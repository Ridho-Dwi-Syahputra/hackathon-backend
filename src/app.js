const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8080',
        'http://10.0.2.2:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'SAKO Backend API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
try {
    // Import routes yang ada
    const authRoutes = require('./routes/authRoutes');
    const quizRoutes = require('./routes/quizRoutes');
    const categoryRoutes = require('./routes/categoryRoutes');
    
    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/quiz', quizRoutes);
    app.use('/api/category', categoryRoutes);

} catch (routeError) {
    console.warn('⚠️ Warning: Some routes failed to load:', routeError.message);
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
        availableEndpoints: [
            'GET /',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/quiz/categories',
            'GET /api/category/all'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Global Error Handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
