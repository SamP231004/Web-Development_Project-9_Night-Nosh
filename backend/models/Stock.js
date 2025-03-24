const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  block: {
    type: String,
    required: [true, 'Block is required'],
    enum: {
      values: ['A Block', 'B Block', 'C Block'],
      message: '{VALUE} is not a valid block'
    }
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
StockSchema.index({ block: 1, date: -1 });
StockSchema.index({ itemName: 1 });

// Virtual for checking if item is low on stock
StockSchema.virtual('isLowStock').get(function() {
  return this.quantity < 5;
});

// Pre-save middleware for data sanitization
StockSchema.pre('save', function(next) {
  this.itemName = this.itemName.trim();
  next();
});

module.exports = mongoose.model('Stock', StockSchema);