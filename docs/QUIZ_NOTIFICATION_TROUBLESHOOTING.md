# 🔍 TROUBLESHOOTING GUIDE - Quiz Notification Tidak Muncul

## 🐛 MASALAH YANG DIPERBAIKI

### ✅ Fix #1: Notification Channels Tidak Lengkap
**Problem:** Backend mengirim ke channel `sako_quiz_success` dan `sako_quiz_general`, tapi frontend hanya punya channel `sako_notifications`

**Solution:** Ditambahkan 2 notification channels baru di `SakoFirebaseMessagingService.kt`:
- `sako_quiz_success` (HIGH importance) - untuk perfect score & passed
- `sako_quiz_general` (DEFAULT importance) - untuk failed quiz

### ✅ Fix #2: Notification Priority Rendah
**Problem:** Quiz notifications menggunakan PRIORITY_DEFAULT, kurang menonjol

**Solution:** 
- Quiz notifications sekarang menggunakan `PRIORITY_HIGH`
- Channel success menggunakan `IMPORTANCE_HIGH`
- Ditambah `BigTextStyle` untuk body yang panjang

### ✅ Fix #3: Kurang Logging untuk Debug
**Problem:** Sulit mengetahui di mana notifikasi gagal

**Solution:** Ditambahkan comprehensive logging:
- Backend: Detail setiap step pengiriman notifikasi
- Frontend: Log channel yang digunakan
- Error stack trace untuk debugging

---

## 📋 CHECKLIST DEBUGGING

Ikuti checklist ini untuk menemukan masalah notifikasi:

### 1️⃣ Cek Backend Logs

```bash
# Jalankan backend dan perhatikan console
cd backend
npm start

# Saat submit quiz, perhatikan output:
```

**Expected Output:**
```
🎯 ========== SENDING QUIZ NOTIFICATION ==========
📝 User ID: xxx
📝 Attempt ID: yyy
📊 Quiz Result: {...}
👤 User: John Doe
📚 Level: Level Mudah (Kategori A)
🔑 FCM Token: eXaMpLeToKeN123...
🎯 Notification Type: quiz_passed
📊 Score: 85%, XP: 150, Passed: true
🔔 Notification enabled: true
📤 Mengirim notifikasi kuis: ✅ Selamat, Kamu Lulus!
📧 FCM Data: {...}
⚙️ Options: {...}
✅ Notifikasi kuis berhasil dikirim
🆔 Message ID: projects/sako-cultural-app/messages/xxx
========== NOTIFICATION SENT SUCCESSFULLY ==========
```

**Jika ada error:**
- ❌ "User tidak ditemukan" → User ID salah
- ❌ "Quiz attempt tidak ditemukan" → Attempt ID salah
- ❌ "FCM token tidak ditemukan" → User belum login/register FCM
- ❌ "Notifikasi dinonaktifkan" → Cek user preferences

### 2️⃣ Cek FCM Token di Database

```sql
-- Cek apakah user punya FCM token
SELECT users_id, full_name, fcm_token, notification_preferences 
FROM users 
WHERE users_id = 'YOUR_USER_ID';
```

**Expected:**
- `fcm_token` harus ada (tidak NULL)
- `fcm_token` format: string panjang ~150+ karakter

**Jika NULL:**
1. Pastikan app Android sudah login
2. Cek Firebase initialization di app
3. Cek `FirebaseHelper.kt` apakah token disimpan ke backend

### 3️⃣ Cek Notification Preferences

```sql
-- Cek preferences user
SELECT notification_preferences 
FROM users 
WHERE users_id = 'YOUR_USER_ID';
```

**Expected:**
```json
{
  "quiz_notifications": {
    "quiz_completed": true,
    "quiz_passed": true,
    "quiz_failed": true,
    "quiz_perfect_score": true
  }
}
```

**Jika preferences menonaktifkan:**
- Update di SettingScreen app
- Atau update manual di database

### 4️⃣ Cek Android Logcat

```bash
# Filter untuk quiz notifications
adb logcat | grep "QUIZ"

# Filter untuk FCM
adb logcat | grep "FCM"

# Filter untuk notification service
adb logcat | grep "SAKO_FCM_SERVICE"
```

**Expected Output:**
```
SAKO_FCM_SERVICE: 📨 FCM Message received from: gcm.googleapis.com
SAKO_FCM_SERVICE: 📊 Message data: {module=quiz, type=quiz_passed, ...}
QUIZ_NOTIFICATION_HANDLER: 🎯 Processing quiz notification: type=quiz_passed
QUIZ_NOTIFICATION_MANAGER: ✅ Subscribed to quiz notifications
SAKO_FCM_SERVICE: 🔔 Notification shown on channel sako_quiz_success: ...
```

**Jika tidak ada output:**
- App tidak menerima FCM message
- Firebase config salah
- Internet connection issue

### 5️⃣ Cek Notification Permission (Android)

**Android 13+ (API 33+):**
```kotlin
// Cek permission
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) 
        != PackageManager.PERMISSION_GRANTED) {
        // Request permission
        requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 1)
    }
}
```

**Manual Check:**
- Settings → Apps → SAKO → Notifications → Ensure enabled
- Check individual channels are enabled

