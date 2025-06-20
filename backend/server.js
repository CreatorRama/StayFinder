const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/Listings');
const bookingRoutes = require('./routes/bookings');
// const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');
const reviewRoutes = require('./routes/review');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "https://js.stripe.com"],
      'frame-src': ["'self'", "https://js.stripe.com"],
      'connect-src': ["'self'", "https://api.stripe.com"],
      'style-src': ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      'img-src': ["'self'", "https://*.stripe.com"], // Add your backend URL
    }
  },
  crossOriginResourcePolicy: false 
}));

app.use(cors({
  origin: ['http://localhost:5003'], // Add your frontend URL
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60*60, // 30 seconds window
  max: 100, // limit each IP to 1 request per windowMs
  message: 'Too many requests, please try again after 30 seconds',
  headers: true, // send rate limit headers
  handler: (req, res, next, options) => {
    res.status(options.statusCode)
       .set('Retry-After', '30') // Set Retry-After header to 30 seconds
       .send({
         message: options.message,
         retryAfter: 30 // Also include in response body if desired
       });
  }
});

app.use('/api/', limiter);

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update booking status
      await Booking.findOneAndUpdate(
        { 'paymentDetails.stripePaymentIntentId': paymentIntent.id },
        { 
          paymentStatus: 'paid',
          status: 'confirmed'
        }
      );
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await Booking.findOneAndUpdate(
        { 'paymentDetails.stripePaymentIntentId': failedPayment.id },
        { paymentStatus: 'failed' }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/listingimages', express.static(path.join(__dirname, 'routes', 'listingimages')))

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StayFinder server running on port ${PORT}`);
});