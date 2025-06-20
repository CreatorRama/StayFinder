const { body, validationResult } = require('express-validator');
const Review = require('../models/review');
const Booking = require('../models/Booking');
const Listing = require('../models/PropListings');
const { auth } = require('../middleware/auth');
const express = require('express');
const { checkstatus } = require('../utils/booking-status');

const router = express.Router();

// Create review
router.post('/', [
  auth,
  body('booking').isMongoId().withMessage('Invalid booking ID'),
  body('ratings.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1-5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
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

    const { booking: bookingId, ratings, comment } = req.body;
    
    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking || checkstatus(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking not found or not completed'
      });
    }

    // Check if user is authorized to review
    if (booking.guest.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = new Review({
      booking: bookingId,
      listing: booking.listing,
      reviewer: req.user.id,
      reviewee: booking.host,
      type: 'guest-to-host',
      ratings,
      comment
    });

    await review.save();

    // Update listing metrics
    await Listing.updateListingMetrics(booking.listing);

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'firstName lastName avatar')
      .populate('reviewee', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
});

// Get reviews for a listing
router.get('/listing/:id', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ 
        listing: req.params.id,
        type: 'guest-to-host',
        isPublic: true
      })
        .populate('reviewer', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ 
        listing: req.params.id,
        type: 'guest-to-host',
        isPublic: true
      })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get listing reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// Get reviews for a user
router.get('/user/:id', async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'guest-to-host' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { 
      reviewee: req.params.id,
      type,
      isPublic: true
    };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'firstName lastName avatar')
        .populate('listing', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// Host response to review
router.post('/:id/response', [
  auth,
  body('comment').isLength({ min: 1, max: 1000 }).withMessage('Response must be 1-1000 characters')
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

    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the host being reviewed
    if (review.reviewee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    // Check if response already exists
    if (review.response) {
      return res.status(400).json({
        success: false,
        message: 'Response already submitted for this review'
      });
    }

    review.response = {
      comment,
      createdAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting response'
    });
  }
});

module.exports = router;