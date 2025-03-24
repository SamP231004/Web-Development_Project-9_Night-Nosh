const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Stock = require('../models/Stock');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get reservations by user and block
router.get('/:userId/:block', authMiddleware, async (req, res) => {
    try {
        const reservations = await Reservation.find({
            userId: req.params.userId,
            block: req.params.block
        }).sort({ reservationDate: -1 });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new reservation
router.post('/', authMiddleware, [
    body('userId').notEmpty(),
    body('itemId').notEmpty(),
    body('quantityReserved').isInt({ min: 1 }),
    body('block').isIn(['A Block', 'B Block', 'C Block'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if stock exists and has enough quantity
        const stock = await Stock.findById(req.body.itemId);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }

        if (stock.quantity < req.body.quantityReserved) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const reservation = new Reservation({
            userId: req.body.userId,
            itemId: req.body.itemId,
            quantityReserved: req.body.quantityReserved,
            block: req.body.block,
            paymentStatus: 'pending'
        });

        const savedReservation = await reservation.save();
        res.status(201).json(savedReservation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Mark reservation as paid
router.put('/mark-paid/:id', authMiddleware, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check if already paid
        if (reservation.paymentStatus === 'paid') {
            return res.status(400).json({ 
                message: 'Reservation is already paid',
                success: false
            });
        }

        // Check if stock exists and has enough quantity
        const stock = await Stock.findById(reservation.itemId);
        if (!stock) {
            return res.status(404).json({ 
                message: 'Stock item not found',
                success: false
            });
        }

        if (stock.quantity < reservation.quantityReserved) {
            return res.status(400).json({ 
                message: 'Insufficient stock',
                success: false
            });
        }

        // Update reservation status
        reservation.paymentStatus = 'paid';
        await reservation.save();

        // Decrement stock
        stock.quantity -= reservation.quantityReserved;
        await stock.save();

        res.json({ 
            message: 'Payment processed successfully',
            success: true,
            reservation 
        });
    } catch (err) {
        res.status(500).json({ 
            message: err.message,
            success: false
        });
    }
});

// Get reservation details
router.get('/details/:id', authMiddleware, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;