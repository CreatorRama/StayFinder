const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Listing = require('../models/PropListings');
const { auth } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Create booking
router.post('/', [
    auth,
    body('listing').isMongoId().withMessage('Invalid listing ID'),
    body('checkIn').isISO8601().withMessage('Invalid check-in date'),
    body('checkOut').isISO8601().withMessage('Invalid check-out date'),
    body('guests.adults').isInt({ min: 1 }).withMessage('At least 1 adult guest required'),
    body('guests.children').optional().isInt({ min: 0 }).withMessage('Children count must be non-negative'),
    body('guests.infants').optional().isInt({ min: 0 }).withMessage('Infants count must be non-negative')
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

        const { listing: listingId, checkIn, checkOut, guests, specialRequests } = req.body;

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate <= today) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date must be in the future'
            });
        }

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }

        // Get listing
        const listing = await Listing.findById(listingId).populate('host');
        if (!listing || listing.status !== 'active') {
            return res.status(404).json({
                success: false,
                message: 'Listing not found or not available'
            });
        }

        // Check if user is trying to book their own listing
        if (listing.host._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book your own listing'
            });
        }

        // Check guest capacity
        const totalGuests =parseInt(guests.adults) + parseInt((guests.children || 0))+parseInt((guests.infants || 0));
        console.log(totalGuests);
        if (totalGuests > listing.capacity.guests) {
            console.log(listing.capacity.guests);
            return res.status(400).json({
                success: false,
                message: `Property can accommodate maximum ${listing.capacity.guests} guests`
            });
        }

        // Check availability
        const existingBooking = await Booking.findOne({
            listing: listingId,
            status: { $in: ['confirmed', 'pending'] },
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Property is not available for selected dates'
            });
        }

        // Calculate pricing
        const nights = moment(checkOutDate).diff(moment(checkInDate), 'days');
        const basePrice = listing.pricing.basePrice;
        const subtotal = basePrice * nights;

        let weeklyDiscount = 0;
        let monthlyDiscount = 0;

        if (nights >= 7 && listing.pricing.weeklyDiscount > 0) {
            weeklyDiscount = (subtotal * listing.pricing.weeklyDiscount) / 100;
        }

        if (nights >= 28 && listing.pricing.monthlyDiscount > 0) {
            monthlyDiscount = (subtotal * listing.pricing.monthlyDiscount) / 100;
        }

        const cleaningFee = listing.pricing.cleaningFee || 0;
        const serviceFee = Math.round(subtotal * 0.14); // 14% service fee
        const taxes = Math.round((subtotal - weeklyDiscount - monthlyDiscount + serviceFee) * 0.12); // 12% tax

        const total = subtotal - weeklyDiscount - monthlyDiscount + cleaningFee + serviceFee + taxes;

        // Create booking
        const booking = new Booking({
            listing: listingId,
            guest: req.user.id,
            host: listing.host._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests,
            totalGuests,
            nights,
            pricing: {
                basePrice,
                totalNights: nights,
                subtotal,
                cleaningFee,
                serviceFee,
                taxes,
                discounts: {
                    weekly: weeklyDiscount,
                    monthly: monthlyDiscount
                },
                total
            },
            specialRequests,
            status:  'pending'
        });

        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('listing', 'title images location')
            .populate('guest', 'firstName lastName email')
            .populate('host', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: populatedBooking,
            serviceFee,
            cleaningFee,
            taxes,
            weeklyDiscount,
            monthlyDiscount
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking'
        });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type = 'guest' } = req.query;

        const filter = {};
        if (type === 'guest') {
            filter.guest = req.user.id;
        } else if (type === 'host') {
            filter.host = req.user.id;
        }

        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [bookings, total] = await Promise.all([
            Booking.find(filter)
                .populate('listing', 'title images location pricing')
                .populate('guest', 'firstName lastName avatar')
                .populate('host', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings'
        });
    }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('listing')
            .populate('guest', 'firstName lastName email phone avatar')
            .populate('host', 'firstName lastName email phone avatar');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is authorized to view this booking
        if (booking.guest._id.toString() !== req.user.id &&
            booking.host._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking'
        });
    }
});

// Update booking status (Host only)
router.patch('/:id/status', [
    auth,
    body('status').isIn(['confirmed', 'declined', 'cancelled']).withMessage('Invalid status')
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

        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is the host
        if (booking.host.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the host can update booking status'
            });
        }

        // Check if booking can be updated
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update completed or cancelled booking'
            });
        }

        booking.status = status;
        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('listing', 'title')
            .populate('guest', 'firstName lastName email')
            .populate('host', 'firstName lastName email');

        res.json({
            success: true,
            message: `Booking ${status} successfully`,
            data: updatedBooking
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating booking'
        });
    }
});

// Cancel booking
router.patch('/:id/cancel', [
    auth,
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is authorized to cancel
        const isGuest = booking.guest.toString() === req.user.id;
        const isHost = booking.host.toString() === req.user.id;

        if (!isGuest && !isHost) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel  already cancelled booking'
            });
        }

        // Calculate refund based on cancellation policy
        let refundAmount = 0;
        const daysDifference = moment(booking.checkIn).diff(moment(), 'days');
        const listing = await Listing.findById(booking.listing);

        switch (listing.cancellationPolicy) {
            case 'flexible':
                if (daysDifference >= 1) refundAmount = booking.pricing.total*0.05;
                break;
            case 'moderate':
                if (daysDifference >= 5) refundAmount = booking.pricing.total;
                else if (daysDifference >= 1) refundAmount = booking.pricing.total * 0.5;
                break;
            case 'strict':
                if (daysDifference >= 7) refundAmount = booking.pricing.total * 0.4;
                break;
            case 'super-strict':
                if (daysDifference >= 30) refundAmount = booking.pricing.total * 0.2;
                break;
        }

        booking.status = 'cancelled';
        booking.cancellation = {
            cancelledBy: isGuest ? 'guest' : 'host',
            cancelledAt: new Date(),
            reason,
            refundAmount
        };

        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                booking,
                refundAmount
            }
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking'
        });
    }
});

module.exports = router;