const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Stock = require('../models/Stock.js');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting
const stockLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Validation middleware
const validateStock = [
    body('itemName').trim().notEmpty().withMessage('Item name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
    body('block').isIn(['A Block', 'B Block', 'C Block']).withMessage('Invalid block')
];

// Create stock item
router.post('/', authMiddleware, stockLimiter, validateStock, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const stock = new Stock({
            ...req.body,
            date: new Date()
        });
        await stock.save();
        res.status(201).json(stock);
    } catch (err) {
        res.status(500).json({ message: 'Error creating stock item', error: err.message });
    }
});

// Get stock by block and date
router.get('/:block/:date', stockLimiter, async (req, res) => {
    try {
        const { block, date } = req.params;
        if (!['A Block', 'B Block', 'C Block'].includes(block)) {
            return res.status(400).json({ message: 'Invalid block' });
        }

        const startDate = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endDate = new Date(new Date(date).setHours(23, 59, 59, 999));

        const stock = await Stock.find({
            block,
            date: {
                $gte: startDate,
                $lt: endDate,
            },
        }).sort({ date: -1 });

        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stock', error: err.message });
    }
});

// Update stock quantity
router.put('/:id/decrement', authMiddleware, stockLimiter, [
    body('decrementAmount').isInt({ min: 1 }).withMessage('Decrement amount must be a positive integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }

        const decrementAmount = parseInt(req.body.decrementAmount) || 1;
        if (stock.quantity < decrementAmount) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        stock.quantity -= decrementAmount;
        await stock.save();
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: 'Error updating stock', error: err.message });
    }
});

module.exports = router;