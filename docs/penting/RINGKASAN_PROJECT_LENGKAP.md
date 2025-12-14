# 📋 RINGKASAN PROJECT LENGKAP - SAKO CULTURAL APP

**Tanggal Update**: 14 Desember 2025  
**Status**: Development - Fase Perbaikan UI/UX & Bug Fixes

---

## 🎯 OVERVIEW PROJECT

**SAKO** adalah aplikasi mobile Android berbasis Kotlin & Jetpack Compose untuk mempromosikan wisata budaya dengan fitur:
- 🗺️ **Modul Map**: Scan QR di tempat wisata, review & rating, like review
- 📹 **Modul Video**: Streaming video edukatif budaya, favorite, collections
- 📝 **Modul Kuis**: Quiz interaktif dengan level & kategori, point system
- 👤 **Modul Profile**: User profile, badge, visited places, change password
- 🔔 **Notifikasi**: FCM untuk map events (review, visit)

---

## 🏗️ ARSITEKTUR SISTEM

### Backend (Node.js + Express)
```
backend/hackathon-backend/
├── server.js                      # Entry point
├── .env                           # Config (DB, JWT, Firebase)
├── sako.sql                       # Database schema
├── src/
│   ├── app.js                     # Express app configuration
│   ├── config/
│   │   ├── database.js           # MySQL connection pool
│   │   └── supabase.js           # Supabase storage config
│   ├── controllers/
│   │   ├── authController.js     # Login, register, logout
│   │   ├── profileController.js  # Get profile, update image, preferences
│   │   ├── changeProfileController.js  # Edit profile, change password (BARU)
│   │   ├── quizController.js     # Start quiz, submit answer
│   │   ├── videoController.js    # Video CRUD, favorite
│   │   ├── categoryController.js # Category & levels
│   │   ├── badgeController.js    # Badge system
│   │   ├── firebase/
│   │   │   └── notifikasi/
│   │   │       └── modul-map/
│   │   │           └── mapNotifikasiController.js  # FCM notifications
│   │   └── modul-map/
│   │       ├── mapController.js           # Get places, detail
│   │       ├── reviewMapController.js     # CRUD review, toggle like
│   │       └── scanMapController.js       # QR scan, check-in (FIXED)
│   ├── models/
│   │   ├── authModel.js
│   │   ├── profileModel.js               # Get profile, stats
│   │   ├── changeProfileModel.js         # Update profile, password (BARU)
│   │   ├── quizModel.js
│   │   ├── videoModel.js
│   │   ├── categoryModel.js
│   │   ├── badgeModel.js
│   │   └── modul-map/
│   │       ├── mapModel.js               # Tourist places queries
│   │       ├── reviewMapModel.js         # Review queries, like system
│   │       └── scanMapModel.js           # Scan validation, visit recording
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── profileRoutes.js     # /api/auth/profile, password (UPDATED)
│   │   ├── quizRoutes.js        # /api/quiz/*
│   │   ├── videoRoutes.js       # /api/videos/*
│   │   ├── videoCollectionRoutes.js  # /api/video-collections/*
│   │   ├── categoryroutes.js    # /api/categories/*
│   │   ├── badgeRoutes.js       # /api/badge/*
│   │   └── mapRoutes.js         # /api/map/*
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── token.js             # Database token check
│   │   ├── upload.js            # Multer file upload
│   │   └── errorHandler.js      # Global error handler
│   └── utils/
│       ├── customIdGenerator.js      # Generate custom IDs
│       ├── indoTimeGenerator.js      # Indonesian time format
│       ├── logsGenerator.js          # Logging utility
│       ├── responseHelper.js         # Standard API response
│       ├── urlConfig.js              # Base URL config
│       ├── endpointAnalyzer.js       # Analyze available endpoints
│       └── geoHelper.js              # Geolocation calculations (BARU)
└── docs/
    ├── penting/
    │   ├── rincian-modul-autentikasi-profile-map-terbaru.md
    │   ├── rincian-upgrade-fitur-scan.md
    │   └── RINGKASAN_PROJECT_LENGKAP.md  # File ini
    ├── COMPLETE_AUTH_MAP_DOCUMENTATION.md
    ├── FIREBASE_TROUBLESHOOTING.md
    ├── MAP_MODULE_UPDATES.md
    └── QUIZ_MODULE_DATA_FLOW_DOCUMENTATION.md
```

