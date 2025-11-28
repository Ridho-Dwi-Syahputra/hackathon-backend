const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// Semua route butuh authentication
router.use(auth);

// GET /api/categories - List semua kategori dengan progress
router.get('/', categoryController.getCategories);

// GET /api/categories/:id/levels - List level dalam kategori
router.get('/:id/levels', categoryController.getCategoryLevels);

module.exports = router;