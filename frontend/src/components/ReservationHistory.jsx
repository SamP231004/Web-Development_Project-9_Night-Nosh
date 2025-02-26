import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationHistory = () => {
    const [reservations, setReservations] = useState([]);
    const [userId, setUserId] = useState('student123');
    const [block, setBlock] = useState('A Block');
    const [stockItems, setStockItems] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get(`/api/reservations/${userId}/${encodeURIComponent(block)}`);
                setReservations(response.data);
            }
            catch (error) {
                console.error('Error fetching reservations:', error);
            }
        };

        fetchReservations();
    }, [userId, block]);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await axios.get(`/api/stock/${encodeURIComponent(block)}/${new Date().toISOString().split('T')[0]}`);
                setStockItems(response.data);
            }
            catch (error) {
                console.error('Error fetching stock:', error);
            }
        };

        fetchStock();
    }, [block]);

    const getItemName = (itemId) => {
        const item = stockItems.find((stockItem) => stockItem._id === itemId);
        return item ? item.itemName : 'Unknown Item';
    };

    return (
        <div>
            <h2>Reservation History</h2>
            <div>
                <label>User ID:</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
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