### Frontend (Android Kotlin + Jetpack Compose)
```
frontend/hackathon-frontend/app/src/main/java/com/sako/
├── MainActivity.kt                # Entry point
├── SakoApplication.kt            # Application class, Firebase init
├── SakoApp.kt                    # Main navigation & theme setup
├── data/
│   ├── local/
│   │   └── UserPreference.kt     # DataStore for session
│   ├── remote/
│   │   ├── response/
│   │   │   ├── AuthResponse.kt
│   │   │   ├── ProfileResponse.kt
│   │   │   ├── QuizResponse.kt
│   │   │   ├── VideoResponse.kt
│   │   │   ├── CategoryResponse.kt
│   │   │   ├── BadgeResponse.kt
│   │   │   └── MapResponse.kt    # UPDATED: userId, touristPlaceId nullable
│   │   ├── retrofit/
│   │   │   ├── ApiConfig.kt      # Retrofit setup
│   │   │   └── ApiService.kt     # API endpoints
│   │   └── interceptor/
│   │       └── AuthInterceptor.kt  # Add auth headers
│   └── repository/
│       ├── AuthRepository.kt
│       ├── ProfileRepository.kt
│       ├── QuizRepository.kt
│       ├── VideoRepository.kt
│       ├── CategoryRepository.kt
│       ├── BadgeRepository.kt
│       └── MapRepository.kt      # UPDATED: toggleReviewLike, deleteReview
├── ui/
│   ├── theme/
│   │   ├── Color.kt              # Maroon, Yellow, Black theme
│   │   ├── Theme.kt              # Dark & Light mode
│   │   ├── Shape.kt
│   │   └── Type.kt
│   ├── components/
│   │   ├── BackgroundImage.kt    # Reusable background
│   │   ├── CommonComponents.kt   # Buttons, cards, dialogs
│   │   ├── ErrorComponents.kt    # Error states
│   │   ├── LoadingComponents.kt  # Loading states
│   │   ├── ProgressComponents.kt # Progress bars
│   │   ├── TextComponents.kt     # Typography
│   │   ├── VideoComponents.kt    # Video cards
│   │   └── MapComponents.kt      # Map-specific components
│   ├── screen/
│   │   ├── welcome/
│   │   │   ├── SplashScreen.kt
│   │   │   └── OnboardingScreen.kt
│   │   ├── auth/
│   │   │   ├── LoginScreen.kt
│   │   │   └── RegisterScreen.kt
│   │   ├── home/
│   │   │   └── HomeScreen.kt
│   │   ├── profile/
│   │   │   ├── ProfileScreen.kt         # UPDATED: Background, header
│   │   │   ├── SettingScreen.kt         # UPDATED: MaterialTheme, dark mode
│   │   │   ├── EditProfileScreen.kt     # BARU: Edit nama & email
│   │   │   ├── ChangePasswordScreen.kt  # BARU: Change password
│   │   │   ├── AboutSystem.kt
│   │   │   └── BadgeListScreen.kt
│   │   ├── kuis/
│   │   │   ├── QuizCategoryChooseScreen.kt
│   │   │   ├── QuizLevelChooseScreen.kt
│   │   │   ├── QuizAttemptScreen.kt
│   │   │   └── QuizResultScreen.kt
│   │   ├── video/
│   │   │   ├── VideoListScreen.kt
│   │   │   ├── VideoDetailScreen.kt
│   │   │   ├── VideoFavoriteScreen.kt
│   │   │   └── VideoCollectionDetailScreen.kt
│   │   └── map/
│   │       ├── TouristPlaceListScreen.kt
│   │       ├── DetailMapScreen.kt       # UPDATED: Review display
│   │       └── ScanMapScreen.kt         # FIXED: Error popups
│   └── navigation/
│       ├── NavGraph.kt           # Navigation setup
│       └── Screen.kt             # Route definitions
├── viewmodel/
│   ├── AuthViewModel.kt
│   ├── ProfileViewModel.kt
│   ├── QuizViewModel.kt
│   ├── VideoViewModel.kt
│   ├── CategoryViewModel.kt
│   ├── BadgeViewModel.kt
│   └── MapViewModel.kt           # UPDATED: toggleReviewLike, deleteReview
├── utils/
│   ├── Resource.kt               # Sealed class for API states
│   ├── ViewModelFactory.kt       # ViewModel factory
│   ├── FirebaseHelper.kt         # Firebase utilities
│   └── MapNotificationManager.kt # Map notification handling
└── res/
    ├── drawable/                 # Icons & images
    ├── values/
    │   ├── colors.xml
    │   ├── strings.xml
    │   └── themes.xml
    └── mipmap/                   # App icons
```

