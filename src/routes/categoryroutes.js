//categoryroutes

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.get('/:categoryId/levels', categoryController.getLevelsByCategory);

module.exports = router;