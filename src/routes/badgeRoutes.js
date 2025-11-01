//badgeRoutes

const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', badgeController.getAllBadges);
router.get('/user', badgeController.getUserBadges);

module.exports = router;