---

## 🗄️ DATABASE SCHEMA (MySQL/MariaDB)

### Tabel Utama:
1. **users** - User accounts (users_id PK, full_name, email, password_hash, profile_image_url)
2. **user_tokens** - Session tokens (user_token_id PK, users_id FK, database_token, fcm_token)
3. **tourist_place** - Tempat wisata (tourist_place_id PK, name, description, address, image_url, average_rating, is_scan_enabled)
4. **user_visit** - Kunjungan user (user_visit_id PK, users_id FK, tourist_place_id FK, visit_date, scan_coordinates)
5. **review** - Review tempat (review_id PK, user_id FK, tourist_place_id FK, rating, review_text, total_likes)
6. **review_like** - Like pada review (review_like_id PK, user_id FK, review_id FK)
7. **category** - Kategori quiz (categories_id PK, name, image_url)
8. **level** - Level quiz (levels_id PK, categories_id FK, name, min_score, max_score)
9. **quiz** - Soal quiz (quiz_id PK, levels_id FK, question, correct_answer, options)
10. **quiz_attempt** - Attempt quiz (quiz_attempt_id PK, users_id FK, categories_id FK, levels_id FK, score, completed_at)
11. **video** - Video edukatif (video_id PK, title, description, url, thumbnail_url)
12. **video_collection** - Koleksi video (video_collection_id PK, users_id FK, name, description)
13. **favorite_video** - Video favorit (favorite_video_id PK, users_id FK, video_id FK)
14. **badge** - Badge achievements (badge_id PK, name, description, image_url, criteria_type, criteria_value)
15. **user_badge** - User badges (user_badge_id PK, users_id FK, badge_id FK, earned_at)

### Triggers (Otomatis):
- **after_review_like_insert** - Increment total_likes saat like ditambah
- **after_review_like_delete** - Decrement total_likes saat like dihapus
- **update_average_rating** - Update average_rating tourist_place setelah review CRUD

---

## 🔧 PERUBAHAN TERBARU (14 Des 2025)

### ✅ Bug Fixes - Modul Map (SELESAI)
1. **QR Scan Success Popup**
   - ❌ Masalah: Success scan menampilkan "Gagal Scan QR"
   - ✅ Fix: Perbaiki `is_active` boolean conversion di `scanMapController.js` line 318
   - File: `backend/hackathon-backend/src/controllers/modul-map/scanMapController.js`

2. **Error Response Parsing**
   - ❌ Masalah: Error message tidak parsing dengan benar (already visited, too far)
   - ✅ Fix: Update `ErrorResponse` di `MapResponse.kt` untuk match backend structure
   - File: `frontend/.../data/remote/response/MapResponse.kt` lines 30-35

