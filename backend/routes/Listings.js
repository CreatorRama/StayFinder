const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Listing = require('../models/PropListings');
const Booking = require('../models/Booking');
const Review = require('../models/review');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer configuration for listing images
const listingImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Go up two levels from routes folder to reach backend root
    const dir = path.join(__dirname, './listingimages');
    console.log('Destination path:', dir); // This will show you the exact path being used

    try {
      if (!fs.existsSync(dir)) {
        console.log('Directory does not exist, creating...');
        fs.mkdirSync(dir, { recursive: true });
        console.log('Directory created successfully at:', dir);
      }
      cb(null, dir);
    } catch (err) {
      console.error('Error creating directory:', err);
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'listing-' + uniqueSuffix + ext);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const uploadListingImages = multer({
  storage: listingImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Helper function to process images
const processImages = (files, existingImages = []) => {
  const newImages = files.map(file => ({
    url: `https://stayfinder-yczq.onrender.com/api/listingimages/${file.filename}`,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    isPrimary: false
  }));

  // Combine with existing images if updating
  const allImages = [...existingImages, ...newImages];

  // Ensure at least one primary image
  if (allImages.length > 0 && !allImages.some(img => img.isPrimary)) {
    allImages[0].isPrimary = true;
  }

  return allImages;
};

// Create new listing with images (Host only)
router.post('/',
  auth,
  uploadListingImages.array('images', 2),
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 characters)'),
    body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required (max 2000 characters)'),
    body('propertyType').isIn(['apartment', 'house', 'villa', 'condo', 'townhouse', 'cabin', 'loft', 'other']).withMessage('Invalid property type'),
    body('roomType').isIn(['entire-place', 'private-room', 'shared-room']).withMessage('Invalid room type'),
    body('location.address').trim().isLength({ min: 1 }).withMessage('Address is required'),
    body('location.city').trim().isLength({ min: 1 }).withMessage('City is required'),
    body('location.country').trim().isLength({ min: 1 }).withMessage('Country is required'),
    body('location.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('pricing.basePrice').isFloat({ min: 1 }).withMessage('Base price must be at least $1'),
    body('capacity.guests').isInt({ min: 1 }).withMessage('Must accommodate at least 1 guest'),
    body('capacity.bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('capacity.beds').isInt({ min: 1 }).withMessage('Must have at least 1 bed'),
    body('capacity.bathrooms').isFloat({ min: 0.5 }).withMessage('Must have at least 0.5 bathrooms')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded files if validation fails
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one image is required'
        });
      }

      const listingData = {
        ...req.body,
        host: req.user.id,
        images: processImages(req.files),
        location: {
          ...req.body.location,
          coordinates: {
            type: 'Point',
            coordinates: [
              parseFloat(req.body.location.coordinates.lng || 0),
              parseFloat(req.body.location.coordinates.lat || 0)
            ]
          }
        }
      };

      // Parse nested objects that might come as strings
      if (typeof listingData.location === 'string') {
        listingData.location = JSON.parse(listingData.location);
      }
      if (typeof listingData.pricing === 'string') {
        listingData.pricing = JSON.parse(listingData.pricing);
      }
      if (typeof listingData.capacity === 'string') {
        listingData.capacity = JSON.parse(listingData.capacity);
      }

      const listing = await Listing.create(listingData);

      const populatedListing = await Listing.findById(listing._id)
        .populate('host', 'firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: populatedListing
      });
    } catch (error) {
      // Clean up uploaded files on error
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }

      console.error('Create listing error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating listing'
      });
    }
  }
);

