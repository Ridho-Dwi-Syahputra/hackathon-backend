# 🚀 QUICK START - QUIZ NOTIFICATION TESTING

## ⚡ FAST TRACK TESTING (5 MENIT)

### 1️⃣ Backend Verification (1 menit)
```bash
cd backend
node test-quiz-notification.js
```
**Expected:** All ✅ green checkmarks

### 2️⃣ Start Server (30 detik)
```bash
npm start
```
**Expected:** Server running on port 5000

### 3️⃣ Test Quiz Submit via Postman (2 menit)

**Endpoint:**
```
POST http://localhost:5000/api/quiz/submit
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Body (example):**
```json
{
  "attempt_id": "your-attempt-id-from-start-quiz",
  "answers": [
    {
      "question_id": 1,
      "option_id": 5,
      "answered_at": "2025-12-15T08:30:00Z"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Selamat! Anda lulus quiz ini",
  "data": {
    "attempt_id": "...",
    "percent_correct": 100,
    "is_passed": true,
    "xp_earned": 200,
    ...
  }
}
```

### 4️⃣ Check Notification Logs (30 detik)
```bash
# Windows
type src\logs\kuis\completions.log

# Linux/Mac
cat src/logs/kuis/completions.log
```

**Expected:** Log entry with notification sent

### 5️⃣ Check Android Device (1 menit)
- Notification should appear in status bar
- Tap notification → Navigate to QuizResultScreen

---

## 🐛 COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| ❌ "Cannot find module" | Missing dependency | `npm install` |
| ❌ "FCM token null" | User not logged in | Login first in Android app |
| ❌ "Notification not sent" | User disabled it | Check `notification_preferences` |
| ❌ "Database error" | MySQL not running | Start MySQL service |
| ❌ No notification on Android | Permission not granted | Enable notifications in app settings |

---

## 📊 DEBUGGING COMMANDS

### Backend Logs
```bash
# All quiz completions
cat src/logs/kuis/completions.log

# Perfect scores only
cat src/logs/kuis/achievements.log

# Errors only
cat src/logs/kuis/errors.log

# Real-time monitoring
tail -f src/logs/kuis/completions.log
```

### Database Queries
```sql
-- Check user FCM token
SELECT users_id, full_name, fcm_token 
FROM users 
WHERE users_id = 'YOUR_USER_ID';

-- Check notification preferences
SELECT users_id, notification_preferences 
FROM users 
WHERE users_id = 'YOUR_USER_ID';

-- Check recent quiz attempts
SELECT * FROM quiz_attempt 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Android Logcat
```bash
# All quiz notifications
adb logcat | grep "QUIZ_NOTIFICATION"

# FCM messages
adb logcat | grep "FCM"

# Notification handler
adb logcat | grep "QuizNotificationHandler"

# Clear logs and start fresh
adb logcat -c && adb logcat | grep "QUIZ"
```

---

## ✅ SUCCESS INDICATORS

### Backend Success
```
✅ Firebase Admin SDK berhasil diinisialisasi
✅ MySQL Pool berhasil terhubung
✅ Notifikasi berhasil dikirim
🆔 Message ID: projects/sako-cultural-app/messages/...
```

### Frontend Success
```
🎯 Processing quiz notification: type=quiz_perfect_score
✅ Quiz notification shown: 🏆 PERFECT SCORE!
```

### User Success
- 📱 Notification appears in status bar
- 🔔 Sound/vibration occurs (if enabled)
- 👆 Tap notification → App opens to QuizResultScreen
- 🎉 Celebration animation (for perfect score)

---

## 🎯 TEST SCENARIOS CHECKLIST

### Scenario 1: Perfect Score
- [ ] Complete quiz with 100% correct
- [ ] Submit quiz
- [ ] Check backend logs for "PERFECT SCORE"
- [ ] Verify notification shows 🏆 icon
- [ ] Tap notification
- [ ] Verify QuizResultScreen shows

### Scenario 2: Passed Quiz
- [ ] Complete quiz with 75% correct
- [ ] Submit quiz
- [ ] Check backend logs for "LULUS"
- [ ] Verify notification shows ✅ icon
- [ ] Verify XP shown in notification

### Scenario 3: Failed Quiz
- [ ] Complete quiz with 40% correct
- [ ] Submit quiz
- [ ] Check backend logs for "BELUM LULUS"
- [ ] Verify notification shows 😢 icon
- [ ] Verify encouragement message

### Scenario 4: No FCM Token
- [ ] Delete FCM token from database
- [ ] Submit quiz
- [ ] Check logs for "FCM token tidak ditemukan"
- [ ] Verify no crash occurs

### Scenario 5: Notification Disabled
- [ ] Disable quiz notifications in settings
- [ ] Submit quiz
- [ ] Verify no notification appears
- [ ] Check logs for "dinonaktifkan oleh user"

---

## 🔍 VERIFICATION CHECKLIST

### Files Created
- [ ] `backend/src/controllers/firebase/notifikasi/modul-kuis/kuisNotifikasiController.js`
- [ ] `frontend/.../firebase/notifications/quiz/QuizNotificationHandler.kt`
- [ ] `frontend/.../firebase/notifications/quiz/QuizNotificationManager.kt`
- [ ] `frontend/.../firebase/notifications/quiz/QuizNotificationPreferencesManager.kt`

### Files Modified
- [ ] `backend/src/controllers/quizController.js` (import + integration)
- [ ] `frontend/.../firebase/SakoFirebaseMessagingService.kt` (routing added)

### Dependencies
- [ ] Firebase Admin SDK initialized
- [ ] Database pool connected
- [ ] Logs utility accessible
- [ ] All environment variables set

### Permissions (Android)
- [ ] `POST_NOTIFICATIONS` permission declared
- [ ] Notification channels created
- [ ] Firebase messaging service registered

---

## 🚨 EMERGENCY ROLLBACK

If something goes wrong and you need to rollback:

### Backend Rollback
```bash
# 1. Remove import from quizController.js
# Comment out line 5:
// const { sendQuizCompletedNotification } = require('./firebase/notifikasi/modul-kuis/kuisNotifikasiController');

# 2. Comment out notification sending (lines 383-396)
# Just comment the entire sendQuizCompletedNotification() call

# 3. Restart server
npm start
```

### Frontend Rollback
```kotlin
// 1. In SakoFirebaseMessagingService.kt
// Remove or comment out "quiz" case in when statement

// 2. Rebuild app
./gradlew assembleDebug
```

System will work without notifications, quiz results still saved!

---

## 📞 CONTACT & SUPPORT

**Developer:** Quiz Module Team  
**Documentation:** `/backend/docs/QUIZ_NOTIFICATION_*.md`  
**Test Script:** `/backend/test-quiz-notification.js`

**Need Help?**
1. Check logs first: `src/logs/kuis/`
2. Review debugging report
3. Run test script
4. Check environment variables

---

**Last Updated:** 15 Desember 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