3. **Review Like/Unlike Crash**
   - ❌ Masalah: App force close saat like/unlike review
   - ✅ Root Cause: Backend tidak mengirim `user_id` & `tourist_place_id` di review list
   - ✅ Fix: Made `userId` & `touristPlaceId` nullable di `ReviewItem` data class
   - File: `frontend/.../data/remote/response/MapResponse.kt` line 115-116

4. **Review Like/Unlike Page Refresh**
   - ❌ Masalah: Page reload setiap kali like/unlike (UX buruk)
   - ✅ Fix: Update local state di `MapViewModel.toggleReviewLike()` tanpa reload API
   - File: `frontend/.../viewmodel/MapViewModel.kt` lines 195-245

5. **Review Delete**
   - ✅ Fix: Hapus duplicate `deleteReview` function, update local state
   - File: `frontend/.../viewmodel/MapViewModel.kt` lines 248-277

6. **Review Display Name**
   - ❌ Masalah: Review menampilkan "Anonim" bukan nama user
   - 🔄 Status: Backend mengirim `user_full_name` tapi frontend mapping ke `userName`
   - ⏳ TODO: Ubah `@SerializedName("user_name")` ke `@SerializedName("user_full_name")`

7. **Visited Places Count**
   - ❌ Masalah: ProfileScreen menampilkan 0 padahal user sudah visit 2 tempat
   - 🔄 Status: Backend query sudah benar, perlu validasi response di frontend
   - ⏳ TODO: Debug `ProfileViewModel` untuk memastikan data di-parse dengan benar

### ✅ UI/UX Improvements (SELESAI)
1. **SettingScreen Redesign**
   - ✅ Collapsing toolbar dengan efek scroll
   - ✅ Dark mode support dengan `MaterialTheme.colorScheme`
   - ✅ Hapus warna hijau, gunakan theme colors (Maroon, Yellow, Black)
   - ✅ Perbaiki kontras warna (text putih pada background gelap)
   - File: `frontend/.../ui/screen/profile/SettingScreen.kt` (COMPLETELY REWRITTEN)

2. **ProfileScreen Improvements**
   - ✅ Unified background (hapus red header yang terpisah)
   - ✅ Smaller, consistent header "Detail Profil"
   - ✅ Remove black line near bottom navigation
   - File: `frontend/.../ui/screen/profile/ProfileScreen.kt` (UPDATED)

### ✅ New Features (BARU)
1. **EditProfileScreen**
   - ✅ UI untuk edit nama & email
   - ✅ Validation & loading states
   - ✅ Menggunakan theme & existing components
   - File: `frontend/.../ui/screen/profile/EditProfileScreen.kt` (CREATED)

2. **ChangePasswordScreen**
   - ✅ UI untuk ganti password (old, new, confirm)
   - ✅ Password visibility toggle
   - ✅ Validation & loading states
   - File: `frontend/.../ui/screen/profile/ChangePasswordScreen.kt` (CREATED)

3. **Backend Refactoring**
   - ✅ Pindahkan edit profile & change password logic ke `changeProfileController.js` & `changeProfileModel.js`
   - ✅ Hapus redundansi dari `profileController.js` & `profileModel.js`
   - ✅ Update routes untuk gunakan controller baru
   - Files:
     - `backend/.../controllers/modul-profile/changeProfileController.js` (UPDATED)
     - `backend/.../models/modul-profile/changeProfileModel.js` (UPDATED)
     - `backend/.../routes/profileRoutes.js` (UPDATED)
     - `backend/.../controllers/modul-profile/profileController.js` (CLEANED)
     - `backend/.../models/modul-profile/profileModel.js` (CLEANED)

---

## 🚀 API ENDPOINTS

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (revoke access token)
- `POST /api/auth/logout-db` - Logout (delete database token)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile (nama, email) **→ changeProfileController**
- `PUT /api/auth/profile/image` - Upload profile image
- `PUT /api/auth/password` - Change password **→ changeProfileController**
- `GET /api/auth/notification-preferences` - Get notification settings
- `PUT /api/auth/notification-preferences` - Update notification settings
- `PUT /api/auth/fcm-token` - Update FCM token
- `GET /api/auth/validate-token` - Validate JWT token
- `GET /api/auth/auto-login` - Auto login with database token

