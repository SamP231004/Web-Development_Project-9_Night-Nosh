import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockList = () => {
    const [stock, setStock] = useState([]);
    const [block, setBlock] = useState('G Block');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const response = await axios.get(`/api/stock/${encodeURIComponent(block)}/${date}`);
                console.log('API Response:', response.data);
                setStock(response.data);
            }
            catch (error) {
                console.error('Error fetching stock:', error);
            }
        };
        fetchStock();
    }, [block, date]);

    return (
        <div>
            <h2>Stock for {block} on {date}</h2>

            <div>
                <label htmlFor="block">Block:</label>
                <select id="block" value={block} onChange={(e) => setBlock(e.target.value)}>
                    <option value="A Block">A Block</option>
                    <option value="B Block">B Block</option>
                    <option value="C Block">C Block</option>
                    <option value="G Block">G Block</option>
                    {/* Add more blocks as needed */}
                </select>
            </div>

            <div>
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <ul>
                {stock.map((item) => (
                    <li key={item._id}>
                        {item.itemName} - ${item.price} - Quantity: {item.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StockList;