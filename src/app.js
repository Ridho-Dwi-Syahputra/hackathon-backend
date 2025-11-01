const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const categoryRoutes = require('./routes/categoryroutes');
const quizRoutes = require('./routes/quizRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const videoRoutes = require('./routes/videoRoutes');
const locationRoutes = require('./routes/locationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ✅ Base API test route
app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'SAKO API is running 🚀',
    health: '/api/health'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SAKO Backend is running ✅' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
