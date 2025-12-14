# Rincian Lengkap Modul Map, Profile, dan Autentikasi

Dokumen ini berisi rincian teknis mendalam mengenai implementasi modul Map, Profile, dan Autentikasi pada sistem Sako, mencakup endpoint, logika backend, struktur database, serta integrasi frontend.

---

## 1. Modul Map (Prioritas)

Modul Map adalah fitur inti yang memungkinkan pengguna menjelajahi lokasi wisata, melihat detail, memindai QR code untuk verifikasi kunjungan, dan memberikan ulasan.

### A. Backend (Node.js/Express)

#### 1. Controller
Lokasi: `backend/hackathon-backend/src/controllers/modul-map/`

*   **`scanMapController.js`**:
    *   **Fungsi**: Menangani logika pemindaian QR Code.
    *   **Logika Utama**:
        *   Menerima input `qr_code_value` dari body request.
        *   Memvalidasi user login (harus ada `req.user.users_id`).
        *   Memvalidasi keberadaan kode di tabel `qr_code` via `scanMapModel.validateQrCode`.
        *   Mengecek apakah user sudah pernah berkunjung (`user_visit`).
        *   Jika valid dan belum berkunjung, mencatat kunjungan baru di `user_visit`.
        *   Mengirim notifikasi FCM via `mapNotifikasiController`.
    *   **Keterkaitan**: Berhubungan dengan model `scanMapModel` dan notifikasi FCM.
*   **`detailMapController.js`**:
    *   **Fungsi**: Mengambil data detail tempat wisata dan list tempat wisata.
    *   **Logika Utama**:
        *   `getPlacesWithVisitStatus`: Mengambil semua tempat wisata dan menambahkan flag `is_visited` (boolean) untuk user yang sedang login.
        *   `getPlaceDetail`: Mengambil detail lengkap satu tempat wisata berdasarkan ID, termasuk rata-rata rating dan daftar ulasan.
*   **`reviewMapController.js`**:
    *   **Fungsi**: Menangani CRUD ulasan (review) pengguna terhadap tempat wisata.
    *   **Logika Utama**: Validasi input rating/komentar, simpan ke tabel `review`, dan update rata-rata rating di `tourist_place`.

#### 2. Routes
Lokasi: `backend/hackathon-backend/src/routes/mapRoutes.js`

*   **Endpoint Utama**:
    *   `POST /api/map/scan/qr`: Endpoint untuk memproses hasil scan QR. (Auth Required)
    *   `GET /api/map/places`: Mengambil daftar semua tempat wisata dengan status kunjungan user. (Auth Required)
    *   `GET /api/map/places/:id`: Mengambil detail satu tempat wisata. (Auth Required)
    *   `GET /api/map/visited`: Mengambil daftar tempat yang sudah dikunjungi user. (Auth Required)
    *   `POST /api/map/review`: Mengirim ulasan baru. (Auth Required)

#### 3. Models
Lokasi: `backend/hackathon-backend/src/models/modul-map/`

*   **`scanMapModel.js`**: Query ke tabel `qr_code` dan `user_visit`.
*   **`detailMapModel.js`**: Query ke tabel `tourist_place` dan join dengan `user_visit`.

---

### B. Frontend (Android/Kotlin/Compose)

#### 1. Struktur Folder & File
*   **Screens (UI)**: `com.sako.ui.screen.map`
    *   `MapScreen.kt`: Tampilan peta utama (Google Maps/List view) yang menampilkan marker lokasi wisata. Mengobservasi `MapViewModel.touristPlaces`.
    *   `DetailMapScreen.kt`: Halaman detail yang muncul saat marker diklik. Menampilkan info, foto, dan tombol "Scan QR". Mengobservasi `MapViewModel.touristPlaceDetail`.
    *   `ScanMapScreen.kt`: Layar kamera untuk memindai QR Code.
*   **ViewModel**: `com.sako.viewmodel.MapViewModel`
    *   **StateFlow**:
        *   `touristPlaces`: List tempat wisata (`Resource<List<TouristPlaceItem>>`).
        *   `touristPlaceDetail`: Detail tempat (`Resource<TouristPlaceDetail>`).
        *   `visitedPlaces`: List tempat dikunjungi (`Resource<List<VisitedPlaceItem>>`).
        *   `scanResult`: Hasil scan QR (`Resource<ScanQRData>?`).
    *   **Fungsi**: `loadTouristPlaces()`, `loadTouristPlaceDetail()`, `scanQRCode()`.
*   **Repository**: `com.sako.data.repository.MapRepository`
    *   Menggunakan `ApiService` untuk memanggil endpoint backend.
    *   Fungsi: `getTouristPlaces`, `getTouristPlaceDetail`, `scanQRCode`.

