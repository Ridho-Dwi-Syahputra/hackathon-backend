//profileRoutes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/modul-profile/profileController');
const settingController = require('../controllers/modul-profile/settingController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * Profile Routes
 * Base path: /auth (dipasang di app.js)
 * 
 * All routes require authentication
 */

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /auth/profile
 * @desc    Get user profile with stats and badges
 * @access  Private (requires auth token)
 * @response {
 *   success: true,
 *   data: {
 *     user: { id, fullName, email, totalXp, userImageUrl, status, createdAt, updatedAt },
 *     stats: { totalAttempts, completedLevels, totalPoints, visitedPlaces },
 *     badges: [{ id, name, description, imageUrl, earnedAt }]
 *   },
 *   message: "Profil berhasil dimuat"
 * }
 */
router.get('/profile', profileController.getProfile);

/**
 * @route   PUT /auth/profile
 * @desc    Update user profile (name and email)
 * @access  Private
 * @body    { full_name, email }
 */
router.put('/profile', profileController.updateProfile);

/**
 * @route   PUT /auth/profile/image
 * @desc    Update user profile image
 * @access  Private
 * @body    multipart/form-data with 'image' field
 */
router.put('/profile/image', (req, res, next) => {
    // Set upload type for middleware
    req.uploadType = 'profiles';
    next();
}, upload.single('image'), profileController.updateProfileImage);

/**
 * @route   PUT /auth/password
 * @desc    Change user password
 * @access  Private
 * @body    { current_password, new_password }
 */
router.put('/password', profileController.changePassword);

/**
 * @route   PUT /auth/notification-preferences
 * @desc    Update user notification preferences
 * @access  Private
 * @body    { system_announcements, marketing, map_notifications, video_notifications, quiz_notifications }
 */
router.put('/notification-preferences', settingController.updateNotificationPreferences);

/**
 * @route   GET /auth/notification-preferences
 * @desc    Get user notification preferences
 * @access  Private
 * @response { notification_preferences: {...} }
 */
router.get('/notification-preferences', settingController.getNotificationPreferences);

module.exports = router;