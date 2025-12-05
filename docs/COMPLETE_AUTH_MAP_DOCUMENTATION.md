# 📚 DOKUMENTASI MODUL AUTH & MAP - SAKO BACKEND

## 📱 **ARSITEKTUR FRONTEND-BACKEND INTEGRATION**

### **🔗 Frontend Structure (Android Kotlin)**
Berdasarkan struktur project Android yang terlihat:

```
app/src/main/java/com/sako/
├── data/
│   ├── pref/
│   │   ├── UserModel.kt         # Model data user untuk SharedPreferences
│   │   └── UserPreference.kt    # Pengelolaan preferensi user lokal
│   ├── remote/
│   │   ├── request/
│   │   │   ├── AuthRequest.kt   # Request model untuk autentikasi
│   │   │   └── MapRequest.kt    # Request model untuk map operations
│   │   └── response/
│   │       ├── AuthResponse.kt  # Response model dari auth endpoints
│   │       └── MapResponse.kt   # Response model dari map endpoints
│   ├── retrofit/
│   │   ├── ApiConfig.kt         # Konfigurasi Retrofit + DevTunnel URL
│   │   └── ApiService.kt        # Interface untuk semua API calls
│   └── repository/
│       └── SakoRepository.kt    # Repository pattern untuk data management
├── di/
│   └── Injection.kt             # Dependency injection setup
└── ui/                          # UI components menggunakan data layer
```

### **🌐 Backend Integration Points**
- **Base URL**: `https://dwc2w4q2-5000.asse.devtunnels.ms/api/`
- **Authentication**: JWT + Database Token (30 hari auto-login)
- **Response Format**: Consistent JSON dengan success/error pattern
- **Data Flow**: Android → Retrofit → NodeJS → MySQL → Response

### **📂 REPOSITORY SEPARATION STRATEGY**
Untuk menghindari redundansi dan error, repository dibagi menjadi 2 file terpisah:

```kotlin
// AuthRepository.kt - Khusus autentikasi
class AuthRepository private constructor(
    private val apiService: ApiService,
    private val userPreference: UserPreference
)

// MapRepository.kt - Khusus map operations
class MapRepository private constructor(
    private val apiService: ApiService,
    private val userPreference: UserPreference
)

// SakoRepository.kt - HAPUS keterkaitan auth & map, hanya untuk operasi umum
// class SakoRepository - TIDAK LAGI DIGUNAKAN untuk auth/map operations
```

---

## 🔐 **MODUL AUTENTIKASI (AUTH) - 10 Functions**

### ✅ **FUNGSIONAL AUTH-1: User Registration**
**Endpoint:** `POST /api/auth/register`  
**Controller:** `authController.register()`  
**Model:** `AuthModel.createUser()`  
**Database:** INSERT users, INSERT user_visit (default not_visited)  
**Authentication:** ❌ Not Required (public endpoint)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Validasi input (email format, password min 6 karakter)
- Generate custom user ID menggunakan customIdGenerator (`U001`, `U002`)
- Hash password dengan bcrypt (saltRounds: 10)
- Set default notification preferences (map_notifications: review_added=true, place_visited=true)
- Buat record user_visit default 'not_visited' untuk semua tempat wisata

**Utils Implementation:**
- `generateCustomId()`: Generate ID dengan format U + 3 digit angka
- `responseHelper.createdResponse()`: Format response 201 Created
- `logsGenerator.writeLog()`: Log registrasi dengan timestamp Indonesia
- `bcrypt.hash()`: Enkripsi password dengan salt

**Alur Proses (Bahasa Indonesia):**
1. User mengirim data registrasi melalui form Android
2. Sistem validasi format email dan panjang password
3. Cek apakah email sudah terdaftar di database
4. Generate ID user baru dengan format custom (U001, U002, dst)
5. Enkripsi password menggunakan bcrypt dengan salt
6. Simpan data user ke database dengan preferensi notifikasi default
7. Buat record kunjungan default 'not_visited' untuk semua tempat wisata
8. Return data user baru yang berhasil dibuat

**Frontend Integration:**
```kotlin
// AuthRequest.kt
data class RegisterRequest(
    val full_name: String,
    val email: String,
    val password: String,
    val fcm_token: String? = null
)

// AuthResponse.kt
data class RegisterResponse(
    val success: Boolean,
    val message: String,
    val data: UserData
)

data class UserData(
    val users_id: String,
    val full_name: String,
    val email: String,
    val user_image_url: String?,
    val total_xp: Int,
    val notification_preferences: NotificationPrefs,
    val created_at: String
)
```

**Request Example:**
```json
{
  "full_name": "Ahmad Rizki",
  "email": "ahmad.rizki@gmail.com",
  "password": "password123",
  "fcm_token": "dA1B2c3D4e5F6g7H8i9J0k..."
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil",
  "data": {
    "users_id": "U001",
    "full_name": "Ahmad Rizki",
    "email": "ahmad.rizki@gmail.com",
    "user_image_url": null,
    "total_xp": 0,
    "notification_preferences": {
      "system_announcements": true,
      "marketing": false,
      "map_notifications": {
        "review_added": true,
        "place_visited": true
      }
    },
    "created_at": "2025-12-04T00:15:30.000Z"
  }
}
```

---

### ✅ **FUNGSIONAL AUTH-2: User Login**
**Endpoint:** `POST /api/auth/login`  
**Controller:** `authController.login()`  
**Model:** `AuthModel.findUserByEmail()`, `AuthModel.createToken()`  
**Database:** SELECT users, INSERT/UPDATE user_tokens  
**Authentication:** ❌ Not Required (public endpoint)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Validasi kredensial user (email & password)
- Generate JWT access token (1 jam) dan database token (30 hari untuk auto-login)
- Update FCM token jika disediakan untuk push notification
- Simpan database token untuk fitur auto-login tanpa password
- Return access token, refresh token, dan data user lengkap

**Utils Implementation:**
- `bcrypt.compare()`: Verifikasi password dengan hash
- `jwt.sign()`: Generate JWT token dengan expiry 1 jam
- `generateCustomId()`: Generate token ID untuk database token
- `responseHelper.successResponse()`: Format response 200 OK
- `logsGenerator.writeLog()`: Log aktivitas login

**Alur Proses (Bahasa Indonesia):**
1. User input email dan password di aplikasi Android
2. Sistem cari user berdasarkan email di database
3. Verifikasi password yang diinput dengan hash di database
4. Generate JWT token baru dengan masa berlaku 1 jam
5. Generate database token dengan masa berlaku 30 hari untuk auto-login
6. Update FCM token jika user kirim token baru
7. Simpan database token ke tabel user_tokens
8. Return access token dan data user untuk session

**Frontend Integration:**
```kotlin
// AuthRequest.kt
data class LoginRequest(
    val email: String,
    val password: String,
    val fcm_token: String? = null
)

// AuthResponse.kt
data class LoginResponse(
    val success: Boolean,
    val message: String,
    val data: LoginData
)

data class LoginData(
    val access_token: String,
    val database_token: String,
    val expires_in: Int,
    val user: UserData
)
```

**Request Example:**
```json
{
  "email": "ahmad.rizki@gmail.com",
  "password": "password123",
  "fcm_token": "dA1B2c3D4e5F6g7H8i9J0k..."
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "database_token": "T001-2025-12-04-U001",
    "expires_in": 3600,
    "user": {
      "users_id": "U001",
      "full_name": "Ahmad Rizki",
      "email": "ahmad.rizki@gmail.com",
      "user_image_url": null,
      "total_xp": 150,
      "fcm_token": "dA1B2c3D4e5F6g7H8i9J0k..."
    }
  }
}
```

---

### ✅ **FUNGSIONAL AUTH-3: Get User Profile**
**Endpoint:** `GET /api/auth/profile`  
**Controller:** `authController.getProfile()`  
**Model:** `AuthModel.findUserById()`  
**Database:** SELECT users WHERE users_id  
**Authentication:** ✅ Required (JWT token)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Ambil data user berdasarkan ID dari JWT token
- Return data profile lengkap tanpa password
- Include total XP, notification preferences, dan FCM token

**Frontend Integration:**
```kotlin
// ApiService.kt
@GET("auth/profile")
suspend fun getUserProfile(
    @Header("Authorization") token: String
): Response<ProfileResponse>

// UserPreference.kt - untuk menyimpan data user
suspend fun saveUser(user: UserData) {
    dataStore.edit { preferences ->
        preferences[USER_ID_KEY] = user.users_id
        preferences[NAME_KEY] = user.full_name
        preferences[EMAIL_KEY] = user.email
        preferences[TOTAL_XP_KEY] = user.total_xp.toString()
    }
}
```

---

### ✅ **FUNGSIONAL AUTH-4: Auto Login (30 Hari)**
**Endpoint:** `GET /api/auth/auto-login`  
**Controller:** `authController.autoLogin()`  
**Model:** `AuthModel.validateDatabaseToken()`  
**Database:** SELECT user_tokens JOIN users  
**Authentication:** ✅ Required (Database Token)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Validasi database token yang tersimpan di Android
- Generate JWT token baru jika database token masih valid
- Update last login timestamp
- Return access token baru untuk session

**Frontend Integration:**
```kotlin
// UserPreference.kt
suspend fun getSession(): Flow<UserModel> {
    return dataStore.data.map { preferences ->
        UserModel(
            userId = preferences[USER_ID_KEY] ?: "",
            name = preferences[NAME_KEY] ?: "",
            email = preferences[EMAIL_KEY] ?: "",
            token = preferences[TOKEN_KEY] ?: "",
            databaseToken = preferences[DB_TOKEN_KEY] ?: "",
            isLogin = preferences[IS_LOGIN_KEY] ?: false
        )
    }
}

// Auto-login implementation
suspend fun autoLogin(databaseToken: String): LoginResponse {
    return apiService.autoLogin("Bearer $databaseToken")
}
```

---

## 🗺️ **MODUL MAP - 6 Functions**

### ✅ **FUNGSIONAL MAP-1: List Tempat Wisata dengan Status Kunjungan**
**Endpoint:** `GET /api/map/places`  
**Controller:** `detailMapController.getPlacesWithVisitStatus()`  
**Model:** `detailMapModel.getPlacesWithVisitStatus()`  
**Database:** SELECT tourist_place LEFT JOIN user_visit  
**Authentication:** ✅ Required (authenticateTokenFromDB)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Ambil semua tempat wisata aktif dari database
- JOIN dengan tabel user_visit untuk mendapatkan status kunjungan per user
- Return array tempat wisata dengan flag is_visited (true/false)
- Support untuk fitur "Tempat yang sudah/belum dikunjungi"
- Data termasuk rating rata-rata dan informasi lokasi

**Utils Implementation:**
- `responseHelper.success()`: Format response 200 dengan data array
- `logsGenerator.writeLog()`: Log access list tempat wisata
- `authenticateTokenFromDB()`: Validasi token dari database untuk auto-login
- Database JOIN optimization untuk performa query

**Alur Proses (Bahasa Indonesia):**
1. User membuka halaman daftar tempat wisata di aplikasi
2. Sistem validasi token user untuk mendapatkan user ID
3. Query database ambil semua tempat wisata yang aktif
4. JOIN dengan tabel user_visit untuk cek status kunjungan user
5. Format data dengan flag is_visited untuk setiap tempat
6. Return list lengkap tempat wisata dengan status kunjungan
7. Aplikasi Android tampilkan list dengan indikator sudah/belum dikunjungi

**Frontend Integration:**
```kotlin
// MapRequest.kt
// No request body needed for this endpoint

// MapResponse.kt
data class PlacesResponse(
    val success: Boolean,
    val message: String,
    val data: List<TouristPlace>
)

data class TouristPlace(
    val tourist_place_id: String,
    val name: String,
    val description: String,
    val address: String,
    val image_url: String,
    val average_rating: Double,
    val is_active: Boolean,
    val is_visited: Boolean,
    val visited_at: String?
)

// SakoRepository.kt
suspend fun getPlaces(): Result<List<TouristPlace>> {
    return try {
        val response = apiService.getPlaces("Bearer $token")
        if (response.isSuccessful && response.body()?.success == true) {
            Result.success(response.body()!!.data)
        } else {
            Result.failure(Exception(response.body()?.message ?: "Unknown error"))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

**Request Example:**
```http
GET /api/map/places
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example:**
```json
{
  "success": true,
  "message": "List tempat wisata dengan status kunjungan berhasil diambil",
  "data": [
    {
      "tourist_place_id": "TP001",
      "name": "Benteng Kuto Besak",
      "description": "Benteng bersejarah di Palembang",
      "address": "Jl. Benteng, Palembang",
      "image_url": "https://example.com/benteng.jpg",
      "average_rating": 4.5,
      "is_active": true,
      "is_visited": true,
      "visited_at": "2025-12-02T10:15:30.000Z"
    },
    {
      "tourist_place_id": "TP002",
      "name": "Masjid Agung Palembang",
      "description": "Masjid bersejarah Sultanate Palembang",
      "address": "Jl. Masjid Agung, Palembang",
      "image_url": "https://example.com/masjid.jpg",
      "average_rating": 4.8,
      "is_active": true,
      "is_visited": false,
      "visited_at": null
    }
  ]
}
```

---

### ✅ **FUNGSIONAL MAP-2: Detail Tempat Wisata + Validasi Scan QR**
**Endpoint:** `GET /api/map/places/:id`  
**Controller:** `detailMapController.getPlaceDetail()`  
**Model:** `detailMapModel.getPlaceDetail()`  
**Database:** SELECT tourist_place, SELECT user_visit  
**Authentication:** ✅ Required (authenticateTokenFromDB)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Ambil detail lengkap tempat wisata berdasarkan ID
- Validasi status kunjungan untuk mengaktifkan/disable tombol scan QR
- Jika status 'not_visited' → scan QR enabled
- Jika status 'visited' → scan QR disabled
- Return detail tempat + flag is_scan_enabled