#### 2. Alur Data Frontend
1.  **Load Map**: `MapScreen` -> `MapViewModel.loadTouristPlaces()` -> `MapRepository` -> API `GET /places`.
2.  **Scan QR**:
    *   User klik FAB di `DetailMapScreen`.
    *   Membuka `ScanMapScreen`.
    *   Hasil scan (string code) dikirim via `MapViewModel.scanQRCode(code)` -> API `POST /scan/qr`.
    *   Jika sukses, tampilkan dialog sukses & update status kunjungan.

---

## 2. Modul Profile

Modul ini menangani data diri pengguna, level, XP, dan pengaturan akun.

### A. Backend
*   **Controller**: `src/controllers/modul-profile/profileController.js`
    *   `getProfile`: Mengambil data user (dari `req.user.users_id`), total XP, level, dan badge yang dimiliki. Mengembalikan object `{ user, stats, badges }`.
    *   `updateProfile`: Mengubah nama dan email.
*   **Routes**: `src/routes/profileRoutes.js`
    *   `GET /api/auth/profile`: Mengambil profil lengkap.
    *   `PUT /api/auth/profile`: Update profil.
    *   `PUT /api/auth/profile/image`: Update foto profil (Multipart).

### B. Frontend
*   **Screen**: `com.sako.ui.screen.profile.ProfileScreen`
    *   Menampilkan avatar, progress bar level, dan grid badge.
    *   Mengobservasi `ProfileViewModel.uiState`.
*   **ViewModel**: `com.sako.viewmodel.ProfileViewModel`
    *   **State**: `ProfileUiState` (userData, stats, badges, levelInfo).
    *   **Fungsi**: `loadUserProfile()`, `updateProfile()`.
*   **Repository**: `com.sako.data.repository.ProfileRepository`
    *   `getProfile()`: Memanggil `GET /api/auth/profile`.
    *   `updateProfile()`: Memanggil `PUT /api/auth/profile`.

---

## 3. Modul Autentikasi

Menangani registrasi, login, dan manajemen token (JWT).

### A. Backend
*   **Controller**: `src/controllers/authController.js`
    *   `register`: Hash password (bcrypt), simpan user baru, generate JWT token & Database token.
    *   `login`: Validasi password, generate JWT token.
    *   `logout`: Menghapus token (jika menggunakan blacklist/db token).
*   **Middleware**: `src/middleware/auth.js`
    *   Memvalidasi header `Authorization: Bearer <token>` menggunakan `jsonwebtoken`.
*   **Routes**: `src/routes/authRoutes.js`
    *   `POST /api/auth/register`
    *   `POST /api/auth/login`
    *   `POST /api/auth/logout`
    *   `PUT /api/auth/fcm-token`: Update token FCM untuk notifikasi.

### B. Frontend
*   **Screens**: `com.sako.ui.screen.auth` (`LoginScreen.kt`, `RegisterScreen.kt`).
*   **ViewModel**: `com.sako.viewmodel.AuthViewModel`
    *   `registerState`, `loginState`.
    *   `register()`, `login()`.
*   **Repository**: `com.sako.data.repository.AuthRepository`
    *   `register()`: Kirim data registrasi, simpan session jika sukses.
    *   `login()`: Kirim kredensial, simpan session (`UserModel`) ke `UserPreference`.
    *   `saveSession()`: Menyimpan token dan data user ke DataStore/SharedPreferences.

---

## Folder Utils & Data (Frontend)

*   **`com.sako.utils`**:
    *   `Resource.kt`: Sealed class untuk state data (`Success`, `Error`, `Loading`).
    *   `Constants.kt`: URL Base API, Key konstan.
    *   `BackendConnectionMonitor.kt`: Memantau koneksi ke backend.
*   **`com.sako.data`**:
    *   `model/`: Data class (POJO) yang mencerminkan respon JSON (misal: `LevelInfo.kt`).
    *   `remote/request/`: Data class untuk body request (misal: `RegisterRequest`, `ScanQRRequest`).
    *   `remote/response/`: Data class untuk parsing respon JSON (misal: `AuthResponse`, `ProfileResponse`, `TouristPlaceListResponse`).
    *   `remote/retrofit/`: Konfigurasi Retrofit (`ApiService.kt`, `ApiConfig.kt`).

## Folder Utils (Backend)

*   **`src/utils/`**:
    *   `responseHelper.js`: Standarisasi format respon JSON (`successResponse`, `errorResponse`, `notFoundResponse`).
    *   `logsGenerator.js`: Mencatat aktivitas scan atau error ke file log dengan timestamp Indonesia.
    *   `customIdGenerator.js`: Membuat ID unik (UUID atau format custom).
    *   `indoTimeGenerator.js`: Konversi waktu ke WIB.
