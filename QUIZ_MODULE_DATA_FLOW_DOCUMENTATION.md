# 📚 DOKUMENTASI LENGKAP: MODUL KUIS - DATA FLOW & API SPECIFICATION

**Aplikasi:** SAKO (Sumatera Barat Knowledge App)  
**Tanggal:** 28 November 2024  
**Tujuan:** Panduan untuk mengembangkan Backend Express.js

---

## 🎯 OVERVIEW MODUL KUIS

Modul Kuis adalah sistem gamifikasi pembelajaran budaya Minangkabau dengan fitur:
- **Multi-category quiz** (Sejarah, Budaya, Wisata, Kuliner)
- **Progressive levels** dengan sistem unlock
- **Timer-based quiz** dengan batas waktu
- **Point & XP system** untuk gamifikasi
- **Badge/Achievement system** untuk motivasi
- **Progress tracking** per category dan level

---

## 📊 DATABASE SCHEMA YANG RELEVAN

### 1. **quiz_category** - Kategori Kuis
```sql
CREATE TABLE quiz_category (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. **level** - Level dalam Kategori
```sql
CREATE TABLE level (
    id CHAR(36) PRIMARY KEY,
    category_id CHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    time_limit_seconds INT CHECK (time_limit_seconds BETWEEN 10 AND 3600),
    pass_condition_type ENUM('percent_correct','points','time','custom'),
    pass_threshold DECIMAL(5,2) NOT NULL,
    base_xp INT DEFAULT 0,
    base_points INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    max_questions INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES quiz_category(id)
);
```

### 3. **prerequisite_level** - Prerequisite antar Level
```sql
CREATE TABLE prerequisite_level (
    id CHAR(36) PRIMARY KEY,
    level_id CHAR(36) NOT NULL,
    required_level_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES level(id),
    FOREIGN KEY (required_level_id) REFERENCES level(id)
);
```

### 4. **question** - Soal Quiz
```sql
CREATE TABLE question (
    id CHAR(36) PRIMARY KEY,
    level_id CHAR(36) NOT NULL,
    text TEXT NOT NULL,
    points_correct INT DEFAULT 1,
    points_wrong INT DEFAULT 0,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES level(id)
);
```

### 5. **question_option** - Pilihan Jawaban
```sql
CREATE TABLE question_option (
    id CHAR(36) PRIMARY KEY,
    question_id CHAR(36) NOT NULL,
    label VARCHAR(4) NOT NULL,  -- A, B, C, D
    text TEXT NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES question(id)
);
```

### 6. **quiz_attempt** - Record Attempt User
```sql
CREATE TABLE quiz_attempt (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    level_id CHAR(36) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    duration_seconds INT NOT NULL,
    seed INT NOT NULL,  -- Random seed untuk shuffle soal
    total_questions INT NOT NULL CHECK (total_questions >= 1),
    status ENUM('in_progress','submitted','expired','aborted'),
    score_points INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    unanswered_count INT DEFAULT 0,
    percent_correct DECIMAL(5,2) DEFAULT 0.00,
    metadata_snapshot JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(users_id),
    FOREIGN KEY (level_id) REFERENCES level(id)
);
```

### 7. **attempt_answer** - Jawaban User per Soal
```sql
CREATE TABLE attempt_answer (
    id CHAR(36) PRIMARY KEY,
    attempt_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    option_id CHAR(36),  -- NULL jika tidak dijawab
    is_correct TINYINT(1),
    answered_at TIMESTAMP,
    order_index INT DEFAULT 0,  -- Urutan soal saat ditampilkan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempt(id),
    FOREIGN KEY (question_id) REFERENCES question(id),
    FOREIGN KEY (option_id) REFERENCES question_option(id)
);
```

### 8. **user_level_progress** - Progress User per Level
```sql
CREATE TABLE user_level_progress (
    user_id CHAR(36) NOT NULL,
    level_id CHAR(36) NOT NULL,
    best_percent_correct DECIMAL(5,2) DEFAULT 0.00,
    best_score_points INT DEFAULT 0,
    total_attempts INT DEFAULT 0,
    status ENUM('locked','unstarted','in_progress','completed') DEFAULT 'locked',
    last_attempt_id CHAR(36),
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, level_id),
    FOREIGN KEY (user_id) REFERENCES users(users_id),
    FOREIGN KEY (level_id) REFERENCES level(id),
    FOREIGN KEY (last_attempt_id) REFERENCES quiz_attempt(id)
);
```

### 9. **user_category_progress** - Progress User per Kategori
```sql
CREATE TABLE user_category_progress (
    user_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    percent_completed DECIMAL(5,2) DEFAULT 0.00,
    completed_levels_count INT DEFAULT 0,
    total_levels_count INT DEFAULT 0,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(users_id),
    FOREIGN KEY (category_id) REFERENCES quiz_category(id)
);
```

### 10. **badge** & **user_badge** - Achievement System
```sql
CREATE TABLE badge (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    image_url VARCHAR(512),
    criteria_type ENUM('level_100_percent','category_mastery','streak','points_total','custom'),
    criteria_value JSON NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_badge (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    badge_id CHAR(36) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_level_id CHAR(36),
    source_category_id CHAR(36),
    attempt_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(users_id),
    FOREIGN KEY (badge_id) REFERENCES badge(id),
    FOREIGN KEY (source_level_id) REFERENCES level(id),
    FOREIGN KEY (source_category_id) REFERENCES quiz_category(id),
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempt(id)
);
```

---

## 🔄 COMPLETE DATA FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        MODUL KUIS - DATA FLOW                             │
└──────────────────────────────────────────────────────────────────────────┘

1. USER MEMBUKA HALAMAN KATEGORI
   ┌──────────┐     GET /api/categories    ┌──────────┐
   │  Client  │ ─────────────────────────> │  Backend │
   │ (Kotlin) │                             │ (Express)│
   └──────────┘                             └──────────┘
                                                   │
                                                   ├─ Query: quiz_category
                                                   ├─ Join: user_category_progress
                                                   └─ Calculate: progress %
                                                   
   ┌──────────┐   CategoryListResponse      ┌──────────┐
   │  Client  │ <───────────────────────── │  Backend │
   └──────────┘                             └──────────┘
   Response: List kategori dengan progress

2. USER MEMILIH KATEGORI → MELIHAT LEVEL LIST
   ┌──────────┐  GET /api/categories/:id/levels  ┌──────────┐
   │  Client  │ ────────────────────────────────> │  Backend │
   └──────────┘                                    └──────────┘
                                                        │
                                                        ├─ Query: level by category_id
                                                        ├─ Join: user_level_progress
                                                        ├─ Join: prerequisite_level
                                                        ├─ Calculate: status (locked/unlocked)
                                                        └─ Order by: display_order
                                                        
   ┌──────────┐      LevelListResponse        ┌──────────┐
   │  Client  │ <──────────────────────────── │  Backend │
   └──────────┘                                └──────────┘
   Response: List level dengan status lock/unlock

3. USER MULAI QUIZ (START QUIZ)
   ┌──────────┐      POST /api/quiz/start      ┌──────────┐
   │  Client  │ ────────────────────────────> │  Backend │
   │          │  Body: { level_id }            │          │
   └──────────┘                                 └──────────┘
                                                     │
                                                     ├─ Validasi: level_id exists
                                                     ├─ Validasi: user sudah unlock level
                                                     ├─ Create: quiz_attempt (status: in_progress)
                                                     ├─ Query: questions by level_id
                                                     ├─ Shuffle: questions dengan seed random
                                                     ├─ Filter: max_questions (jika ada)
                                                     ├─ Query: options per question
                                                     └─ PENTING: JANGAN kirim is_correct!
                                                     
   ┌──────────┐      QuizStartResponse         ┌──────────┐
   │  Client  │ <──────────────────────────── │  Backend │
   └──────────┘                                 └──────────┘
   Response: {
       attempt_id,
       level: { info level },
       questions: [ { id, text, points, options: [] } ],
       duration_seconds,
       started_at
   }

4. USER MENGERJAKAN QUIZ (CLIENT-SIDE)
   ┌─────────────────────────────────────────────┐
   │  Client menyimpan jawaban di state lokal    │
   │  Map<questionId, optionId>                  │
   │  Timer berjalan di client                   │
   │  TIDAK ada komunikasi dengan server         │
   └─────────────────────────────────────────────┘

5. USER SUBMIT QUIZ
   ┌──────────┐     POST /api/quiz/submit      ┌──────────┐
   │  Client  │ ────────────────────────────> │  Backend │
   │          │  Body: {                        │          │
   │          │    attempt_id,                  │          │
   │          │    answers: [                   │          │
   │          │      { question_id,             │          │
   │          │        option_id,               │          │
   │          │        answered_at }            │          │
   │          │    ]                            │          │
   │          │  }                              │          │
   └──────────┘                                 └──────────┘
                                                     │
                                                     ├─ BEGIN TRANSACTION
                                                     ├─ Validasi: attempt_id exists
                                                     ├─ Validasi: attempt masih in_progress
                                                     ├─ Loop setiap answer:
                                                     │   ├─ Cari jawaban benar dari DB
                                                     │   ├─ Bandingkan dengan jawaban user
                                                     │   ├─ Hitung points (correct/wrong)
                                                     │   ├─ Insert ke attempt_answer
                                                     │   └─ Akumulasi score
                                                     │
                                                     ├─ Update quiz_attempt:
                                                     │   ├─ status = 'submitted'
                                                     │   ├─ finished_at = NOW()
                                                     │   ├─ score_points
                                                     │   ├─ correct_count
                                                     │   ├─ wrong_count
                                                     │   ├─ unanswered_count
                                                     │   └─ percent_correct
                                                     │
                                                     ├─ Cek: is_passed (percent >= pass_threshold)
                                                     │
                                                     ├─ IF PASSED:
                                                     │   ├─ Calculate XP earned
                                                     │   ├─ Update users.total_xp
                                                     │   ├─ Update user_points
                                                     │   ├─ Unlock next level
                                                     │   └─ Check & award badges
                                                     │
                                                     ├─ Update user_level_progress:
                                                     │   ├─ best_percent_correct (jika lebih baik)
                                                     │   ├─ best_score_points (jika lebih baik)
                                                     │   ├─ total_attempts++
                                                     │   ├─ status (in_progress/completed)
                                                     │   └─ last_attempt_id
                                                     │
                                                     ├─ Update user_category_progress:
                                                     │   ├─ completed_levels_count
                                                     │   ├─ percent_completed
                                                     │   └─ last_updated_at
                                                     │
                                                     └─ COMMIT TRANSACTION
                                                     
   ┌──────────┐     QuizSubmitResponse         ┌──────────┐
   │  Client  │ <──────────────────────────── │  Backend │
   └──────────┘                                 └──────────┘
   Response: {
       attempt_id,
       score_points,
       correct_count,
       wrong_count,
       unanswered_count,
       percent_correct,
       xp_earned,
       points_earned,
       is_passed,
       new_total_xp,
       badges_earned: [ { badge info } ]
   }

6. USER MELIHAT HASIL (OPTIONAL - JIKA BUTUH DETAIL)
   ┌──────────┐   GET /api/quiz/attempts/:id   ┌──────────┐
   │  Client  │ ────────────────────────────> │  Backend │
   └──────────┘                                 └──────────┘
                                                     │
                                                     ├─ Query: quiz_attempt by id
                                                     ├─ Join: attempt_answer
                                                     ├─ Join: question & options
                                                     └─ Include: jawaban benar/salah
                                                     
   ┌──────────┐      QuizAttemptDetail         ┌──────────┐
   │  Client  │ <──────────────────────────── │  Backend │
   └──────────┘                                 └──────────┘
   Response: Detail attempt dengan review jawaban
```

---

## 🌐 API ENDPOINTS SPECIFICATION

### Base URL
```
https://your-domain.com/api
```

### Authentication
Semua endpoint memerlukan Bearer Token JWT:
```http
Authorization: Bearer <jwt_token>
```

---

### 1️⃣ **GET /categories** - Daftar Kategori Quiz

#### Request
```http
GET /api/categories
Authorization: Bearer <token>
```

#### Response Success (200)
```json
{
    "status": "success",
    "message": "Categories retrieved successfully",
    "data": [
        {
            "id": "cat-uuid-1",
            "name": "Sejarah Minangkabau",
            "description": "Pelajari sejarah Minangkabau...",
            "is_active": true,
            "display_order": 1,
            "progress": {
                "percent_completed": 40.0,
                "completed_levels_count": 2,
                "total_levels_count": 5
            }
        },
        {
            "id": "cat-uuid-2",
            "name": "Budaya & Tradisi",
            "description": "Kenali budaya Minangkabau...",
            "is_active": true,
            "display_order": 2,
            "progress": {
                "percent_completed": 0.0,
                "completed_levels_count": 0,
                "total_levels_count": 5
            }
        }
    ]
}
```

#### Response Error (401)
```json
{
    "status": "error",
    "message": "Unauthorized - Token invalid or expired"
}
```

#### Logic Backend
```javascript
// Pseudocode
async function getCategories(userId) {
    // 1. Query semua kategori aktif
    const categories = await db.query(`
        SELECT id, name, description, is_active, display_order
        FROM quiz_category
        WHERE is_active = 1
        ORDER BY display_order ASC
    `);
    
    // 2. Untuk setiap kategori, hitung progress user
    for (let category of categories) {
        const progress = await db.query(`
            SELECT 
                percent_completed,
                completed_levels_count,
                total_levels_count
            FROM user_category_progress
            WHERE user_id = ? AND category_id = ?
        `, [userId, category.id]);
        
        // Jika belum ada progress, set default 0
        category.progress = progress || {
            percent_completed: 0,
            completed_levels_count: 0,
            total_levels_count: await countLevelsInCategory(category.id)
        };
    }
    
    return categories;
}
```

---

### 2️⃣ **GET /categories/:categoryId/levels** - Daftar Level dalam Kategori

#### Request
```http
GET /api/categories/cat-uuid-1/levels
Authorization: Bearer <token>
```

#### Response Success (200)
```json
{
    "status": "success",
    "message": "Levels retrieved successfully",
    "data": {
        "category": {
            "id": "cat-uuid-1",
            "name": "Sejarah Minangkabau",
            "description": "Pelajari sejarah...",
            "is_active": true,
            "display_order": 1
        },
        "levels": [
            {
                "id": "level-uuid-1",
                "name": "Asal Usul Minangkabau",
                "description": "Pelajari legenda asal usul...",
                "time_limit_seconds": 300,
                "base_xp": 50,
                "base_points": 100,
                "max_questions": 10,
                "display_order": 1,
                "pass_condition_type": "percent_correct",
                "pass_threshold": 70.0,
                "progress": {
                    "status": "unstarted",
                    "best_percent_correct": 0.0,
                    "best_score_points": 0,
                    "total_attempts": 0
                }
            },
            {
                "id": "level-uuid-2",
                "name": "Kerajaan Pagaruyung",
                "description": "Sejarah kerajaan...",
                "time_limit_seconds": 360,
                "base_xp": 75,
                "base_points": 150,
                "max_questions": 12,
                "display_order": 2,
                "pass_condition_type": "percent_correct",
                "pass_threshold": 70.0,
                "progress": {
                    "status": "locked",
                    "best_percent_correct": 0.0,
                    "best_score_points": 0,
                    "total_attempts": 0
                }
            }
        ]
    }
}
```

#### Logic Backend - Status Lock/Unlock
```javascript
async function determineLevelStatus(userId, levelId) {
    // 1. Cek progress user untuk level ini
    const progress = await db.query(`
        SELECT status, best_percent_correct
        FROM user_level_progress
        WHERE user_id = ? AND level_id = ?
    `, [userId, levelId]);
    
    // Jika belum pernah dicoba, cek prerequisite
    if (!progress) {
        const prerequisites = await db.query(`
            SELECT required_level_id
            FROM prerequisite_level
            WHERE level_id = ?
        `, [levelId]);
        
        // Jika tidak ada prerequisite, level unlocked (unstarted)
        if (prerequisites.length === 0) {
            return 'unstarted';
        }
        
        // Cek apakah semua prerequisite sudah completed dengan passing grade
        for (let prereq of prerequisites) {
            const prereqProgress = await db.query(`
                SELECT status, best_percent_correct
                FROM user_level_progress
                WHERE user_id = ? AND level_id = ?
            `, [userId, prereq.required_level_id]);
            
            // Jika prerequisite belum completed atau tidak passing, level locked
            if (!prereqProgress || prereqProgress.status !== 'completed') {
                return 'locked';
            }
            
            const prereqLevel = await getLevel(prereq.required_level_id);
            if (prereqProgress.best_percent_correct < prereqLevel.pass_threshold) {
                return 'locked';
            }
        }
        
        // Semua prerequisite terpenuhi
        return 'unstarted';
    }
    
    // Jika sudah ada progress, return status dari DB
    return progress.status;
}
```

---

### 3️⃣ **POST /quiz/start** - Mulai Quiz Attempt Baru

#### Request
```http
POST /api/quiz/start
Authorization: Bearer <token>
Content-Type: application/json

{
    "level_id": "level-uuid-1"
}
```

#### Response Success (200)
```json
{
    "status": "success",
    "message": "Quiz started successfully",
    "data": {
        "attempt_id": "attempt-uuid-123",
        "level": {
            "id": "level-uuid-1",
            "name": "Asal Usul Minangkabau",
            "description": "Pelajari legenda...",
            "time_limit_seconds": 300,
            "base_xp": 50,
            "base_points": 100,
            "max_questions": 10,
            "display_order": 1,
            "pass_condition_type": "percent_correct",
            "pass_threshold": 70.0
        },
        "questions": [
            {
                "id": "q-uuid-1",
                "text": "Siapa nama tokoh dalam legenda Cindua Mato?",
                "points_correct": 10,
                "points_wrong": 0,
                "display_order": 1,
                "options": [
                    {
                        "id": "opt-uuid-1",
                        "label": "A",
                        "text": "Datuk Perpatih",
                        "display_order": 1
                    },
                    {
                        "id": "opt-uuid-2",
                        "label": "B",
                        "text": "Datuk Katumanggungan",
                        "display_order": 2
                    },
                    {
                        "id": "opt-uuid-3",
                        "label": "C",
                        "text": "Rajo Babanding",
                        "display_order": 3
                    },
                    {
                        "id": "opt-uuid-4",
                        "label": "D",
                        "text": "Dang Tuanku",
                        "display_order": 4
                    }
                ]
            }
        ],
        "duration_seconds": 300,
        "started_at": "2024-11-28T10:00:00.000Z"
    }
}
```

#### Response Error - Level Locked (403)
```json
{
    "status": "error",
    "message": "Level is locked. Complete prerequisite levels first."
}
```

#### Response Error - Level Not Found (404)
```json
{
    "status": "error",
    "message": "Level not found"
}
```

#### Logic Backend - START QUIZ
```javascript
async function startQuiz(userId, levelId) {
    // 1. Validasi level exists dan active
    const level = await db.query(`
        SELECT * FROM level WHERE id = ? AND is_active = 1
    `, [levelId]);
    
    if (!level) {
        throw new Error('Level not found');
    }
    
    // 2. Cek apakah level sudah unlock untuk user ini
    const status = await determineLevelStatus(userId, levelId);
    if (status === 'locked') {
        throw new Error('Level is locked');
    }
    
    // 3. Generate random seed untuk shuffle questions
    const seed = Math.floor(Math.random() * 1000000);
    
    // 4. Query questions untuk level ini
    let questions = await db.query(`
        SELECT q.*, 
               GROUP_CONCAT(
                   JSON_OBJECT(
                       'id', qo.id,
                       'label', qo.label,
                       'text', qo.text,
                       'display_order', qo.display_order
                   )
               ) as options
        FROM question q
        LEFT JOIN question_option qo ON q.id = qo.question_id
        WHERE q.level_id = ? AND q.is_active = 1
        GROUP BY q.id
        ORDER BY q.display_order
    `, [levelId]);
    
    // 5. Shuffle questions berdasarkan seed
    questions = shuffleArrayWithSeed(questions, seed);
    
    // 6. Limit questions jika max_questions ditentukan
    if (level.max_questions && questions.length > level.max_questions) {
        questions = questions.slice(0, level.max_questions);
    }
    
    // 7. PENTING: Remove field 'is_correct' dari options
    // Client tidak boleh tahu jawaban yang benar
    questions = questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
            id: opt.id,
            label: opt.label,
            text: opt.text,
            display_order: opt.display_order
            // is_correct TIDAK dikirim!
        }))
    }));
    
    // 8. Create quiz_attempt record
    const attemptId = generateUUID();
    const startedAt = new Date().toISOString();
    
    await db.query(`
        INSERT INTO quiz_attempt (
            id, user_id, level_id, started_at, 
            duration_seconds, seed, total_questions, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `, [
        attemptId, userId, levelId, startedAt,
        level.time_limit_seconds, seed, questions.length
    ]);
    
    // 9. Update user_level_progress jika belum ada
    await db.query(`
        INSERT INTO user_level_progress (
            user_id, level_id, status, total_attempts
        ) VALUES (?, ?, 'in_progress', 0)
        ON DUPLICATE KEY UPDATE status = 'in_progress'
    `, [userId, levelId]);
    
    // 10. Return response
    return {
        attempt_id: attemptId,
        level: level,
        questions: questions,
        duration_seconds: level.time_limit_seconds,
        started_at: startedAt
    };
}
```

---

### 4️⃣ **POST /quiz/submit** - Submit Jawaban Quiz

#### Request
```http
POST /api/quiz/submit
Authorization: Bearer <token>
Content-Type: application/json

{
    "attempt_id": "attempt-uuid-123",
    "answers": [
        {
            "question_id": "q-uuid-1",
            "option_id": "opt-uuid-2",
            "answered_at": "2024-11-28T10:02:30.000Z"
        },
        {
            "question_id": "q-uuid-2",
            "option_id": "opt-uuid-7",
            "answered_at": "2024-11-28T10:03:15.000Z"
        },
        {
            "question_id": "q-uuid-3",
            "option_id": null,
            "answered_at": null
        }
    ]
}
```

**Notes:**
- `option_id` = `null` jika user tidak menjawab
- `answered_at` = `null` jika tidak dijawab
- Client harus mengirim semua questions, termasuk yang tidak dijawab

#### Response Success (200)
```json
{
    "status": "success",
    "message": "Quiz submitted successfully",
    "data": {
        "attempt_id": "attempt-uuid-123",
        "score_points": 80,
        "correct_count": 8,
        "wrong_count": 1,
        "unanswered_count": 1,
        "percent_correct": 80.0,
        "xp_earned": 50,
        "points_earned": 80,
        "is_passed": true,
        "new_total_xp": 350,
        "badges_earned": [
            {
                "id": "badge-uuid-1",
                "name": "Pemula Sejarah",
                "description": "Selesaikan level pertama Sejarah",
                "image_url": "https://cdn.example.com/badges/pemula.png"
            }
        ]
    }
}
```

#### Response Error - Attempt Not Found (404)
```json
{
    "status": "error",
    "message": "Quiz attempt not found"
}
```

#### Response Error - Already Submitted (400)
```json
{
    "status": "error",
    "message": "Quiz attempt already submitted"
}
```

#### Logic Backend - SUBMIT QUIZ (CRITICAL!)
```javascript
async function submitQuiz(userId, attemptId, answers) {
    // START TRANSACTION
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
        // 1. Validasi attempt exists dan belongs to user
        const attempt = await connection.query(`
            SELECT * FROM quiz_attempt
            WHERE id = ? AND user_id = ?
        `, [attemptId, userId]);
        
        if (!attempt) {
            throw new Error('Quiz attempt not found');
        }
        
        if (attempt.status !== 'in_progress') {
            throw new Error('Quiz attempt already submitted');
        }
        
        // 2. Get level info untuk scoring
        const level = await connection.query(`
            SELECT * FROM level WHERE id = ?
        `, [attempt.level_id]);
        
        // 3. Initialize counters
        let totalPoints = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;
        
        // 4. Process setiap answer
        for (let answer of answers) {
            // Get question info
            const question = await connection.query(`
                SELECT * FROM question WHERE id = ?
            `, [answer.question_id]);
            
            // Jika tidak dijawab
            if (!answer.option_id) {
                unansweredCount++;
                
                await connection.query(`
                    INSERT INTO attempt_answer (
                        id, attempt_id, question_id, 
                        option_id, is_correct, answered_at
                    ) VALUES (?, ?, ?, NULL, NULL, NULL)
                `, [generateUUID(), attemptId, answer.question_id]);
                
                continue;
            }
            
            // Get correct answer
            const correctOption = await connection.query(`
                SELECT id FROM question_option
                WHERE question_id = ? AND is_correct = 1
            `, [answer.question_id]);
            
            // Check if answer is correct
            const isCorrect = (answer.option_id === correctOption.id);
            
            if (isCorrect) {
                correctCount++;
                totalPoints += question.points_correct;
            } else {
                wrongCount++;
                totalPoints -= question.points_wrong; // Biasanya 0
            }
            
            // Save answer
            await connection.query(`
                INSERT INTO attempt_answer (
                    id, attempt_id, question_id, option_id, 
                    is_correct, answered_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                generateUUID(), attemptId, answer.question_id,
                answer.option_id, isCorrect, answer.answered_at
            ]);
        }
        
        // 5. Calculate percentage
        const totalQuestions = answers.length;
        const percentCorrect = (correctCount / totalQuestions) * 100;
        
        // 6. Determine if passed
        const isPassed = (percentCorrect >= level.pass_threshold);
        
        // 7. Calculate XP and points earned
        let xpEarned = 0;
        let pointsEarned = totalPoints;
        
        if (isPassed) {
            // Base XP + Bonus dari persentase
            xpEarned = level.base_xp + Math.floor((percentCorrect - level.pass_threshold) * 0.5);
        }
        
        // 8. Update quiz_attempt
        const finishedAt = new Date().toISOString();
        
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
            finishedAt, totalPoints, correctCount,
            wrongCount, unansweredCount, percentCorrect, attemptId
        ]);
        
        // 9. Update user's total XP and points
        let newTotalXp = 0;
        
        if (isPassed) {
            const userResult = await connection.query(`
                UPDATE users 
                SET total_xp = total_xp + ?
                WHERE users_id = ?
            `, [xpEarned, userId]);
            
            const updatedUser = await connection.query(`
                SELECT total_xp FROM users WHERE users_id = ?
            `, [userId]);
            
            newTotalXp = updatedUser.total_xp;
            
            // Update user_points
            await connection.query(`
                INSERT INTO user_points (user_id, total_points, lifetime_points)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    total_points = total_points + VALUES(total_points),
                    lifetime_points = lifetime_points + VALUES(lifetime_points)
            `, [userId, pointsEarned, pointsEarned]);
        }
        
        // 10. Update user_level_progress
        const existingProgress = await connection.query(`
            SELECT * FROM user_level_progress
            WHERE user_id = ? AND level_id = ?
        `, [userId, level.id]);
        
        const newStatus = isPassed ? 'completed' : 'in_progress';
        const newBestPercent = Math.max(
            existingProgress?.best_percent_correct || 0, 
            percentCorrect
        );
        const newBestScore = Math.max(
            existingProgress?.best_score_points || 0,
            totalPoints
        );
        
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
            newBestPercent, newBestScore, newStatus,
            attemptId, userId, level.id
        ]);
        
        // 11. Update user_category_progress
        const completedLevels = await connection.query(`
            SELECT COUNT(*) as count FROM user_level_progress
            WHERE user_id = ? AND status = 'completed'
            AND level_id IN (
                SELECT id FROM level WHERE category_id = ?
            )
        `, [userId, level.category_id]);
        
        const totalLevels = await connection.query(`
            SELECT COUNT(*) as count FROM level
            WHERE category_id = ? AND is_active = 1
        `, [level.category_id]);
        
        const categoryPercent = (completedLevels.count / totalLevels.count) * 100;
        
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
            userId, level.category_id, categoryPercent,
            completedLevels.count, totalLevels.count
        ]);
        
        // 12. Unlock next level if passed
        if (isPassed) {
            // Find levels yang require level ini sebagai prerequisite
            const nextLevels = await connection.query(`
                SELECT level_id FROM prerequisite_level
                WHERE required_level_id = ?
            `, [level.id]);
            
            for (let nextLevel of nextLevels) {
                // Check if all prerequisites are met
                const allPrereqsMet = await checkAllPrerequisitesMet(
                    userId, nextLevel.level_id, connection
                );
                
                if (allPrereqsMet) {
                    // Unlock the level
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
        
        // 13. Check and award badges
        const badgesEarned = await checkAndAwardBadges(
            userId, attemptId, level, percentCorrect, connection
        );
        
        // COMMIT TRANSACTION
        await connection.commit();
        
        // 14. Return result
        return {
            attempt_id: attemptId,
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
        };
        
    } catch (error) {
        // ROLLBACK on error
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
```

#### Helper Function - Check Prerequisites
```javascript
async function checkAllPrerequisitesMet(userId, levelId, connection) {
    const prerequisites = await connection.query(`
        SELECT required_level_id FROM prerequisite_level
        WHERE level_id = ?
    `, [levelId]);
    
    if (prerequisites.length === 0) {
        return true; // No prerequisites
    }
    
    for (let prereq of prerequisites) {
        const progress = await connection.query(`
            SELECT status, best_percent_correct
            FROM user_level_progress
            WHERE user_id = ? AND level_id = ?
        `, [userId, prereq.required_level_id]);
        
        if (!progress || progress.status !== 'completed') {
            return false;
        }
        
        const level = await connection.query(`
            SELECT pass_threshold FROM level WHERE id = ?
        `, [prereq.required_level_id]);
        
        if (progress.best_percent_correct < level.pass_threshold) {
            return false;
        }
    }
    
    return true;
}
```

#### Helper Function - Badge Award System
```javascript
async function checkAndAwardBadges(userId, attemptId, level, percentCorrect, connection) {
    const badgesEarned = [];
    
    // Get all active badges
    const badges = await connection.query(`
        SELECT * FROM badge WHERE is_active = 1
    `);
    
    for (let badge of badges) {
        const criteria = JSON.parse(badge.criteria_value);
        let shouldAward = false;
        
        // Check based on criteria_type
        switch (badge.criteria_type) {
            case 'level_100_percent':
                // Award jika dapat 100%
                if (percentCorrect === 100) {
                    shouldAward = true;
                }
                break;
                
            case 'category_mastery':
                // Award jika semua level di kategori completed
                const categoryProgress = await connection.query(`
                    SELECT percent_completed FROM user_category_progress
                    WHERE user_id = ? AND category_id = ?
                `, [userId, level.category_id]);
                
                if (categoryProgress && categoryProgress.percent_completed === 100) {
                    shouldAward = true;
                }
                break;
                
            case 'points_total':
                // Award jika total points mencapai threshold
                const userPoints = await connection.query(`
                    SELECT total_points FROM user_points WHERE user_id = ?
                `, [userId]);
                
                if (userPoints && userPoints.total_points >= criteria.threshold) {
                    shouldAward = true;
                }
                break;
                
            // Add more criteria types as needed
        }
        
        if (shouldAward) {
            // Check if user already has this badge
            const existingBadge = await connection.query(`
                SELECT id FROM user_badge
                WHERE user_id = ? AND badge_id = ?
            `, [userId, badge.id]);
            
            if (!existingBadge) {
                // Award the badge
                await connection.query(`
                    INSERT INTO user_badge (
                        id, user_id, badge_id, earned_at,
                        source_level_id, source_category_id, attempt_id
                    ) VALUES (?, ?, ?, NOW(), ?, ?, ?)
                `, [
                    generateUUID(), userId, badge.id,
                    level.id, level.category_id, attemptId
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
```

---

### 5️⃣ **GET /quiz/attempts/:attemptId** - Get Attempt Detail (Optional)

Endpoint ini opsional, untuk melihat detail attempt termasuk jawaban yang benar/salah.

#### Request
```http
GET /api/quiz/attempts/attempt-uuid-123
Authorization: Bearer <token>
```

#### Response Success (200)
```json
{
    "status": "success",
    "message": "Attempt details retrieved",
    "data": {
        "attempt_id": "attempt-uuid-123",
        "level": { /* level info */ },
        "started_at": "2024-11-28T10:00:00.000Z",
        "finished_at": "2024-11-28T10:05:30.000Z",
        "status": "submitted",
        "score_points": 80,
        "correct_count": 8,
        "wrong_count": 1,
        "unanswered_count": 1,
        "percent_correct": 80.0,
        "questions": [
            {
                "question_id": "q-uuid-1",
                "text": "Siapa nama tokoh...",
                "user_answer": {
                    "option_id": "opt-uuid-2",
                    "option_text": "Datuk Katumanggungan",
                    "is_correct": true,
                    "answered_at": "2024-11-28T10:02:30.000Z"
                },
                "correct_answer": {
                    "option_id": "opt-uuid-2",
                    "option_text": "Datuk Katumanggungan"
                }
            }
        ]
    }
}
```

---

## 🔐 SECURITY CONSIDERATIONS

### 1. **Prevent Cheating - Jawaban Benar**
- ❌ **JANGAN PERNAH** kirim `is_correct` saat start quiz
- ✅ Hanya kirim `is_correct` di response submit atau attempt detail
- ✅ Validate di backend bahwa `option_id` valid untuk `question_id`

### 2. **Prevent Time Manipulation**
- ✅ Server mencatat `started_at` saat start quiz
- ✅ Server mencatat `finished_at` saat submit
- ✅ (Optional) Reject submission jika waktu melebihi `time_limit_seconds + grace_period`
```javascript
const elapsed = (new Date(finishedAt) - new Date(attempt.started_at)) / 1000;
const gracePeriod = 30; // 30 seconds tolerance

if (elapsed > (attempt.duration_seconds + gracePeriod)) {
    throw new Error('Quiz submission timeout');
}
```

### 3. **Prevent Double Submission**
- ✅ Check status `in_progress` sebelum accept submission
- ✅ Use database transaction untuk atomicity

### 4. **Validate Ownership**
- ✅ Selalu cek `user_id` dari token matches dengan data
```javascript
if (attempt.user_id !== userId) {
    throw new Error('Unauthorized');
}
```

### 5. **Rate Limiting**
- ✅ Limit start quiz per user (contoh: max 5 start per hour)
- ✅ Prevent spam submission

---

## 🎲 RANDOMIZATION & SHUFFLING

### Seed-based Shuffling
Backend harus konsisten shuffle questions berdasarkan seed yang sama:

```javascript
function shuffleArrayWithSeed(array, seed) {
    // Fisher-Yates shuffle with seeded random
    const rng = seedrandom(seed); // Use seedrandom library
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}
```

Install library:
```bash
npm install seedrandom
```

---

## 📈 PROGRESS CALCULATION

### Category Progress
```javascript
async function calculateCategoryProgress(userId, categoryId) {
    const completedLevels = await db.query(`
        SELECT COUNT(*) as count 
        FROM user_level_progress ulp
        JOIN level l ON ulp.level_id = l.id
        WHERE ulp.user_id = ? 
        AND l.category_id = ?
        AND ulp.status = 'completed'
    `, [userId, categoryId]);
    
    const totalLevels = await db.query(`
        SELECT COUNT(*) as count 
        FROM level
        WHERE category_id = ? AND is_active = 1
    `, [categoryId]);
    
    const percent = totalLevels.count > 0 
        ? (completedLevels.count / totalLevels.count) * 100 
        : 0;
    
    return {
        percent_completed: percent,
        completed_levels_count: completedLevels.count,
        total_levels_count: totalLevels.count
    };
}
```

---

## 🏆 GAMIFICATION FORMULAS

### XP Calculation
```javascript
function calculateXP(baseXp, percentCorrect, passThreshold) {
    if (percentCorrect < passThreshold) {
        return 0; // No XP if failed
    }
    
    // Base XP + Bonus dari excess percentage
    const excess = percentCorrect - passThreshold;
    const bonus = Math.floor(excess * 0.5); // 0.5 XP per 1% excess
    
    return baseXp + bonus;
}

// Example:
// baseXp = 50, percentCorrect = 85%, passThreshold = 70%
// XP = 50 + ((85 - 70) * 0.5) = 50 + 7.5 = 57 XP
```

### Points Calculation
```javascript
function calculatePoints(answers, questions) {
    let totalPoints = 0;
    
    for (let answer of answers) {
        const question = questions.find(q => q.id === answer.question_id);
        
        if (answer.is_correct) {
            totalPoints += question.points_correct;
        } else if (answer.option_id !== null) {
            totalPoints -= question.points_wrong; // Usually 0
        }
    }
    
    return Math.max(0, totalPoints); // Tidak boleh negatif
}
```

---

## 🧪 TESTING SCENARIOS

### Test Case 1: Start Quiz - Success
```
Given: User authenticated, level unlocked
When: POST /quiz/start with valid level_id
Then: 
  - quiz_attempt created with status 'in_progress'
  - Questions returned without is_correct field
  - user_level_progress status updated to 'in_progress'
```

### Test Case 2: Start Quiz - Locked Level
```
Given: User authenticated, level locked (prerequisite not met)
When: POST /quiz/start with locked level_id
Then: 
  - Return 403 error
  - Message: "Level is locked"
```

### Test Case 3: Submit Quiz - All Correct
```
Given: Quiz in progress, all answers correct
When: POST /quiz/submit with 100% correct answers
Then:
  - percent_correct = 100%
  - is_passed = true
  - XP earned = base_xp + bonus
  - Badges checked and awarded
  - Next level unlocked
```

### Test Case 4: Submit Quiz - Failed
```
Given: Quiz in progress, < 70% correct
When: POST /quiz/submit with 60% correct answers
Then:
  - percent_correct = 60%
  - is_passed = false
  - xp_earned = 0
  - No badges awarded
  - Status = 'in_progress' (not completed)
```

### Test Case 5: Double Submission
```
Given: Quiz already submitted
When: POST /quiz/submit again with same attempt_id
Then:
  - Return 400 error
  - Message: "Quiz attempt already submitted"
```

---

## 📝 NOTES PENTING UNTUK DEVELOPER BACKEND

### 1. **UUID Generation**
```javascript
const { v4: uuidv4 } = require('uuid');

function generateUUID() {
    return uuidv4();
}
```

### 2. **Transaction Management**
Selalu gunakan transaction untuk operasi submit quiz karena melibatkan multiple table updates:
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
    // ... operations ...
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}
```

### 3. **Timestamp Format**
Gunakan ISO 8601 format untuk konsistensi:
```javascript
const timestamp = new Date().toISOString();
// Output: "2024-11-28T10:00:00.000Z"
```

### 4. **Error Handling**
Standarisasi error response:
```javascript
function errorResponse(res, statusCode, message) {
    return res.status(statusCode).json({
        status: 'error',
        message: message
    });
}
```

### 5. **Pagination (Future)**
Jika diperlukan pagination untuk history attempts:
```javascript
// GET /quiz/attempts?page=1&limit=10
const offset = (page - 1) * limit;
const attempts = await db.query(`
    SELECT * FROM quiz_attempt
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
`, [userId, limit, offset]);
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database tables created dengan indexes yang tepat
- [ ] Seed data untuk categories, levels, questions
- [ ] JWT authentication middleware configured
- [ ] CORS configured untuk frontend domain
- [ ] Rate limiting implemented
- [ ] Error logging setup (Sentry, CloudWatch, etc.)
- [ ] Environment variables configured (.env)
- [ ] API documentation published (Swagger/Postman)
- [ ] Load testing performed
- [ ] Backup strategy implemented

---

## 📞 CONTACT & SUPPORT

Jika ada pertanyaan atau klarifikasi tentang dokumentasi ini:
- **Developer Frontend:** [Your Name]
- **Project:** SAKO - Sumatera Barat Knowledge App
- **Date:** 28 November 2024

---

**END OF DOCUMENTATION**

**Catatan Akhir:** Dokumentasi ini mencakup 100% flow data modul kuis dari frontend ke backend. Semua request/response format, business logic, security considerations, dan edge cases sudah didokumentasikan dengan detail. Backend developer dapat langsung implement berdasarkan spec ini.
