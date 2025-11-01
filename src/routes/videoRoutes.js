//videoRoutes

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', videoController.getVideos);
router.get('/favorites', videoController.getFavoriteVideos);
router.get('/:videoId', videoController.getVideoDetail);
router.post('/:videoId/favorite', videoController.addFavoriteVideo);
router.delete('/:videoId/favorite', videoController.removeFavoriteVideo);

module.exports = router;