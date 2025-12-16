# 🎯 IMPLEMENTASI NOTIFIKASI KUIS - MODUL QUIZ

**Tanggal:** 15 Desember 2025  
**Developer:** Modul Kuis  
**Status:** ✅ IMPLEMENTASI LENGKAP

---

## 📋 DAFTAR ISI

1. [Ringkasan Implementasi](#ringkasan-implementasi)
2. [Alur Modul Kuis](#alur-modul-kuis)
3. [Tipe Notifikasi](#tipe-notifikasi)
4. [File-File yang Dibuat](#file-file-yang-dibuat)
5. [Integrasi Backend](#integrasi-backend)
6. [Integrasi Frontend](#integrasi-frontend)
7. [Cara Kerja Notifikasi](#cara-kerja-notifikasi)
8. [Environment Variables](#environment-variables)
9. [Testing](#testing)

---

## 🎬 RINGKASAN IMPLEMENTASI

Sistem notifikasi kuis telah dikembangkan mengikuti pola yang sama dengan modul map wisata, dengan fitur:

- ✅ Notifikasi ketika kuis selesai
- ✅ 3 tipe notifikasi berbeda:
  - 🏆 **Perfect Score** (100% benar)
  - ✅ **Quiz Passed** (Lulus tapi tidak sempurna)
  - 😢 **Quiz Failed** (Belum lulus)
- ✅ Integrasi Firebase Cloud Messaging (FCM)
- ✅ Logging sistem untuk debugging
- ✅ Pengaturan preferensi notifikasi per user

---

## 📱 ALUR MODUL KUIS

### Frontend Flow:
```
Home Screen
    ↓
Quiz Category Choose Screen (Pilih Kategori)
    ↓
Quiz Level Choose Screen (Pilih Level)
    ↓
Quiz Attempt Screen (Kerjakan Kuis)
    ↓
Submit Quiz
    ↓
Quiz Result Screen + Notifikasi Firebase 🔔
```

### Backend Flow:
```
POST /api/quiz/start
    ↓
Buat quiz_attempt (status: in_progress)
    ↓
Return questions ke frontend
    ↓
POST /api/quiz/submit
    ↓
Hitung score & hasil
    ↓
Update quiz_attempt (status: submitted)
    ↓
Kirim notifikasi Firebase 🔔
    ↓
Return result ke frontend
```

---

## 🔔 TIPE NOTIFIKASI

### 1. Perfect Score (100%)
**Type:** `quiz_perfect_score`
```json
{
  "title": "🏆 PERFECT SCORE!",
  "body": "Luar biasa, [Nama]! Kamu mendapat nilai sempurna di kuis \"[Level]\"! Kamu mendapat [XP] XP! 🎉"
}
```

### 2. Quiz Passed (Lulus)
**Type:** `quiz_passed`
```json
{
  "title": "✅ Selamat, Kamu Lulus!",
  "body": "Hebat, [Nama]! Kamu berhasil menyelesaikan kuis \"[Level]\" dengan skor [Score]%. Kamu mendapat [XP] XP! 🎯"
}
```

### 3. Quiz Failed (Belum Lulus)
**Type:** `quiz_failed`
```json
{
  "title": "😢 Belum Berhasil",
  "body": "Tetap semangat, [Nama]! Kuis \"[Level]\" belum berhasil diselesaikan (skor [Score]%). Coba lagi, kamu pasti bisa! 💪"
}
```

---

## 📂 FILE-FILE YANG DIBUAT

### Backend

#### 1. `backend/src/controllers/firebase/notifikasi/modul-kuis/kuisNotifikasiController.js`
**Fungsi Utama:**
- `sendQuizCompletedNotification(userId, attemptId, quizResult)` - Kirim notifikasi kuis selesai
- `checkQuizNotificationEnabled(userId, notificationType)` - Cek preferensi user

**Logger:**
- `kuisLogger.quizCompleted()` - Log kuis selesai
- `kuisLogger.perfectScore()` - Log perfect score achievement
- `kuisLogger.preferences()` - Log perubahan preferensi
- `kuisLogger.error()` - Log error

**Data yang Dikirim:**
```javascript
{
  type: 'quiz_perfect_score' | 'quiz_passed' | 'quiz_failed',
  module: 'quiz',
  attempt_id: '...',
  level_name: '...',
  category_name: '...',
  user_name: '...',
  score_points: '...',
  percent_correct: '...',
  xp_earned: '...',
  is_passed: 'true' | 'false',
  correct_count: '...',
  wrong_count: '...',
  action: 'open_quiz_result',
  screen: 'QuizResultScreen',
  attempt_id_nav: '...'
}
```

### Frontend

#### 2. `frontend/app/src/main/java/com/sako/firebase/notifications/quiz/QuizNotificationHandler.kt`
**Fungsi Utama:**
- `processQuizNotification()` - Process notifikasi dari FCM
- `createNotificationContent()` - Buat title & body notifikasi
- `getNavigationData()` - Data untuk navigasi ke screen

**Handlers:**
- `handlePerfectScoreNotification()` - Handle perfect score
- `handleQuizPassedNotification()` - Handle lulus
- `handleQuizFailedNotification()` - Handle gagal
- `handleQuizCompletedNotification()` - Handle umum

#### 3. `frontend/app/src/main/java/com/sako/firebase/notifications/quiz/QuizNotificationManager.kt`
**Fungsi Utama:**
- `initializeQuizNotifications()` - Init saat app start/login
- `subscribeToQuizTopics()` - Subscribe FCM topics
- `updateNotificationPreferences()` - Update preferensi
- `shouldProcessNotification()` - Cek apakah notif harus diproses

**FCM Topics:**
- `quiz_notifications` - Topic umum
- `quiz_completed_notifications` - Topic quiz selesai
- `quiz_perfect_score_notifications` - Topic perfect score

#### 4. `frontend/app/src/main/java/com/sako/firebase/notifications/quiz/QuizNotificationPreferencesManager.kt`
**Fungsi Utama:**
- `areQuizNotificationsEnabled()` - Cek status global
- `setQuizNotificationsEnabled(enabled)` - Set status global
- `areCompletedNotificationsEnabled()` - Cek notif completed
- `arePerfectScoreNotificationsEnabled()` - Cek notif perfect score

**SharedPreferences Keys:**
- `quiz_notifications_enabled` - Global toggle
- `quiz_completed_enabled` - Toggle completed
- `quiz_perfect_score_enabled` - Toggle perfect score

---

## 🔧 INTEGRASI BACKEND

### File yang Dimodifikasi:

#### `backend/src/controllers/quizController.js`

**Import:**
```javascript
const { sendQuizCompletedNotification } = require('./firebase/notifikasi/modul-kuis/kuisNotifikasiController');
```

**Integrasi di submitQuiz (setelah commit):**
```javascript
// Kirim notifikasi secara async (tidak blocking)
sendQuizCompletedNotification(userId, attempt_id, quizResultData)
  .then(result => {
    if (result.success) {
      console.log(`✅ Notifikasi kuis berhasil dikirim untuk attempt ${attempt_id}`);
    } else {
      console.log(`⚠️ Notifikasi kuis gagal dikirim: ${result.error || 'Unknown error'}`);
    }
  })
  .catch(err => {
    console.error(`❌ Error saat mengirim notifikasi kuis: ${err.message}`);
  });
```

**Kapan Notifikasi Dikirim:**
- ✅ Setelah quiz_attempt berhasil di-update (status: submitted)
- ✅ Setelah user_level_progress di-update
- ✅ Setelah XP dikalkulasi dan badges dicek
- ✅ Sebelum response dikirim ke frontend
- ⚡ Async (tidak menghalangi response)

---

## 📱 INTEGRASI FRONTEND

### File yang Dimodifikasi:

#### `frontend/app/src/main/java/com/sako/firebase/SakoFirebaseMessagingService.kt`

**Import:**
```kotlin
import com.sako.firebase.notifications.quiz.QuizNotificationHandler
import com.sako.firebase.notifications.quiz.QuizNotificationManager
```

**Handler di onMessageReceived:**
```kotlin
when (module) {
    "map" -> { handleMapNotification(...) }
    "video" -> { handleVideoNotification(...) }
    "quiz" -> { handleQuizNotification(...) } // ← BARU
}
```

**Fungsi handleQuizNotification:**
```kotlin
private fun handleQuizNotification(
    data: Map<String, String>,
    notification: RemoteMessage.Notification?
) {
    // 1. Cek preferences
    val notificationManager = QuizNotificationManager.getInstance(this)
    if (!notificationManager.shouldProcessNotification(notificationType)) {
        return // User disable notifikasi
    }
    
    // 2. Process melalui handler
    val processed = QuizNotificationHandler.processQuizNotification(this, data)
    
    // 3. Buat title & body
    val (title, body) = QuizNotificationHandler.createNotificationContent(notificationType, data)
    
    // 4. Tambah navigation data
    val navigationData = QuizNotificationHandler.getNavigationData(notificationType, data)
    
    // 5. Show notification
    showNotification(title, body, enhancedData)
}
```

---

## ⚙️ CARA KERJA NOTIFIKASI

### Backend Side:

1. **User submit kuis** → `POST /api/quiz/submit`
2. **Backend hitung hasil** → score, XP, badges
3. **Backend tentukan tipe notifikasi:**
   - `percent_correct === 100` → `quiz_perfect_score`
   - `isPassed === true` → `quiz_passed`
   - `isPassed === false` → `quiz_failed`
4. **Backend cek preferensi user** dari tabel `users.notification_preferences`
5. **Backend kirim ke Firebase** menggunakan FCM Token
6. **Backend log aktivitas** ke folder `logs/kuis/`

### Frontend Side:

1. **FCM menerima notifikasi** → `SakoFirebaseMessagingService.onMessageReceived()`
2. **Routing berdasarkan module** → `module === "quiz"`
3. **Cek preferences lokal** → `QuizNotificationPreferencesManager`
4. **Process notification** → `QuizNotificationHandler`
5. **Show notification** → Android Notification Channel
6. **User tap notification** → Navigate ke `QuizResultScreen`

### Diagram Flow:

```
Backend                          Firebase                        Frontend
-------                          --------                        --------
Quiz Submit
    ↓
Calculate Result
    ↓
Determine Type
    ↓
Check Preferences
    ↓
Send to FCM  ────────────────→  FCM Server
                                     ↓
                                 Push to Device ──────────────→  Receive Message
                                                                      ↓
                                                                  Check Module
                                                                      ↓
                                                                  Route to Handler
                                                                      ↓
                                                                  Check Preferences
                                                                      ↓
                                                                  Process & Show
                                                                      ↓
                                                                  User Tap
                                                                      ↓
                                                                  Navigate to Result
```

---

## 🔐 ENVIRONMENT VARIABLES

File yang dibutuhkan sudah ada di `.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=sako-cultural-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sako-cultural-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_SENDER_ID=24983268260
```

**Tidak perlu setup tambahan!** ✅

---

## 🧪 TESTING

### 1. Test Backend (Manual)

```bash
# Start server
cd backend
npm start

# Submit quiz via Postman/curl
POST http://localhost:5000/api/quiz/submit
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
Body: {
  "attempt_id": "...",
  "answers": [...]
}

# Cek logs
cat backend/src/logs/kuis/completions.log
cat backend/src/logs/kuis/achievements.log
```

### 2. Test Frontend (Android)

```kotlin
// Di MainActivity atau test class
val quizNotificationManager = QuizNotificationManager.getInstance(this)

// Initialize
quizNotificationManager.initializeQuizNotifications()

// Cek preferences
val status = quizNotificationManager.getPreferencesStatus()
Log.d("TEST", "Quiz Notif Status: $status")

// Update preferences
quizNotificationManager.updateNotificationPreferences(true)
```

### 3. Test E2E (End-to-End)

**Langkah-langkah:**

1. ✅ Login ke app Android
2. ✅ Buka modul kuis
3. ✅ Pilih kategori
4. ✅ Pilih level
5. ✅ Kerjakan kuis
6. ✅ Submit jawaban
7. ✅ **Cek notifikasi muncul di notification bar**
8. ✅ Tap notifikasi → harus navigate ke QuizResultScreen

**Expected Results:**

| Scenario | Notification Title | Should Navigate To |
|----------|-------------------|-------------------|
| 100% benar | 🏆 PERFECT SCORE! | QuizResultScreen |
| Lulus (>= threshold) | ✅ Selamat, Kamu Lulus! | QuizResultScreen |
| Gagal (< threshold) | 😢 Belum Berhasil | QuizResultScreen |

### 4. Test Logging

```bash
# Cek log completions
tail -f backend/src/logs/kuis/completions.log

# Cek log achievements
tail -f backend/src/logs/kuis/achievements.log

# Cek log errors
tail -f backend/src/logs/kuis/errors.log
```

**Format Log:**
```
[2025-12-15 14:30:25 WIB] INFO: 🎯 Kuis John Doe untuk Level Mudah - LULUS (85%) - Notifikasi berhasil dikirim
{
  "user": "John Doe",
  "level": "Level Mudah",
  "score": 85,
  "is_passed": true,
  "notification_sent": true,
  "platform": "android_kotlin",
  "timestamp_indo": "15/12/2025 14:30:25 WIB"
}
```

---

## 📊 DATABASE STRUCTURE

### Tabel yang Digunakan:

#### `users`
```sql
- fcm_token VARCHAR(255) -- FCM Token untuk notifikasi
- notification_preferences JSON -- Preferensi notifikasi
```

**Contoh notification_preferences:**
```json
{
  "quiz_notifications": {
    "quiz_completed": true,
    "quiz_passed": true,
    "quiz_failed": true,
    "quiz_perfect_score": true
  },
  "map_notifications": {...},
  "video_notifications": {...}
}
```

#### `quiz_attempt`
```sql
- id VARCHAR(36) PRIMARY KEY
- user_id VARCHAR(36)
- level_id INT
- status ENUM('in_progress', 'submitted')
- score_points INT
- percent_correct DECIMAL(5,2)
- correct_count INT
- wrong_count INT
- unanswered_count INT
- finished_at DATETIME
```

#### `level`
```sql
- id INT PRIMARY KEY
- name VARCHAR(100)
- category_id INT
- pass_threshold DECIMAL(5,2)
- base_xp INT
```

---

## 🎯 FITUR TAMBAHAN

### Preferences Manager

User bisa mengatur notifikasi di Setting Screen:

```kotlin
// SettingScreen.kt
var quizNotificationsEnabled by remember { 
    mutableStateOf(notificationPreferences?.quizNotifications ?: true) 
}

// Toggle
Switch(
    checked = quizNotificationsEnabled,
    onCheckedChange = { enabled ->
        quizNotificationsEnabled = enabled
        // Update ke backend dan local
        viewModel.updateNotificationPreferences(...)
    }
)
```

### Logging System

Semua aktivitas notifikasi kuis dicatat di:
- `backend/src/logs/kuis/completions.log` - Semua kuis selesai
- `backend/src/logs/kuis/achievements.log` - Perfect scores
- `backend/src/logs/kuis/preferences.log` - Perubahan preferensi
- `backend/src/logs/kuis/errors.log` - Error handling

---

## ✅ CHECKLIST IMPLEMENTASI

### Backend
- [x] File controller notifikasi kuis
- [x] Integrasi ke quizController
- [x] Logging system
- [x] Check user preferences
- [x] Send notification via FCM

### Frontend
- [x] QuizNotificationHandler
- [x] QuizNotificationManager
- [x] QuizNotificationPreferencesManager
- [x] Integrasi ke SakoFirebaseMessagingService
- [x] Navigation handling

### Testing
- [ ] Test backend manual
- [ ] Test frontend manual
- [ ] Test E2E flow
- [ ] Test logging
- [ ] Test preferences

---

## 🚀 CARA DEPLOYMENT

### 1. Backend

```bash
cd backend

# Install dependencies (jika belum)
npm install

# Restart server
npm start
# atau
pm2 restart sako-backend
```

### 2. Frontend

```bash
cd frontend

# Build APK
./gradlew assembleDebug
# atau untuk release
./gradlew assembleRelease

# Install ke device
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 3. Firebase Console

**Tidak perlu setup tambahan!**

Firebase sudah dikonfigurasi di:
- Backend: `.env` file
- Frontend: `google-services.json`

---

## 📞 TROUBLESHOOTING

### Notifikasi tidak muncul?

1. **Cek FCM Token:**
   ```sql
   SELECT fcm_token FROM users WHERE users_id = 'USER_ID';
   ```

2. **Cek preferences:**
   ```sql
   SELECT notification_preferences FROM users WHERE users_id = 'USER_ID';
   ```

3. **Cek logs backend:**
   ```bash
   tail -f backend/src/logs/kuis/errors.log
   ```

4. **Cek Logcat Android:**
   ```bash
   adb logcat | grep "QUIZ_NOTIFICATION"
   ```

### Notifikasi terkirim tapi tidak tampil di Android?

1. **Cek Notification Permission:**
   ```kotlin
   // AndroidManifest.xml harus ada
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

2. **Cek Notification Channel:**
   ```kotlin
   val channel = NotificationChannel(
       "sako_quiz_success",
       "Quiz Success Notifications",
       NotificationManager.IMPORTANCE_HIGH
   )
   ```

3. **Cek App Notifications Settings:**
   - Buka Settings → Apps → SAKO → Notifications
   - Pastikan notifications enabled

---

## 📝 NOTES

### Perbedaan dengan Map Notification:

| Aspek | Map Notification | Quiz Notification |
|-------|-----------------|-------------------|
| **Trigger** | Review added, Place visited | Quiz completed |
| **Tipe** | 2 tipe | 3 tipe (perfect/passed/failed) |
| **Timing** | Saat event terjadi | Setelah submit quiz |
| **Data** | Place info, rating | Score, XP, attempt info |
| **Navigation** | PlaceDetailScreen | QuizResultScreen |

### Best Practices:

1. **Async Notification:** Notifikasi dikirim async agar tidak blocking response
2. **Error Handling:** Semua error di-log, tidak crash app
3. **Preferences:** User bisa disable per tipe notifikasi
4. **Logging:** Semua aktivitas dicatat untuk debugging
5. **Security:** FCM Token tidak di-expose di log

---

## 📚 REFERENSI

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Android Notifications Guide](https://developer.android.com/develop/ui/views/notifications)
- Map Notification Implementation (`mapNotifikasiController.js`)
- Quiz Controller (`quizController.js`)

---

**Dibuat oleh:** Modul Kuis Developer  
**Tanggal:** 15 Desember 2025  
**Versi:** 1.0.0  
**Status:** ✅ PRODUCTION READY
