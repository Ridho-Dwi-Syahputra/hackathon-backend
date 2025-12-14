const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authMiddleware = require('../middleware/auth');

/**
 * Home Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/home/dashboard
 * @desc    Get comprehensive dashboard data
 * @access  Private
 */
router.get('/dashboard', authMiddleware, homeController.getDashboardData);

/**
 * @route   GET /api/home/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authMiddleware, homeController.getUserStats);

/**
 * @route   GET /api/home/activities
 * @desc    Get recent user activities
 * @access  Private
 * @query   limit - Number of activities to return (default: 10)
 */
router.get('/activities', authMiddleware, homeController.getRecentActivities);

/**
 * @route   GET /api/home/popular
 * @desc    Get popular content (videos and places)
 * @access  Private
 * @query   limit - Number of items per category (default: 5)
 */
router.get('/popular', authMiddleware, homeController.getPopularContent);

module.exports = router;