**Frontend Integration:**
```kotlin
// MapResponse.kt
data class PlaceDetailResponse(
    val success: Boolean,
    val message: String,
    val data: PlaceDetail
)

data class PlaceDetail(
    val tourist_place_id: String,
    val name: String,
    val description: String,
    val address: String,
    val image_url: String,
    val average_rating: Double,
    val is_visited: Boolean,
    val is_scan_enabled: Boolean,
    val visited_at: String?,
    val reviews_count: Int
)
```

---

### ✅ **FUNGSIONAL MAP-3: Scan QR Code & Update Kunjungan**
**Endpoint:** `POST /api/map/scan/qr`  
**Controller:** `scanMapController.scanQRCode()`  
**Model:** `scanMapModel.validateQrCode()`, `scanMapModel.updateVisitToVisited()`  
**Database:** SELECT qr_code, UPDATE user_visit SET status='visited'  
**Authentication:** ✅ Required (authenticateTokenFromDB)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Validasi QR code value di tabel qr_code untuk tourist_place_id
- Cek record user_visit harus ada dengan status 'not_visited'
- UPDATE user_visit SET status='visited', visited_at=NOW()
- ❌ TIDAK memberikan XP (hanya mencatat kunjungan)
- Kirim notifikasi FCM via mapNotifikasiController
- Return data tempat wisata + timestamp kunjungan

**Utils Implementation:**
- `responseHelper.success()`: Format response dengan data kunjungan
- `logsGenerator.writeLog()`: Log scan QR activity dengan detail
- `getIndonesianTime()`: Timestamp zona waktu Indonesia (WIB)
- `sendPlaceVisitedNotification()`: FCM notification ke user
- Database validation untuk QR code dan visit status

**Alur Proses (Bahasa Indonesia):**
1. User scan QR code yang ada di lokasi tempat wisata
2. Sistem ekstrak code_value dari QR dan validasi di database
3. Cek apakah QR code valid dan terkait dengan tempat wisata aktif
4. Validasi user harus punya record 'not_visited' untuk tempat ini
5. Update status kunjungan dari 'not_visited' ke 'visited' dengan timestamp
6. Kirim push notification ke user tentang kunjungan berhasil
7. Return data tempat wisata dan konfirmasi kunjungan tercatat
8. Aplikasi Android tampilkan success message dan update status

**Frontend Integration:**
```kotlin
// MapRequest.kt
data class ScanQRRequest(
    val qr_code_value: String
)

// MapResponse.kt
data class ScanQRResponse(
    val success: Boolean,
    val message: String,
    val data: ScanQRData
)

data class ScanQRData(
    val scan_success: Boolean,
    val tourist_place: TouristPlace,
    val visit_info: VisitInfo,
    val qr_code_info: QRCodeInfo
)

data class VisitInfo(
    val user_visit_id: String,
    val user_id: String,
    val tourist_place_id: String,
    val status: String,
    val visited_at: String,
    val created_at: String,
    val updated_at: String
)

// QR Code Scanner Implementation
class QRScannerActivity {
    private fun processQRResult(qrCodeValue: String) {
        viewModel.scanQRCode(qrCodeValue).observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    showSuccessDialog(result.data.message)
                    updateVisitStatus(result.data.data.tourist_place.tourist_place_id)
                }
                is Result.Error -> showErrorDialog(result.exception.message)
            }
        }
    }
}
```

**Request Example:**
```json
{
  "qr_code_value": "SAKO-TP001-BKT"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Selamat datang di Benteng Kuto Besak! Kunjungan Anda telah tercatat pada 2025-12-04 14:30:15.",
  "data": {
    "scan_success": true,
    "tourist_place": {
      "tourist_place_id": "TP001",
      "name": "Benteng Kuto Besak",
      "description": "Benteng bersejarah di Palembang",
      "address": "Jl. Benteng, Palembang",
      "image_url": "https://example.com/benteng.jpg",
      "average_rating": 4.5,
      "is_active": true
    },
    "visit_info": {
      "user_visit_id": "UV001",
      "user_id": "U001",
      "tourist_place_id": "TP001",
      "status": "visited",
      "visited_at": "2025-12-04T14:30:15.000Z",
      "created_at": "2025-12-01T10:00:00.000Z",
      "updated_at": "2025-12-04T14:30:15.000Z"
    },
    "qr_code_info": {
      "qr_code_value": "SAKO-TP001-BKT",
      "scan_timestamp": "2025-12-04T14:30:15.123Z"
    }
  }
}
```

---

### ✅ **FUNGSIONAL MAP-4: Toggle Like Review**
**Endpoint:** `POST /api/map/reviews/:id/toggle-like`  
**Controller:** `reviewMapController.toggleReviewLike()`  
**Model:** `reviewMapModel.toggleReviewLike()`  
**Database:** INSERT/DELETE review_like, UPDATE review.total_likes  
**Authentication:** ✅ Required (authenticateTokenFromDB)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- User me-like atau unlike review orang lain (tidak bisa like review sendiri)
- Menggunakan composite primary key (review_id, user_id) di tabel review_like
- Jika belum like: INSERT data baru + UPDATE total_likes (+1)
- Jika sudah like: DELETE data + UPDATE total_likes (-1)
- Database trigger otomatis maintain consistency

**Frontend Integration:**
```kotlin
// ApiService.kt
@POST("map/reviews/{reviewId}/toggle-like")
suspend fun toggleReviewLike(
    @Header("Authorization") token: String,
    @Path("reviewId") reviewId: String
): Response<ToggleLikeResponse>

// MapResponse.kt
data class ToggleLikeResponse(
    val success: Boolean,
    val message: String,
    val data: LikeData
)

data class LikeData(
    val review_id: String,
    val action: String, // "liked" or "unliked"
    val total_likes: Int,
    val is_liked_by_me: Boolean,
    val user_info: UserInfo
)
```

---

### ✅ **FUNGSIONAL MAP-5: Add Review**
**Endpoint:** `POST /api/map/places/:id/reviews`  
**Controller:** `reviewMapController.addReview()`  
**Model:** `reviewMapModel.createReview()`  
**Database:** INSERT review, UPDATE tourist_place.average_rating  
**Authentication:** ✅ Required (authenticateTokenFromDB)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- User menambahkan review dan rating untuk tempat wisata
- Generate custom review ID (RV001, RV002)
- Kirim notifikasi FCM via sendReviewAddedNotification()
- Update average rating tempat wisata otomatis
- Validasi user hanya bisa 1 review per tempat

**Frontend Integration:**
```kotlin
// MapRequest.kt
data class AddReviewRequest(
    val rating: Int,
    val review_text: String
)

// Review submission implementation
class ReviewActivity {
    private fun submitReview(placeId: String, rating: Int, reviewText: String) {
        val request = AddReviewRequest(rating, reviewText)
        viewModel.addReview(placeId, request).observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    showSuccessMessage("Review berhasil ditambahkan")
                    finish()
                }
                is Result.Error -> showErrorMessage(result.exception.message)
            }
        }
    }
}
```

---

### ✅ **FUNGSIONAL MAP-6: Get Place Reviews**
**Endpoint:** `GET /api/map/places/:id/reviews`  
**Controller:** `reviewMapController.getPlaceReviews()`  
**Model:** `reviewMapModel.getPlaceReviews()`  
**Database:** SELECT review JOIN users, COUNT review_like  
**Authentication:** ✅ Required (authenticateTokenFromDB)  
**Response Format:** ✅ Sesuai schema database  

**Fungsi Detail:**
- Ambil semua review untuk tempat wisata dengan paginasi
- Pisahkan user_review (review user sendiri) dan other_reviews
- Include total likes dan status is_liked_by_me untuk setiap review
- Support paginasi dengan parameter page dan limit

**Frontend Integration:**
```kotlin
// ApiService.kt
@GET("map/places/{placeId}/reviews")
suspend fun getPlaceReviews(
    @Header("Authorization") token: String,
    @Path("placeId") placeId: String,
    @Query("page") page: Int = 1,
    @Query("limit") limit: Int = 10
): Response<ReviewsResponse>

// MapResponse.kt
data class ReviewsResponse(
    val success: Boolean,
    val message: String,
    val data: ReviewsData
)

data class ReviewsData(
    val user_review: Review?,
    val other_reviews: List<Review>,
    val pagination: PaginationInfo
)

data class Review(
    val review_id: String,
    val user_id: String,
    val user_name: String,
    val user_image_url: String?,
    val rating: Int,
    val review_text: String,
    val total_likes: Int,
    val is_liked_by_me: Boolean,
    val created_at: String
)
```

---

## 🔧 **FILE KONFIGURASI FRONTEND-BACKEND**

### **📱 ApiConfig.kt - Konfigurasi DevTunnel**
```kotlin
object ApiConfig {
    // DevTunnel URL untuk akses public
    const val BASE_URL = "https://dwc2w4q2-5000.asse.devtunnels.ms/api/"
    
    // Alternative URLs
    const val LOCAL_URL = "http://10.0.2.2:5000/api/"
    const val TUNNEL_URL = "https://dwc2w4q2-5000.asse.devtunnels.ms/api/"
    
    // Headers
    const val CONTENT_TYPE = "application/json"
    const val ACCEPT = "application/json"
}
```

### **🌐 ApiService.kt - Interface Retrofit**
```kotlin
interface ApiService {
    // Auth Endpoints
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @GET("auth/profile")
    suspend fun getUserProfile(@Header("Authorization") token: String): Response<ProfileResponse>
    
    @GET("auth/auto-login")
    suspend fun autoLogin(@Header("Authorization") databaseToken: String): Response<LoginResponse>
    
    // Map Endpoints
    @GET("map/places")
    suspend fun getPlaces(@Header("Authorization") token: String): Response<PlacesResponse>
    
    @GET("map/places/{id}")
    suspend fun getPlaceDetail(
        @Header("Authorization") token: String,
        @Path("id") placeId: String
    ): Response<PlaceDetailResponse>
    
    @POST("map/scan/qr")
    suspend fun scanQRCode(
        @Header("Authorization") token: String,
        @Body request: ScanQRRequest
    ): Response<ScanQRResponse>
    
    @GET("map/places/{id}/reviews")
    suspend fun getPlaceReviews(
        @Header("Authorization") token: String,
        @Path("id") placeId: String,
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): Response<ReviewsResponse>
    
    @POST("map/places/{id}/reviews")
    suspend fun addReview(
        @Header("Authorization") token: String,
        @Path("id") placeId: String,
        @Body request: AddReviewRequest
    ): Response<AddReviewResponse>
    
    @POST("map/reviews/{id}/toggle-like")
    suspend fun toggleReviewLike(
        @Header("Authorization") token: String,
        @Path("id") reviewId: String
    ): Response<ToggleLikeResponse>
}
```

### **🔑 AuthRepository.kt - Repository Autentikasi**
```kotlin
class AuthRepository private constructor(
    private val apiService: ApiService,
    private val userPreference: UserPreference
) {
    
    suspend fun register(request: RegisterRequest): Result<RegisterResponse> {
        return try {
            val response = apiService.register(request)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun login(request: LoginRequest): Result<LoginResponse> {
        return try {
            val response = apiService.login(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val loginData = response.body()!!.data
                // Save tokens to local storage
                userPreference.saveSession(
                    UserModel(
                        userId = loginData.user.users_id,
                        fullName = loginData.user.full_name,
                        email = loginData.user.email,
                        userImageUrl = loginData.user.user_image_url,
                        totalXp = loginData.user.total_xp,
                        accessToken = loginData.access_token,
                        databaseToken = loginData.database_token,
                        fcmToken = loginData.user.fcm_token,
                        isLogin = true
                    )
                )
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUserProfile(): Result<ProfileResponse> {
        return try {
            val session = userPreference.getSession().first()
            val response = apiService.getUserProfile("Bearer ${session.accessToken}")
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun autoLogin(): Result<LoginResponse> {
        return try {
            val session = userPreference.getSession().first()
            val response = apiService.autoLogin("Bearer ${session.databaseToken}")
            if (response.isSuccessful && response.body()?.success == true) {
                val loginData = response.body()!!.data
                // Update session with new access token
                userPreference.saveSession(session.copy(accessToken = loginData.access_token))
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Auto login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun logout() {
        userPreference.logout()
    }
    
    companion object {
        @Volatile
        private var instance: AuthRepository? = null
        
        fun getInstance(apiService: ApiService, userPreference: UserPreference): AuthRepository {
            return instance ?: synchronized(this) {
                instance ?: AuthRepository(apiService, userPreference).also { instance = it }
            }
        }
    }
}
```

