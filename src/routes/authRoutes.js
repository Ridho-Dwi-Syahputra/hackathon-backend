//authRoutes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
// Import database token middleware sebagai alternatif
const { authenticateTokenFromDB } = require('../middleware/token');

// Public routes (no authentication)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

// FCM & Notification routes
router.put('/fcm-token', authMiddleware, authController.updateFcmToken);
router.put('/notification-preferences', authMiddleware, authController.updateNotificationPreferences);
router.get('/notification-preferences', authMiddleware, authController.getNotificationPreferences);

// ====== DATABASE TOKEN MANAGEMENT ROUTES ======
// Menggunakan database token middleware
router.post('/revoke-token', authMiddleware, authController.revokeToken);
router.get('/validate-token', authMiddleware, authController.validateToken);

// ====== AUTO-LOGIN ROUTE (30 DAYS) ======
// Auto-login menggunakan database token untuk validasi 30 hari
router.get('/auto-login', authenticateTokenFromDB, authController.autoLogin);

// Alternative routes menggunakan database token verification
// Uncomment jika ingin switch ke database token verification
// router.post('/logout-db', authenticateTokenFromDB, authController.logout);
// router.get('/profile-db', authenticateTokenFromDB, authController.getProfile);
// ==================================================

module.exports = router;