### Map Module (`/api/map`)
- `GET /api/map/places` - List tempat wisata (pagination)
- `GET /api/map/places/:id` - Detail tempat wisata
- `GET /api/map/visited` - Tempat yang sudah dikunjungi user
- `GET /api/map/places/:id/reviews` - List review (user review + others)
- `POST /api/map/reviews/add` - Tambah review
- `PUT /api/map/reviews/:id/edit` - Edit review
- `DELETE /api/map/reviews/:id/delete` - Hapus review
- `POST /api/map/reviews/:id/toggle-like` - Like/unlike review
- `POST /api/map/scan/qr` - Scan QR code di tempat wisata

### Quiz Module (`/api/quiz`)
- `POST /api/quiz/start` - Start quiz (dapat soal)
- `POST /api/quiz/submit` - Submit jawaban & dapat hasil

### Video Module (`/api/videos`)
- `GET /api/videos` - List video (pagination)
- `GET /api/videos/:id` - Detail video
- `GET /api/videos/favorites` - Video favorit user
- `POST /api/videos/:id/favorite` - Add to favorite
- `DELETE /api/videos/:id/favorite` - Remove from favorite

### Video Collection (`/api/video-collections`)
- `GET /api/video-collections/collections` - List collections
- `GET /api/video-collections/collections/:id` - Detail collection
- `POST /api/video-collections/collections` - Create collection
- `PUT /api/video-collections/collections/:id` - Update collection
- `DELETE /api/video-collections/collections/:id` - Delete collection
- `POST /api/video-collections/collections/:id/videos/:videoId` - Add video to collection
- `DELETE /api/video-collections/collections/:id/videos/:videoId` - Remove video

### Category & Badge
- `GET /api/categories` - List kategori quiz
- `GET /api/categories/:id/levels` - List level per kategori
- `GET /api/badge` - List semua badge
- `GET /api/badge/user` - Badge yang sudah didapat user

---

## 🔑 ENVIRONMENT VARIABLES (.env)

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sako
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Firebase Admin SDK
FIREBASE_PROJECT_ID=sako-cultural-app
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@sako-cultural-app.iam.gserviceaccount.com

# Supabase Storage
SUPABASE_URL=https://lqdmiwpsmufcwziayoev.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Server
PORT=5000
NODE_ENV=development

# Tunnel (ngrok)
USE_TUNNEL=false
TUNNEL_URL=https://cheryll-unintelligent-fuzzily.ngrok-free.dev
```

---

## 🎨 THEME COLORS

### Light Mode
- **Primary**: `#8B1A1A` (Maroon)
- **Secondary**: `#FFC107` (Yellow)
- **Background**: `#FFFFFF`
- **Surface**: `#F5F5F5`
- **OnPrimary**: `#FFFFFF`
- **OnSecondary**: `#000000`

### Dark Mode
- **Primary**: `#C62828` (Lighter Maroon)
- **Secondary**: `#FFD54F` (Lighter Yellow)
- **Background**: `#121212`
- **Surface**: `#1E1E1E`
- **OnPrimary**: `#FFFFFF`
- **OnSecondary**: `#000000`

**Design System**: Menggunakan `MaterialTheme.colorScheme` di seluruh app untuk konsistensi.

---

## 🔄 WORKFLOW GIT

### Last Commits:
1. **Backend**: `a7c13d6` - "modul map scan qr complete + bug review done"
   - Fixed QR scan popups
   - Fixed review like/unlike crash
   - Added `geoHelper.js`
   - Updated scan controller & model

2. **Frontend**: `01c3ca2` - "modul map scan qr complete + bug review done"
   - Fixed ReviewItem nullable fields
   - Updated MapViewModel local state handling
   - Enhanced error dialogs

