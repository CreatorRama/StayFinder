const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', [
  auth,
  body('bookingId').isMongoId().withMessage('Invalid booking ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId } = req.body;
    console.log(bookingId);

    const booking = await Booking.findById(bookingId)
      .populate('listing', 'title')
      .populate('guest', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the guest
    if (booking.guest._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

   

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.pricing.total * 100), 
      currency: 'usd', 
      metadata: {
        bookingId: booking._id.toString(),
        listingTitle: booking.listing.title,
        guestEmail: booking.guest.email 
      },
      description: `StayFinder booking for ${booking.listing.title}`
    });

    console.log(paymentIntent.id);

    // Update booking with payment intent ID
    booking.paymentDetails.stripePaymentIntentId = paymentIntent.id;
    await booking.save();


    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment intent'
    });
  }
});

// Confirm payment
router.post('/confirm-payment', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('bookingId').isMongoId().withMessage('Invalid booking ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent with expanded charge data
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data.balance_transaction']
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Safely get charge details
    const charge = paymentIntent.charges?.data?.[0];
    const paymentMethod = charge?.payment_method_details?.type || 'card';

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        'paymentDetails.stripeChargeId': charge?.id,
        'paymentDetails.paymentMethod': paymentMethod
      },
      { new: true }
    ).populate('listing', 'title')
     .populate('guest', 'firstName lastName email')
     .populate('host', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while confirming payment'
    });
  }
});

// Process refund
router.post('/refund', [
  auth,
  body('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Invalid refund amount')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (admin or host)
    if (req.user.role !== 'admin' && booking.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refund'
      });
    }

    if (!booking.paymentDetails.stripePaymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this booking'
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentDetails.stripePaymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
      metadata: {
        bookingId: booking._id.toString(),
        refundReason: 'Cancellation refund'
      }
    });

    // Update booking
    booking.paymentStatus = 'refunded';
    if (booking.cancellation) {
      booking.cancellation.refundAmount = amount;
    }
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.id,
      amount: amount
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
});

// Webhook endpoint for Stripe events

module.exports = router;