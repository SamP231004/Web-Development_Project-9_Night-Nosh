const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/Reservation');
const Stock = require('../models/Stock');
const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
    try {
        const { reservationData, amount } = req.body;
        const lineItems = reservationData.map(reservation => ({
            price_data: { currency: 'inr', product_data: { name: reservation.itemName }, unit_amount: reservation.price * 100, },
            quantity: reservation.quantityReserved,
        }));
        const reservationIds = reservationData.map(r => r._id);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/reservation-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/reservation-cancel`,
            metadata: { reservationIds: JSON.stringify(reservationIds), },
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Session Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook Signature Verification Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const reservationIds = JSON.parse(session.metadata.reservationIds);

        if (reservationIds && reservationIds.length > 0) {
            try {
                for (const reservationId of reservationIds) {
                    const reservation = await Reservation.findById(reservationId);
                    if (reservation && reservation.paymentStatus !== 'paid') {
                        reservation.paymentStatus = 'paid';
                        await reservation.save();
                        console.log(`Reservation ${reservationId} updated to PAID.`);

                        const stockItem = await Stock.findById(reservation.itemId);
                        if (stockItem) {
                            stockItem.quantity -= reservation.quantityReserved;
                            await stockItem.save();
                            console.log(`Stock item ${stockItem.itemName} quantity reduced.`);
                        } else {
                            console.warn(`Stock item not found for reservation ${reservationId}`);
                        }
                    } else if (reservation && reservation.paymentStatus === 'paid') {
                        console.log(`Reservation ${reservationId} already paid.`);
                    } else {
                        console.warn(`Reservation ${reservationId} not found.`);
                    }
                }

                console.log('Payment successful, reservations and stock updated.');
                return res.json({ received: true, message: 'Reservations updated successfully.' });
            } catch (error) {
                console.error('Error updating reservation status or stock:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }

    res.json({ received: true });
});

router.get('/payments/session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        const reservationIds = JSON.parse(session.metadata.reservationIds);
        res.json({ reservationIds });
    } catch (error) {
        console.error('Error fetching Stripe session:', error);
        console.error('Stripe error details:', error.message); // Add this line
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;