### Branches:
- `main` - Production-ready code
- Working directly on `main` (no feature branches currently)

---

## 🐛 KNOWN ISSUES & TODO

### Critical Bugs (P0)
1. ❌ **Review nama tampil "Anonim"**
   - Backend: `user_full_name` ✅
   - Frontend: mapping ke `user_name` ❌
   - Fix: Update `@SerializedName` di ReviewItem

2. ❌ **Visited places count = 0**
   - Backend query: ✅ Sudah benar
   - Frontend: Perlu debug ProfileViewModel
   - Investigate: Response parsing issue?

### High Priority (P1)
3. ⏳ **Global review detection**
   - Issue: Setelah review di tempat A, tempat B detect sudah pernah review
   - Need: Check review validation logic di backend

4. ⏳ **Edit review goes to edit mode immediately**
   - Issue: After create review, tap edit langsung edit mode
   - Need: Check state management di DetailMapScreen

### Medium Priority (P2)
5. ⏳ **Delete review needs 2 taps**
   - Issue: Perlu tap delete 2x baru terhapus
   - Status: Local state update implemented, needs testing

6. ✅ **Connect EditProfileScreen & ChangePasswordScreen** (SELESAI - 14 Des 2025)
   - Backend: ✅ API ready (changeProfileController.js)
   - Frontend: ✅ UI ready + Integrated dengan ProfileViewModel
   - Integration: ✅ COMPLETE
   - Response Format: ✅ Fixed to match frontend expectations
   - Files Updated:
     - `EditProfileScreen.kt` - Integrated dengan ProfileViewModel
     - `ChangePasswordScreen.kt` - Integrated dengan ProfileViewModel  
     - `changeProfileController.js` - Response format diperbaiki
   - Flow: EditProfile/ChangePassword → ProfileViewModel → ProfileRepository → API → changeProfileController
   - Features:
     - Edit profile (nama & email) dengan validation
     - Change password dengan old/new/confirm password
     - Success/error handling dengan dialog & snackbar
     - Auto navigate back setelah sukses
     - Session update otomatis setelah edit profile

### Low Priority (P3)
7. ⏳ **Optimize image loading**
   - Use Coil library untuk async image loading
   - Add placeholder & error images

8. ⏳ **Add pull-to-refresh**
   - Implement SwipeRefresh di list screens

---

## 📦 DEPENDENCIES

### Backend (package.json)
```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0",
  "sequelize": "^6.32.1",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^17.2.3",
  "firebase-admin": "^11.10.1",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5",
  "nodemon": "^3.0.1"
}
```

### Frontend (build.gradle.kts)
```kotlin
// Jetpack Compose
implementation("androidx.compose.ui:ui:1.5.4")
implementation("androidx.compose.material3:material3:1.1.2")
implementation("androidx.navigation:navigation-compose:2.7.5")

// Retrofit + Gson
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")

// Firebase
implementation(platform("com.google.firebase:firebase-bom:32.5.0"))
implementation("com.google.firebase:firebase-messaging-ktx")
implementation("com.google.firebase:firebase-analytics-ktx")

// CameraX (QR Scan)
implementation("androidx.camera:camera-camera2:1.3.0")
implementation("androidx.camera:camera-lifecycle:1.3.0")
implementation("androidx.camera:camera-view:1.3.0")
implementation("com.google.mlkit:barcode-scanning:17.2.0")

// DataStore
implementation("androidx.datastore:datastore-preferences:1.0.0")

// Coil (Image Loading)
implementation("io.coil-kt:coil-compose:2.4.0")
```

---

## 🧪 TESTING