// Update listing with images (Host only)
// Update listing with images (Host only)
router.put('/:id',
  auth,
  uploadListingImages.array('images', 10),
  async (req, res) => {
    try {
      console.log('Starting listing update...');
      console.log('Req files:', req.files?.length || 0);
      // console.log('Req body:', req.body);

      // Parse stringified fields if they exist
      const parsedBody = {};
      for (const key in req.body) {
        try {
          // Handle JSON strings
          if (typeof req.body[key] === 'string' &&
            (req.body[key].startsWith('{') || req.body[key].startsWith('['))) {
            parsedBody[key] = JSON.parse(req.body[key]);
          } else {
            parsedBody[key] = req.body[key];
          }
        } catch (e) {
          // If parsing fails, keep original value
          parsedBody[key] = req.body[key];
        }
      }

      console.log('Parsed body:', parsedBody);

      // Process location data
      if (parsedBody.location) {
        if (typeof parsedBody.location === 'string') {
          parsedBody.location = JSON.parse(parsedBody.location);
        }
        // Ensure proper GeoJSON format
        if (parsedBody.location.coordinates) {
          parsedBody.location.coordinates = {
            type: 'Point',
            coordinates: [
              parseFloat(parsedBody.location.coordinates.coordinates?.[0] || 0),
              parseFloat(parsedBody.location.coordinates.coordinates?.[1] || 0)
            ]
          };
        }
      }

      // Process pricing data - This is the key fix
      if (parsedBody.pricing) {
        if (typeof parsedBody.pricing === 'string') {
          try {
            parsedBody.pricing = JSON.parse(parsedBody.pricing);
          } catch (e) {
            console.error('Failed to parse pricing:', e);
            parsedBody.pricing = {};
          }
        }

        // Force numeric conversion
        parsedBody.pricing = {
          basePrice: Number(parsedBody.pricing.basePrice) || 0,
          cleaningFee: Number(parsedBody.pricing.cleaningFee) || 0
        };

        console.log('Processed pricing:', parsedBody.pricing);
      }
      // Process capacity data
      if (parsedBody.capacity) {
        if (typeof parsedBody.capacity === 'string') {
          parsedBody.capacity = JSON.parse(parsedBody.capacity);
        }
        // Ensure numeric values
        parsedBody.capacity = {
          guests: parseInt(parsedBody.capacity.guests) || 0,
          bedrooms: parseInt(parsedBody.capacity.bedrooms) || 0,
          beds: parseInt(parsedBody.capacity.beds) || 0,
          bathrooms: parseFloat(parsedBody.capacity.bathrooms) || 0
        };
      }

      // Process amenities
      if (parsedBody.amenities) {
        if (typeof parsedBody.amenities === 'string') {
          parsedBody.amenities = JSON.parse(parsedBody.amenities);
        }
      }

      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        if (req.files?.length) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      if (listing.host.toString() !== req.user.id) {
        if (req.files?.length) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Start with existing images
      let images = [...listing.images];

      // Handle image deletions FIRST
      if (parsedBody.deletedImages) {
        const deletedImageIds = Array.isArray(parsedBody.deletedImages)
          ? parsedBody.deletedImages
          : [parsedBody.deletedImages];

        console.log('Deleting images with IDs:', deletedImageIds);

        // Filter out deleted images
        images = images.filter(img => {
          if (img._id) {
            return !deletedImageIds.includes(img._id.toString());
          }
          return true;
        });

        // Delete physical files
        deletedImageIds.forEach(imgId => {
          const imgToDelete = listing.images.find(img => img._id && img._id.toString() === imgId);
          if (imgToDelete) {
            const filePath = path.join(__dirname, '../../listingimages', path.basename(imgToDelete.url));
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log('Deleted file:', filePath);
            }
          }
        });
      }

      // Handle new image uploads
      if (req.files?.length) {
        console.log('Processing new images:', req.files.length);
        const newImages = req.files.map(file => ({
          url: `https://stayfinder-yczq.onrender.com/api/listingimages/${file.filename}`,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          isPrimary: false
        }));

        images = [...images, ...newImages];
      }

      // Handle primary image change
      if (parsedBody.primaryImageId) {
        images = images.map(img => ({
          ...img,
          isPrimary: img._id && img._id.toString() === parsedBody.primaryImageId
        }));
      }

      // Ensure at least one primary image if we have images
      if (images.length > 0 && !images.some(img => img.isPrimary)) {
        images[0].isPrimary = true;
      }

      // Prepare update data
      const updateData = {
        ...parsedBody,
        images,
        updatedAt: Date.now()
      };

      // Remove fields that shouldn't be updated
      delete updateData.host;
      delete updateData.createdAt;
      delete updateData.deletedImages;
      delete updateData.primaryImageId;

      console.log('Final update data:', {
        ...updateData,
        images: `Array of ${updateData.images.length} images`,
        pricing: updateData.pricing // Log pricing specifically
      });

      const updatedListing = await Listing.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('host', 'firstName lastName avatar');

      console.log('Updated listing pricing:', updatedListing.pricing); // Log the result

      res.json({
        success: true,
        message: 'Listing updated successfully',
        data: updatedListing
      });
    } catch (error) {
      console.error('Full update error:', error);
      console.error('Error stack:', error.stack);

      if (req.files?.length) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error('Error deleting uploaded file:', unlinkError);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while updating listing',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);
// Get all listings with advanced filtering and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('guests').optional().isInt({ min: 1 }).withMessage('Guests must be a positive integer'),
  query('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  query('bathrooms').optional().isFloat({ min: 0 }).withMessage('Bathrooms must be a non-negative number')
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

    const {
      page = 1,
      limit,
      search,
      city,
      country,
      propertyType,
      roomType,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      bathrooms,
      amenities,
      instantBook,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 10,
      checkIn,
      checkOut,
      featured
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } }
      ];
    }

    // Location filters
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (country) filter['location.country'] = { $regex: country, $options: 'i' };

    // Property filters
    if (propertyType) filter.propertyType = propertyType;
    if (roomType) filter.roomType = roomType;

    // Price range
    if (minPrice || maxPrice) {
      filter['pricing.basePrice'] = {};
      if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Capacity filters
    if (guests) filter['capacity.guests'] = { $gte: parseInt(guests) };
    if (bedrooms) filter['capacity.bedrooms'] = { $gte: parseInt(bedrooms) };
    if (bathrooms) filter['capacity.bathrooms'] = { $gte: parseFloat(bathrooms) };

    // Amenities filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      filter.amenities = { $all: amenitiesList };
    }

    // Instant book
    if (instantBook === 'true') filter['availability.instantBook'] = true;

    // Featured listings
    if (featured === 'true') filter.featured = true;

    // Geographic search
    if (lat && lng) {
      filter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 3963.2]
        }
      };
    }

    // Date availability check
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Find bookings that conflict with requested dates
      const conflictingBookings = await Booking.find({
        $or: [
          {
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          }
        ],
        status: { $in: ['confirmed', 'pending'] }
      }).distinct('listing');

      filter._id = { $nin: conflictingBookings };
      console.log(filter._id);
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'pricing.basePrice', 'metrics.rating', 'metrics.reviewCount'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
      console.log(sortOptions[sortBy]);
    } else {
      sortOptions.createdAt = -1;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('host', 'firstName lastName avatar hostProfile.superhost')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Listing.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    console.log(total);

    res.json({
      success: true,
      data: listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        city,
        country,
        propertyType,
        roomType,
        minPrice,
        maxPrice,
        guests,
        bedrooms,
        bathrooms,
        amenities,
        instantBook,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings'
    });
  }
});

