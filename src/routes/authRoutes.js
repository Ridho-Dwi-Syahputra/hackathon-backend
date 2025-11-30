//authRoutes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Existing routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

// ====== ROUTES BARU UNTUK FCM & NOTIFICATIONS ======
router.put('/fcm-token', authMiddleware, authController.updateFcmToken);
router.put('/notification-preferences', authMiddleware, authController.updateNotificationPreferences);
router.get('/notification-preferences', authMiddleware, authController.getNotificationPreferences);
// ===================================================

module.exports = router;