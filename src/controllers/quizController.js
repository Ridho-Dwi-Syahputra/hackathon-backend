//quizController.js

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Start Quiz
exports.startQuiz = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const userId = req.user.id;
    const { level_id } = req.body;

    if (!level_id) {
      return res.status(400).json({
        success: false,
        message: 'Level ID harus diisi'
      });
    }

    await connection.beginTransaction();

    // Get level details
    const [levels] = await connection.query(
      `SELECT id, name, time_limit_seconds, base_xp, base_points, max_questions 
       FROM level WHERE id = ? AND is_active = 1`,
      [level_id]
    );

    if (levels.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Level tidak ditemukan'
      });
    }

    const level = levels[0];

    // Get questions for this level
    const [questions] = await connection.query(
      `SELECT q.id, q.text, q.points_correct, q.points_wrong
       FROM question q
       WHERE q.level_id = ? AND q.is_active = 1
       ORDER BY RAND()
       LIMIT ?`,
      [level_id, level.max_questions || 10]
    );

    if (questions.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Tidak ada soal tersedia untuk level ini'
      });
    }

    // Get options for all questions
    for (let question of questions) {
      const [options] = await connection.query(
        `SELECT id, label, text FROM question_option 
         WHERE question_id = ? 
         ORDER BY RAND()`,
        [question.id]
      );
      question.options = options;
    }

    // Create quiz attempt
    const attemptId = uuidv4();
    const seed = Math.floor(Math.random() * 1000000);

    await connection.query(
      `INSERT INTO quiz_attempt 
       (id, user_id, level_id, started_at, duration_seconds, seed, total_questions, status, 
        score_points, correct_count, wrong_count, unanswered_count, percent_correct, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), 0, ?, ?, 'in_progress', 0, 0, 0, ?, 0, NOW(), NOW())`,
      [attemptId, userId, level_id, seed, questions.length, questions.length]
    );

    // Create attempt_answer records
    for (let i = 0; i < questions.length; i++) {
      const answerId = uuidv4();
      await connection.query(
        `INSERT INTO attempt_answer 
         (id, attempt_id, question_id, option_id, is_correct, answered_at, order_index, created_at, updated_at) 
         VALUES (?, ?, ?, NULL, NULL, NULL, ?, NOW(), NOW())`,
        [answerId, attemptId, questions[i].id, i]
      );
    }

    // Update or create user_level_progress
    const [existingProgress] = await connection.query(
      'SELECT * FROM user_level_progress WHERE user_id = ? AND level_id = ?',
      [userId, level_id]
    );

    if (existingProgress.length === 0) {
      await connection.query(
        `INSERT INTO user_level_progress 
         (user_id, level_id, best_percent_correct, best_score_points, total_attempts, status, last_attempt_id, last_updated_at, created_at) 
         VALUES (?, ?, 0, 0, 0, 'in_progress', ?, NOW(), NOW())`,
        [userId, level_id, attemptId]
      );
    } else {
      await connection.query(
        `UPDATE user_level_progress 
         SET status = 'in_progress', last_attempt_id = ?, last_updated_at = NOW() 
         WHERE user_id = ? AND level_id = ?`,
        [attemptId, userId, level_id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Quiz dimulai',
      data: {
        attempt_id: attemptId,
        level: {
          id: level.id,
          name: level.name,
          time_limit_seconds: level.time_limit_seconds,
          base_xp: level.base_xp,
          base_points: level.base_points
        },
        questions: questions.map((q, index) => ({
          order_index: index,
          question_id: q.id,
          text: q.text,
          points_correct: q.points_correct,
          points_wrong: q.points_wrong,
          options: q.options
        })),
        total_questions: questions.length
      }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Submit Quiz
exports.submitQuiz = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const userId = req.user.id;
    const { attempt_id, answers } = req.body;

    if (!attempt_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid'
      });
    }

    await connection.beginTransaction();

    // Get attempt details
    const [attempts] = await connection.query(
      `SELECT qa.*, l.base_xp, l.base_points, l.pass_threshold, l.category_id
       FROM quiz_attempt qa
       JOIN level l ON qa.level_id = l.id
       WHERE qa.id = ? AND qa.user_id = ? AND qa.status = 'in_progress'`,
      [attempt_id, userId]
    );

    if (attempts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Attempt tidak ditemukan atau sudah selesai'
      });
    }

    const attempt = attempts[0];
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalPoints = 0;

    // Process each answer
    for (let answer of answers) {
      const { question_id, option_id } = answer;

      if (!option_id) {
        unansweredCount++;
        continue;
      }

      // Get correct option and points
      const [questions] = await connection.query(
        'SELECT points_correct, points_wrong FROM question WHERE id = ?',
        [question_id]
      );

      const [options] = await connection.query(
        'SELECT is_correct FROM question_option WHERE id = ?',
        [option_id]
      );

      if (questions.length === 0 || options.length === 0) {
        continue;
      }

      const isCorrect = options[0].is_correct;
      const points = isCorrect ? questions[0].points_correct : questions[0].points_wrong;

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      totalPoints += points;

      // Update attempt_answer
      await connection.query(
        `UPDATE attempt_answer 
         SET option_id = ?, is_correct = ?, answered_at = NOW(), updated_at = NOW() 
         WHERE attempt_id = ? AND question_id = ?`,
        [option_id, isCorrect, attempt_id, question_id]
      );
    }

    // Calculate percent correct
    const percentCorrect = attempt.total_questions > 0 
      ? (correctCount / attempt.total_questions * 100).toFixed(2) 
      : 0;

    // Update quiz_attempt
    await connection.query(
      `UPDATE quiz_attempt 
       SET status = 'submitted', finished_at = NOW(), 
           duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW()),
           score_points = ?, correct_count = ?, wrong_count = ?, 
           unanswered_count = ?, percent_correct = ?, updated_at = NOW()
       WHERE id = ?`,
      [totalPoints, correctCount, wrongCount, unansweredCount, percentCorrect, attempt_id]
    );

    // Check if level is passed
    const isPassed = parseFloat(percentCorrect) >= parseFloat(attempt.pass_threshold);

    // Update user_level_progress
    const [currentProgress] = await connection.query(
      'SELECT best_percent_correct, best_score_points, total_attempts FROM user_level_progress WHERE user_id = ? AND level_id = ?',
      [userId, attempt.level_id]
    );

    const newBestPercent = Math.max(
      parseFloat(currentProgress[0].best_percent_correct), 
      parseFloat(percentCorrect)
    );
    const newBestScore = Math.max(
      currentProgress[0].best_score_points, 
      totalPoints
    );
    const newStatus = isPassed ? 'completed' : 'in_progress';

    await connection.query(
      `UPDATE user_level_progress 
       SET best_percent_correct = ?, best_score_points = ?, total_attempts = total_attempts + 1, 
           status = ?, last_attempt_id = ?, last_updated_at = NOW()
       WHERE user_id = ? AND level_id = ?`,
      [newBestPercent, newBestScore, newStatus, attempt_id, userId, attempt.level_id]
    );

    // Update user XP
    const xpGained = isPassed ? attempt.base_xp : 0;
    await connection.query(
      'UPDATE users SET total_xp = total_xp + ?, updated_at = NOW() WHERE id = ?',
      [xpGained, userId]
    );

    // Update user points
    await connection.query(
      `UPDATE user_points 
       SET total_points = total_points + ?, lifetime_points = lifetime_points + ?, last_updated_at = NOW() 
       WHERE user_id = ?`,
      [totalPoints, totalPoints, userId]
    );

    // Update category progress
    const [completedLevels] = await connection.query(
      `SELECT COUNT(*) as completed FROM user_level_progress 
       WHERE user_id = ? AND level_id IN (SELECT id FROM level WHERE category_id = ?) AND status = 'completed'`,
      [userId, attempt.category_id]
    );

    const [totalLevels] = await connection.query(
      'SELECT COUNT(*) as total FROM level WHERE category_id = ? AND is_active = 1',
      [attempt.category_id]
    );

    const categoryPercent = totalLevels[0].total > 0 
      ? (completedLevels[0].completed / totalLevels[0].total * 100).toFixed(2) 
      : 0;

    const [existingCategoryProgress] = await connection.query(
      'SELECT * FROM user_category_progress WHERE user_id = ? AND category_id = ?',
      [userId, attempt.category_id]
    );

    if (existingCategoryProgress.length === 0) {
      await connection.query(
        `INSERT INTO user_category_progress 
         (user_id, category_id, percent_completed, completed_levels_count, total_levels_count, last_updated_at, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, attempt.category_id, categoryPercent, completedLevels[0].completed, totalLevels[0].total]
      );
    } else {
      await connection.query(
        `UPDATE user_category_progress 
         SET percent_completed = ?, completed_levels_count = ?, total_levels_count = ?, last_updated_at = NOW() 
         WHERE user_id = ? AND category_id = ?`,
        [categoryPercent, completedLevels[0].completed, totalLevels[0].total, userId, attempt.category_id]
      );
    }

    // Check for badge achievements (simplified - you can expand this)
    await checkAndAwardBadges(connection, userId, attempt.level_id, attempt.category_id, attempt_id, percentCorrect);

    await connection.commit();

    // Get updated user data
    const [userData] = await connection.query(
      `SELECT u.total_xp, up.total_points, up.lifetime_points
       FROM users u
       JOIN user_points up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Quiz berhasil diselesaikan',
      data: {
        attempt_id,
        score_points: totalPoints,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        percent_correct: percentCorrect,
        is_passed: isPassed,
        xp_gained: xpGained,
        total_xp: userData[0].total_xp,
        total_points: userData[0].total_points,
        lifetime_points: userData[0].lifetime_points
      }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Helper function to check and award badges
async function checkAndAwardBadges(connection, userId, levelId, categoryId, attemptId, percentCorrect) {
  try {
    // Check for 100% level completion badge
    if (parseFloat(percentCorrect) === 100) {
      const [badges] = await connection.query(
        `SELECT id FROM badge WHERE criteria_type = 'level_100_percent' AND is_active = 1 LIMIT 1`
      );

      if (badges.length > 0) {
        const badgeId = badges[0].id;
        
        // Check if user already has this badge
        const [existing] = await connection.query(
          'SELECT id FROM user_badge WHERE user_id = ? AND badge_id = ?',
          [userId, badgeId]
        );

        if (existing.length === 0) {
          await connection.query(
            `INSERT INTO user_badge 
             (id, user_id, badge_id, earned_at, source_level_id, source_category_id, attempt_id, created_at) 
             VALUES (?, ?, ?, NOW(), ?, ?, ?, NOW())`,
            [uuidv4(), userId, badgeId, levelId, categoryId, attemptId]
          );
        }
      }
    }

    // Check for category mastery badge
    const [categoryProgress] = await connection.query(
      'SELECT percent_completed FROM user_category_progress WHERE user_id = ? AND category_id = ?',
      [userId, categoryId]
    );

    if (categoryProgress.length > 0 && parseFloat(categoryProgress[0].percent_completed) === 100) {
      const [badges] = await connection.query(
        `SELECT id FROM badge WHERE criteria_type = 'category_mastery' AND is_active = 1 LIMIT 1`
      );

      if (badges.length > 0) {
        const badgeId = badges[0].id;
        
        const [existing] = await connection.query(
          'SELECT id FROM user_badge WHERE user_id = ? AND badge_id = ? AND source_category_id = ?',
          [userId, badgeId, categoryId]
        );

        if (existing.length === 0) {
          await connection.query(
            `INSERT INTO user_badge 
             (id, user_id, badge_id, earned_at, source_category_id, attempt_id, created_at) 
             VALUES (?, ?, ?, NOW(), ?, ?, NOW())`,
            [uuidv4(), userId, badgeId, categoryId, attemptId]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
    // Don't throw error, just log it
  }
}

// Get Quiz Attempt Details
exports.getQuizAttempt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;

    const [attempts] = await db.query(
      `SELECT qa.*, l.name as level_name, l.time_limit_seconds
       FROM quiz_attempt qa
       JOIN level l ON qa.level_id = l.id
       WHERE qa.id = ? AND qa.user_id = ?`,
      [attemptId, userId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attempt tidak ditemukan'
      });
    }

    const attempt = attempts[0];

    // Get answers
    const [answers] = await db.query(
      `SELECT aa.*, q.text as question_text, qo.text as selected_answer, qo.label as selected_label
       FROM attempt_answer aa
       JOIN question q ON aa.question_id = q.id
       LEFT JOIN question_option qo ON aa.option_id = qo.id
       WHERE aa.attempt_id = ?
       ORDER BY aa.order_index`,
      [attemptId]
    );

    res.json({
      success: true,
      data: {
        attempt,
        answers
      }
    });

  } catch (error) {
    next(error);
  }
};