// Get single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('host', 'firstName lastName avatar hostProfile phone email')
      .lean();

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Get reviews for this listing
    const reviews = await Review.find({
      listing: req.params.id,
      type: 'guest-to-host',
      isPublic: true
    })
      .populate('reviewer', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Increment view count
    await Listing.findByIdAndUpdate(req.params.id, {
      $inc: { 'metrics.views': 1 }
    });

    res.json({
      success: true,
      data: {
        ...listing,
        reviews
      }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing'
    });
  }
});


// Delete an image from listing (Host only)
router.delete('/:id/images/:imageId', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this listing'
      });
    }

    // Find the image to delete
    const imageToDelete = listing.images.find(
      img => img._id.toString() === req.params.imageId
    );

    if (!imageToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in this listing'
      });
    }

    // Remove the image from the array
    listing.images = listing.images.filter(
      img => img._id.toString() !== req.params.imageId
    );

    // If we deleted the primary image and there are other images, make the first one primary
    if (imageToDelete.isPrimary && listing.images.length > 0) {
      listing.images[0].isPrimary = true;
    }

    // Delete the actual file from server
    const filePath = path.join(__dirname,'routes', 'listingimages', path.basename(imageToDelete.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await listing.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: listing
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting image'
    });
  }
});


// Delete listing (Host only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      listing: req.params.id,
      status: { $in: ['confirmed', 'pending'] },
      checkIn: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete listing with active bookings'
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing'
    });
  }
});

// Get host's listings
router.get('/host/my-listings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12, status } = req.query;

    const filter = { host: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Listing.countDocuments(filter)

    ]);
    console.log(listings, "\n", total);

    res.json({
      success: true,
      data: listings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get host listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching host listings'
    });
  }
});

module.exports = router;