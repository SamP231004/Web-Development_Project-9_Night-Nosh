import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const ReservationHistory = () => {
    const [reservations, setReservations] = useState([]);
    // const [userId, setUserId] = useState('student123');
    const [block, setBlock] = useState('A Block');
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
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
                const userId = decodedToken.userId;

                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reservations/${userId}/${encodeURIComponent(block)}`);
                setReservations(response.data);
            }
            catch (error) {
                console.error('Error fetching reservations:', error);
                setError('Failed to load reservations.');
            }
            finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [block, navigate]);

    useEffect(() => {
        const fetchStock = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stock/${encodeURIComponent(block)}/${new Date().toISOString().split('T')[0]}`);
                setStockItems(response.data);
            }
            catch (error) {
                console.error('Error fetching stock:', error);
                setError('Failed to load stock items.');
            }
            finally {
                setLoading(false);
            }
        };

        fetchStock();
    }, [block]);

    const getItemName = (itemId) => {
        const item = stockItems.find((stockItem) => stockItem._id === itemId);
        return item ? item.itemName : 'Unknown Item';
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Reservation History</h2>
            <div>
                {/* <label>User ID:</label> */}
                {/* <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} /> */}
                <label>Block:</label>
                <select value={block} onChange={(e) => setBlock(e.target.value)}>
                    <option value="A Block">A Block</option>
                    <option value="B Block">B Block</option>
                    <option value="C Block">C Block</option>
                    {/* Add more blocks as needed */}
                </select>
            </div>
            <ul>
                {reservations.map((reservation) => (
                    <li key={reservation._id}>
                        Item: {getItemName(reservation.itemId)} - Quantity: {reservation.quantityReserved} - Status: {reservation.paymentStatus}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReservationHistory;