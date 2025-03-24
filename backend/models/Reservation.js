const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  quantityReserved: {
    type: Number,
    required: true
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    default: 'pending'
  },
  block: {
    type: String,
    required: true
  },
  paymentIntentId: {
    type: String
  }
});

module.exports = mongoose.model('Reservation', ReservationSchema);