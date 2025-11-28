# 🚀 STEP-BY-STEP: IMPLEMENTASI BACKEND MODUL QUIZ EXPRESS.JS

**Target:** Backend API untuk aplikasi Android SAKO (Quiz Budaya Minangkabau)  
**Tech Stack:** Express.js + MySQL  
**Level:** Pemula-Friendly 🎯  
**Estimasi:** 3-4 hari kerja

---

## 📋 PREREQUISITES (Yang Harus Sudah Ada)

✅ Node.js installed (v16+)  
✅ MySQL database running  
✅ Database `sako` sudah dibuat  
✅ File `sako.sql` sudah di-import ke database  
✅ Text editor (VS Code recommended)  
✅ Postman/Thunder Client untuk testing API

---

## 🗂️ STRUKTUR FOLDER (Sudah Ada)

```
backend/
├── package.json
├── server.js
├── .env
└── src/
    ├── app.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── quizController.js
    │   └── ...
    ├── routes/
    │   ├── quizRoutes.js
    │   └── ...
    └── middleware/
        └── auth.js
```

---

## 🎯 BREAKDOWN IMPLEMENTASI

### **PHASE 1: SETUP DASAR** ⚙️

#### **Step 1.1: Install Dependencies**

```bash
npm install express mysql2 dotenv cors uuid seedrandom jsonwebtoken bcryptjs express-validator
npm install --save-dev nodemon
```

**Penjelasan singkat:**
- `express` → Framework web
- `mysql2` → Koneksi ke database MySQL
- `uuid` → Generate ID unik
- `seedrandom` → Shuffle soal dengan seed
- `jsonwebtoken` → Untuk autentikasi JWT
- `cors` → Agar Android bisa akses API

---

#### **Step 1.2: Setup .env File**

Buat/edit file `.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sako
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.x:3000
```

**⚠️ Penting:** 
- Ganti `DB_PASSWORD` dengan password MySQL Anda
- Ganti `JWT_SECRET` dengan string random yang kuat
- `192.168.1.x` adalah IP laptop Anda (untuk testing dari Android)

---

#### **Step 1.3: Setup Database Connection**

Edit `src/config/database.js`:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promisify untuk async/await
const promisePool = pool.promise();

// Test connection
promisePool.query('SELECT 1')
    .then(() => {
        console.log('✅ Database connected successfully');
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    });

module.exports = promisePool;
```

**Test:** Jalankan `node src/config/database.js` untuk cek koneksi.

---

#### **Step 1.4: Setup server.js**

```javascript
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Access from Android: http://YOUR_IP:${PORT}`);
});
```

---

#### **Step 1.5: Setup src/app.js**

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const quizRoutes = require('./routes/quizRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/quiz', quizRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
```

---

### **PHASE 2: IMPLEMENTASI CATEGORY ENDPOINTS** 📂

#### **Step 2.1: Buat categoryController.js**

Buat file `src/controllers/categoryController.js`:

```javascript
const db = require('../config/database');

// GET /api/categories - List semua kategori
exports.getCategories = async (req, res) => {
    try {
        const userId = req.user.users_id; // Dari JWT middleware

        // Query categories
        const [categories] = await db.query(`
            SELECT 
                id,
                name,
                description,
                is_active,
                display_order
            FROM quiz_category
            WHERE is_active = 1
            ORDER BY display_order ASC
        `);

        // Untuk setiap category, ambil progress user
        for (let category of categories) {
            const [progress] = await db.query(`
                SELECT 
                    percent_completed,
                    completed_levels_count,
                    total_levels_count
                FROM user_category_progress
                WHERE user_id = ? AND category_id = ?
            `, [userId, category.id]);

            if (progress.length > 0) {
                category.progress = progress[0];
            } else {
                // Jika belum ada progress, hitung total levels
                const [countResult] = await db.query(`
                    SELECT COUNT(*) as total
                    FROM level
                    WHERE category_id = ? AND is_active = 1
                `, [category.id]);

                category.progress = {
                    percent_completed: 0,
                    completed_levels_count: 0,
                    total_levels_count: countResult[0].total
                };
            }
        }

        res.json({
            status: 'success',
            message: 'Categories retrieved successfully',
            data: categories
        });

    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// GET /api/categories/:id/levels - List level dalam kategori
exports.getCategoryLevels = async (req, res) => {
    try {
        const userId = req.user.users_id;
        const categoryId = req.params.id;

        // Get category info
        const [categories] = await db.query(`
            SELECT * FROM quiz_category WHERE id = ? AND is_active = 1
        `, [categoryId]);

        if (categories.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        const category = categories[0];

        // Get levels
        const [levels] = await db.query(`
            SELECT 
                id,
                name,
                description,
                time_limit_seconds,
                base_xp,
                base_points,
                max_questions,
                display_order,
                pass_condition_type,
                pass_threshold
            FROM level
            WHERE category_id = ? AND is_active = 1
            ORDER BY display_order ASC
        `, [categoryId]);

        // Untuk setiap level, ambil progress
        for (let level of levels) {
            const [progress] = await db.query(`
                SELECT 
                    status,
                    best_percent_correct,
                    best_score_points,
                    total_attempts
                FROM user_level_progress
                WHERE user_id = ? AND level_id = ?
            `, [userId, level.id]);

            if (progress.length > 0) {
                level.progress = progress[0];
            } else {
                // Cek apakah level unlocked berdasarkan prerequisite
                const status = await determineLevelStatus(userId, level.id);
                level.progress = {
                    status: status,
                    best_percent_correct: 0,
                    best_score_points: 0,
                    total_attempts: 0
                };
            }
        }

        res.json({
            status: 'success',
            message: 'Levels retrieved successfully',
            data: {
                category: category,
                levels: levels
            }
        });

    } catch (error) {
        console.error('Error in getCategoryLevels:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Helper function: Cek status level (locked/unlocked)
async function determineLevelStatus(userId, levelId) {
    // Cek prerequisite
    const [prerequisites] = await db.query(`
        SELECT required_level_id FROM prerequisite_level
        WHERE level_id = ?
    `, [levelId]);

    // Jika tidak ada prerequisite, level unlocked
    if (prerequisites.length === 0) {
        return 'unstarted';
    }

    // Cek apakah semua prerequisite sudah completed
    for (let prereq of prerequisites) {
        const [progress] = await db.query(`
            SELECT status, best_percent_correct
            FROM user_level_progress
            WHERE user_id = ? AND level_id = ?
        `, [userId, prereq.required_level_id]);

        if (progress.length === 0 || progress[0].status !== 'completed') {
            return 'locked';
        }

        // Cek apakah passing grade terpenuhi
        const [level] = await db.query(`
            SELECT pass_threshold FROM level WHERE id = ?
        `, [prereq.required_level_id]);

        if (progress[0].best_percent_correct < level[0].pass_threshold) {
            return 'locked';
        }
    }

    return 'unstarted';
}
```

---

#### **Step 2.2: Buat categoryRoutes.js**

Buat file `src/routes/categoryRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// Semua route butuh authentication
router.use(auth);

// GET /api/categories
router.get('/', categoryController.getCategories);

// GET /api/categories/:id/levels
router.get('/:id/levels', categoryController.getCategoryLevels);

module.exports = router;
```

---

#### **Step 2.3: Update app.js untuk load categoryRoutes**

Di `src/app.js`, tambahkan:

```javascript
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);
```

---

### **PHASE 3: IMPLEMENTASI QUIZ ENDPOINTS** 🎮

#### **Step 3.1: Buat quizController.js - START QUIZ**

Buat file `src/controllers/quizController.js`:

```javascript
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const seedrandom = require('seedrandom');

// POST /api/quiz/start - Mulai quiz
exports.startQuiz = async (req, res) => {
    try {
        const userId = req.user.users_id;
        const { level_id } = req.body;

        // Validasi input
        if (!level_id) {
            return res.status(400).json({
                status: 'error',
                message: 'level_id is required'
            });
        }

        // 1. Cek level exists dan active
        const [levels] = await db.query(`
            SELECT * FROM level WHERE id = ? AND is_active = 1
        `, [level_id]);

        if (levels.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Level not found'
            });
        }

        const level = levels[0];

        // 2. Cek apakah level unlocked
        const [progress] = await db.query(`
            SELECT status FROM user_level_progress
            WHERE user_id = ? AND level_id = ?
        `, [userId, level_id]);

        if (progress.length > 0 && progress[0].status === 'locked') {
            return res.status(403).json({
                status: 'error',
                message: 'Level is locked. Complete prerequisite levels first.'
            });
        }

        // Jika belum ada progress, cek prerequisite
        if (progress.length === 0) {
            const status = await determineLevelStatus(userId, level_id);
            if (status === 'locked') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Level is locked. Complete prerequisite levels first.'
                });
            }
        }

        // 3. Generate seed untuk shuffle
        const seed = Math.floor(Math.random() * 1000000);

        // 4. Query questions + options
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
                status: 'error',
                message: 'No questions found for this level'
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
                id, user_id, level_id, started_at,
                duration_seconds, seed, total_questions, status
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
                user_id, level_id, status, total_attempts
            ) VALUES (?, ?, 'in_progress', 0)
            ON DUPLICATE KEY UPDATE status = 'in_progress'
        `, [userId, level_id]);

        // 10. Return response
        res.json({
            status: 'success',
            message: 'Quiz started successfully',
            data: {
                attempt_id: attemptId,
                level: {
                    id: level.id,
                    name: level.name,
                    description: level.description,
                    time_limit_seconds: level.time_limit_seconds,
                    base_xp: level.base_xp,
                    base_points: level.base_points,
                    max_questions: level.max_questions,
                    display_order: level.display_order,
                    pass_condition_type: level.pass_condition_type,
                    pass_threshold: level.pass_threshold
                },
                questions: finalQuestions,
                duration_seconds: level.time_limit_seconds,
                started_at: startedAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Error in startQuiz:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Helper: Shuffle array dengan seed
function shuffleArrayWithSeed(array, seed) {
    const rng = seedrandom(seed.toString());
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

// Helper: Cek status level
async function determineLevelStatus(userId, levelId) {
    const [prerequisites] = await db.query(`
        SELECT required_level_id FROM prerequisite_level
        WHERE level_id = ?
    `, [levelId]);

    if (prerequisites.length === 0) {
        return 'unstarted';
    }

    for (let prereq of prerequisites) {
        const [progress] = await db.query(`
            SELECT status, best_percent_correct
            FROM user_level_progress
            WHERE user_id = ? AND level_id = ?
        `, [userId, prereq.required_level_id]);

        if (progress.length === 0 || progress[0].status !== 'completed') {
            return 'locked';
        }

        const [level] = await db.query(`
            SELECT pass_threshold FROM level WHERE id = ?
        `, [prereq.required_level_id]);

        if (progress[0].best_percent_correct < level[0].pass_threshold) {
            return 'locked';
        }
    }

    return 'unstarted';
}

module.exports = {
    startQuiz,
    determineLevelStatus
};
```

---

#### **Step 3.2: Tambahkan submitQuiz ke quizController.js**

Tambahkan di `src/controllers/quizController.js`:

```javascript
// POST /api/quiz/submit - Submit quiz
exports.submitQuiz = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const userId = req.user.users_id;
        const { attempt_id, answers } = req.body;

        // Validasi input
        if (!attempt_id || !answers || !Array.isArray(answers)) {
            await connection.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'attempt_id and answers array are required'
            });
        }

        // 1. Validasi attempt exists dan belongs to user
        const [attempts] = await connection.query(`
            SELECT * FROM quiz_attempt
            WHERE id = ? AND user_id = ?
        `, [attempt_id, userId]);

        if (attempts.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Quiz attempt not found'
            });
        }

        const attempt = attempts[0];

        if (attempt.status !== 'in_progress') {
            await connection.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Quiz attempt already submitted'
            });
        }

        // 2. Get level info
        const [levels] = await connection.query(`
            SELECT * FROM level WHERE id = ?
        `, [attempt.level_id]);

        const level = levels[0];

        // 3. Process answers
        let totalPoints = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;

        for (let answer of answers) {
            // Get question info
            const [questions] = await connection.query(`
                SELECT * FROM question WHERE id = ?
            `, [answer.question_id]);

            if (questions.length === 0) continue;
            const question = questions[0];

            // Jika tidak dijawab
            if (!answer.option_id) {
                unansweredCount++;
                await connection.query(`
                    INSERT INTO attempt_answer (
                        id, attempt_id, question_id, 
                        option_id, is_correct, answered_at
                    ) VALUES (?, ?, ?, NULL, NULL, NULL)
                `, [uuidv4(), attempt_id, answer.question_id]);
                continue;
            }

            // Get correct answer
            const [correctOptions] = await connection.query(`
                SELECT id FROM question_option
                WHERE question_id = ? AND is_correct = 1
            `, [answer.question_id]);

            if (correctOptions.length === 0) continue;

            const isCorrect = (answer.option_id === correctOptions[0].id);

            if (isCorrect) {
                correctCount++;
                totalPoints += question.points_correct;
            } else {
                wrongCount++;
                totalPoints -= question.points_wrong;
            }

            // Save answer
            await connection.query(`
                INSERT INTO attempt_answer (
                    id, attempt_id, question_id, option_id,
                    is_correct, answered_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                uuidv4(),
                attempt_id,
                answer.question_id,
                answer.option_id,
                isCorrect ? 1 : 0,
                answer.answered_at || new Date()
            ]);
        }

        // 4. Calculate percentage
        const totalQuestions = answers.length;
        const percentCorrect = totalQuestions > 0 
            ? (correctCount / totalQuestions) * 100 
            : 0;

        // 5. Determine if passed
        const isPassed = (percentCorrect >= level.pass_threshold);

        // 6. Calculate XP and points
        let xpEarned = 0;
        let pointsEarned = Math.max(0, totalPoints);

        if (isPassed) {
            const excess = percentCorrect - level.pass_threshold;
            const bonus = Math.floor(excess * 0.5);
            xpEarned = level.base_xp + bonus;
        }

        // 7. Update quiz_attempt
        const finishedAt = new Date();
        await connection.query(`
            UPDATE quiz_attempt SET
                status = 'submitted',
                finished_at = ?,
                score_points = ?,
                correct_count = ?,
                wrong_count = ?,
                unanswered_count = ?,
                percent_correct = ?
            WHERE id = ?
        `, [
            finishedAt,
            totalPoints,
            correctCount,
            wrongCount,
            unansweredCount,
            percentCorrect,
            attempt_id
        ]);

        // 8. Update user XP and points
        let newTotalXp = 0;
        if (isPassed) {
            await connection.query(`
                UPDATE users SET total_xp = total_xp + ?
                WHERE users_id = ?
            `, [xpEarned, userId]);

            const [userResult] = await connection.query(`
                SELECT total_xp FROM users WHERE users_id = ?
            `, [userId]);
            newTotalXp = userResult[0].total_xp;

            // Update user_points
            await connection.query(`
                INSERT INTO user_points (user_id, total_points, lifetime_points)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    total_points = total_points + VALUES(total_points),
                    lifetime_points = lifetime_points + VALUES(lifetime_points)
            `, [userId, pointsEarned, pointsEarned]);
        }

        // 9. Update user_level_progress
        const [existingProgress] = await connection.query(`
            SELECT * FROM user_level_progress
            WHERE user_id = ? AND level_id = ?
        `, [userId, level.id]);

        const newStatus = isPassed ? 'completed' : 'in_progress';
        const currentBestPercent = existingProgress.length > 0 
            ? existingProgress[0].best_percent_correct 
            : 0;
        const currentBestScore = existingProgress.length > 0 
            ? existingProgress[0].best_score_points 
            : 0;

        const newBestPercent = Math.max(currentBestPercent, percentCorrect);
        const newBestScore = Math.max(currentBestScore, totalPoints);

        await connection.query(`
            UPDATE user_level_progress SET
                best_percent_correct = ?,
                best_score_points = ?,
                total_attempts = total_attempts + 1,
                status = ?,
                last_attempt_id = ?,
                last_updated_at = NOW()
            WHERE user_id = ? AND level_id = ?
        `, [
            newBestPercent,
            newBestScore,
            newStatus,
            attempt_id,
            userId,
            level.id
        ]);

        // 10. Update user_category_progress
        const [completedLevels] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM user_level_progress
            WHERE user_id = ? AND status = 'completed'
            AND level_id IN (
                SELECT id FROM level WHERE category_id = ?
            )
        `, [userId, level.category_id]);

        const [totalLevels] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM level
            WHERE category_id = ? AND is_active = 1
        `, [level.category_id]);

        const categoryPercent = totalLevels[0].count > 0
            ? (completedLevels[0].count / totalLevels[0].count) * 100
            : 0;

        await connection.query(`
            INSERT INTO user_category_progress (
                user_id, category_id, percent_completed,
                completed_levels_count, total_levels_count
            ) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                percent_completed = VALUES(percent_completed),
                completed_levels_count = VALUES(completed_levels_count),
                last_updated_at = NOW()
        `, [
            userId,
            level.category_id,
            categoryPercent,
            completedLevels[0].count,
            totalLevels[0].count
        ]);

        // 11. Unlock next levels if passed
        if (isPassed) {
            await unlockNextLevels(userId, level.id, connection);
        }

        // 12. Check badges
        const badgesEarned = await checkAndAwardBadges(
            userId, 
            attempt_id, 
            level, 
            percentCorrect, 
            connection
        );

        // COMMIT
        await connection.commit();

        // 13. Return response
        res.json({
            status: 'success',
            message: 'Quiz submitted successfully',
            data: {
                attempt_id: attempt_id,
                score_points: totalPoints,
                correct_count: correctCount,
                wrong_count: wrongCount,
                unanswered_count: unansweredCount,
                percent_correct: percentCorrect,
                xp_earned: xpEarned,
                points_earned: pointsEarned,
                is_passed: isPassed,
                new_total_xp: newTotalXp,
                badges_earned: badgesEarned
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error in submitQuiz:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    } finally {
        connection.release();
    }
};

// Helper: Unlock next levels
async function unlockNextLevels(userId, completedLevelId, connection) {
    // Find levels yang require level ini
    const [nextLevels] = await connection.query(`
        SELECT level_id FROM prerequisite_level
        WHERE required_level_id = ?
    `, [completedLevelId]);

    for (let nextLevel of nextLevels) {
        // Check all prerequisites
        const [allPrereqs] = await connection.query(`
            SELECT required_level_id FROM prerequisite_level
            WHERE level_id = ?
        `, [nextLevel.level_id]);

        let allMet = true;
        for (let prereq of allPrereqs) {
            const [progress] = await connection.query(`
                SELECT status, best_percent_correct
                FROM user_level_progress
                WHERE user_id = ? AND level_id = ?
            `, [userId, prereq.required_level_id]);

            if (progress.length === 0 || progress[0].status !== 'completed') {
                allMet = false;
                break;
            }

            const [level] = await connection.query(`
                SELECT pass_threshold FROM level WHERE id = ?
            `, [prereq.required_level_id]);

            if (progress[0].best_percent_correct < level[0].pass_threshold) {
                allMet = false;
                break;
            }
        }

        if (allMet) {
            await connection.query(`
                INSERT INTO user_level_progress (
                    user_id, level_id, status
                ) VALUES (?, ?, 'unstarted')
                ON DUPLICATE KEY UPDATE
                    status = CASE 
                        WHEN status = 'locked' THEN 'unstarted'
                        ELSE status
                    END
            `, [userId, nextLevel.level_id]);
        }
    }
}

// Helper: Check and award badges
async function checkAndAwardBadges(userId, attemptId, level, percentCorrect, connection) {
    const badgesEarned = [];

    const [badges] = await connection.query(`
        SELECT * FROM badge WHERE is_active = 1
    `);

    for (let badge of badges) {
        let criteria = {};
        try {
            criteria = JSON.parse(badge.criteria_value);
        } catch (e) {
            continue;
        }

        let shouldAward = false;

        switch (badge.criteria_type) {
            case 'level_100_percent':
                if (percentCorrect === 100) {
                    shouldAward = true;
                }
                break;

            case 'category_mastery':
                const [categoryProgress] = await connection.query(`
                    SELECT percent_completed 
                    FROM user_category_progress
                    WHERE user_id = ? AND category_id = ?
                `, [userId, level.category_id]);

                if (categoryProgress.length > 0 && 
                    categoryProgress[0].percent_completed === 100) {
                    shouldAward = true;
                }
                break;

            case 'points_total':
                const [userPoints] = await connection.query(`
                    SELECT total_points FROM user_points WHERE user_id = ?
                `, [userId]);

                if (userPoints.length > 0 && 
                    userPoints[0].total_points >= criteria.threshold) {
                    shouldAward = true;
                }
                break;
        }

        if (shouldAward) {
            // Check if already has badge
            const [existing] = await connection.query(`
                SELECT id FROM user_badge
                WHERE user_id = ? AND badge_id = ?
            `, [userId, badge.id]);

            if (existing.length === 0) {
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

module.exports = {
    startQuiz,
    submitQuiz,
    determineLevelStatus
};
```

---

#### **Step 3.3: Buat quizRoutes.js**

Buat file `src/routes/quizRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Semua route butuh authentication
router.use(auth);

// POST /api/quiz/start
router.post('/start', quizController.startQuiz);

// POST /api/quiz/submit
router.post('/submit', quizController.submitQuiz);

module.exports = router;
```

---

### **PHASE 4: AUTHENTICATION MIDDLEWARE** 🔐

#### **Step 4.1: Setup JWT Middleware**

Edit `src/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized - No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized - Token invalid or expired'
        });
    }
};
```

---

### **PHASE 5: TESTING** 🧪

#### **Step 5.1: Setup Postman Collection**

Buat collection dengan endpoints berikut:

**1. Login (Untuk Dapat Token)**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

**2. Get Categories**
```http
GET http://localhost:3000/api/categories
Authorization: Bearer YOUR_JWT_TOKEN
```

**3. Get Levels**
```http
GET http://localhost:3000/api/categories/CAT_UUID/levels
Authorization: Bearer YOUR_JWT_TOKEN
```

**4. Start Quiz**
```http
POST http://localhost:3000/api/quiz/start
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "level_id": "LEVEL_UUID"
}
```

**5. Submit Quiz**
```http
POST http://localhost:3000/api/quiz/submit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "attempt_id": "ATTEMPT_UUID",
    "answers": [
        {
            "question_id": "Q_UUID_1",
            "option_id": "OPT_UUID_1",
            "answered_at": "2024-11-28T10:02:30.000Z"
        },
        {
            "question_id": "Q_UUID_2",
            "option_id": null,
            "answered_at": null
        }
    ]
}
```

---

#### **Step 5.2: Test Scenarios**

✅ **Test 1:** Login user → Dapat token  
✅ **Test 2:** Get categories → Muncul list kategori  
✅ **Test 3:** Get levels → Level pertama unlocked, sisanya locked  
✅ **Test 4:** Start quiz → Dapat questions tanpa jawaban benar  
✅ **Test 5:** Submit dengan 100% benar → Pass, dapat XP, unlock next level  
✅ **Test 6:** Submit dengan 60% benar → Tidak pass, tidak dapat XP  
✅ **Test 7:** Start quiz locked level → Error 403  

---

### **PHASE 6: SEEDING DATA (OPSIONAL)** 🌱

#### **Step 6.1: Buat Seed Script**

Buat file `scripts/seedQuizData.js`:

```javascript
const db = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function seedQuizData() {
    try {
        console.log('🌱 Starting seed...');

        // 1. Insert Categories
        const categoryId1 = uuidv4();
        const categoryId2 = uuidv4();

        await db.query(`
            INSERT INTO quiz_category (id, name, description, display_order)
            VALUES 
            (?, 'Sejarah Minangkabau', 'Pelajari sejarah Minang', 1),
            (?, 'Budaya & Tradisi', 'Kenali budaya Minang', 2)
        `, [categoryId1, categoryId2]);

        console.log('✅ Categories inserted');

        // 2. Insert Levels
        const level1Id = uuidv4();
        const level2Id = uuidv4();

        await db.query(`
            INSERT INTO level (
                id, category_id, name, description,
                time_limit_seconds, pass_condition_type, pass_threshold,
                base_xp, base_points, max_questions, display_order
            ) VALUES
            (?, ?, 'Level 1: Dasar', 'Level dasar sejarah', 300, 'percent_correct', 70, 50, 100, 5, 1),
            (?, ?, 'Level 2: Lanjutan', 'Level lanjutan sejarah', 360, 'percent_correct', 70, 75, 150, 5, 2)
        `, [level1Id, categoryId1, level2Id, categoryId1]);

        console.log('✅ Levels inserted');

        // 3. Insert Prerequisite (Level 2 butuh Level 1)
        await db.query(`
            INSERT INTO prerequisite_level (id, level_id, required_level_id)
            VALUES (?, ?, ?)
        `, [uuidv4(), level2Id, level1Id]);

        console.log('✅ Prerequisites inserted');

        // 4. Insert Sample Questions for Level 1
        for (let i = 1; i <= 5; i++) {
            const questionId = uuidv4();
            
            await db.query(`
                INSERT INTO question (id, level_id, text, points_correct, display_order)
                VALUES (?, ?, ?, 10, ?)
            `, [questionId, level1Id, `Soal Sejarah ${i}?`, i]);

            // Insert 4 options (A, B, C, D)
            const labels = ['A', 'B', 'C', 'D'];
            for (let j = 0; j < 4; j++) {
                const isCorrect = (j === 0 ? 1 : 0); // Option A is correct
                await db.query(`
                    INSERT INTO question_option (id, question_id, label, text, is_correct, display_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    uuidv4(),
                    questionId,
                    labels[j],
                    `Jawaban ${labels[j]}`,
                    isCorrect,
                    j + 1
                ]);
            }
        }

        console.log('✅ Questions and options inserted');

        // 5. Insert Sample Badge
        await db.query(`
            INSERT INTO badge (id, name, description, criteria_type, criteria_value)
            VALUES (?, 'Pemula Sejarah', 'Selesaikan Level 1', 'level_100_percent', '{}')
        `, [uuidv4()]);

        console.log('✅ Badge inserted');
        console.log('🎉 Seed completed successfully!');

    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        process.exit();
    }
}

