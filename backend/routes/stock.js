const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Stock = require('../models/Stock.js');
const authMiddleware = require('../middleware/auth'); // Ensure this is the updated authMiddleware
const rateLimit = require('express-rate-limit');

// --- Rate Limiting Middleware ---
// Limits requests to stock-related routes to prevent abuse.
const stockLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// --- Validation Middleware ---
// Ensures incoming request bodies for stock operations meet defined criteria.
const validateStock = [
    body('itemName')
        .trim()
        .notEmpty()
        .withMessage('Item name is required and cannot be empty.'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number.'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a positive integer.'),
    body('block')
        .isIn(['A Block', 'B Block', 'C Block'])
        .withMessage('Invalid block specified. Must be "A Block", "B Block", or "C Block".'),
];

// --- Routes ---

// @route   GET /api/stock
// @desc    Get all stock items
// @access  Authenticated (Student or Owner)
router.get('/', authMiddleware(), stockLimiter, async (req, res) => {
    try {
        // Fetch all stock items, sorted by date in descending order (newest first)
        const stock = await Stock.find().sort({ date: -1 });
        if (stock.length === 0) {
            return res.status(404).json({ message: 'No stock items found.' });
        }
        res.status(200).json({ message: 'Successfully fetched all stock items.', data: stock });
    } 
    catch (err) {
        console.error('Error fetching all stock items:', err.message);
        res.status(500).json({ message: 'Failed to retrieve all stock items due to a server error.', error: err.message });
    }
});

// @route   GET /api/stock/:block/:date
// @desc    Get stock items for a specific block and date
// @access  Authenticated (Student or Owner)
router.get('/:block/:date', authMiddleware(), stockLimiter, async (req, res) => {
    try {
        const { block, date } = req.params;

        // Basic validation for the block parameter before querying
        if (!['A Block', 'B Block', 'C Block'].includes(block)) {
            return res.status(400).json({ message: 'Invalid block provided. Please use "A Block", "B Block", or "C Block".' });
        }

        // Parse date for filtering (start of day to end of day)
        const startDate = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endDate = new Date(new Date(date).setHours(23, 59, 59, 999));

        // Find stock items matching the block and date range
        const stock = await Stock.find({
            block,
            date: {
                $gte: startDate, // Greater than or equal to the start of the day
                $lt: endDate,    // Less than the end of the day
            },
        }).sort({ date: -1 }); // Sort by date, newest first

        if (stock.length === 0) {
            return res.status(404).json({ message: `No stock found for ${block} on ${new Date(date).toDateString()}.` });
        }

        res.status(200).json({ message: `Successfully fetched stock for ${block} on ${new Date(date).toDateString()}.`, data: stock });
    } catch (err) {
        console.error('Error fetching stock by block and date:', err.message);
        res.status(500).json({ message: 'Failed to retrieve stock due to a server error.', error: err.message });
    }
});


// @route   POST /api/stock
// @desc    Create a new stock item
// @access  Owner only
router.post('/', authMiddleware('owner'), stockLimiter, validateStock, async (req, res) => {
    try {
        // Validate request body using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed.', errors: errors.array() });
        }

        // Create a new Stock instance with data from request body and current date
        const stock = new Stock({
            ...req.body,
            date: new Date() // Automatically set the date for the new stock entry
        });

        // Save the new stock item to the database
        await stock.save();

        // Respond with success message and the created stock item
        res.status(201).json({ message: 'Stock item successfully created.', data: stock });
    } catch (err) {
        console.error('Error creating stock item:', err.message);
        // Handle specific Mongoose errors if necessary (e.g., duplicate key error)
        if (err.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ message: 'A stock item with this name might already exist for this block/date.', error: err.message });
        }
        res.status(500).json({ message: 'Failed to create stock item due to a server error.', error: err.message });
    }
});


// @route   PUT /api/stock/:id/decrement
// @desc    Decrement the quantity of an existing stock item
// @access  Owner only
router.put('/:id/decrement', authMiddleware('owner'), stockLimiter, [
    body('decrementAmount')
        .isInt({ min: 1 })
        .withMessage('Decrement amount must be a positive integer.')
], async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed.', errors: errors.array() });
        }

        // Find the stock item by ID
        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found with the provided ID.' });
        }

        const decrementAmount = parseInt(req.body.decrementAmount);

        // Check for insufficient stock
        if (stock.quantity < decrementAmount) {
            return res.status(400).json({ message: 'Insufficient stock: Cannot decrement quantity below zero.' });
        }

        // Decrement quantity and save
        stock.quantity -= decrementAmount;
        await stock.save();

        res.status(200).json({ message: 'Stock quantity successfully decremented.', data: stock });
    } catch (err) {
        console.error('Error updating stock quantity:', err.message);
        res.status(500).json({ message: 'Failed to update stock quantity due to a server error.', error: err.message });
    }
});

module.exports = router;