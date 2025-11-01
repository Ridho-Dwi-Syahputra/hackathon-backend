//categoryController.js

const db = require('../config/database');

// Get All Categories with User Progress
exports.getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [categories] = await db.query(
      `SELECT 
         c.id, 
         c.name, 
         c.description, 
         c.display_order,
         COALESCE(ucp.percent_completed, 0) as percent_completed,
         COALESCE(ucp.completed_levels_count, 0) as completed_levels_count,
         COALESCE(ucp.total_levels_count, 0) as total_levels_count
       FROM quiz_category c
       LEFT JOIN user_category_progress ucp ON c.id = ucp.category_id AND ucp.user_id = ?
       WHERE c.is_active = 1
       ORDER BY c.display_order ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    next(error);
  }
};

// Get Levels by Category with User Progress
exports.getLevelsByCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categoryId } = req.params;

    // Check if category exists
    const [categories] = await db.query(
      'SELECT id, name FROM quiz_category WHERE id = ? AND is_active = 1',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Get levels with progress
    const [levels] = await db.query(
      `SELECT 
         l.id, 
         l.name, 
         l.description,
         l.time_limit_seconds,
         l.base_xp,
         l.base_points,
         l.display_order,
         COALESCE(ulp.status, 'locked') as status,
         COALESCE(ulp.best_percent_correct, 0) as best_percent_correct,
         COALESCE(ulp.best_score_points, 0) as best_score_points,
         COALESCE(ulp.total_attempts, 0) as total_attempts
       FROM level l
       LEFT JOIN user_level_progress ulp ON l.id = ulp.level_id AND ulp.user_id = ?
       WHERE l.category_id = ? AND l.is_active = 1
       ORDER BY l.display_order ASC`,
      [userId, categoryId]
    );

    res.json({
      success: true,
      data: {
        category: categories[0],
        levels: levels
      }
    });

  } catch (error) {
    next(error);
  }
};