### 6️⃣ Cek Notification Channels

```bash
# Via adb
adb shell dumpsys notification_listener | grep -A 5 "sako"
```

**Expected Channels:**
- `sako_notifications` (DEFAULT)
- `sako_quiz_success` (HIGH)
- `sako_quiz_general` (DEFAULT)

---

## 🔧 COMMON FIXES

### Fix #1: FCM Token NULL
**Problem:** User tidak punya FCM token

**Solution:**
```kotlin
// Di MainActivity onCreate atau onResume
FirebaseHelper.getCurrentToken(this) { token ->
    if (token != null) {
        // Save to backend
        viewModel.updateFCMToken(token)
    }
}
```

### Fix #2: Firebase Not Initialized
**Problem:** Firebase belum diinisialisasi

**Solution:**
```kotlin
// Di Application class atau MainActivity
FirebaseApp.initializeApp(this)
```

### Fix #3: Notification Permission Denied
**Problem:** Android 13+ permission tidak diberikan

**Solution:**
```kotlin
// Request permission
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    requestPermissions(
        arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 
        REQUEST_CODE_NOTIFICATION
    )
}
```

### Fix #4: Channel Tidak Ada
**Problem:** Notification channel belum dibuat

**Solution:** Channels sudah otomatis dibuat di `onCreate()` service, tapi bisa dipaksa:
```kotlin
// Rebuild & reinstall app
./gradlew clean assembleDebug
adb uninstall com.sako
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Fix #5: Backend Error
**Problem:** Error di backend saat kirim notifikasi

**Solution:** Cek logs dan perbaiki:
```bash
# Cek error logs
cat backend/src/logs/kuis/errors.log

# Restart server
npm start
```

---

## 🧪 TESTING STEP BY STEP

### Test 1: Simple Test (Backend)
```bash
# 1. Start server dengan logging
cd backend
npm start

# 2. Submit quiz via Postman
POST http://localhost:5000/api/quiz/submit

# 3. Check console output
# Harus ada: "========== SENDING QUIZ NOTIFICATION =========="
# Harus ada: "✅ Notifikasi kuis berhasil dikirim"
# Harus ada: "🆔 Message ID: ..."
```

### Test 2: Full E2E Test
```bash
# 1. Backend
cd backend && npm start

# 2. Frontend - rebuild
cd frontend
./gradlew clean assembleDebug

# 3. Uninstall old app
adb uninstall com.sako

# 4. Install new app
adb install app/build/outputs/apk/debug/app-debug.apk

# 5. Open logcat
adb logcat -c && adb logcat | grep -E "(QUIZ|FCM|SAKO)"

# 6. Buka app, login, submit quiz

# 7. Notification should appear!
```

### Test 3: Check Notification Manually
```bash
# Send test notification via Firebase Console
# 1. Go to Firebase Console
# 2. Cloud Messaging → Send test message
# 3. Add FCM token from database
# 4. Send

# Should receive notification
```

---

## 📊 MONITORING & LOGS

### Backend Logs Location
```
backend/src/logs/kuis/
├── completions.log  # All quiz completions
├── achievements.log # Perfect scores
├── errors.log       # Errors
└── preferences.log  # Preference changes
```

### Real-time Monitoring
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Logs
tail -f backend/src/logs/kuis/completions.log

# Terminal 3 - Android
adb logcat | grep "QUIZ"
```

---

## ⚡ QUICK FIX COMMANDS

```bash
# 1. Reset notification channels (uninstall/reinstall)
adb uninstall com.sako && adb install app/build/outputs/apk/debug/app-debug.apk

# 2. Clear app data
adb shell pm clear com.sako

# 3. Force stop app
adb shell am force-stop com.sako

# 4. Restart backend
cd backend && npm start

# 5. Check FCM token in database
mysql -u root sako -e "SELECT users_id, LEFT(fcm_token, 50) as token FROM users LIMIT 5;"
```

---

## 📞 STILL NOT WORKING?

### Checklist Final:
- [ ] Backend running tanpa error
- [ ] FCM token ada di database (tidak NULL)
- [ ] User preferences allow notifications
- [ ] Android app permissions granted
- [ ] Notification channels created
- [ ] Firebase config correct (.env + google-services.json)
- [ ] Internet connection active
- [ ] App in foreground or background (test both)

### Debug Output Harus Ada:
```
Backend:
✅ ========== SENDING QUIZ NOTIFICATION ==========
✅ 🔑 FCM Token: eXaMpLe...
✅ 🔔 Notification enabled: true
✅ ✅ Notifikasi kuis berhasil dikirim
✅ 🆔 Message ID: projects/...

Android:
✅ 📨 FCM Message received
✅ 🎯 Processing quiz notification
✅ 🔔 Notification shown on channel sako_quiz_success
```

### Jika Masih Gagal:
1. Cek Firebase Console → Cloud Messaging → Logs
2. Cek Firebase project settings
3. Cek google-services.json sudah latest
4. Cek .env file backend (FIREBASE_*)
5. Try with different device/emulator

---

**Last Updated:** 15 Desember 2025  
**Status:** All fixes applied ✅
