const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import URL configuration helper
const UrlConfig = require('./utils/urlConfig');
const urlConfig = new UrlConfig();

const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// CORS configuration with flexible origins using UrlConfig
app.use(
    cors({
        origin: urlConfig.getCorsOrigins(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint with dynamic URL info
app.get('/', (req, res) => {
    const serverInfo = urlConfig.getServerInfo();
    const baseUrl = urlConfig.getApiBaseUrl();

    res.json({
        success: true,
        message: 'SAKO Backend API is running!',
        timestamp: new Date().toISOString(),
        server_info: serverInfo,
        endpoints: {
            auth: `${baseUrl}/api/auth`,
            map: `${baseUrl}/api/map`,
            scan: `${baseUrl}/api/scan`,
        },
        android_config: urlConfig.generateAndroidConfig(),
    });
});

// API Routes
try {
    // Import routes yang ada
    const authRoutes = require('./routes/authRoutes');
    const quizRoutes = require('./routes/quizRoutes');
    const categoryRoutes = require('./routes/categoryroutes');
    const mapRoutes = require('./routes/mapRoutes');

    // Import scan controller untuk endpoint /api/scan terpisah
    const { scanMapController } = require('./controllers/modul-map/scanMapController');
    const authMiddleware = require('./middleware/auth');

    // Import routes tambahan jika ada
    let badgeRoutes, profileRoutes, videoRoutes;

    try {
        badgeRoutes = require('./routes/badgeRoutes');
    } catch (e) {
        console.warn('⚠️ badgeRoutes not found or has error:', e.message);
    }

    try {
        profileRoutes = require('./routes/profileRoutes');
    } catch (e) {
        console.warn('⚠️ profileRoutes not found or has error:', e.message);
    }

    try {
        videoRoutes = require('./routes/videoRoutes');
    } catch (e) {
        console.warn('⚠️ videoRoutes not found or has error:', e.message);
    }

    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/quiz', quizRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/map', mapRoutes);

    // FUNGSIONAL 6: Mount scan endpoint terpisah
    app.post('/api/scan', authMiddleware, scanMapController.scanQRCode);

    // Mount routes tambahan jika berhasil diimport
    if (badgeRoutes) app.use('/api/badge', badgeRoutes);
    if (profileRoutes) app.use('/api/profile', profileRoutes);
    if (videoRoutes) app.use('/api/videos', videoRoutes);
} catch (routeError) {
    console.warn('⚠️ Warning: Some routes failed to load:', routeError.message);
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
        availableEndpoints: ['GET /', 'POST /api/auth/login', 'POST /api/auth/register', 'GET /api/quiz/categories', 'GET /api/category/all', 'GET /api/map/detail/:id', 'POST /api/map/review/add', 'POST /api/map/scan/qr'],
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Global Error Handler:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

module.exports = app;
