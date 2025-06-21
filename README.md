# StayFinder 🏠

A full-stack property rental web application similar to Airbnb, built with the MERN stack. Users can list properties, search for accommodations, and make bookings for short-term or long-term stays.

![StayFinder Demo](./Demo-Screenshot.png)



[Live-Link](https://stay-finder-4a7u.vercel.app/)

## 🚀 Features

### Core Features
- **Property Listings**: Browse properties with images, location, and pricing
- **Detailed Property View**: Comprehensive property pages with image galleries, descriptions, and availability calendar
- **User Authentication**: Secure registration and login system with JWT tokens
- **Booking System**: Complete reservation functionality with date selection
- **Host Dashboard**: Property management interface for hosts to create, edit, and manage listings

### Bonus Features ✨
- **Advanced Search & Filters**: Filter by location, price range, dates, and property type
- **Interactive Maps**: Mapbox integration showing property locations
- **Mock Payment Integration**: Simulated payment processing workflow
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Redux Toolkit** - Predictable state management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Comprehensive icon library
- **Mapbox GL JS** - Interactive maps integration
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cors** - Cross-origin resource sharing

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart development server

## 📁 Project Structure

```
stayfinder/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based component organization
│   │   ├── store/          # Redux store configuration
│   │   ├── pages/          # Route-based page components
│   │   ├── utils/          # Helper functions and utilities
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.jsx         # Main application component
│   ├── public/
│   └── package.json
└── backend/
    ├── routes/             # API route definitions
    ├── models/             # Database models (User, Listing, Booking)
    ├── middleware/         # Custom middleware functions
    ├── config/             # Database and app configuration
    ├── routes/listingimages/  # Image upload handling
    ├── server.js           # Main server file
    └── package.json
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (guest/host),
  createdAt: Date
}
```

### Listing Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  location: {
    address: String,
    coordinates: [longitude, latitude]
  },
  images: [String],
  amenities: [String],
  host: ObjectId (ref: User),
  availability: [Date],
  createdAt: Date
}
```

### Booking Model
```javascript
{
  user: ObjectId (ref: User),
  listing: ObjectId (ref: Listing),
  checkIn: Date,
  checkOut: Date,
  totalPrice: Number,
  status: String,
  createdAt: Date
}
```

## 🚦 API Endpoints (Working)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create new listing (hosts only)
- `PUT /api/listings/:id` - Update listing (host only)
- - `GET /api/listings/host/my-listings` -Host listings (host only)
- `DELETE /api/listings/:id` - Delete listing (host only)

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get bookings by id
-  `GET /api/bookings/:id/status` - Update booking status (Host only)
-  `GET /api/bookings/:id/cancel` -cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` -Confirm payment

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/stayfinder.git
cd stayfinder
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/stayfinder
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000" > .env

# Start the server
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_token_here" > .env

# Start the development server
npm run dev
```

4. **Seed Database (Optional)**
```bash
cd backend
npm run seed
```

### Environment Variables

#### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/stayfinder
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
PORT=5000
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

## 🧪 Testing

The application includes seed data for testing purposes:
- Sample properties in various locations
- Test user accounts (host and guest roles)
- Mock booking data

### Test Accounts
- **Host**: ap410485@gmail.com.com / Amanwa
- **Guest**: ap41045@gmail.com / Amanwa

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation for all endpoints
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Upload Security**: Validated image uploads with size limits

## 📱 Responsive Design

The application is fully responsive and tested on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
npm run dev
# Deploy dist folder
```

### Backend (Heroku/Railway)
```bash
# Set environment variables in deployment platform
# Deploy with MongoDB Atlas connection
npm install
npm start or npm run dev
npm run seed for seeding mock data 
```

## 🎯 Future Enhancements

- Real-time chat between hosts and guests
- Advanced calendar management
- Email notifications for bookings
- Review and rating system
- Multi-language support
- Progressive Web App (PWA) features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/CreatorRama)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/aman-pandey-237728259)
- Email: ap410485@gmail.com

## 🙏 Acknowledgments

- Airbnb for design inspiration
- Mapbox for mapping services
- The React and Node.js communities
- All contributors and testers

---

*Built with ❤️ for the StayFinder Internship Project*
