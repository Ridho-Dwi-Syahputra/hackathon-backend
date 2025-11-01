//locationRoutes

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', locationController.getTouristPlaces);
router.get('/visited', locationController.getVisitedPlaces);
router.get('/:placeId', locationController.getTouristPlaceDetail);
router.post('/checkin', locationController.checkinLocation);

module.exports = router;