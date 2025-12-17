//badgeController.js

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// GET /api/badges - Get All Badges dengan status user
// ============================================================================
exports.getAllBadges = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    // Get all badges dengan status earned
    const badgesResult = await db.query(
      `SELECT 
         b.id, 
         b.name, 
         b.description, 
         b.image_url,
         b.criteria_type,
         b.criteria_value,
         CASE WHEN ub.id IS NOT NULL THEN 1 ELSE 0 END as is_earned,
         ub.earned_at,
         ub.is_viewed
       FROM badge b
       LEFT JOIN user_badge ub ON b.id = ub.badge_id AND ub.user_id = ?
       WHERE b.is_active = 1
       ORDER BY is_earned DESC, b.created_at ASC`,
      [userId]
    );
    const badges = Array.isArray(badgesResult) ? badgesResult : (Array.isArray(badgesResult[0]) ? badgesResult[0] : []);

    // Separate earned and locked badges
    const earnedBadges = badges.filter(b => b.is_earned === 1);
    const lockedBadges = badges.filter(b => b.is_earned === 0);

    // Calculate progress for point-based badges
    const progressData = {};
    
    // Get user's total points
    const [userPoints] = await db.query(
      `SELECT total_points FROM user_points WHERE user_id = ?`,
      [userId]
    );
    const totalPoints = userPoints.length > 0 ? userPoints[0].total_points : 0;

    // Calculate progress for each locked badge
    for (let badge of lockedBadges) {
      if (badge.criteria_type === 'points_total') {
        const criteria = JSON.parse(badge.criteria_value);
        const minPoints = criteria.min_points || 0;
        progressData[badge.id] = {
          current: totalPoints,
          target: minPoints,
          percentage: Math.min((totalPoints / minPoints) * 100, 100)
        };
      }
      // TODO: Add progress calculation for other types (streak, category_mastery, etc.)
    }

    res.json({
      success: true,
      data: {
        owned: earnedBadges,
        locked: lockedBadges,
        progress: progressData,
        totalBadges: badges.length,
        earnedCount: earnedBadges.length
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================================
// GET /api/badges/user - Get User's Earned Badges
// ============================================================================
exports.getUserBadges = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const badgesResult = await db.query(
      `SELECT 
         b.id, 
         b.name, 
         b.description, 
         b.image_url,
         b.criteria_type,
         ub.earned_at,
         ub.source_level_id,
         ub.source_category_id,
         ub.is_viewed,
         ub.viewed_at
       FROM user_badge ub
       JOIN badge b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [userId]
    );
    const badges = Array.isArray(badgesResult) ? badgesResult : (Array.isArray(badgesResult[0]) ? badgesResult[0] : []);

    res.json({
      success: true,
      data: badges
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================================
// GET /api/badges/unviewed - Get Unviewed Badges (untuk popup di home)
// ============================================================================
exports.getUnviewedBadges = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const badgesResult = await db.query(
      `SELECT 
         b.id, 
         b.name, 
         b.description, 
         b.image_url,
         b.criteria_type,
         ub.earned_at
       FROM user_badge ub
       JOIN badge b ON ub.badge_id = b.id
       WHERE ub.user_id = ? AND (ub.is_viewed = 0 OR ub.is_viewed IS NULL)
       ORDER BY ub.earned_at DESC`,
      [userId]
    );
    const badges = Array.isArray(badgesResult) ? badgesResult : (Array.isArray(badgesResult[0]) ? badgesResult[0] : []);

    res.json({
      success: true,
      data: badges
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================================
// POST /api/badges/:badgeId/view - Mark badge as viewed
// ============================================================================
exports.markBadgeAsViewed = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { badgeId } = req.params;

    // Update is_viewed status
    const result = await db.query(
      `UPDATE user_badge 
       SET is_viewed = 1, viewed_at = NOW()
       WHERE user_id = ? AND badge_id = ?`,
      [userId, badgeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Badge tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Badge ditandai sudah dilihat'
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================================
// POST /api/badges/view-all - Mark all badges as viewed
// ============================================================================
exports.markAllBadgesAsViewed = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    await db.query(
      `UPDATE user_badge 
       SET is_viewed = 1, viewed_at = NOW()
       WHERE user_id = ? AND (is_viewed = 0 OR is_viewed IS NULL)`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Semua badge ditandai sudah dilihat'
    });

  } catch (error) {
    next(error);
  }
};