### **🗺️ MapRepository.kt - Repository Map Operations**
```kotlin
class MapRepository private constructor(
    private val apiService: ApiService,
    private val userPreference: UserPreference
) {
    
    suspend fun getPlaces(): Result<List<TouristPlace>> {
        return try {
            val session = userPreference.getSession().first()
            val response = apiService.getPlaces("Bearer ${session.accessToken}")
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get places"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPlaceDetail(placeId: String): Result<PlaceDetail> {
        return try {
            val session = userPreference.getSession().first()
            val response = apiService.getPlaceDetail("Bearer ${session.accessToken}", placeId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get place detail"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun scanQRCode(qrCodeValue: String): Result<ScanQRResponse> {
        return try {
            val session = userPreference.getSession().first()
            val request = ScanQRRequest(qrCodeValue)
            val response = apiService.scanQRCode("Bearer ${session.accessToken}", request)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "QR scan failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPlaceReviews(placeId: String, page: Int = 1, limit: Int = 10): Result<ReviewsData> {
        return try {
            val session = userPreference.getSession().first()
            val response = apiService.getPlaceReviews("Bearer ${session.accessToken}", placeId, page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get reviews"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addReview(placeId: String, rating: Int, reviewText: String): Result<AddReviewResponse> {
        return try {
            val session = userPreference.getSession().first()
            val request = AddReviewRequest(rating, reviewText)
            val response = apiService.addReview("Bearer ${session.accessToken}", placeId, request)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to add review"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun toggleReviewLike(reviewId: String): Result<ToggleLikeResponse> {
        return try {
            val session = userPreference.getSession().first()
            val response = apiService.toggleReviewLike("Bearer ${session.accessToken}", reviewId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to toggle like"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    companion object {
        @Volatile
        private var instance: MapRepository? = null
        
        fun getInstance(apiService: ApiService, userPreference: UserPreference): MapRepository {
            return instance ?: synchronized(this) {
                instance ?: MapRepository(apiService, userPreference).also { instance = it }
            }
        }
    }
}
```

---

## 📱 **DATA MODELS SESUAI DATABASE SAKO.SQL**

### **👤 User & Auth Models**
```kotlin
// UserModel.kt - Model untuk UserPreference & Session
data class UserModel(
    val userId: String = "",                    // users.users_id (CHAR 36)
    val fullName: String = "",                  // users.full_name (VARCHAR 150)
    val email: String = "",                     // users.email (VARCHAR 255)
    val userImageUrl: String? = null,           // users.user_image_url (VARCHAR 512)
    val totalXp: Int = 0,                       // users.total_xp (INT)
    val accessToken: String = "",               // JWT token (1 jam)
    val databaseToken: String = "",             // Database token (30 hari)
    val fcmToken: String? = null,               // users.fcm_token (TEXT)
    val status: String = "active",              // users.status (ENUM: active, inactive, banned)
    val notificationPreferences: String? = null, // users.notification_preferences (JSON)
    val isLogin: Boolean = false,
    val createdAt: String = "",                 // users.created_at (TIMESTAMP)
    val updatedAt: String = ""                  // users.updated_at (TIMESTAMP)
)

// AuthRequest.kt
data class RegisterRequest(
    val full_name: String,                      // Sesuai users.full_name
    val email: String,                          // Sesuai users.email
    val password: String,                       // Akan di-hash ke users.password_hash
    val fcm_token: String? = null               // Sesuai users.fcm_token
)

data class LoginRequest(
    val email: String,                          // Sesuai users.email
    val password: String,                       // Untuk validasi dengan users.password_hash
    val fcm_token: String? = null               // Update users.fcm_token
)

// AuthResponse.kt
data class RegisterResponse(
    val success: Boolean,
    val message: String,
    val data: UserData
)

data class LoginResponse(
    val success: Boolean,
    val message: String,
    val data: LoginData
)

data class LoginData(
    val access_token: String,                   // JWT token
    val database_token: String,                 // Database token untuk auto-login
    val expires_in: Int,                        // Token expiry (3600 detik)
    val user: UserData
)

data class UserData(
    val users_id: String,                       // users.users_id
    val full_name: String,                      // users.full_name
    val email: String,                          // users.email
    val user_image_url: String?,                // users.user_image_url
    val total_xp: Int,                          // users.total_xp
    val status: String,                         // users.status
    val fcm_token: String?,                     // users.fcm_token
    val notification_preferences: NotificationPrefs?, // users.notification_preferences
    val created_at: String,                     // users.created_at
    val updated_at: String                      // users.updated_at
)

data class NotificationPrefs(
    val system_announcements: Boolean,
    val marketing: Boolean,
    val map_notifications: MapNotificationPrefs
)

data class MapNotificationPrefs(
    val review_added: Boolean,
    val place_visited: Boolean
)
```

### **🗺️ Map & Tourist Place Models**
```kotlin
// MapRequest.kt
data class ScanQRRequest(
    val qr_code_value: String                   // Sesuai qr_code.code_value
)

data class AddReviewRequest(
    val rating: Int,                            // review.rating (1-5)
    val review_text: String                     // review.review_text
)

// MapResponse.kt
data class PlacesResponse(
    val success: Boolean,
    val message: String,
    val data: List<TouristPlace>
)

data class TouristPlace(
    val tourist_place_id: String,               // tourist_place.tourist_place_id (CHAR 36)
    val name: String,                           // tourist_place.name (VARCHAR 150)
    val description: String?,                   // tourist_place.description (TEXT)
    val address: String?,                       // tourist_place.address (VARCHAR 255)
    val image_url: String?,                     // tourist_place.image_url (VARCHAR 512)
    val average_rating: Double,                 // tourist_place.average_rating (DECIMAL 3,1)
    val is_active: Boolean,                     // tourist_place.is_active (TINYINT 1)
    val is_visited: Boolean,                    // user_visit.status == 'visited'
    val visited_at: String?,                    // user_visit.visited_at (TIMESTAMP)
    val created_at: String,                     // tourist_place.created_at
    val updated_at: String                      // tourist_place.updated_at
)

data class PlaceDetailResponse(
    val success: Boolean,
    val message: String,
    val data: PlaceDetail
)

data class PlaceDetail(
    val tourist_place_id: String,               // tourist_place.tourist_place_id
    val name: String,                           // tourist_place.name
    val description: String?,                   // tourist_place.description
    val address: String?,                       // tourist_place.address
    val image_url: String?,                     // tourist_place.image_url
    val average_rating: Double,                 // tourist_place.average_rating
    val is_active: Boolean,                     // tourist_place.is_active
    val is_visited: Boolean,                    // user_visit.status == 'visited'
    val is_scan_enabled: Boolean,               // Logic: !is_visited
    val visited_at: String?,                    // user_visit.visited_at
    val reviews_count: Int,                     // COUNT(review)
    val created_at: String,                     // tourist_place.created_at
    val updated_at: String                      // tourist_place.updated_at
)

data class ScanQRResponse(
    val success: Boolean,
    val message: String,
    val data: ScanQRData
)

data class ScanQRData(
    val scan_success: Boolean,
    val tourist_place: TouristPlace,
    val visit_info: VisitInfo,
    val qr_code_info: QRCodeInfo
)

data class VisitInfo(
    val user_visit_id: String,                  // user_visit.user_visit_id (CHAR 36)
    val user_id: String,                        // user_visit.user_id (CHAR 36)
    val tourist_place_id: String,               // user_visit.tourist_place_id (CHAR 36)
    val status: String,                         // user_visit.status (ENUM: visited, not_visited)
    val visited_at: String?,                    // user_visit.visited_at (TIMESTAMP)
    val created_at: String,                     // user_visit.created_at
    val updated_at: String                      // user_visit.updated_at
)

data class QRCodeInfo(
    val qr_code_value: String,                  // qr_code.code_value
    val scan_timestamp: String
)
```

### **📝 Review Models**
```kotlin
data class ReviewsResponse(
    val success: Boolean,
    val message: String,
    val data: ReviewsData
)

data class ReviewsData(
    val user_review: Review?,                   // Review user sendiri (jika ada)
    val other_reviews: List<Review>,            // Review user lain
    val pagination: PaginationInfo
)

data class Review(
    val review_id: String,                      // review.review_id (CHAR 36)
    val user_id: String,                        // review.user_id (CHAR 36)
    val tourist_place_id: String,               // review.tourist_place_id (CHAR 36)
    val user_name: String,                      // users.full_name (JOIN)
    val user_image_url: String?,                // users.user_image_url (JOIN)
    val rating: Int,                            // review.rating (INT 1-5)
    val review_text: String?,                   // review.review_text (TEXT)
    val total_likes: Int,                       // review.total_likes (INT)
    val is_liked_by_me: Boolean,                // Cek review_like.user_id
    val created_at: String,                     // review.created_at (TIMESTAMP)
    val updated_at: String                      // review.updated_at (TIMESTAMP)
)

data class AddReviewResponse(
    val success: Boolean,
    val message: String,
    val data: Review
)

data class ToggleLikeResponse(
    val success: Boolean,
    val message: String,
    val data: LikeData
)

data class LikeData(
    val review_id: String,                      // review_like.review_id
    val action: String,                         // "liked" or "unliked"
    val total_likes: Int,                       // review.total_likes (updated)
    val is_liked_by_me: Boolean,                // Status like terbaru
    val user_info: UserInfo
)

data class UserInfo(
    val user_id: String,                        // review_like.user_id
    val user_name: String                       // users.full_name (JOIN)
)

data class PaginationInfo(
    val current_page: Int,
    val total_pages: Int,
    val total_items: Int,
    val items_per_page: Int
)
```

---

## 🏗️ **VIEWMODEL & FACTORY IMPLEMENTATION**

### **🎯 MapViewModel.kt - ViewModel untuk Map Operations**
```kotlin
class MapViewModel(private val mapRepository: MapRepository) : ViewModel() {
    
    private val _places = MutableLiveData<Result<List<TouristPlace>>>()
    val places: LiveData<Result<List<TouristPlace>>> = _places
    
    private val _placeDetail = MutableLiveData<Result<PlaceDetail>>()
    val placeDetail: LiveData<Result<PlaceDetail>> = _placeDetail
    
    private val _scanResult = MutableLiveData<Result<ScanQRResponse>>()
    val scanResult: LiveData<Result<ScanQRResponse>> = _scanResult
    
    private val _reviews = MutableLiveData<Result<ReviewsData>>()
    val reviews: LiveData<Result<ReviewsData>> = _reviews
    
    private val _addReviewResult = MutableLiveData<Result<AddReviewResponse>>()
    val addReviewResult: LiveData<Result<AddReviewResponse>> = _addReviewResult
    
    private val _toggleLikeResult = MutableLiveData<Result<ToggleLikeResponse>>()
    val toggleLikeResult: LiveData<Result<ToggleLikeResponse>> = _toggleLikeResult
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // Get all places with visit status
    fun getPlaces() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = mapRepository.getPlaces()
            _places.value = result
            _isLoading.value = false
        }
    }
    
    // Get specific place detail
    fun getPlaceDetail(placeId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = mapRepository.getPlaceDetail(placeId)
            _placeDetail.value = result
            _isLoading.value = false
        }
    }
    
    // Scan QR Code
    fun scanQRCode(qrCodeValue: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = mapRepository.scanQRCode(qrCodeValue)
            _scanResult.value = result
            _isLoading.value = false
        }
    }
    
    // Get place reviews with pagination
    fun getPlaceReviews(placeId: String, page: Int = 1, limit: Int = 10) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = mapRepository.getPlaceReviews(placeId, page, limit)
            _reviews.value = result
            _isLoading.value = false
        }
    }
    
    // Add new review
    fun addReview(placeId: String, rating: Int, reviewText: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = mapRepository.addReview(placeId, rating, reviewText)
            _addReviewResult.value = result
            _isLoading.value = false
        }
    }
    
    // Toggle like/unlike review
    fun toggleReviewLike(reviewId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            val result = mapRepository.toggleReviewLike(reviewId)
            _toggleLikeResult.value = result
            _isLoading.value = false
        }
    }
    
    // Filter visited places
    fun getVisitedPlaces(): LiveData<List<TouristPlace>> = places.map { result ->
        if (result.isSuccess) {
            result.getOrNull()?.filter { it.is_visited } ?: emptyList()
        } else {
            emptyList()
        }
    }
    
    // Filter not visited places
    fun getNotVisitedPlaces(): LiveData<List<TouristPlace>> = places.map { result ->
        if (result.isSuccess) {
            result.getOrNull()?.filter { !it.is_visited } ?: emptyList()
        } else {
            emptyList()
        }
    }
}
```

### **🏭 MapViewModelFactory.kt - Factory untuk MapViewModel**
```kotlin
class MapViewModelFactory(private val mapRepository: MapRepository) : ViewModelProvider.NewInstanceFactory() {
    
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(MapViewModel::class.java) -> {
                MapViewModel(mapRepository) as T
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class: " + modelClass.name)
        }
    }
    
    companion object {
        @Volatile
        private var instance: MapViewModelFactory? = null
        
        fun getInstance(mapRepository: MapRepository): MapViewModelFactory {
            return instance ?: synchronized(this) {
                instance ?: MapViewModelFactory(mapRepository).also { instance = it }
            }
        }
    }
}
```

### **🔑 AuthViewModel.kt - ViewModel untuk Auth Operations**
```kotlin
class AuthViewModel(private val authRepository: AuthRepository) : ViewModel() {
    
    private val _registerResult = MutableLiveData<Result<RegisterResponse>>()
    val registerResult: LiveData<Result<RegisterResponse>> = _registerResult
    
    private val _loginResult = MutableLiveData<Result<LoginResponse>>()
    val loginResult: LiveData<Result<LoginResponse>> = _loginResult
    
    private val _userProfile = MutableLiveData<Result<ProfileResponse>>()
    val userProfile: LiveData<Result<ProfileResponse>> = _userProfile
    
    private val _autoLoginResult = MutableLiveData<Result<LoginResponse>>()
    val autoLoginResult: LiveData<Result<LoginResponse>> = _autoLoginResult
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // User registration
    fun register(fullName: String, email: String, password: String, fcmToken: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            val request = RegisterRequest(fullName, email, password, fcmToken)
            val result = authRepository.register(request)
            _registerResult.value = result
            _isLoading.value = false
        }
    }
    
    // User login
    fun login(email: String, password: String, fcmToken: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            val request = LoginRequest(email, password, fcmToken)
            val result = authRepository.login(request)
            _loginResult.value = result
            _isLoading.value = false
        }
    }
    
    // Get user profile
    fun getUserProfile() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = authRepository.getUserProfile()
            _userProfile.value = result
            _isLoading.value = false
        }
    }
    
    // Auto login with database token
    fun autoLogin() {
        viewModelScope.launch {
            _isLoading.value = true
            val result = authRepository.autoLogin()
            _autoLoginResult.value = result
            _isLoading.value = false
        }
    }
    
    // Logout
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
}
```

