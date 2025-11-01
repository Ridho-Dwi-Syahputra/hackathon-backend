//reviewCOntroller.js

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Add Review
exports.addReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tourist_place_id, rating, review_text } = req.body;

    // Validation
    if (!tourist_place_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Lokasi dan rating harus diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    // Check if place exists
    const [places] = await db.query(
      'SELECT id FROM tourist_place WHERE id = ? AND is_active = 1',
      [tourist_place_id]
    );

    if (places.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi tidak ditemukan'
      });
    }

    // Check if user has visited this place
    const [visits] = await db.query(
      'SELECT id FROM user_visit WHERE user_id = ? AND tourist_place_id = ? AND status = "visited"',
      [userId, tourist_place_id]
    );

    if (visits.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Anda harus mengunjungi lokasi ini terlebih dahulu sebelum memberikan ulasan'
      });
    }

    // Check if user already reviewed this place
    const [existingReviews] = await db.query(
      'SELECT id FROM review WHERE user_id = ? AND tourist_place_id = ?',
      [userId, tourist_place_id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah memberikan ulasan untuk lokasi ini'
      });
    }

    // Add review
    const reviewId = uuidv4();
    await db.query(
      `INSERT INTO review (id, user_id, tourist_place_id, rating, review_text, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [reviewId, userId, tourist_place_id, rating, review_text]
    );

    res.status(201).json({
      success: true,
      message: 'Ulasan berhasil ditambahkan',
      data: {
        id: reviewId
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update Review
exports.updateReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, review_text } = req.body;

    // Validation
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    // Check if review exists and belongs to user
    const [reviews] = await db.query(
      'SELECT id FROM review WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan atau bukan milik Anda'
      });
    }

    // Update review
    await db.query(
      'UPDATE review SET rating = ?, review_text = ?, updated_at = NOW() WHERE id = ?',
      [rating, review_text, reviewId]
    );

    res.json({
      success: true,
      message: 'Ulasan berhasil diperbarui'
    });

  } catch (error) {
    next(error);
  }
};

// Delete Review
exports.deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const [reviews] = await db.query(
      'SELECT id FROM review WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ulasan tidak ditemukan atau bukan milik Anda'
      });
    }

    // Delete review
    await db.query('DELETE FROM review WHERE id = ?', [reviewId]);

    res.json({
      success: true,
      message: 'Ulasan berhasil dihapus'
    });

  } catch (error) {
    next(error);
  }
};