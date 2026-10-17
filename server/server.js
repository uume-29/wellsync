const path = require('path');
const dotenv = require('dotenv');

// Load environment variables immediately before other modules
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser & Cookie Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS with Credentials for HttpOnly cookies
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation'), false);
    },
    credentials: true,
  })
);

// Safe development request logger (no tokens, passwords, or secrets logged)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const hasCookie = Boolean(req.cookies?.token);
    const hasAuth = Boolean(req.headers.authorization);
    console.log(`[API Request] ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin || 'same-origin'} | HasCookie: ${hasCookie} | HasAuthHeader: ${hasAuth}`);
    next();
  });
}

// Mount Auth, Profile & Meal Planner Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/meals', require('./routes/mealPlanRoutes'));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'WellSync API Backend',
    time: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error]: ${err.stack}`);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[WellSync Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});