### **🏭 AuthViewModelFactory.kt - Factory untuk AuthViewModel**
```kotlin
class AuthViewModelFactory(private val authRepository: AuthRepository) : ViewModelProvider.NewInstanceFactory() {
    
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(AuthViewModel::class.java) -> {
                AuthViewModel(authRepository) as T
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class: " + modelClass.name)
        }
    }
    
    companion object {
        @Volatile
        private var instance: AuthViewModelFactory? = null
        
        fun getInstance(authRepository: AuthRepository): AuthViewModelFactory {
            return instance ?: synchronized(this) {
                instance ?: AuthViewModelFactory(authRepository).also { instance = it }
            }
        }
    }
}
```

---

## 🔧 **UTILS FRONTEND UNTUK MEMPERMUDAH DEVELOPMENT**

### **📅 DateUtils.kt - Format Timestamp Indonesia**
```kotlin
object DateUtils {
    private val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
    private val outputFormat = SimpleDateFormat("dd MMMM yyyy, HH:mm", Locale("id", "ID"))
    private val timeOnlyFormat = SimpleDateFormat("HH:mm", Locale("id", "ID"))
    private val dateOnlyFormat = SimpleDateFormat("dd MMMM yyyy", Locale("id", "ID"))
    
    init {
        inputFormat.timeZone = TimeZone.getTimeZone("UTC")
        outputFormat.timeZone = TimeZone.getTimeZone("Asia/Jakarta")
    }
    
    fun formatTimestamp(timestamp: String?): String {
        return try {
            if (timestamp.isNullOrEmpty()) return "Tanggal tidak tersedia"
            val date = inputFormat.parse(timestamp)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            "Tanggal tidak tersedia"
        }
    }
    
    fun formatTimeOnly(timestamp: String?): String {
        return try {
            if (timestamp.isNullOrEmpty()) return "-"
            val date = inputFormat.parse(timestamp)
            timeOnlyFormat.format(date ?: Date())
        } catch (e: Exception) {
            "-"
        }
    }
    
    fun formatDateOnly(timestamp: String?): String {
        return try {
            if (timestamp.isNullOrEmpty()) return "-"
            val date = inputFormat.parse(timestamp)
            dateOnlyFormat.format(date ?: Date())
        } catch (e: Exception) {
            "-"
        }
    }
    
    fun getRelativeTime(timestamp: String?): String {
        return try {
            if (timestamp.isNullOrEmpty()) return "Waktu tidak tersedia"
            val date = inputFormat.parse(timestamp)
            val now = Date()
            val diffMs = now.time - (date?.time ?: 0)
            val diffMinutes = diffMs / (60 * 1000)
            val diffHours = diffMs / (60 * 60 * 1000)
            val diffDays = diffMs / (24 * 60 * 60 * 1000)
            
            when {
                diffMinutes < 1 -> "Baru saja"
                diffMinutes < 60 -> "$diffMinutes menit yang lalu"
                diffHours < 24 -> "$diffHours jam yang lalu"
                diffDays < 7 -> "$diffDays hari yang lalu"
                else -> formatDateOnly(timestamp)
            }
        } catch (e: Exception) {
            "Waktu tidak tersedia"
        }
    }
}
```

### **🖼️ ImageUtils.kt - Image Loading & Handling**
```kotlin
object ImageUtils {
    
    fun loadImageWithGlide(
        context: Context,
        imageUrl: String?,
        imageView: ImageView,
        placeholder: Int = R.drawable.placeholder_image,
        error: Int = R.drawable.error_image
    ) {
        Glide.with(context)
            .load(imageUrl)
            .placeholder(placeholder)
            .error(error)
            .into(imageView)
    }
    
    fun loadCircularImageWithGlide(
        context: Context,
        imageUrl: String?,
        imageView: ImageView,
        placeholder: Int = R.drawable.placeholder_profile
    ) {
        Glide.with(context)
            .load(imageUrl)
            .placeholder(placeholder)
            .error(placeholder)
            .circleCrop()
            .into(imageView)
    }
    
    fun getDefaultProfileImage(): String {
        return "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
    }
    
    fun generateProfileImageUrl(fullName: String): String {
        val initials = fullName.split(" ").joinToString("") { it.firstOrNull()?.toString() ?: "" }
        return "https://ui-avatars.com/api/?name=$initials&background=0D8ABC&color=fff"
    }
}
```

### **🌟 RatingUtils.kt - Rating Display & Interaction**
```kotlin
object RatingUtils {
    
    fun formatRating(rating: Double): String {
        return if (rating == 0.0) {
            "Belum ada rating"
        } else {
            String.format(Locale.getDefault(), "%.1f", rating)
        }
    }
    
    fun getRatingColor(context: Context, rating: Double): Int {
        return when {
            rating >= 4.5 -> ContextCompat.getColor(context, R.color.rating_excellent)
            rating >= 4.0 -> ContextCompat.getColor(context, R.color.rating_very_good)
            rating >= 3.5 -> ContextCompat.getColor(context, R.color.rating_good)
            rating >= 3.0 -> ContextCompat.getColor(context, R.color.rating_fair)
            rating > 0 -> ContextCompat.getColor(context, R.color.rating_poor)
            else -> ContextCompat.getColor(context, R.color.rating_none)
        }
    }
    
    fun setupRatingBar(ratingBar: RatingBar, rating: Int, isEnabled: Boolean = true) {
        ratingBar.rating = rating.toFloat()
        ratingBar.isEnabled = isEnabled
    }
    
    fun getRatingText(rating: Double): String {
        return when {
            rating >= 4.5 -> "Luar biasa"
            rating >= 4.0 -> "Sangat bagus"
            rating >= 3.5 -> "Bagus"
            rating >= 3.0 -> "Cukup baik"
            rating > 0 -> "Kurang baik"
            else -> "Belum ada rating"
        }
    }
}
```

### **🎨 ViewUtils.kt - UI Helper Functions**
```kotlin
object ViewUtils {
    
    fun showToast(context: Context, message: String, duration: Int = Toast.LENGTH_SHORT) {
        Toast.makeText(context, message, duration).show()
    }
    
    fun showSnackbar(view: View, message: String, duration: Int = Snackbar.LENGTH_SHORT) {
        Snackbar.make(view, message, duration).show()
    }
    
    fun setVisibility(view: View, visible: Boolean) {
        view.visibility = if (visible) View.VISIBLE else View.GONE
    }
    
    fun animateVisibility(view: View, visible: Boolean, duration: Long = 300L) {
        val targetAlpha = if (visible) 1f else 0f
        val targetVisibility = if (visible) View.VISIBLE else View.GONE
        
        view.animate()
            .alpha(targetAlpha)
            .setDuration(duration)
            .setListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    view.visibility = targetVisibility
                }
            })
            .start()
    }
    
    fun showProgressDialog(context: Context, message: String = "Memuat..."): AlertDialog {
        val progressView = LayoutInflater.from(context).inflate(R.layout.dialog_progress, null)
        val textView = progressView.findViewById<TextView>(R.id.tv_message)
        textView.text = message
        
        return AlertDialog.Builder(context)
            .setView(progressView)
            .setCancelable(false)
            .create()
    }
    
    fun showErrorDialog(context: Context, title: String, message: String, onRetry: (() -> Unit)? = null) {
        AlertDialog.Builder(context)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { dialog, _ ->
                dialog.dismiss()
            }
            .apply {
                if (onRetry != null) {
                    setNeutralButton("Coba Lagi") { _, _ ->
                        onRetry()
                    }
                }
            }
            .show()
    }
}
```

### **🔍 ValidationUtils.kt - Input Validation**
```kotlin
object ValidationUtils {
    
    fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    fun isValidPassword(password: String): Boolean {
        return password.length >= 6
    }
    
    fun isValidFullName(fullName: String): Boolean {
        return fullName.trim().length >= 2
    }
    
    fun isValidRating(rating: Int): Boolean {
        return rating in 1..5
    }
    
    fun isValidReviewText(reviewText: String): Boolean {
        return reviewText.trim().isNotEmpty() && reviewText.trim().length >= 10
    }
    
    fun validateRegisterInput(fullName: String, email: String, password: String): String? {
        return when {
            !isValidFullName(fullName) -> "Nama lengkap minimal 2 karakter"
            !isValidEmail(email) -> "Format email tidak valid"
            !isValidPassword(password) -> "Password minimal 6 karakter"
            else -> null
        }
    }
    
    fun validateLoginInput(email: String, password: String): String? {
        return when {
            !isValidEmail(email) -> "Format email tidak valid"
            password.isEmpty() -> "Password tidak boleh kosong"
            else -> null
        }
    }
    
    fun validateReviewInput(rating: Int, reviewText: String): String? {
        return when {
            !isValidRating(rating) -> "Rating harus antara 1-5"
            !isValidReviewText(reviewText) -> "Review minimal 10 karakter"
            else -> null
        }
    }
}
```

### **🌐 NetworkUtils.kt - API Integration & Error Handling**
```kotlin
object NetworkUtils {
    
    // Check network connection
    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork
            val capabilities = connectivityManager.getNetworkCapabilities(network)
            capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
        } else {
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo
            @Suppress("DEPRECATION")
            networkInfo?.isConnectedOrConnecting == true
        }
    }
    
    // Parse API error response
    fun parseApiError(response: Response<*>): String {
        return try {
            val errorBody = response.errorBody()?.string()
            if (!errorBody.isNullOrEmpty()) {
                val errorJson = JSONObject(errorBody)
                errorJson.optString("message", "Terjadi kesalahan pada server")
            } else {
                getHttpErrorMessage(response.code())
            }
        } catch (e: Exception) {
            getHttpErrorMessage(response.code())
        }
    }
    
    // Get HTTP status code error message
    private fun getHttpErrorMessage(code: Int): String {
        return when (code) {
            400 -> "Permintaan tidak valid (Bad Request)"
            401 -> "Akses ditolak. Silakan login kembali"
            403 -> "Akses terlarang"
            404 -> "Data tidak ditemukan"
            408 -> "Koneksi timeout. Coba lagi"
            422 -> "Data yang dikirim tidak valid"
            429 -> "Terlalu banyak permintaan. Tunggu sebentar"
            500 -> "Server bermasalah. Coba lagi nanti"
            502 -> "Gateway bermasalah"
            503 -> "Server sedang maintenance"
            else -> "Terjadi kesalahan (Kode: $code)"
        }
    }
    
    // Check if URL is accessible
    suspend fun checkEndpointHealth(context: Context): EndpointStatus {
        return try {
            if (!isNetworkAvailable(context)) {
                return EndpointStatus.NO_INTERNET
            }
            
            val client = OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build()
            
            val request = Request.Builder()
                .url("${ApiConfig.BASE_URL.removeSuffix("/api/")}/health")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            when (response.code) {
                200 -> EndpointStatus.ONLINE
                else -> EndpointStatus.SERVER_ERROR
            }
        } catch (e: Exception) {
            when (e) {
                is SocketTimeoutException -> EndpointStatus.TIMEOUT
                is UnknownHostException -> EndpointStatus.DNS_ERROR
                is ConnectException -> EndpointStatus.CONNECTION_REFUSED
                else -> EndpointStatus.UNKNOWN_ERROR
            }
        }
    }
    
    // Format endpoint status untuk user
    fun getEndpointStatusMessage(status: EndpointStatus): String {
        return when (status) {
            EndpointStatus.ONLINE -> "✅ Server terhubung"
            EndpointStatus.NO_INTERNET -> "❌ Tidak ada koneksi internet"
            EndpointStatus.TIMEOUT -> "⏰ Koneksi timeout"
            EndpointStatus.DNS_ERROR -> "🌐 Tidak dapat menemukan server"
            EndpointStatus.CONNECTION_REFUSED -> "🚫 Server menolak koneksi"
            EndpointStatus.SERVER_ERROR -> "⚠️ Server bermasalah"
            EndpointStatus.UNKNOWN_ERROR -> "❓ Error tidak dikenal"
        }
    }
}

enum class EndpointStatus {
    ONLINE,
    NO_INTERNET,
    TIMEOUT,
    DNS_ERROR,
    CONNECTION_REFUSED,
    SERVER_ERROR,
    UNKNOWN_ERROR
}
```

### **📊 ApiResponseHandler.kt - Response Status Management**
```kotlin
sealed class ApiResult<out T> {
    data class Success<out T>(val data: T) : ApiResult<T>()
    data class Error(val exception: Throwable, val code: Int? = null) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

object ApiResponseHandler {
    
    // Handle Retrofit Response
    suspend fun <T> handleApiCall(apiCall: suspend () -> Response<T>): ApiResult<T> {
        return try {
            val response = apiCall()
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    ApiResult.Success(body)
                } else {
                    ApiResult.Error(Exception("Response body is null"), response.code())
                }
            } else {
                val errorMessage = NetworkUtils.parseApiError(response)
                ApiResult.Error(Exception(errorMessage), response.code())
            }
        } catch (e: Exception) {
            ApiResult.Error(e)
        }
    }
    
    // Handle API Result in UI
    fun <T> handleResult(
        result: ApiResult<T>,
        onSuccess: (T) -> Unit,
        onError: ((String, Int?) -> Unit)? = null,
        onLoading: (() -> Unit)? = null
    ) {
        when (result) {
            is ApiResult.Success -> onSuccess(result.data)
            is ApiResult.Error -> {
                val message = when (result.exception) {
                    is SocketTimeoutException -> "Koneksi timeout. Periksa internet Anda"
                    is UnknownHostException -> "Tidak dapat terhubung ke server"
                    is ConnectException -> "Gagal terhubung ke server"
                    else -> result.exception.message ?: "Terjadi kesalahan"
                }
                onError?.invoke(message, result.code)
            }
            is ApiResult.Loading -> onLoading?.invoke()
        }
    }
    
    // Log API request and response
    fun logApiCall(endpoint: String, method: String, requestBody: Any? = null) {
        if (BuildConfig.DEBUG) {
            Log.d("API_CALL", "[$method] $endpoint")
            requestBody?.let {
                Log.d("API_REQUEST", "Body: ${Gson().toJson(it)}")
            }
        }
    }
    
    fun logApiResponse(endpoint: String, responseCode: Int, responseBody: Any? = null) {
        if (BuildConfig.DEBUG) {
            Log.d("API_RESPONSE", "$endpoint -> Code: $responseCode")
            responseBody?.let {
                Log.d("API_RESPONSE", "Body: ${Gson().toJson(it)}")
            }
        }
    }
}
```

