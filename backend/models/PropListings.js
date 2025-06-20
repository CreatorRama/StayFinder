const mongoose = require('mongoose');
const Review = require('./review')
const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'villa', 'condo', 'townhouse', 'cabin', 'loft', 'other']
  },
  roomType: {
    type: String,
    required: true,
    enum: ['entire-place', 'private-room', 'shared-room']
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
        validate: {
          validator: function (v) {
            return v.length === 2 &&
              v[0] >= -180 && v[0] <= 180 &&
              v[1] >= -90 && v[1] <= 90;
          },
          message: props => `${props.value} is not a valid longitude/latitude pair`
        }
      }
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [1, 'Price must be at least $1']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    weeklyDiscount: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    },
    monthlyDiscount: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    },
    cleaningFee: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    taxRate: {
      type: Number,
      default: 0
    }
  },
  capacity: {
    guests: {
      type: Number,
      required: true,
      min: 1
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0
    },
    beds: {
      type: Number,
      required: true,
      min: 1
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0.5
    }
  },
  amenities: [{
    type: String,
    enum: [
      'wifi', 'kitchen', 'washer', 'dryer', 'air-conditioning', 'heating',
      'tv', 'hot-tub', 'pool', 'gym', 'parking', 'elevator', 'wheelchair-accessible',
      'pet-friendly', 'smoking-allowed', 'events-allowed', 'fireplace',
      'breakfast', 'laptop-friendly', 'family-friendly', 'suitable-for-infants'
    ]
  }],
  images: [{
    url: { type: String, required: true, default: "http://localhost:5000/api/listingimages/default.png" },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  availability: {
    minStay: {
      type: Number,
      default: 1
    },
    maxStay: {
      type: Number,
      default: 365
    },
    instantBook: {
      type: Boolean,
      default: true
    },
    advanceNotice: {
      type: String,
      enum: ['same-day', '1-day', '2-days', '3-days', '7-days'],
      default: 'same-day'
    },
    preparationTime: {
      type: Number,
      default: 0
    },
    availabilityWindow: {
      type: Number,
      default: 365
    },
    blockedDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  houseRules: [{
    type: String,
    maxlength: [200, 'House rule cannot exceed 200 characters']
  }],
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'super-strict'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'suspended'],
    default: 'draft'
  },
  metrics: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ 'pricing.basePrice': 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ host: 1 });
listingSchema.index({ propertyType: 1 });
listingSchema.index({ 'metrics.rating': -1 });


listingSchema.statics.updateListingMetrics = async function (listingId) {
  const reviews = await Review.find({ listing: listingId, isPublic: true });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.ratings.overall, 0);
    const avgRating = totalRating / reviews.length;

    await this.findByIdAndUpdate(listingId, {
      'metrics.rating': avgRating,
      'metrics.reviewCount': reviews.length
    });
  }
};

listingSchema.methods.isAvailable = async function (checkIn, checkOut) {
  const conflictingBooking = await Booking.findOne({
    listing: this._id,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      { checkIn: { $lt: new Date(checkOut) } },
      { checkOut: { $gt: new Date(checkIn) } }
    ]
  });

  return !conflictingBooking;
};

module.exports = mongoose.model('Listing', listingSchema);