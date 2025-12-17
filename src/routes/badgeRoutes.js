//badgeRoutes

const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all badges dengan status user (owned/locked)
router.get('/', badgeController.getAllBadges);

// Get user's earned badges
router.get('/user', badgeController.getUserBadges);

// Get unviewed badges (untuk popup)
router.get('/unviewed', badgeController.getUnviewedBadges);

// Mark specific badge as viewed
router.post('/:badgeId/view', badgeController.markBadgeAsViewed);

// Mark all badges as viewed
router.post('/view-all', badgeController.markAllBadgesAsViewed);

module.exports = router;