### **🔄 RetryUtils.kt - Retry Logic untuk API Calls**
```kotlin
object RetryUtils {
    
    // Retry dengan exponential backoff
    suspend fun <T> retryWithExponentialBackoff(
        maxRetries: Int = 3,
        initialDelayMs: Long = 1000,
        backoffMultiplier: Double = 2.0,
        apiCall: suspend () -> ApiResult<T>
    ): ApiResult<T> {
        var delayMs = initialDelayMs
        
        repeat(maxRetries) { attempt ->
            val result = apiCall()
            
            when (result) {
                is ApiResult.Success -> return result
                is ApiResult.Error -> {
                    // Jangan retry untuk error 4xx (client error)
                    if (result.code != null && result.code in 400..499) {
                        return result
                    }
                    
                    // Jika bukan attempt terakhir, tunggu sebelum retry
                    if (attempt < maxRetries - 1) {
                        delay(delayMs)
                        delayMs = (delayMs * backoffMultiplier).toLong()
                    }
                }
                is ApiResult.Loading -> {
                    // Continue to next attempt
                }
            }
        }
        
        // Jika semua retry gagal, return error terakhir
        return apiCall()
    }
    
    // Retry untuk operasi yang membutuhkan network
    suspend fun <T> retryOnNetworkError(
        context: Context,
        maxRetries: Int = 3,
        delayMs: Long = 2000,
        operation: suspend () -> ApiResult<T>
    ): ApiResult<T> {
        repeat(maxRetries) { attempt ->
            if (!NetworkUtils.isNetworkAvailable(context)) {
                if (attempt < maxRetries - 1) {
                    delay(delayMs)
                    continue
                } else {
                    return ApiResult.Error(Exception("Tidak ada koneksi internet"))
                }
            }
            
            val result = operation()
            when (result) {
                is ApiResult.Success -> return result
                is ApiResult.Error -> {
                    // Retry hanya untuk network error
                    if (result.exception is UnknownHostException || 
                        result.exception is ConnectException ||
                        result.exception is SocketTimeoutException) {
                        
                        if (attempt < maxRetries - 1) {
                            delay(delayMs)
                            continue
                        }
                    }
                    return result
                }
                is ApiResult.Loading -> continue
            }
        }
        
        return operation()
    }
    
    // Check apakah error bisa di-retry
    fun isRetryableError(throwable: Throwable): Boolean {
        return when (throwable) {
            is SocketTimeoutException,
            is ConnectException,
            is UnknownHostException -> true
            else -> false
        }
    }
    
    // Check apakah HTTP code bisa di-retry
    fun isRetryableHttpCode(code: Int): Boolean {
        return code in listOf(408, 429, 500, 502, 503, 504)
    }
}
```

### **📡 ConnectionMonitor.kt - Real-time Network Monitoring**
```kotlin
class ConnectionMonitor(private val context: Context) {
    
    private val _connectionState = MutableLiveData<ConnectionState>()
    val connectionState: LiveData<ConnectionState> = _connectionState
    
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private var networkCallback: ConnectivityManager.NetworkCallback? = null
    
    init {
        checkCurrentConnection()
    }
    
    private fun checkCurrentConnection() {
        val isConnected = NetworkUtils.isNetworkAvailable(context)
        _connectionState.value = if (isConnected) {
            ConnectionState.CONNECTED
        } else {
            ConnectionState.DISCONNECTED
        }
    }
    
    @RequiresApi(Build.VERSION_CODES.N)
    fun startMonitoring() {
        if (networkCallback != null) return
        
        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _connectionState.postValue(ConnectionState.CONNECTED)
                checkServerStatus()
            }
            
            override fun onLost(network: Network) {
                _connectionState.postValue(ConnectionState.DISCONNECTED)
            }
            
            override fun onUnavailable() {
                _connectionState.postValue(ConnectionState.DISCONNECTED)
            }
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            connectivityManager.registerDefaultNetworkCallback(networkCallback!!)
        }
    }
    
    fun stopMonitoring() {
        networkCallback?.let {
            connectivityManager.unregisterNetworkCallback(it)
            networkCallback = null
        }
    }
    
    private fun checkServerStatus() {
        CoroutineScope(Dispatchers.IO).launch {
            val status = NetworkUtils.checkEndpointHealth(context)
            _connectionState.postValue(
                if (status == EndpointStatus.ONLINE) {
                    ConnectionState.SERVER_CONNECTED
                } else {
                    ConnectionState.SERVER_DISCONNECTED
                }
            )
        }
    }
    
    // Get connection status message untuk UI
    fun getConnectionMessage(state: ConnectionState): String {
        return when (state) {
            ConnectionState.CONNECTED -> "📶 Terhubung ke internet"
            ConnectionState.DISCONNECTED -> "📵 Tidak ada koneksi internet"
            ConnectionState.SERVER_CONNECTED -> "🟢 Server online"
            ConnectionState.SERVER_DISCONNECTED -> "🔴 Server offline"
            ConnectionState.CHECKING -> "🔄 Memeriksa koneksi..."
        }
    }
    
    // Get connection color untuk UI indicator
    fun getConnectionColor(context: Context, state: ConnectionState): Int {
        return when (state) {
            ConnectionState.CONNECTED,
            ConnectionState.SERVER_CONNECTED -> ContextCompat.getColor(context, R.color.green_500)
            ConnectionState.DISCONNECTED,
            ConnectionState.SERVER_DISCONNECTED -> ContextCompat.getColor(context, R.color.red_500)
            ConnectionState.CHECKING -> ContextCompat.getColor(context, R.color.orange_500)
        }
    }
}

enum class ConnectionState {
    CONNECTED,
    DISCONNECTED,
    SERVER_CONNECTED,
    SERVER_DISCONNECTED,
    CHECKING
}
```

### **🎯 EndpointTester.kt - Test Individual Endpoints**
```kotlin
object EndpointTester {
    
    // Test authentication endpoints
    suspend fun testAuthEndpoints(context: Context): Map<String, EndpointTestResult> {
        val results = mutableMapOf<String, EndpointTestResult>()
        
        // Test register endpoint
        results["POST /auth/register"] = testEndpoint(
            context,
            "auth/register",
            "POST",
            mapOf("Content-Type" to "application/json")
        )
        
        // Test login endpoint
        results["POST /auth/login"] = testEndpoint(
            context,
            "auth/login",
            "POST",
            mapOf("Content-Type" to "application/json")
        )
        
        return results
    }
    
    // Test map endpoints
    suspend fun testMapEndpoints(context: Context, token: String? = null): Map<String, EndpointTestResult> {
        val results = mutableMapOf<String, EndpointTestResult>()
        val headers = if (token != null) {
            mapOf("Authorization" to "Bearer $token", "Content-Type" to "application/json")
        } else {
            mapOf("Content-Type" to "application/json")
        }
        
        // Test places list
        results["GET /map/places"] = testEndpoint(context, "map/places", "GET", headers)
        
        // Test scan QR
        results["POST /map/scan/qr"] = testEndpoint(context, "map/scan/qr", "POST", headers)
        
        return results
    }
    
    // Test individual endpoint
    private suspend fun testEndpoint(
        context: Context,
        endpoint: String,
        method: String,
        headers: Map<String, String> = emptyMap()
    ): EndpointTestResult {
        return try {
            if (!NetworkUtils.isNetworkAvailable(context)) {
                return EndpointTestResult.NO_INTERNET
            }
            
            val client = OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build()
            
            val requestBuilder = Request.Builder()
                .url("${ApiConfig.BASE_URL}$endpoint")
            
            // Add headers
            headers.forEach { (key, value) ->
                requestBuilder.addHeader(key, value)
            }
            
            // Set method
            when (method.uppercase()) {
                "GET" -> requestBuilder.get()
                "POST" -> requestBuilder.post("{}".toRequestBody("application/json".toMediaType()))
                "PUT" -> requestBuilder.put("{}".toRequestBody("application/json".toMediaType()))
                "DELETE" -> requestBuilder.delete()
            }
            
            val response = client.newCall(requestBuilder.build()).execute()
            
            when (response.code) {
                200, 201 -> EndpointTestResult.SUCCESS
                400, 422 -> EndpointTestResult.BAD_REQUEST
                401 -> EndpointTestResult.UNAUTHORIZED
                403 -> EndpointTestResult.FORBIDDEN
                404 -> EndpointTestResult.NOT_FOUND
                500 -> EndpointTestResult.SERVER_ERROR
                else -> EndpointTestResult.UNKNOWN_ERROR
            }
            
        } catch (e: Exception) {
            when (e) {
                is SocketTimeoutException -> EndpointTestResult.TIMEOUT
                is UnknownHostException -> EndpointTestResult.DNS_ERROR
                is ConnectException -> EndpointTestResult.CONNECTION_REFUSED
                else -> EndpointTestResult.UNKNOWN_ERROR
            }
        }
    }
    
    // Generate test report
    fun generateTestReport(authResults: Map<String, EndpointTestResult>, mapResults: Map<String, EndpointTestResult>): String {
        val report = StringBuilder()
        report.appendLine("🔍 ENDPOINT TEST REPORT")
        report.appendLine("Tanggal: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}")
        report.appendLine("Base URL: ${ApiConfig.BASE_URL}")
        report.appendLine()
        
        report.appendLine("🔐 AUTH ENDPOINTS:")
        authResults.forEach { (endpoint, result) ->
            val status = getResultIcon(result)
            val message = getResultMessage(result)
            report.appendLine("  $status $endpoint - $message")
        }
        
        report.appendLine()
        report.appendLine("🗺️ MAP ENDPOINTS:")
        mapResults.forEach { (endpoint, result) ->
            val status = getResultIcon(result)
            val message = getResultMessage(result)
            report.appendLine("  $status $endpoint - $message")
        }
        
        return report.toString()
    }
    
    private fun getResultIcon(result: EndpointTestResult): String {
        return when (result) {
            EndpointTestResult.SUCCESS -> "✅"
            EndpointTestResult.BAD_REQUEST -> "⚠️"
            EndpointTestResult.UNAUTHORIZED -> "🔒"
            EndpointTestResult.FORBIDDEN -> "🚫"
            EndpointTestResult.NOT_FOUND -> "❓"
            EndpointTestResult.SERVER_ERROR -> "💥"
            EndpointTestResult.TIMEOUT -> "⏰"
            EndpointTestResult.DNS_ERROR -> "🌐"
            EndpointTestResult.CONNECTION_REFUSED -> "🚪"
            EndpointTestResult.NO_INTERNET -> "📵"
            EndpointTestResult.UNKNOWN_ERROR -> "❌"
        }
    }
    
    private fun getResultMessage(result: EndpointTestResult): String {
        return when (result) {
            EndpointTestResult.SUCCESS -> "OK"
            EndpointTestResult.BAD_REQUEST -> "Bad Request"
            EndpointTestResult.UNAUTHORIZED -> "Unauthorized"
            EndpointTestResult.FORBIDDEN -> "Forbidden"
            EndpointTestResult.NOT_FOUND -> "Not Found"
            EndpointTestResult.SERVER_ERROR -> "Server Error"
            EndpointTestResult.TIMEOUT -> "Timeout"
            EndpointTestResult.DNS_ERROR -> "DNS Error"
            EndpointTestResult.CONNECTION_REFUSED -> "Connection Refused"
            EndpointTestResult.NO_INTERNET -> "No Internet"
            EndpointTestResult.UNKNOWN_ERROR -> "Unknown Error"
        }
    }
}

enum class EndpointTestResult {
    SUCCESS,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    SERVER_ERROR,
    TIMEOUT,
    DNS_ERROR,
    CONNECTION_REFUSED,
    NO_INTERNET,
    UNKNOWN_ERROR
}
```

---

## 🎯 **CARA IMPLEMENTASI DI ACTIVITY/FRAGMENT**