### Manual Testing Checklist:
- [ ] Login/Register flow
- [ ] Profile display dengan stats benar
- [ ] Edit profile (nama, email)
- [ ] Change password
- [ ] QR scan success/error popups
- [ ] Review CRUD operations
- [ ] Like/unlike review (no crash, no refresh)
- [ ] Delete review (1 tap)
- [ ] Quiz flow (start, submit, result)
- [ ] Video favorite/unfavorite
- [ ] Video collection CRUD
- [ ] Dark mode consistency
- [ ] FCM notifications

### Test Users:
```
Email: ridhoo01@example.com
Password: ridho123
User ID: U403
```

---

## 🚀 DEPLOYMENT

### Backend (Development)
1. Start MySQL/MariaDB
2. Import `sako.sql`
3. Configure `.env`
4. Run: `npm install && npm run dev`
5. Start ngrok: `ngrok http 5000`
6. Update frontend `BASE_URL` ke ngrok URL

### Frontend (Development)
1. Update `BASE_URL` di `ApiConfig.kt`
2. Sync Gradle
3. Build: `./gradlew assembleDebug`
4. Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`

### Production (TODO)
- Backend: Deploy ke VPS/Cloud (Railway, Render, AWS)
- Database: MySQL managed service
- Frontend: Publish ke Google Play Store
- Assets: Migrate ke CDN (Cloudinary, AWS S3)

---

## 👥 TEAM & CONTACT

**Developer**: Ridho Dwi Syahputra  
**Email**: ridhoo01@example.com  
**GitHub Backend**: https://github.com/Ridho-Dwi-Syahputra/hackathon-backend  
**GitHub Frontend**: https://github.com/Ridho-Dwi-Syahputra/hackathon-frontend

---

## 📝 NOTES FOR NEXT AI ASSISTANT

### Context Penting:
1. **Code sudah menggunakan MaterialTheme** - Jangan hardcode colors!
2. **Backend sudah punya fungsi** - Cek model/controller dulu sebelum buat baru
3. **ReviewItem.userId nullable** - Backend tidak kirim field ini di list
4. **Visited places API working** - Issue di frontend parsing
5. **Edit Profile & Change Password** - UI done, need integration

### Current Focus:
- Fix review nama display (SerializedName issue)
- Fix visited places count display
- Integrate EditProfileScreen & ChangePasswordScreen with backend
- Test all bug fixes di real device

### Next Sprint Goals:
- Complete profile module integration
- Fix remaining review bugs (global detection, edit mode)
- Optimize performance (image loading, caching)
- Add analytics & crash reporting

---

**Last Updated**: 14 Desember 2025, 18:30 WIB  
**Next Review**: Setelah integration EditProfile & ChangePassword selesai

---

## 🔍 QUICK REFERENCE

### Useful Commands:
```bash
# Backend
cd "d:\Local Disk D\sako 2\backend\hackathon-backend"
npm run dev

# Frontend
cd "d:\Local Disk D\sako 2\frontend\hackathon-frontend"
.\gradlew.bat assembleDebug

# Ngrok
d:\"Local Disk D"\ngrok.exe http 5000

# Git
git add .
git commit -m "message"
git push origin main
```

### Critical Files to Check:
- `backend/src/controllers/modul-map/reviewMapController.js` - Review logic
- `backend/src/models/modul-map/reviewMapModel.js` - Review queries
- `frontend/.../data/remote/response/MapResponse.kt` - Data models
- `frontend/.../viewmodel/MapViewModel.kt` - Business logic
- `frontend/.../ui/theme/Color.kt` - Theme colors
- `frontend/.../ui/theme/Theme.kt` - Dark/Light mode

### When App Crashes:
1. Check Logcat for stack trace
2. Look for NullPointerException (common issue)
3. Verify API response matches data class
4. Check nullable fields in models
5. Validate `MaterialTheme.colorScheme` usage

### When API Returns Error:
1. Check backend console logs
2. Verify JWT token not expired
3. Check database connection
4. Validate request body format
5. Check middleware auth logic

---

**SELAMAT MELANJUTKAN! 🚀**

Dokumentasi ini comprehensive untuk context switching ke AI baru atau developer baru.
