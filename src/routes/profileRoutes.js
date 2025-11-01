//profileRoutes

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authMiddleware); // All routes need authentication

router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.put('/profile/image', (req, res, next) => {
  req.uploadType = 'profiles';
  next();
}, upload.single('image'), profileController.updateProfileImage);
router.put('/password', profileController.changePassword);

module.exports = router;