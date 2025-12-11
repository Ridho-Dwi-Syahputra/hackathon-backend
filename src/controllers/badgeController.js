//badgeController.js

const db = require('../config/database');

// Get All Badges
exports.getAllBadges = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const badgesResult = await db.query(
      `SELECT 
         b.id, 
         b.name, 
         b.description, 
         b.image_url,
         b.criteria_type,
         CASE WHEN ub.id IS NOT NULL THEN 1 ELSE 0 END as is_earned,
         ub.earned_at
       FROM badge b
       LEFT JOIN user_badge ub ON b.id = ub.badge_id AND ub.user_id = ?
       WHERE b.is_active = 1
       ORDER BY is_earned DESC, b.name ASC`,
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

// Get User Badges
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
         ub.source_category_id
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