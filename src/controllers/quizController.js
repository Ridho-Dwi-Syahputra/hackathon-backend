const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const seedrandom = require('seedrandom');

// ============================================================================
// POST /api/quiz/start - Mulai quiz attempt baru
// ============================================================================
exports.startQuiz = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { level_id } = req.body;

    // Validasi input
    if (!level_id) {
      return res.status(400).json({
        success: false,
        message: 'level_id harus diisi'
      });
    }

    // 1. Cek level exists dan active
    const [levels] = await db.query(`
      SELECT * FROM level WHERE id = ? AND is_active = 1
    `, [level_id]);

    if (levels.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Level tidak ditemukan'
      });
    }

    const level = levels[0];

    // 2. Cek apakah level unlocked (cek prerequisite)
    const isUnlocked = await checkLevelUnlocked(userId, level_id);
    
    if (!isUnlocked) {
      return res.status(403).json({
        success: false,
        message: 'Level masih terkunci. Selesaikan level prerequisite terlebih dahulu'
      });
    }

    // 3. Generate seed untuk shuffle
    const seed = Math.floor(Math.random() * 1000000);

    // 4. Query questions dengan options
    const [questions] = await db.query(`
      SELECT 
        q.id,
        q.text,
        q.points_correct,
        q.points_wrong,
        q.display_order
      FROM question q
      WHERE q.level_id = ? AND q.is_active = 1
      ORDER BY q.display_order
    `, [level_id]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tidak ada soal untuk level ini'
      });
    }

    // 5. Untuk setiap question, ambil options (TANPA is_correct!)
    for (let question of questions) {
      const [options] = await db.query(`
        SELECT 
          id,
          label,
          text,
          display_order
        FROM question_option
        WHERE question_id = ?
        ORDER BY display_order
      `, [question.id]);
      
      question.options = options;
    }

    // 6. Shuffle questions dengan seed
    const shuffledQuestions = shuffleArrayWithSeed(questions, seed);

    // 7. Limit max_questions jika ada
    let finalQuestions = shuffledQuestions;
    if (level.max_questions && shuffledQuestions.length > level.max_questions) {
      finalQuestions = shuffledQuestions.slice(0, level.max_questions);
    }

    // 8. Create quiz_attempt
    const attemptId = uuidv4();
    const startedAt = new Date();

    await db.query(`
      INSERT INTO quiz_attempt (
        id, user_id, level_id, started_at, duration_seconds, 
        seed, total_questions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `, [
      attemptId,
      userId,
      level_id,
      startedAt,
      level.time_limit_seconds,
      seed,
      finalQuestions.length
    ]);

    // 9. Update user_level_progress
    await db.query(`
      INSERT INTO user_level_progress (
        user_id, level_id, status, total_attempts, last_updated_at
      ) VALUES (?, ?, 'in_progress', 1, NOW())
      ON DUPLICATE KEY UPDATE 
        status = 'in_progress',
        total_attempts = total_attempts + 1,
        last_updated_at = NOW()
    `, [userId, level_id]);

    // 10. Return response (TANPA is_correct!)
    res.json({
      success: true,
      message: 'Quiz dimulai',
      data: {
        attempt_id: attemptId,
        level: {
          id: level.id,
          name: level.name,
          time_limit_seconds: level.time_limit_seconds,
          pass_threshold: parseFloat(level.pass_threshold)
        },
        questions: finalQuestions.map((q, index) => ({
          id: q.id,
          text: q.text,
          order_index: index,
          options: q.options
        })),
        started_at: startedAt,
        seed: seed
      }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================================
// POST /api/quiz/submit - Submit jawaban quiz
// ============================================================================
exports.submitQuiz = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.users_id;
    const { attempt_id, answers } = req.body;

    // Validasi input
    if (!attempt_id || !answers || !Array.isArray(answers)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'attempt_id dan answers harus diisi'
      });
    }

    // 1. Cek attempt exists dan milik user ini
    const [attempts] = await connection.query(`
      SELECT * FROM quiz_attempt 
      WHERE id = ? AND user_id = ?
    `, [attempt_id, userId]);

    if (attempts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt tidak ditemukan'
      });
    }

    const attempt = attempts[0];

    // 2. Cek status masih in_progress
    if (attempt.status !== 'in_progress') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Quiz sudah di-submit sebelumnya'
      });
    }

    // 3. Get level info
    const [levels] = await connection.query(`
      SELECT * FROM level WHERE id = ?
    `, [attempt.level_id]);

    const level = levels[0];

    // 4. Get all questions dengan jawaban benar
    const [questions] = await connection.query(`
      SELECT 
        q.id,
        q.points_correct,
        q.points_wrong,
        qo.id as correct_option_id
      FROM question q
      LEFT JOIN question_option qo ON q.id = qo.question_id AND qo.is_correct = 1
      WHERE q.level_id = ?
    `, [level.id]);

    // Buat map untuk cepat lookup
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = {
        correct_option_id: q.correct_option_id,
        points_correct: q.points_correct,
        points_wrong: q.points_wrong
      };
    });

    // 5. Validasi dan hitung score
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let scorePoints = 0;

    for (let answer of answers) {
      const { question_id, option_id, answered_at } = answer;

      const questionInfo = questionMap[question_id];
      if (!questionInfo) continue; // Skip jika question tidak valid

      let isCorrect = null;
      
      if (!option_id) {
        // Tidak dijawab
        unansweredCount++;
        isCorrect = null;
      } else {
        // Ada jawaban
        isCorrect = option_id === questionInfo.correct_option_id;
        
        if (isCorrect) {
          correctCount++;
          scorePoints += questionInfo.points_correct;
        } else {
          wrongCount++;
          scorePoints += questionInfo.points_wrong; // Biasanya 0 atau negatif
        }
      }

      // 6. Insert ke attempt_answer
      const answeredAtFormatted = answered_at ? new Date(answered_at) : null;
      
      await connection.query(`
        INSERT INTO attempt_answer (
          id, attempt_id, question_id, option_id, 
          is_correct, answered_at, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        attempt_id,
        question_id,
        option_id,
        isCorrect,
        answeredAtFormatted,
        answers.indexOf(answer)
      ]);
    }

    // 7. Hitung percent correct
    const percentCorrect = (correctCount / attempt.total_questions) * 100;

    // 8. Update quiz_attempt
    const finishedAt = new Date();
    const isPassed = percentCorrect >= parseFloat(level.pass_threshold);

    await connection.query(`
      UPDATE quiz_attempt SET
        finished_at = ?,
        status = 'submitted',
        score_points = ?,
        correct_count = ?,
        wrong_count = ?,
        unanswered_count = ?,
        percent_correct = ?
      WHERE id = ?
    `, [
      finishedAt,
      scorePoints,
      correctCount,
      wrongCount,
      unansweredCount,
      percentCorrect,
      attempt_id
    ]);

    // 9. Update user_level_progress
    const newStatus = isPassed ? 'completed' : 'in_progress';
    
    await connection.query(`
      UPDATE user_level_progress SET
        best_percent_correct = GREATEST(best_percent_correct, ?),
        best_score_points = GREATEST(best_score_points, ?),
        status = ?,
        last_attempt_id = ?,
        last_updated_at = NOW()
      WHERE user_id = ? AND level_id = ?
    `, [
      percentCorrect,
      scorePoints,
      newStatus,
      attempt_id,
      userId,
      level.id
    ]);

    // 10. Jika lulus, hitung XP dan unlock next levels
    let xpEarned = 0;
    let unlockedLevels = [];

    if (isPassed) {
      // Hitung XP dengan bonus
      const bonus = Math.floor((percentCorrect - parseFloat(level.pass_threshold)) * 0.5);
      xpEarned = level.base_xp + bonus;

      // Update total XP user
      await connection.query(`
        UPDATE users SET total_xp = total_xp + ? WHERE users_id = ?
      `, [xpEarned, userId]);

      // Unlock next levels
      unlockedLevels = await unlockNextLevels(userId, level.id, connection);

      // Update category progress
      await updateCategoryProgress(userId, level.category_id, connection);
    }

    // 11. Check dan award badges
    const badgesEarned = await checkAndAwardBadges(
      userId, 
      attempt_id, 
      level, 
      percentCorrect, 
      connection
    );

    await connection.commit();

    // 12. Return response
    res.json({
      success: true,
      message: isPassed ? 'Selamat! Anda lulus quiz ini' : 'Quiz selesai. Coba lagi untuk hasil lebih baik',
      data: {
        attempt_id: attempt_id,
        score_points: scorePoints,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        total_questions: attempt.total_questions,
        percent_correct: parseFloat(percentCorrect.toFixed(2)),
        is_passed: isPassed,
        pass_threshold: parseFloat(level.pass_threshold),
        xp_earned: xpEarned,
        unlocked_levels: unlockedLevels,
        badges_earned: badgesEarned
      }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Shuffle array dengan seed (deterministic)
function shuffleArrayWithSeed(array, seed) {
  const rng = seedrandom(seed.toString());
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Cek apakah level sudah unlocked
async function checkLevelUnlocked(userId, levelId) {
  // Cek prerequisite
  const [prerequisites] = await db.query(`
    SELECT required_level_id FROM prerequisite_level
    WHERE level_id = ?
  `, [levelId]);

  // Jika tidak ada prerequisite, level unlocked
  if (prerequisites.length === 0) {
    return true;
  }

  // Cek apakah semua prerequisite sudah completed
  for (let prereq of prerequisites) {
    const [progress] = await db.query(`
      SELECT status, best_percent_correct
      FROM user_level_progress
      WHERE user_id = ? AND level_id = ?
    `, [userId, prereq.required_level_id]);

    // Prerequisite belum di-attempt atau belum completed
    if (progress.length === 0 || progress[0].status !== 'completed') {
      return false;
    }

    // Cek passing grade
    const [level] = await db.query(`
      SELECT pass_threshold FROM level WHERE id = ?
    `, [prereq.required_level_id]);

    if (progress[0].best_percent_correct < level[0].pass_threshold) {
      return false;
    }
  }

  return true;
}

// Unlock next levels setelah complete level ini
async function unlockNextLevels(userId, completedLevelId, connection) {
  const unlockedLevels = [];

  // Cari level yang membutuhkan level ini sebagai prerequisite
  const [nextLevels] = await connection.query(`
    SELECT DISTINCT level_id FROM prerequisite_level
    WHERE required_level_id = ?
  `, [completedLevelId]);

  for (let nextLevel of nextLevels) {
    // Cek apakah semua prerequisite level ini sudah completed
    const [allPrereqs] = await connection.query(`
      SELECT pl.required_level_id, ulp.status, ulp.best_percent_correct, l.pass_threshold
      FROM prerequisite_level pl
      LEFT JOIN user_level_progress ulp ON pl.required_level_id = ulp.level_id AND ulp.user_id = ?
      LEFT JOIN level l ON pl.required_level_id = l.id
      WHERE pl.level_id = ?
    `, [userId, nextLevel.level_id]);

    let allCompleted = true;
    for (let prereq of allPrereqs) {
      if (!prereq.status || prereq.status !== 'completed' || 
          prereq.best_percent_correct < prereq.pass_threshold) {
        allCompleted = false;
        break;
      }
    }

    if (allCompleted) {
      // Unlock level ini
      await connection.query(`
        INSERT INTO user_level_progress (
          user_id, level_id, status, total_attempts, last_updated_at
        ) VALUES (?, ?, 'unstarted', 0, NOW())
        ON DUPLICATE KEY UPDATE 
          status = IF(status = 'locked', 'unstarted', status),
          last_updated_at = NOW()
      `, [userId, nextLevel.level_id]);

      // Ambil info level yang di-unlock
      const [levelInfo] = await connection.query(`
        SELECT id, name FROM level WHERE id = ?
      `, [nextLevel.level_id]);

      if (levelInfo.length > 0) {
        unlockedLevels.push(levelInfo[0]);
      }
    }
  }

  return unlockedLevels;
}

// Update category progress
async function updateCategoryProgress(userId, categoryId, connection) {
  // Hitung total level dan completed level
  const [stats] = await connection.query(`
    SELECT 
      COUNT(l.id) as total_levels,
      SUM(CASE WHEN ulp.status = 'completed' THEN 1 ELSE 0 END) as completed_levels
    FROM level l
    LEFT JOIN user_level_progress ulp ON l.id = ulp.level_id AND ulp.user_id = ?
    WHERE l.category_id = ? AND l.is_active = 1
  `, [userId, categoryId]);

  const totalLevels = stats[0].total_levels;
  const completedLevels = stats[0].completed_levels || 0;
  const percentCompleted = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  // Update atau insert
  await connection.query(`
    INSERT INTO user_category_progress (
      user_id, category_id, percent_completed, 
      completed_levels_count, total_levels_count, last_updated_at
    ) VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      percent_completed = ?,
      completed_levels_count = ?,
      total_levels_count = ?,
      last_updated_at = NOW()
  `, [
    userId, categoryId, percentCompleted, completedLevels, totalLevels,
    percentCompleted, completedLevels, totalLevels
  ]);
}

// Check dan award badges
async function checkAndAwardBadges(userId, attemptId, level, percentCorrect, connection) {
  const badgesEarned = [];

  // Get all active badges
  const [badges] = await connection.query(`
    SELECT * FROM badge WHERE is_active = 1
  `);

  for (let badge of badges) {
    let shouldAward = false;
    const criteriaValue = JSON.parse(badge.criteria_value);

    switch (badge.criteria_type) {
      case 'level_100_percent':
        // Perfect score pada level tertentu
        if (percentCorrect === 100) {
          shouldAward = true;
        }
        break;

      case 'category_mastery':
        // Complete semua level dalam kategori dengan >= threshold
        const [categoryProgress] = await connection.query(`
          SELECT percent_completed FROM user_category_progress
          WHERE user_id = ? AND category_id = ?
        `, [userId, level.category_id]);

        if (categoryProgress.length > 0 && 
            categoryProgress[0].percent_completed >= (criteriaValue.threshold || 100)) {
          shouldAward = true;
        }
        break;

      case 'points_total':
        // Total points mencapai threshold
        const [userPoints] = await connection.query(`
          SELECT total_points FROM user_points WHERE user_id = ?
        `, [userId]);

        if (userPoints.length > 0 && 
            userPoints[0].total_points >= criteriaValue.threshold) {
          shouldAward = true;
        }
        break;

      default:
        break;
    }

    if (shouldAward) {
      // Cek apakah badge sudah pernah di-award
      const [existing] = await connection.query(`
        SELECT id FROM user_badge 
        WHERE user_id = ? AND badge_id = ?
      `, [userId, badge.id]);

      if (existing.length === 0) {
        // Award badge
        await connection.query(`
          INSERT INTO user_badge (
            id, user_id, badge_id, earned_at, 
            source_level_id, source_category_id, attempt_id
          ) VALUES (?, ?, ?, NOW(), ?, ?, ?)
        `, [
          uuidv4(),
          userId,
          badge.id,
          level.id,
          level.category_id,
          attemptId
        ]);

        badgesEarned.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          image_url: badge.image_url
        });
      }
    }
  }

  return badgesEarned;
}
