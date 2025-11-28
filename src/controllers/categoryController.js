const db = require('../config/database');

// GET /api/categories - List semua kategori dengan progress user
exports.getCategories = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const [categories] = await db.query(
      `SELECT 
         c.id, 
         c.name, 
         c.description,
         c.is_active,
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
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        is_active: Boolean(cat.is_active),
        display_order: cat.display_order,
        progress: {
          percent_completed: parseFloat(cat.percent_completed),
          completed_levels_count: cat.completed_levels_count,
          total_levels_count: cat.total_levels_count
        }
      }))
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id/levels - List level dalam kategori dengan status lock/unlock
exports.getCategoryLevels = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const categoryId = req.params.id;

    // Check if category exists
    const [categories] = await db.query(
      'SELECT id, name, description, is_active, display_order FROM quiz_category WHERE id = ? AND is_active = 1',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        status: 'error',
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
         l.pass_threshold,
         l.pass_condition_type,
         l.base_xp,
         l.base_points,
         l.display_order,
         l.max_questions,
         ulp.status as progress_status,
         COALESCE(ulp.best_percent_correct, 0) as best_percent_correct,
         COALESCE(ulp.best_score_points, 0) as best_score_points,
         COALESCE(ulp.total_attempts, 0) as total_attempts
       FROM level l
       LEFT JOIN user_level_progress ulp ON l.id = ulp.level_id AND ulp.user_id = ?
       WHERE l.category_id = ? AND l.is_active = 1
       ORDER BY l.display_order ASC`,
      [userId, categoryId]
    );

    // Determine actual status based on prerequisites
    for (let level of levels) {
      if (level.progress_status) {
        // User has progress, use that status
        level.status = level.progress_status;
      } else {
        // No progress yet, check if unlocked based on prerequisites
        const [prerequisites] = await db.query(
          'SELECT required_level_id FROM prerequisite_level WHERE level_id = ?',
          [level.id]
        );

        if (prerequisites.length === 0) {
          // No prerequisites, level is unlocked
          level.status = 'unstarted';
        } else {
          // Check if all prerequisites are met
          let allMet = true;
          for (let prereq of prerequisites) {
            const [reqProgress] = await db.query(
              `SELECT status, best_percent_correct 
               FROM user_level_progress 
               WHERE user_id = ? AND level_id = ?`,
              [userId, prereq.required_level_id]
            );

            if (reqProgress.length === 0 || reqProgress[0].status !== 'completed') {
              allMet = false;
              break;
            }

            // Check if passing grade met
            const [reqLevel] = await db.query(
              'SELECT pass_threshold FROM level WHERE id = ?',
              [prereq.required_level_id]
            );

            if (reqProgress[0].best_percent_correct < reqLevel[0].pass_threshold) {
              allMet = false;
              break;
            }
          }

          level.status = allMet ? 'unstarted' : 'locked';
        }
      }
      
      // Remove temporary field
      delete level.progress_status;
    }

    res.json({
      status: 'success',
      message: 'Levels retrieved successfully',
      data: {
        category: {
          id: categories[0].id,
          name: categories[0].name,
          description: categories[0].description,
          is_active: Boolean(categories[0].is_active),
          display_order: categories[0].display_order || 0,
          progress: null
        },
        levels: levels.map(lvl => ({
          id: lvl.id,
          name: lvl.name,
          description: lvl.description,
          time_limit_seconds: lvl.time_limit_seconds,
          base_xp: lvl.base_xp,
          base_points: lvl.base_points,
          max_questions: lvl.max_questions,
          display_order: lvl.display_order,
          pass_condition_type: lvl.pass_condition_type || 'percent_correct',
          pass_threshold: parseFloat(lvl.pass_threshold),
          progress: {
            status: lvl.status,
            best_percent_correct: parseFloat(lvl.best_percent_correct),
            best_score_points: lvl.best_score_points,
            total_attempts: lvl.total_attempts
          }
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};