seedQuizData();
```

**Run seed:**
```bash
node scripts/seedQuizData.js
```

---

### **PHASE 7: DEPLOYMENT** 🚀

#### **Step 7.1: Setup untuk Testing dari Android**

1. **Cek IP Laptop:**
```bash
ipconfig
# Cari IPv4 Address, contoh: 192.168.1.100
```

2. **Update CORS di app.js:**
```javascript
app.use(cors({
    origin: '*', // Untuk development
    credentials: true
}));
```

3. **Run server:**
```bash
npm run dev
```

4. **Test dari Android:**
```
Base URL: http://192.168.1.100:3000/api
```

---

#### **Step 7.2: Package.json Scripts**

Tambahkan di `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seedQuizData.js"
  }
}
```

---

## 🎯 CHECKLIST FINAL

Pastikan semua ini sudah beres:

- [ ] Database connected successfully
- [ ] `.env` file configured
- [ ] JWT secret generated
- [ ] Categories endpoint working
- [ ] Levels endpoint showing lock/unlock status
- [ ] Start quiz returns questions WITHOUT is_correct
- [ ] Submit quiz calculates score correctly
- [ ] XP dan points awarded on pass
- [ ] Next level unlocked after pass
- [ ] Badges awarded correctly
- [ ] Authentication middleware working
- [ ] CORS enabled for Android
- [ ] Tested all endpoints in Postman
- [ ] Server accessible from Android via IP

---

## 🆘 TROUBLESHOOTING

### Error: "Database connection failed"
✅ **Fix:** Cek `.env` → DB_PASSWORD, DB_NAME harus benar

### Error: "Token invalid"
✅ **Fix:** Pastikan JWT_SECRET di `.env` sama dengan saat generate token

### Error: "Level is locked"
✅ **Fix:** Cek `prerequisite_level` table → Level 1 harus tanpa prerequisite

### Error: "Cannot access from Android"
✅ **Fix:** 
- Pastikan laptop & Android di WiFi yang sama
- Cek firewall Windows (allow port 3000)
- Gunakan IP laptop, bukan localhost

---

## 📚 NEXT STEPS

Setelah backend selesai, Anda bisa:

1. **Tambah Endpoint Opsional:**
   - GET `/api/quiz/attempts/:id` - Detail attempt
   - GET `/api/quiz/history` - History attempts user
   - GET `/api/badges` - List badges user

2. **Optimasi:**
   - Add caching (Redis)
   - Add request validation (express-validator)
   - Add API rate limiting
   - Add logging (winston)

3. **Testing:**
   - Unit tests (Jest)
   - Integration tests
   - Load testing

---

## 🎉 SELESAI!

Dengan mengikuti guide ini step-by-step, backend modul quiz Anda sudah siap diintegrasikan dengan aplikasi Android!

**Happy Coding! 🚀**
