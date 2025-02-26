import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OwnerStockManagement = () => {
    const [itemName, setItemName] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [block, setBlock] = useState('A Block');
    const [decrementItemId, setDecrementItemId] = useState('');
    const [decrementAmount, setDecrementAmount] = useState(1);
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

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/stock', { itemName, price, quantity, block });
            setMessage('Stock added successfully!');
            setItemName('');
            setPrice(0);
            setQuantity(0);
        }
        catch (error) {
            setMessage(`Failed to add stock: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDecrementStock = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/stock/${decrementItemId}/decrement`, { decrementAmount });
            setMessage('Stock decremented successfully!');
            setDecrementItemId('');
            setDecrementAmount(1);
        }
        catch (error) {
            setMessage(`Failed to decrement stock: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div>
            <h2>Owner Stock Management</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleAddStock}>
                <label>Item Name:</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                <label>Price:</label>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                <label>Quantity:</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
                <label>Block:</label>
                <select value={block} onChange={(e) => setBlock(e.target.value)}>
                    <option value="A Block">A Block</option>
                    <option value="B Block">B Block</option>
                    <option value="C Block">C Block</option>
                    {/* Add more blocks as needed */}
                </select>
                <button type="submit">Add Stock</button>
            </form>

            <form onSubmit={handleDecrementStock}>
                <label>Item to Decrement:</label>
                <select value={decrementItemId} onChange={(e) => setDecrementItemId(e.target.value)} required>
                    <option value="">Select an item</option>
                    {stockItems.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.itemName}
                        </option>
                    ))}
                </select>
                <label>Decrement Amount:</label>
                <input type="number" value={decrementAmount} onChange={(e) => setDecrementAmount(Number(e.target.value))} min="1" required />
                <button type="submit">Decrement Stock</button>
            </form>
        </div>
    );
};

export default OwnerStockManagement;