### **📱 PlaceListFragment.kt - Implementasi List Tempat Wisata dengan Network Monitoring**
```kotlin
class PlaceListFragment : Fragment() {
    
    private var _binding: FragmentPlaceListBinding? = null
    private val binding get() = _binding!!
    
    private lateinit var mapViewModel: MapViewModel
    private lateinit var placesAdapter: PlacesAdapter
    private lateinit var connectionMonitor: ConnectionMonitor
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPlaceListBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupViewModel()
        setupRecyclerView()
        setupConnectionMonitor()
        observeViewModel()
        setupRefreshLayout()
        setupClickListeners()
        
        // Load places on start
        loadPlacesWithRetry()
    }
    
    private fun setupViewModel() {
        val mapRepository = Injection.provideMapRepository(requireContext())
        val viewModelFactory = MapViewModelFactory.getInstance(mapRepository)
        mapViewModel = ViewModelProvider(this, viewModelFactory)[MapViewModel::class.java]
    }
    
    private fun setupRecyclerView() {
        placesAdapter = PlacesAdapter { place ->
            // Navigate to place detail
            val action = PlaceListFragmentDirections.actionToPlaceDetail(place.tourist_place_id)
            findNavController().navigate(action)
        }
        
        binding.rvPlaces.apply {
            adapter = placesAdapter
            layoutManager = LinearLayoutManager(requireContext())
            setHasFixedSize(true)
        }
    }
    
    private fun setupConnectionMonitor() {
        connectionMonitor = ConnectionMonitor(requireContext())
        
        // Monitor connection changes
        connectionMonitor.connectionState.observe(viewLifecycleOwner) { state ->
            updateConnectionStatus(state)
            
            // Auto reload ketika koneksi kembali
            if (state == ConnectionState.SERVER_CONNECTED && placesAdapter.itemCount == 0) {
                loadPlacesWithRetry()
            }
        }
        
        // Start monitoring
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            connectionMonitor.startMonitoring()
        }
    }
    
    private fun updateConnectionStatus(state: ConnectionState) {
        binding.apply {
            val message = connectionMonitor.getConnectionMessage(state)
            val color = connectionMonitor.getConnectionColor(requireContext(), state)
            
            tvConnectionStatus.text = message
            tvConnectionStatus.setTextColor(color)
            
            // Show/hide connection status
            val showStatus = state in listOf(
                ConnectionState.DISCONNECTED,
                ConnectionState.SERVER_DISCONNECTED,
                ConnectionState.CHECKING
            )
            ViewUtils.setVisibility(layoutConnectionStatus, showStatus)
        }
    }
    
    private fun loadPlacesWithRetry() {
        viewLifecycleOwner.lifecycleScope.launch {
            val result = RetryUtils.retryOnNetworkError(
                context = requireContext(),
                maxRetries = 3,
                delayMs = 2000
            ) {
                // Simulate API call result
                try {
                    mapViewModel.getPlaces()
                    // Return success placeholder - actual handling in observer
                    ApiResult.Loading
                } catch (e: Exception) {
                    ApiResult.Error(e)
                }
            }
            
            // Handle retry result
            when (result) {
                is ApiResult.Error -> {
                    ViewUtils.showErrorDialog(
                        requireContext(),
                        "Koneksi Gagal",
                        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
                    ) {
                        loadPlacesWithRetry()
                    }
                }
                else -> {
                    // Success akan ditangani oleh observer
                }
            }
        }
    }
    
    private fun observeViewModel() {
        // Observe places data dengan error handling
        mapViewModel.places.observe(viewLifecycleOwner) { result ->
            ApiResponseHandler.handleResult(
                result = when (result) {
                    is Result.Success -> ApiResult.Success(result.data)
                    is Result.Error -> ApiResult.Error(result.exception)
                },
                onSuccess = { places ->
                    ViewUtils.setVisibility(binding.progressBar, false)
                    ViewUtils.setVisibility(binding.tvEmpty, places.isEmpty())
                    placesAdapter.submitList(places)
                    
                    // Log successful API call
                    ApiResponseHandler.logApiResponse("map/places", 200, places.size)
                },
                onError = { message, code ->
                    ViewUtils.setVisibility(binding.progressBar, false)
                    
                    // Show error dengan opsi retry
                    ViewUtils.showErrorDialog(
                        requireContext(),
                        "Error ${code ?: ""}",
                        message
                    ) {
                        loadPlacesWithRetry()
                    }
                    
                    // Log failed API call
                    ApiResponseHandler.logApiResponse("map/places", code ?: 0, message)
                }
            )
        }
        
        // Observe loading state
        mapViewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            ViewUtils.setVisibility(binding.progressBar, isLoading)
            binding.swipeRefresh.isRefreshing = isLoading
        }
        
        // Observe filtered data for visited places
        mapViewModel.getVisitedPlaces().observe(viewLifecycleOwner) { visitedPlaces ->
            binding.tvVisitedCount.text = "Dikunjungi: ${visitedPlaces.size}"
        }
        
        // Observe filtered data for not visited places
        mapViewModel.getNotVisitedPlaces().observe(viewLifecycleOwner) { notVisitedPlaces ->
            binding.tvNotVisitedCount.text = "Belum dikunjungi: ${notVisitedPlaces.size}"
        }
    }
    
    private fun setupRefreshLayout() {
        binding.swipeRefresh.setOnRefreshListener {
            loadPlacesWithRetry()
        }
    }
    
    private fun setupClickListeners() {
        // Test endpoint button (untuk debugging)
        binding.btnTestEndpoints.setOnClickListener {
            testEndpoints()
        }
        
        // Retry connection button
        binding.btnRetryConnection.setOnClickListener {
            loadPlacesWithRetry()
        }
    }
    
    private fun testEndpoints() {
        viewLifecycleOwner.lifecycleScope.launch {
            ViewUtils.showToast(requireContext(), "Testing endpoints...")
            
            try {
                // Test map endpoints
                val mapResults = EndpointTester.testMapEndpoints(requireContext())
                
                // Show results
                val report = EndpointTester.generateTestReport(
                    emptyMap(), // No auth test for now
                    mapResults
                )
                
                ViewUtils.showErrorDialog(
                    requireContext(),
                    "Endpoint Test Results",
                    report
                )
                
            } catch (e: Exception) {
                ViewUtils.showToast(requireContext(), "Test failed: ${e.message}")
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        // Check connection when fragment resumes
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            connectionMonitor.startMonitoring()
        }
    }
    
    override fun onPause() {
        super.onPause()
        connectionMonitor.stopMonitoring()
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        connectionMonitor.stopMonitoring()
        _binding = null
    }
}
```

### **📱 LoginActivity.kt - Implementasi Login dengan Network Handling**
```kotlin
class LoginActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityLoginBinding
    private lateinit var authViewModel: AuthViewModel
    private lateinit var connectionMonitor: ConnectionMonitor
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupViewModel()
        setupConnectionMonitor()
        observeViewModel()
        setupClickListeners()
        
        // Check if already logged in
        checkAutoLogin()
    }
    
    private fun setupViewModel() {
        val authRepository = Injection.provideAuthRepository(this)
        val viewModelFactory = AuthViewModelFactory.getInstance(authRepository)
        authViewModel = ViewModelProvider(this, viewModelFactory)[AuthViewModel::class.java]
    }
    
    private fun setupConnectionMonitor() {
        connectionMonitor = ConnectionMonitor(this)
        
        connectionMonitor.connectionState.observe(this) { state ->
            updateConnectionUI(state)
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            connectionMonitor.startMonitoring()
        }
    }
    
    private fun updateConnectionUI(state: ConnectionState) {
        binding.apply {
            val message = connectionMonitor.getConnectionMessage(state)
            val color = connectionMonitor.getConnectionColor(this@LoginActivity, state)
            
            tvConnectionStatus.text = message
            tvConnectionStatus.setTextColor(color)
            
            // Disable login button jika tidak ada koneksi
            val isConnected = state in listOf(ConnectionState.CONNECTED, ConnectionState.SERVER_CONNECTED)
            btnLogin.isEnabled = isConnected && !authViewModel.isLoading.value!!
            
            if (!isConnected) {
                ViewUtils.showToast(this@LoginActivity, "Periksa koneksi internet Anda")
            }
        }
    }
    
    private fun checkAutoLogin() {
        lifecycleScope.launch {
            // Check endpoint health first
            val endpointStatus = NetworkUtils.checkEndpointHealth(this@LoginActivity)
            
            when (endpointStatus) {
                EndpointStatus.ONLINE -> {
                    ViewUtils.showToast(this@LoginActivity, "✅ Server terhubung")
                    authViewModel.autoLogin()
                }
                EndpointStatus.NO_INTERNET -> {
                    ViewUtils.showToast(this@LoginActivity, "❌ Tidak ada koneksi internet")
                }
                else -> {
                    ViewUtils.showToast(this@LoginActivity, NetworkUtils.getEndpointStatusMessage(endpointStatus))
                }
            }
        }
    }
    
    private fun observeViewModel() {
        // Observe login result
        authViewModel.loginResult.observe(this) { result ->
            ApiResponseHandler.handleResult(
                result = when (result) {
                    is Result.Success -> ApiResult.Success(result.data)
                    is Result.Error -> ApiResult.Error(result.exception)
                },
                onSuccess = { response ->
                    ViewUtils.showToast(this, "Login berhasil!")
                    
                    // Navigate to main activity
                    val intent = Intent(this, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                    
                    // Log successful login
                    ApiResponseHandler.logApiResponse("auth/login", 200, "Login success")
                },
                onError = { message, code ->
                    ViewUtils.showErrorDialog(
                        this,
                        "Login Gagal",
                        message
                    ) {
                        // Retry option
                        if (code in listOf(500, 502, 503, 504)) {
                            performLogin()
                        }
                    }
                    
                    // Log failed login
                    ApiResponseHandler.logApiResponse("auth/login", code ?: 0, message)
                }
            )
        }
        
        // Observe auto login result
        authViewModel.autoLoginResult.observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    ViewUtils.showToast(this, "Auto login berhasil")
                    
                    val intent = Intent(this, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
                is Result.Error -> {
                    // Auto login gagal, user harus login manual
                    ViewUtils.showToast(this, "Silakan login kembali")
                }
            }
        }
        
        // Observe loading state
        authViewModel.isLoading.observe(this) { isLoading ->
            binding.apply {
                btnLogin.isEnabled = !isLoading && NetworkUtils.isNetworkAvailable(this@LoginActivity)
                progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
                
                if (isLoading) {
                    btnLogin.text = "Logging in..."
                } else {
                    btnLogin.text = "Login"
                }
            }
        }
    }
    
    private fun setupClickListeners() {
        binding.apply {
            btnLogin.setOnClickListener {
                performLogin()
            }
            
            tvRegister.setOnClickListener {
                startActivity(Intent(this@LoginActivity, RegisterActivity::class.java))
            }
            
            btnTestConnection.setOnClickListener {
                testConnection()
            }
        }
    }
    
    private fun performLogin() {
        binding.apply {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()
            
            // Validate input
            val validationError = ValidationUtils.validateLoginInput(email, password)
            if (validationError != null) {
                ViewUtils.showToast(this@LoginActivity, validationError)
                return
            }
            
            // Check network before login
            if (!NetworkUtils.isNetworkAvailable(this@LoginActivity)) {
                ViewUtils.showToast(this@LoginActivity, "Tidak ada koneksi internet")
                return
            }
            
            // Log API call
            ApiResponseHandler.logApiCall("auth/login", "POST", mapOf("email" to email))
            
            // Perform login with retry
            lifecycleScope.launch {
                val result = RetryUtils.retryWithExponentialBackoff(
                    maxRetries = 3,
                    initialDelayMs = 1000
                ) {
                    try {
                        authViewModel.login(email, password)
                        ApiResult.Loading // Actual result will be observed
                    } catch (e: Exception) {
                        ApiResult.Error(e)
                    }
                }
                
                when (result) {
                    is ApiResult.Error -> {
                        if (RetryUtils.isRetryableError(result.exception)) {
                            ViewUtils.showErrorDialog(
                                this@LoginActivity,
                                "Koneksi Bermasalah",
                                "Tidak dapat terhubung ke server. Coba lagi nanti."
                            )
                        }
                    }
                    else -> {
                        // Success handled by observer
                    }
                }
            }
        }
    }
    
    private fun testConnection() {
        lifecycleScope.launch {
            binding.progressBar.visibility = View.VISIBLE
            
            try {
                // Test auth endpoints
                val authResults = EndpointTester.testAuthEndpoints(this@LoginActivity)
                
                // Generate and show report
                val report = EndpointTester.generateTestReport(authResults, emptyMap())
                
                ViewUtils.showErrorDialog(
                    this@LoginActivity,
                    "Connection Test Results",
                    report
                )
                
            } catch (e: Exception) {
                ViewUtils.showToast(this@LoginActivity, "Test failed: ${e.message}")
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        connectionMonitor.stopMonitoring()
    }
}
```
```

### **📱 PlaceDetailActivity.kt - Implementasi Detail Tempat Wisata**
```kotlin
class PlaceDetailActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityPlaceDetailBinding
    private lateinit var mapViewModel: MapViewModel
    private lateinit var reviewsAdapter: ReviewsAdapter
    
    private var placeId: String = ""
    private var currentPlace: PlaceDetail? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPlaceDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        placeId = intent.getStringExtra(EXTRA_PLACE_ID) ?: return
        
        setupViewModel()
        setupRecyclerView()
        observeViewModel()
        setupClickListeners()
        
        // Load place detail and reviews
        mapViewModel.getPlaceDetail(placeId)
        mapViewModel.getPlaceReviews(placeId)
    }
    
    private fun setupViewModel() {
        val mapRepository = Injection.provideMapRepository(this)
        val viewModelFactory = MapViewModelFactory.getInstance(mapRepository)
        mapViewModel = ViewModelProvider(this, viewModelFactory)[MapViewModel::class.java]
    }
    
    private fun setupRecyclerView() {
        reviewsAdapter = ReviewsAdapter(
            onLikeClick = { review ->
                mapViewModel.toggleReviewLike(review.review_id)
            }
        )
        
        binding.rvReviews.apply {
            adapter = reviewsAdapter
            layoutManager = LinearLayoutManager(this@PlaceDetailActivity)
            setHasFixedSize(true)
        }
    }
    
    private fun observeViewModel() {
        // Observe place detail
        mapViewModel.placeDetail.observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    currentPlace = result.data
                    bindPlaceDetail(result.data)
                }
                is Result.Error -> {
                    ViewUtils.showErrorDialog(
                        this,
                        "Error",
                        result.exception.message ?: "Gagal memuat detail tempat"
                    )
                }
            }
        }
        
        // Observe reviews
        mapViewModel.reviews.observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    bindReviews(result.data)
                }
                is Result.Error -> {
                    ViewUtils.showToast(this, "Gagal memuat review")
                }
            }
        }
        
        // Observe scan result
        mapViewModel.scanResult.observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    ViewUtils.showToast(this, result.data.message)
                    // Refresh place detail to update visit status
                    mapViewModel.getPlaceDetail(placeId)
                }
                is Result.Error -> {
                    ViewUtils.showErrorDialog(
                        this,
                        "Scan Gagal",
                        result.exception.message ?: "QR Code tidak valid"
                    )
                }
            }
        }
        
        // Observe toggle like result
        mapViewModel.toggleLikeResult.observe(this) { result ->
            when (result) {
                is Result.Success -> {
                    // Refresh reviews to update like status
                    mapViewModel.getPlaceReviews(placeId)
                }
                is Result.Error -> {
                    ViewUtils.showToast(this, "Gagal mengubah status like")
                }
            }
        }
        
        // Observe loading state
        mapViewModel.isLoading.observe(this) { isLoading ->
            ViewUtils.setVisibility(binding.progressBar, isLoading)
        }
    }
    
    private fun bindPlaceDetail(place: PlaceDetail) {
        binding.apply {
            tvPlaceName.text = place.name
            tvPlaceDescription.text = place.description
            tvPlaceAddress.text = place.address
            tvRating.text = RatingUtils.formatRating(place.average_rating)
            tvRatingText.text = RatingUtils.getRatingText(place.average_rating)
            
            // Load place image
            ImageUtils.loadImageWithGlide(
                this@PlaceDetailActivity,
                place.image_url,
                ivPlaceImage
            )
            
            // Update visit status
            if (place.is_visited) {
                tvVisitStatus.text = "✅ Sudah dikunjungi"
                tvVisitDate.text = "Dikunjungi: ${DateUtils.formatDateOnly(place.visited_at)}"
                btnScanQR.text = "Sudah Dikunjungi"
                btnScanQR.isEnabled = false
            } else {
                tvVisitStatus.text = "📍 Belum dikunjungi"
                tvVisitDate.text = ""
                btnScanQR.text = "Scan QR Code"
                btnScanQR.isEnabled = true
            }
        }
    }
    
    private fun bindReviews(reviewsData: ReviewsData) {
        binding.apply {
            tvReviewsCount.text = "Review (${reviewsData.other_reviews.size})"
            
            // Show user review if exists
            if (reviewsData.user_review != null) {
                ViewUtils.setVisibility(layoutUserReview, true)
                bindUserReview(reviewsData.user_review)
            } else {
                ViewUtils.setVisibility(layoutUserReview, false)
            }
            
            // Show other reviews
            reviewsAdapter.submitList(reviewsData.other_reviews)
            ViewUtils.setVisibility(tvNoReviews, reviewsData.other_reviews.isEmpty())
        }
    }
    
    private fun bindUserReview(review: Review) {
        binding.apply {
            tvUserReviewRating.text = "⭐ ${review.rating}"
            tvUserReviewText.text = review.review_text
            tvUserReviewDate.text = DateUtils.formatTimestamp(review.created_at)
        }
    }
    
    private fun setupClickListeners() {
        binding.apply {
            btnScanQR.setOnClickListener {
                if (currentPlace?.is_scan_enabled == true) {
                    // Launch QR Scanner
                    val intent = Intent(this@PlaceDetailActivity, QRScannerActivity::class.java)
                    intent.putExtra(QRScannerActivity.EXTRA_PLACE_ID, placeId)
                    startActivity(intent)
                }
            }
            
            btnAddReview.setOnClickListener {
                if (currentPlace?.is_visited == true) {
                    // Launch Add Review Activity
                    val intent = Intent(this@PlaceDetailActivity, AddReviewActivity::class.java)
                    intent.putExtra(AddReviewActivity.EXTRA_PLACE_ID, placeId)
                    startActivity(intent)
                } else {
                    ViewUtils.showToast(this@PlaceDetailActivity, "Kunjungi tempat ini terlebih dahulu untuk memberikan review")
                }
            }
        }
    }
    
    companion object {
        const val EXTRA_PLACE_ID = "extra_place_id"
    }
}
```

---

## 💉 **DEPENDENCY INJECTION UPDATE**

### **💉 Injection.kt - Updated dengan Repository Terpisah & Network Utils**
```kotlin
object Injection {
    
