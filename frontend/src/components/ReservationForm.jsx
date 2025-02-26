import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationForm = () => {
    const [userId, setUserId] = useState('');
    const [itemId, setItemId] = useState('');
    const [quantityReserved, setQuantityReserved] = useState(1);
    const [block, setBlock] = useState('A Block');
    const [message, setMessage] = useState('');
    const [stockItems, setStockItems] = useState([]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/reservations', {
                userId,
                itemId,
                quantityReserved,
                block,
            });
            setMessage('Reservation successful!');
            setUserId('');
            setItemId('');
            setQuantityReserved(1);
        }
        catch (error) {
            setMessage(`Reservation failed: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div>
            <h2>Make a Reservation</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>User ID:</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />
                <label>Item Name:</label>
                <select value={itemId} onChange={(e) => setItemId(e.target.value)} required>
                    <option value="">Select an item</option>
                    {stockItems.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.itemName}
                        </option>
                    ))}
                </select>
                <label>Quantity:</label>
                <input type="number" value={quantityReserved} onChange={(e) => setQuantityReserved(Number(e.target.value))} min="1" required />
                <label>Block:</label>
                <select value={block} onChange={(e) => setBlock(e.target.value)}>
                    <option value="A Block">A Block</option>
                    <option value="B Block">B Block</option>
                    <option value="C Block">C Block</option>
                    {/* Add more blocks as needed */}
                </select>
                <button type="submit">Reserve</button>
            </form>
        </div>
    );
};

export default ReservationForm;