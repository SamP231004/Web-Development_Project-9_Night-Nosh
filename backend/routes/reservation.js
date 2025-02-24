const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation.js');

router.post('/', async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json(reservation);
    } 
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:userId/:block', async (req, res) => {
    try {
        const { userId, block } = req.params;
        const reservations = await Reservation.find({ userId, block });
        res.json(reservations);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id/payment', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        reservation.paymentStatus = req.body.paymentStatus;
        await reservation.save();
        res.json(reservation);
    } 
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;