    fun provideAuthRepository(context: Context): AuthRepository {
        val apiService = provideApiService()
        val userPreference = provideUserPreference(context)
        return AuthRepository.getInstance(apiService, userPreference)
    }
    
    fun provideMapRepository(context: Context): MapRepository {
        val apiService = provideApiService()
        val userPreference = provideUserPreference(context)
        return MapRepository.getInstance(apiService, userPreference)
    }
    
    fun provideConnectionMonitor(context: Context): ConnectionMonitor {
        return ConnectionMonitor(context)
    }
    
    private fun provideApiService(): ApiService {
        val retrofit = Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(provideOkHttpClient())
            .build()
        return retrofit.create(ApiService::class.java)
    }
    
    private fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            .addInterceptor(provideNetworkInterceptor())
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }
    
    private fun provideNetworkInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            
            // Log request
            ApiResponseHandler.logApiCall(
                request.url.encodedPath,
                request.method,
                request.body
            )
            
            try {
                val response = chain.proceed(request)
                
                // Log response
                ApiResponseHandler.logApiResponse(
                    request.url.encodedPath,
                    response.code,
                    response.body
                )
                
                response
            } catch (e: Exception) {
                // Log network error
                Log.e("NETWORK_ERROR", "Request failed: ${request.url}", e)
                throw e
            }
        }
    }
    
    private fun provideUserPreference(context: Context): UserPreference {
        val dataStore = context.dataStore
        return UserPreference.getInstance(dataStore)
    }
}
```

### **🔧 Extended ApiService.kt - Dengan Health Check Endpoint**
```kotlin
interface ApiService {
    // Health check endpoint
    @GET("health")
    suspend fun healthCheck(): Response<HealthResponse>
    
    @GET("status")
    suspend fun getServerStatus(): Response<ServerStatusResponse>
    
    // Auth Endpoints
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
    
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @GET("auth/profile")
    suspend fun getUserProfile(@Header("Authorization") token: String): Response<ProfileResponse>
    
    @GET("auth/auto-login")
    suspend fun autoLogin(@Header("Authorization") databaseToken: String): Response<LoginResponse>
    
    // Map Endpoints
    @GET("map/places")
    suspend fun getPlaces(@Header("Authorization") token: String): Response<PlacesResponse>
    
    @GET("map/places/{id}")
    suspend fun getPlaceDetail(
        @Header("Authorization") token: String,
        @Path("id") placeId: String
    ): Response<PlaceDetailResponse>
    
    @POST("map/scan/qr")
    suspend fun scanQRCode(
        @Header("Authorization") token: String,
        @Body request: ScanQRRequest
    ): Response<ScanQRResponse>
    
    @GET("map/places/{id}/reviews")
    suspend fun getPlaceReviews(
        @Header("Authorization") token: String,
        @Path("id") placeId: String,
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): Response<ReviewsResponse>
    
    @POST("map/places/{id}/reviews")
    suspend fun addReview(
        @Header("Authorization") token: String,
        @Path("id") placeId: String,
        @Body request: AddReviewRequest
    ): Response<AddReviewResponse>
    
    @POST("map/reviews/{id}/toggle-like")
    suspend fun toggleReviewLike(
        @Header("Authorization") token: String,
        @Path("id") reviewId: String
    ): Response<ToggleLikeResponse>
}

// Health check models
data class HealthResponse(
    val status: String,
    val message: String,
    val timestamp: String,
    val version: String
)

data class ServerStatusResponse(
    val success: Boolean,
    val data: ServerStatus
)

data class ServerStatus(
    val database_connected: Boolean,
    val total_endpoints: Int,
    val server_uptime: String,
    val memory_usage: String,
    val active_connections: Int
)
```

### **⚡ Enhanced NetworkUtils.kt - Dengan Detailed Health Check**
```kotlin
object NetworkUtils {
    
    // ... previous methods ...
    
    // Enhanced health check dengan detail server status
    suspend fun getDetailedServerStatus(context: Context): ServerHealthStatus {
        return try {
            if (!isNetworkAvailable(context)) {
                return ServerHealthStatus.NO_INTERNET
            }
            
            val apiService = Injection.provideApiService()
            
            // Check basic health
            val healthResponse = withTimeoutOrNull(10000) {
                apiService.healthCheck()
            }
            
            if (healthResponse?.isSuccessful == true) {
                // Get detailed status
                val statusResponse = withTimeoutOrNull(5000) {
                    apiService.getServerStatus()
                }
                
                if (statusResponse?.isSuccessful == true) {
                    val serverStatus = statusResponse.body()?.data
                    return if (serverStatus?.database_connected == true) {
                        ServerHealthStatus.FULLY_OPERATIONAL
                    } else {
                        ServerHealthStatus.DATABASE_ERROR
                    }
                } else {
                    return ServerHealthStatus.PARTIAL_OPERATIONAL
                }
            } else {
                return ServerHealthStatus.SERVER_DOWN
            }
            
        } catch (e: Exception) {
            when (e) {
                is SocketTimeoutException -> ServerHealthStatus.TIMEOUT
                is UnknownHostException -> ServerHealthStatus.DNS_ERROR
                is ConnectException -> ServerHealthStatus.CONNECTION_REFUSED
                else -> ServerHealthStatus.UNKNOWN_ERROR
            }
        }
    }
    
    // Get comprehensive error message
    fun getComprehensiveErrorMessage(status: ServerHealthStatus): String {
        return when (status) {
            ServerHealthStatus.FULLY_OPERATIONAL -> "✅ Server berjalan normal"
            ServerHealthStatus.PARTIAL_OPERATIONAL -> "⚠️ Server online, beberapa fitur mungkin bermasalah"
            ServerHealthStatus.DATABASE_ERROR -> "💾 Server online, database bermasalah"
            ServerHealthStatus.SERVER_DOWN -> "🔴 Server sedang offline"
            ServerHealthStatus.NO_INTERNET -> "📵 Tidak ada koneksi internet"
            ServerHealthStatus.TIMEOUT -> "⏰ Koneksi ke server timeout"
            ServerHealthStatus.DNS_ERROR -> "🌐 Tidak dapat menemukan server"
            ServerHealthStatus.CONNECTION_REFUSED -> "🚫 Server menolak koneksi"
            ServerHealthStatus.UNKNOWN_ERROR -> "❓ Terjadi kesalahan yang tidak diketahui"
        }
    }
    
    // Test specific endpoint dengan detailed response
    suspend fun testSpecificEndpoint(
        endpoint: String, 
        method: HttpMethod = HttpMethod.GET,
        headers: Map<String, String> = emptyMap(),
        body: String? = null
    ): EndpointTestDetailResult {
        return try {
            val client = OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build()
            
            val requestBuilder = Request.Builder()
                .url("${ApiConfig.BASE_URL}$endpoint")
            
            // Add headers
            headers.forEach { (key, value) ->
                requestBuilder.addHeader(key, value)
            }
            
            // Set method and body
            val requestBody = if (body != null) {
                body.toRequestBody("application/json".toMediaType())
            } else {
                "".toRequestBody("application/json".toMediaType())
            }
            
            when (method) {
                HttpMethod.GET -> requestBuilder.get()
                HttpMethod.POST -> requestBuilder.post(requestBody)
                HttpMethod.PUT -> requestBuilder.put(requestBody)
                HttpMethod.DELETE -> requestBuilder.delete(requestBody)
            }
            
            val startTime = System.currentTimeMillis()
            val response = client.newCall(requestBuilder.build()).execute()
            val endTime = System.currentTimeMillis()
            val responseTime = endTime - startTime
            
            val responseBody = response.body?.string() ?: ""
            
            EndpointTestDetailResult(
                success = response.isSuccessful,
                httpCode = response.code,
                responseTime = responseTime,
                responseBody = responseBody,
                error = null
            )
            
        } catch (e: Exception) {
            EndpointTestDetailResult(
                success = false,
                httpCode = null,
                responseTime = null,
                responseBody = null,
                error = e.message ?: "Unknown error"
            )
        }
    }
}

enum class ServerHealthStatus {
    FULLY_OPERATIONAL,
    PARTIAL_OPERATIONAL,
    DATABASE_ERROR,
    SERVER_DOWN,
    NO_INTERNET,
    TIMEOUT,
    DNS_ERROR,
    CONNECTION_REFUSED,
    UNKNOWN_ERROR
}

enum class HttpMethod {
    GET, POST, PUT, DELETE
}

