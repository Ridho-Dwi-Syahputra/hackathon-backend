//videoRoutes

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/auth');

// Semua endpoint video butuh authentication
router.use(authMiddleware);

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Order matters! /favorites must be before /:videoId
router.get('/', videoController.getVideos);
router.get('/favorites', videoController.getFavoriteVideos);
router.get('/:videoId', videoController.getVideoDetail);
router.post('/:videoId/favorite', videoController.addFavoriteVideo);
router.delete('/:videoId/favorite', videoController.removeFavoriteVideo);

module.exports = router;
