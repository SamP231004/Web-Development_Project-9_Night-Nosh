const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock.js');

router.post('/', async (req, res) => {
    try {
        const stock = new Stock(req.body);
        await stock.save();
        res.status(201).json(stock);
    } 
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:block/:date', async (req, res) => {
    try {
        const { block, date } = req.params;
        const stock = await Stock.find({
            block,
            date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
            },
        });
        res.json(stock);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/decrement', async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        const decrementAmount = req.body.decrementAmount || 1;
        if (stock.quantity >= decrementAmount) {
            stock.quantity -= decrementAmount;
            await stock.save();
            res.json(stock);
        } 
        else {
            res.status(400).json({ message: 'Insufficient stock' });
        }
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;