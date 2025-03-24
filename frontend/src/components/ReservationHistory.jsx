import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const ReservationHistory = () => {
    const [reservations, setReservations] = useState([]);
    const [block, setBlock] = useState('A Block');
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();
    const [selectedReservations, setSelectedReservations] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken || !decodedToken.userId || !decodedToken.exp) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('token');
            navigate('/');
            return;
        }
    }, [navigate]);

    const fetchReservations = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const decodedToken = jwtDecode(token);
            if (!decodedToken || !decodedToken.userId) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }

            console.log('Fetching reservations with token:', token);
            const userId = decodedToken.userId;
            const response = await api.get(`/api/reservations/${userId}/${encodeURIComponent(block)}`);

            console.log('Reservations response:', response.data);

            if (!response.data) {
                throw new Error('No data received from server');
            }

            const today = new Date().toISOString().split('T')[0];
            const filteredReservations = response.data.filter(reservation =>
                reservation.reservationDate && reservation.reservationDate.split('T')[0] === today
            );

            console.log('Filtered reservations:', filteredReservations);

            setReservations(filteredReservations);
            
            // Clear selected reservations that are already paid
            setSelectedReservations(prev => 
                prev.filter(id => {
                    const reservation = filteredReservations.find(r => r._id === id);
                    return reservation && reservation.paymentStatus !== 'paid';
                })
            );
        } catch (error) {
            console.error('Error fetching reservations:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/');
                return;
            }
            setError(error.response?.data?.message || 'Failed to load reservations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [block, navigate]);

    const getItemName = (itemId) => {
        const item = stockItems.find((stockItem) => stockItem._id === itemId);
        return item ? item.itemName : 'Unknown Item';
    };

    const getItemPrice = (itemId) => {
        const item = stockItems.find((stockItem) => stockItem._id === itemId);
        return item ? item.price : 0;
    };

    const handleCheckboxChange = (reservationId) => {
        const reservation = reservations.find(r => r._id === reservationId);
        if (reservation.paymentStatus === 'paid') {
            return;
        }
        
        if (selectedReservations.includes(reservationId)) {
            setSelectedReservations(selectedReservations.filter((id) => id !== reservationId));
        } else {
            setSelectedReservations([...selectedReservations, reservationId]);
        }
    };

    useEffect(() => {
        let total = 0;
        selectedReservations.forEach(reservationId => {
            const reservation = reservations.find(r => r._id === reservationId);
            if (reservation && reservation.paymentStatus !== 'paid') {
                total += getItemPrice(reservation.itemId) * reservation.quantityReserved;
            }
        });
        setTotalAmount(total);
    }, [selectedReservations, reservations, stockItems]);

    useEffect(() => {
        const fetchStock = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/stock/${encodeURIComponent(block)}/${new Date().toISOString().split('T')[0]}`);
                setStockItems(response.data);
            } catch (error) {
                console.error('Error fetching stock:', error);
                setError(error.response?.data?.message || 'Failed to load stock items.');
            } finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, [block]);

    const handlePaySelected = async () => {
        if (selectedReservations.length === 0) {
            alert('Please select reservations to pay.');
            return;
        }

        if (processing) {
            alert('Payment is already being processed. Please wait.');
            return;
        }

        setProcessing(true);

        try {
            const unpaidReservations = reservations.filter((reservation) =>
                selectedReservations.includes(reservation._id) && 
                reservation.paymentStatus !== 'paid'
            );

            if (unpaidReservations.length === 0) {
                alert('All selected reservations are already paid.');
                setProcessing(false);
                return;
            }

            const reservationsToPay = unpaidReservations.map(reservation => {
                const stockItem = stockItems.find(item => item._id === reservation.itemId);
                return {
                    ...reservation,
                    price: stockItem ? stockItem.price : 0,
                    itemName: stockItem ? stockItem.itemName : "unknown item"
                };
            });

            const response = await api.post('/api/payments/create-checkout-session', {
                reservationData: reservationsToPay,
                amount: totalAmount
            });

            if (response.data.url) {
                sessionStorage.setItem('pendingPaymentReservations', JSON.stringify(selectedReservations));
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Payment Error:', error);
            setError(error.response?.data?.message || 'Failed to create payment session.');
        } finally {
            setProcessing(false);
        }
    };

    const handleMarkAsPaid = async (reservationId) => {
        if (processing) {
            alert('Another payment is being processed. Please wait.');
            return;
        }

        const reservation = reservations.find(r => r._id === reservationId);
        if (reservation.paymentStatus === 'paid') {
            alert('This reservation is already paid.');
            return;
        }

        setProcessing(true);
        try {
            const stockResponse = await api.get(`/api/stock/${reservation.itemId}`);
            const currentStock = stockResponse.data.quantity;

            if (currentStock < reservation.quantityReserved) {
                alert('Sorry, not enough stock available.');
                return;
            }

            const response = await api.put(
                `/api/reservations/mark-paid/${reservationId}`,
                { paymentStatus: 'paid' }
            );

            if (response.data.success) {
                await api.put(`/api/stock/${reservation.itemId}/decrement`, {
                    decrementAmount: reservation.quantityReserved
                });

                setSelectedReservations(prev => prev.filter(id => id !== reservationId));
                await fetchReservations();
                alert('Payment processed successfully!');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            setError(error.response?.data?.message || 'Failed to process payment.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Reservation History</h2>
            <div>
                <label>Block:</label>
                <select value={block} onChange={(e) => setBlock(e.target.value)}>
                    <option value="A Block">A Block</option>
                    <option value="B Block">B Block</option>
                    <option value="C Block">C Block</option>
                </select>
            </div>
            {reservations.length === 0 ? (
                <p>No reservations found for today.</p>
            ) : (
                <ul>
                    {reservations.map((reservation) => (
                        <li key={reservation._id}>
                            <input
                                type="checkbox"
                                checked={selectedReservations.includes(reservation._id)}
                                onChange={() => handleCheckboxChange(reservation._id)}
                                disabled={reservation.paymentStatus === 'paid' || processing}
                            />
                            Item: {getItemName(reservation.itemId)} - 
                            Quantity: {reservation.quantityReserved} - 
                            Status: {reservation.paymentStatus === 'paid' ? 
                                <span style={{color: 'green'}}>Paid</span> : 
                                <span style={{color: 'orange'}}>Pending</span>
                            }
                            {reservation.paymentStatus !== 'paid' && (
                                <button 
                                    onClick={() => handleMarkAsPaid(reservation._id)}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Mark as Paid'}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <p>Total Amount: Rs {totalAmount}</p>
            <button 
                onClick={handlePaySelected} 
                disabled={processing || selectedReservations.length === 0}
            >
                {processing ? 'Processing Payment...' : 'Pay Selected'}
            </button>
        </div>
    );
};

export default ReservationHistory;