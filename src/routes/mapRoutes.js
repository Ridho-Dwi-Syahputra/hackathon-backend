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
const authMiddleware = require('../middleware/auth');
const { authenticateTokenFromDB } = require('../middleware/token');
// Use authMiddleware as authenticateToken alias for consistency
// Use authenticateTokenFromDB for enhanced security and auto-login compatibility
const authenticateToken = authMiddleware;
const authenticateTokenEnhanced = authenticateTokenFromDB;

/**
 * ===========================================
 * DETAIL MAP ROUTES (Fungsional 1, 2)
 * ===========================================
 */

// FUNGSIONAL 1: List lokasi budaya dengan status kunjungan
// GET /api/map/places
// Required auth - menggunakan JWT token dari header Authorization
router.get('/places', authenticateToken, detailMapController.getPlacesWithVisitStatus);

// ADDITIONAL: List tempat wisata yang sudah dikunjungi
// GET /api/map/visited
router.get('/visited', authenticateToken, detailMapController.getVisitedPlaces);

// FUNGSIONAL 2: Detail lokasi & validasi scan QR
// GET /api/map/places/:id
// Required auth - untuk validasi scan QR berdasarkan status kunjungan
router.get('/places/:id', authenticateToken, detailMapController.getPlaceDetail);

/**
 * ===========================================
 * REVIEW MAP ROUTES (Fungsional 3, 4, 5)
 * ===========================================
 */

// FUNGSIONAL 3: Mendapatkan semua review untuk tempat wisata tertentu
// GET /api/map/places/:id/reviews
// Required auth - menggunakan JWT token dari header Authorization
router.get('/places/:id/reviews', authenticateToken, reviewMapController.getPlaceReviews);

// FUNGSIONAL 5: Mengelola ulasan (Tambah, Edit, Hapus)
// POST /api/map/reviews/add - Tambah review (EXPLICIT ACTION) - tourist_place_id di body
router.post('/reviews/add', authenticateToken, reviewMapController.addReview);

// PUT /api/map/reviews/:id/edit - Edit review (EXPLICIT ACTION)
router.put('/reviews/:id/edit', authenticateToken, reviewMapController.editReview);

// DELETE /api/map/reviews/:id/delete - Hapus review (EXPLICIT ACTION)
router.delete('/reviews/:id/delete', authenticateToken, reviewMapController.deleteReview);

// FUNGSIONAL 4: Toggle like pada review
// POST /api/reviews/:id/toggle-like
router.post('/reviews/:id/toggle-like', authenticateToken, reviewMapController.toggleReviewLike);

/**
 * ===========================================
 * SCAN MAP ROUTES (Fungsional 6 + Bonus)
 * ===========================================
 */

// FUNGSIONAL 6: Scan QR code dan catat kunjungan + FCM notification
// POST /api/map/scan/qr
// Required auth - menggunakan JWT token dari header Authorization
router.post('/scan/qr', authenticateToken, scanMapController.scanQRCode);

/**
 * ===========================================
 * ROUTE SUMMARY & DOCUMENTATION
 * ===========================================
 * 
 * AUTHENTICATED ROUTES (6 Fungsionalitas) - ENHANCED SECURITY:
 * - GET    /api/map/places                     - List tempat dengan status kunjungan (Enhanced Auth)
 * - GET    /api/map/places/:id                 - Detail tempat + validasi scan QR (Enhanced Auth)
 * - GET    /api/map/places/:id/reviews         - List review tempat (Enhanced Auth) 
 * - POST   /api/map/reviews/add                - Tambah review + FCM notification (Enhanced Auth)
 * - PUT    /api/map/reviews/:id/edit           - Edit review user [NEW]
 * - DELETE /api/map/reviews/:id/delete         - Hapus review user [NEW]
 * - POST   /api/map/reviews/:id/toggle-like    - Toggle like review
 * - POST   /api/map/scan/qr                    - Scan QR + update kunjungan + FCM notification
 * 
 * TOTAL: 8 ENDPOINTS (6 Fungsionalitas)
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