/*
 * MAP ROUTES - SAKO BACKEND
 * Mengatur routing untuk semua fitur modul map
 * Berdasarkan 6 fungsional requirement dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const express = require('express');
const router = express.Router();

// Import controllers
const { detailMapController } = require('../controllers/modul-map/detailMapController');
const { reviewMapController } = require('../controllers/modul-map/reviewMapController');
const { scanMapController } = require('../controllers/modul-map/scanMapController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');

/**
 * ===========================================
 * DETAIL MAP ROUTES (Fungsional 1, 2, 3)
 * ===========================================
 */

// FUNGSIONAL 1: Mendapatkan detail lengkap tempat wisata
// GET /api/map/detail/:id
// Optional auth - guest bisa akses, user login dapat info favorit
router.get('/detail/:id', (req, res, next) => {
    // Optional authentication - tidak wajib login
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        authenticateToken(req, res, next);
    } else {
        req.user = null; // Set sebagai guest
        next();
    }
}, detailMapController.getPlaceDetail);

// FUNGSIONAL 2: Menambahkan/menghapus tempat dari daftar favorit
// POST /api/map/favorite/toggle
// Required auth - hanya user login
router.post('/favorite/toggle', authenticateToken, detailMapController.toggleFavorite);

// FUNGSIONAL 3: Mendapatkan daftar tempat favorit user
// GET /api/map/favorites
// Required auth - hanya user login
router.get('/favorites', authenticateToken, detailMapController.getUserFavorites);

/**
 * ===========================================
 * REVIEW MAP ROUTES (Fungsional 4, 5)
 * ===========================================
 */

// FUNGSIONAL 4: Menambahkan review dan rating untuk tempat wisata
// POST /api/map/review/add
// Required auth - hanya user login bisa review
router.post('/review/add', authenticateToken, reviewMapController.addReview);

// FUNGSIONAL 5: Mendapatkan semua review untuk tempat wisata tertentu
// GET /api/map/review/:tourist_place_id
// Optional auth - guest bisa lihat review
router.get('/review/:tourist_place_id', (req, res, next) => {
    // Optional authentication - tidak wajib login untuk lihat review
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        authenticateToken(req, res, next);
    } else {
        req.user = null; // Set sebagai guest
        next();
    }
}, reviewMapController.getPlaceReviews);

/**
 * ===========================================
 * SCAN MAP ROUTES (Fungsional 6 + Bonus)
 * ===========================================
 */

// FUNGSIONAL 6: Scan QR code di tempat wisata dan catat kunjungan
// POST /api/map/scan/qr
// Required auth - hanya user login bisa scan
router.post('/scan/qr', authenticateToken, scanMapController.scanQRCode);

// BONUS: Mendapatkan riwayat kunjungan user
// GET /api/map/scan/history
// Required auth - hanya user login
router.get('/scan/history', authenticateToken, scanMapController.getUserVisitHistory);

/**
 * ===========================================
 * ROUTE SUMMARY & DOCUMENTATION
 * ===========================================
 * 
 * PUBLIC ROUTES (Guest Access):
 * - GET    /api/map/detail/:id              - Detail tempat wisata
 * - GET    /api/map/review/:tourist_place_id  - List review tempat
 * 
 * AUTHENTICATED ROUTES (Login Required):
 * - POST   /api/map/favorite/toggle         - Toggle favorit
 * - GET    /api/map/favorites               - List favorit user
 * - POST   /api/map/review/add              - Tambah review + FCM notification
 * - POST   /api/map/scan/qr                 - Scan QR + catat kunjungan + FCM notification
 * - GET    /api/map/scan/history            - Riwayat kunjungan user
 * 
 * QUERY PARAMETERS:
 * - GET /api/map/review/:id?page=1&limit=10&sort=newest|oldest|highest|lowest
 * - GET /api/map/scan/history?page=1&limit=10
 * 
 * RESPONSE FORMAT:
 * All endpoints menggunakan responseHelper.success() dan responseHelper.error()
 * 
 * LOGGING:
 * Semua activity tercatat di logs/map/ menggunakan logsGenerator
 * 
 * NOTIFICATIONS:
 * - Review berhasil ditambahkan -> FCM notification
 * - QR scan sukses (first visit today) -> FCM notification
 * 
 */

module.exports = router;