data class EndpointTestDetailResult(
    val success: Boolean,
    val httpCode: Int?,
    val responseTime: Long?,
    val responseBody: String?,
    val error: String?
)
```

---

## 🎯 **IMPLEMENTASI NETWORK TESTING ACTIVITY**

### **🧪 NetworkTestActivity.kt - Activity untuk Test Koneksi**
```kotlin
class NetworkTestActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityNetworkTestBinding
    private lateinit var testResultsAdapter: TestResultsAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNetworkTestBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupRecyclerView()
        setupClickListeners()
        
        // Run initial test
        runBasicConnectivityTest()
    }
    
    private fun setupRecyclerView() {
        testResultsAdapter = TestResultsAdapter()
        binding.rvTestResults.apply {
            adapter = testResultsAdapter
            layoutManager = LinearLayoutManager(this@NetworkTestActivity)
        }
    }
    
    private fun setupClickListeners() {
        binding.apply {
            btnTestBasic.setOnClickListener { runBasicConnectivityTest() }
            btnTestEndpoints.setOnClickListener { runEndpointTests() }
            btnTestAuth.setOnClickListener { runAuthTests() }
            btnTestMap.setOnClickListener { runMapTests() }
            btnTestAll.setOnClickListener { runAllTests() }
            btnClearResults.setOnClickListener { clearResults() }
        }
    }
    
    private fun runBasicConnectivityTest() {
        lifecycleScope.launch {
            showLoading("Testing basic connectivity...")
            
            val results = mutableListOf<TestResult>()
            
            // Internet connection test
            val hasInternet = NetworkUtils.isNetworkAvailable(this@NetworkTestActivity)
            results.add(TestResult(
                testName = "Internet Connection",
                success = hasInternet,
                message = if (hasInternet) "Connected" else "No internet",
                responseTime = null
            ))
            
            if (hasInternet) {
                // DNS resolution test
                try {
                    val startTime = System.currentTimeMillis()
                    InetAddress.getByName(Uri.parse(ApiConfig.BASE_URL).host)
                    val endTime = System.currentTimeMillis()
                    
                    results.add(TestResult(
                        testName = "DNS Resolution",
                        success = true,
                        message = "DNS resolved successfully",
                        responseTime = endTime - startTime
                    ))
                } catch (e: Exception) {
                    results.add(TestResult(
                        testName = "DNS Resolution",
                        success = false,
                        message = "DNS resolution failed: ${e.message}",
                        responseTime = null
                    ))
                }
                
                // Server health check
                val healthStatus = NetworkUtils.getDetailedServerStatus(this@NetworkTestActivity)
                results.add(TestResult(
                    testName = "Server Health",
                    success = healthStatus == ServerHealthStatus.FULLY_OPERATIONAL,
                    message = NetworkUtils.getComprehensiveErrorMessage(healthStatus),
                    responseTime = null
                ))
            }
            
            hideLoading()
            testResultsAdapter.addResults(results)
            updateSummary()
        }
    }
    
    private fun runEndpointTests() {
        lifecycleScope.launch {
            showLoading("Testing API endpoints...")
            
            val results = mutableListOf<TestResult>()
            val endpoints = listOf(
                "health" to HttpMethod.GET,
                "status" to HttpMethod.GET,
                "auth/register" to HttpMethod.POST,
                "auth/login" to HttpMethod.POST,
                "map/places" to HttpMethod.GET
            )
            
            endpoints.forEach { (endpoint, method) ->
                val testResult = NetworkUtils.testSpecificEndpoint(
                    endpoint = endpoint,
                    method = method,
                    headers = if (endpoint.startsWith("map/")) {
                        mapOf("Authorization" to "Bearer dummy-token")
                    } else {
                        emptyMap()
                    }
                )
                
                results.add(TestResult(
                    testName = "${method.name} /$endpoint",
                    success = testResult.success || (testResult.httpCode in 400..499), // 4xx is expected for some
                    message = "HTTP ${testResult.httpCode ?: "Error"}: ${testResult.error ?: "OK"}",
                    responseTime = testResult.responseTime
                ))
            }
            
            hideLoading()
            testResultsAdapter.addResults(results)
            updateSummary()
        }
    }
    
    private fun runAuthTests() {
        lifecycleScope.launch {
            showLoading("Testing authentication endpoints...")
            
            val authResults = EndpointTester.testAuthEndpoints(this@NetworkTestActivity)
            val results = authResults.map { (endpoint, result) ->
                TestResult(
                    testName = endpoint,
                    success = result == EndpointTestResult.SUCCESS || result == EndpointTestResult.BAD_REQUEST,
                    message = EndpointTester.getResultMessage(result),
                    responseTime = null
                )
            }
            
            hideLoading()
            testResultsAdapter.addResults(results)
            updateSummary()
        }
    }
    
    private fun runMapTests() {
        lifecycleScope.launch {
            showLoading("Testing map endpoints...")
            
            val mapResults = EndpointTester.testMapEndpoints(this@NetworkTestActivity)
            val results = mapResults.map { (endpoint, result) ->
                TestResult(
                    testName = endpoint,
                    success = result == EndpointTestResult.SUCCESS || result == EndpointTestResult.UNAUTHORIZED,
                    message = EndpointTester.getResultMessage(result),
                    responseTime = null
                )
            }
            
            hideLoading()
            testResultsAdapter.addResults(results)
            updateSummary()
        }
    }
    
    private fun runAllTests() {
        lifecycleScope.launch {
            showLoading("Running comprehensive tests...")
            
            runBasicConnectivityTest()
            delay(1000)
            runEndpointTests()
            delay(1000)
            runAuthTests()
            delay(1000)
            runMapTests()
            
            hideLoading()
            ViewUtils.showToast(this@NetworkTestActivity, "All tests completed")
        }
    }
    
    private fun clearResults() {
        testResultsAdapter.clearResults()
        updateSummary()
    }
    
    private fun showLoading(message: String) {
        binding.apply {
            progressBar.visibility = View.VISIBLE
            tvLoadingMessage.text = message
            tvLoadingMessage.visibility = View.VISIBLE
        }
    }
    
    private fun hideLoading() {
        binding.apply {
            progressBar.visibility = View.GONE
            tvLoadingMessage.visibility = View.GONE
        }
    }
    
    private fun updateSummary() {
        val results = testResultsAdapter.getAllResults()
        val totalTests = results.size
        val passedTests = results.count { it.success }
        val failedTests = totalTests - passedTests
        
        binding.apply {
            tvTotalTests.text = "Total: $totalTests"
            tvPassedTests.text = "Passed: $passedTests"
            tvFailedTests.text = "Failed: $failedTests"
            
            val successRate = if (totalTests > 0) (passedTests * 100) / totalTests else 0
            tvSuccessRate.text = "Success Rate: $successRate%"
            
            progressSuccess.progress = successRate
        }
    }
}

data class TestResult(
    val testName: String,
    val success: Boolean,
    val message: String,
    val responseTime: Long?
)
```

---

## 📊 **SUMMARY INTEGRASI NETWORK MONITORING**

### **✅ Network Utils yang Ditambahkan:**
1. **NetworkUtils.kt** - Cek koneksi internet, parse error API, health check endpoint
2. **ApiResponseHandler.kt** - Handle response dengan proper error parsing dan logging  
3. **RetryUtils.kt** - Retry logic dengan exponential backoff untuk network error
4. **ConnectionMonitor.kt** - Real-time monitoring koneksi internet dan server status
5. **EndpointTester.kt** - Test individual endpoints dan generate comprehensive report

### **🎯 Fitur Network Monitoring:**
- **Real-time Connection Status** - Monitor koneksi internet dan server secara real-time
- **Automatic Retry** - Retry otomatis untuk network error dengan intelligent backoff
- **Endpoint Health Check** - Test kesehatan semua endpoint secara individual
- **Comprehensive Error Handling** - Parse error response dari backend dengan detail
- **Network Test Activity** - UI untuk test koneksi dan debug network issues

### **📱 Integration di Activities:**
- **PlaceListFragment** - Dengan network monitoring dan auto-retry
- **LoginActivity** - Dengan connection status dan endpoint testing
- **NetworkTestActivity** - Dedicated activity untuk comprehensive network testing

### **🔧 Enhanced Features:**
- **Auto-reload** ketika koneksi kembali normal
- **Visual indicators** untuk status koneksi (warna, icon)
- **Detailed error messages** dalam bahasa Indonesia
- **Response time monitoring** untuk performance tracking
- **Comprehensive test reports** untuk debugging

**✅ Sekarang frontend memiliki monitoring lengkap untuk integrasi backend!** 🚀

Dengan utils ini, tim Anda bisa dengan mudah:
- Monitor apakah backend endpoint berhasil diakses atau error
- Mendapat detail error yang spesifik dan actionable
- Auto-retry untuk mengatasi network error sementara  
- Test semua endpoint secara individual untuk debugging
- Monitor real-time connection status untuk UX yang better
```

---

## 📊 **SUMMARY INTEGRASI & IMPLEMENTATION**

### **✅ Backend Files:**
- **Controllers:** `authController.js`, `detailMapController.js`, `reviewMapController.js`, `scanMapController.js`
- **Models:** `authModel.js`, `detailMapModel.js`, `reviewMapModel.js`, `scanMapModel.js`
- **Utils:** `customIdGenerator.js`, `responseHelper.js`, `logsGenerator.js`, `urlConfig.js`
- **Middleware:** `token.js` (authenticateTokenFromDB)
- **Database:** `database.js` dengan query function

### **📱 Frontend Files (SEPARATED REPOSITORIES):**
- **Config:** `ApiConfig.kt` (DevTunnel URL), `ApiService.kt` (Retrofit interface)
- **Data Models:** Sesuai struktur database `sako.sql` dengan mapping yang tepat
- **Repositories:** `AuthRepository.kt` (auth operations), `MapRepository.kt` (map operations)
- **ViewModels:** `AuthViewModel.kt`, `MapViewModel.kt` dengan Factory masing-masing
- **Storage:** `UserPreference.kt` (Local storage), `UserModel.kt` (User data model)
- **Utils:** `DateUtils.kt`, `ImageUtils.kt`, `RatingUtils.kt`, `ViewUtils.kt`, `ValidationUtils.kt`
- **DI:** `Injection.kt` (Dependency injection dengan repository terpisah)

### **🔗 Connection Flow:**
1. **Android App** → `ApiService` → **DevTunnel** → **NodeJS Backend**
2. **Authentication**: JWT + Database Token (30 hari auto-login)
3. **Data Flow**: Repository Pattern → API → Controller → Model → Database
4. **Response**: JSON → Retrofit → Repository → ViewModel → UI

### **🎯 Implementation Guidelines:**
1. **Repository Separation**: AuthRepository dan MapRepository terpisah untuk menghindari redundansi
2. **Data Models**: Sesuai 100% dengan struktur database `sako.sql`
3. **ViewModel Pattern**: Menggunakan ViewModel + Factory untuk state management
4. **Utils Integration**: Helper functions untuk Date, Image, Rating, View, Validation
5. **Error Handling**: Comprehensive error handling di setiap layer
6. **UI Patterns**: Fragment/Activity dengan proper lifecycle management

**✅ Total: 35 Endpoints Ready dengan Architecture Pattern yang Robust!** 🚀

### **💾 UserPreference.kt - Local Storage**
```kotlin
class UserPreference private constructor(private val dataStore: DataStore<Preferences>) {
    
    suspend fun saveSession(user: UserModel) {
        dataStore.edit { preferences ->
            preferences[USER_ID_KEY] = user.userId
            preferences[NAME_KEY] = user.name
            preferences[EMAIL_KEY] = user.email
            preferences[TOKEN_KEY] = user.token
            preferences[DB_TOKEN_KEY] = user.databaseToken
            preferences[IS_LOGIN_KEY] = true
        }
    }
    
    fun getSession(): Flow<UserModel> {
        return dataStore.data.map { preferences ->
            UserModel(
                userId = preferences[USER_ID_KEY] ?: "",
                name = preferences[NAME_KEY] ?: "",
                email = preferences[EMAIL_KEY] ?: "",
                token = preferences[TOKEN_KEY] ?: "",
                databaseToken = preferences[DB_TOKEN_KEY] ?: "",
                isLogin = preferences[IS_LOGIN_KEY] ?: false
            )
        }
    }
    
    suspend fun logout() {
        dataStore.edit { preferences ->
            preferences.clear()
        }
    }
    
    companion object {
        @Volatile
        private var INSTANCE: UserPreference? = null
        
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val NAME_KEY = stringPreferencesKey("name")
        private val EMAIL_KEY = stringPreferencesKey("email")
        private val TOKEN_KEY = stringPreferencesKey("token")
        private val DB_TOKEN_KEY = stringPreferencesKey("database_token")
        private val IS_LOGIN_KEY = booleanPreferencesKey("is_login")
        
        fun getInstance(dataStore: DataStore<Preferences>): UserPreference {
            return INSTANCE ?: synchronized(this) {
                val instance = UserPreference(dataStore)
                INSTANCE = instance
                instance
            }
        }
    }
}
```

---

## 📊 **SUMMARY INTEGRASI**

### **✅ Backend Files:**
- **Controllers:** `authController.js`, `detailMapController.js`, `reviewMapController.js`, `scanMapController.js`
- **Models:** `authModel.js`, `detailMapModel.js`, `reviewMapModel.js`, `scanMapModel.js`
- **Utils:** `customIdGenerator.js`, `responseHelper.js`, `logsGenerator.js`, `urlConfig.js`
- **Middleware:** `token.js` (authenticateTokenFromDB)
- **Database:** `database.js` dengan query function

### **📱 Frontend Files:**
- **Config:** `ApiConfig.kt` (DevTunnel URL), `ApiService.kt` (Retrofit interface)
- **Data Models:** `AuthRequest.kt`, `AuthResponse.kt`, `MapRequest.kt`, `MapResponse.kt`
- **Repository:** `SakoRepository.kt` (Data management)
- **Storage:** `UserPreference.kt` (Local storage), `UserModel.kt` (User data model)
- **DI:** `Injection.kt` (Dependency injection)

### **🔗 Connection Flow:**
1. **Android App** → `ApiService` → **DevTunnel** → **NodeJS Backend**
2. **Authentication**: JWT + Database Token (30 hari auto-login)
3. **Data Flow**: Repository Pattern → API → Controller → Model → Database
4. **Response**: JSON → Retrofit → Repository → UI

**✅ Total: 35 Endpoints Ready untuk Android Integration!** 🚀