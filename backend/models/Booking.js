const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 }
  },
  totalGuests: {
    type: Number,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  pricing: {
    basePrice: { type: Number, required: true },
    totalNights: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    discounts: {
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      coupon: { type: Number, default: 0 }
    },
    total: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paymentMethod: String,
    currency: { type: String, default: 'USD' }
  },
  specialRequests: String,
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['guest', 'host', 'admin']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'system', 'automated'],
      default: 'message'
    }
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);