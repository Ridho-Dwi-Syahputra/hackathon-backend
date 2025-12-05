// videoCollectionRoutes.js

const express = require('express');
const router = express.Router();
const videoCollectionController = require('../controllers/videoCollectionController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Video Collection CRUD
router.post('/collections', videoCollectionController.createCollection);
router.get('/collections', videoCollectionController.getCollections);
router.get('/collections/:collectionId', videoCollectionController.getCollectionDetail);
router.put('/collections/:collectionId', videoCollectionController.updateCollection);
router.delete('/collections/:collectionId', videoCollectionController.deleteCollection);

// Video Collection-Video operations
router.post('/collections/:collectionId/videos/:videoId', videoCollectionController.addVideoToCollection);
router.delete('/collections/:collectionId/videos/:videoId', videoCollectionController.removeVideoFromCollection);

// Get collections for specific video (to show which collections can add this video)
router.get('/videos/:videoId/collections', videoCollectionController.getCollectionsForVideo);

module.exports = router;
