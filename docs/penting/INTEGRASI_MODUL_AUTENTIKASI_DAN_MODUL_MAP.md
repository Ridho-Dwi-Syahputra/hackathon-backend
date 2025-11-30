# INTEGRASI MODUL AUTENTIKASI DAN MODUL MAP
## Dokumentasi Integrasi Android Kotlin dengan Backend Node.js

### 📋 OVERVIEW ARSITEKTUR
```
Android Kotlin (Jetpack Compose) ←→ Retrofit API ←→ Node.js Express (MVC) ←→ MySQL Database
                ↓                                      ↓
        Firebase FCM Client                    Firebase Admin SDK
```

---

## 🔐 MODUL AUTENTIKASI

### 📡 ENDPOINT BACKEND YANG TERSEDIA

| Method | Endpoint | Auth Required | Deskripsi |
|--------|----------|---------------|-----------|
| POST | `/api/auth/register` | ❌ | Registrasi user baru |
| POST | `/api/auth/login` | ❌ | Login user |
| POST | `/api/auth/logout` | ✅ | Logout user |
| GET | `/api/auth/profile` | ✅ | Get profile user |
| PUT | `/api/auth/fcm-token` | ✅ | Update FCM token |
| PUT | `/api/auth/notification-preferences` | ✅ | Update preferensi notifikasi |
| GET | `/api/auth/notification-preferences` | ✅ | Get preferensi notifikasi |

### 📄 REQUEST & RESPONSE STRUCTURES

#### 1. REGISTER
**Request:** `POST /api/auth/register`
```json
{
  "users_id": "USR001",
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "phone_number": "081234567890",
  "fcm_token": "fcm_token_from_firebase"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User berhasil didaftarkan",
  "data": {
    "users_id": "USR001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "081234567890",
    "profile_image": null,
    "is_verified": false,
    "fcm_token": "fcm_token_from_firebase"
  }
}
```

#### 2. LOGIN
**Request:** `POST /api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123",
  "fcm_token": "updated_fcm_token"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "users_id": "USR001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "081234567890",
      "profile_image": null,
      "is_verified": true
    },
    "token": "jwt_token_here"
  }
}
```

#### 3. UPDATE FCM TOKEN
**Request:** `PUT /api/auth/fcm-token`
```json
{
  "fcm_token": "new_fcm_token_from_firebase"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "FCM token berhasil diperbarui"
}
```

### 🔧 ANDROID KOTLIN IMPLEMENTATION

#### 📁 data/remote/request/AuthRequest.kt
```kotlin
package com.sako.app.data.remote.request
import com.google.gson.annotations.SerializedName

data class RegisterRequest(
    @SerializedName("users_id") val usersId: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("phone_number") val phoneNumber: String,
    @SerializedName("fcm_token") val fcmToken: String
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("fcm_token") val fcmToken: String
)

data class UpdateFcmTokenRequest(
    @SerializedName("fcm_token") val fcmToken: String
)

data class NotificationPreferencesRequest(
    @SerializedName("map_notifications") val mapNotifications: Boolean = true,
    @SerializedName("quiz_notifications") val quizNotifications: Boolean = true,
    @SerializedName("system_notifications") val systemNotifications: Boolean = true
)
```

#### 📁 data/remote/response/AuthResponse.kt
```kotlin
package com.sako.app.data.remote.response
import com.google.gson.annotations.SerializedName

data class BaseResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: T? = null
)

data class UserData(
    @SerializedName("users_id") val usersId: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("phone_number") val phoneNumber: String,
    @SerializedName("profile_image") val profileImage: String?,
    @SerializedName("is_verified") val isVerified: Boolean
)

data class LoginData(
    @SerializedName("user") val user: UserData,
    @SerializedName("token") val token: String
)

data class NotificationPreferencesData(
    @SerializedName("map_notifications") val mapNotifications: Boolean,
    @SerializedName("quiz_notifications") val quizNotifications: Boolean,
    @SerializedName("system_notifications") val systemNotifications: Boolean
)
```

#### 📁 data/remote/ApiService.kt
```kotlin
package com.sako.app.data.remote
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // ====== AUTH ENDPOINTS ======
    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<BaseResponse<UserData>>
    
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<BaseResponse<LoginData>>
    
    @POST("auth/logout")
    suspend fun logout(
        @Header("Authorization") token: String
    ): Response<BaseResponse<Any>>
    
    @GET("auth/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<BaseResponse<UserData>>
    
    @PUT("auth/fcm-token")
    suspend fun updateFcmToken(
        @Header("Authorization") token: String,
        @Body request: UpdateFcmTokenRequest
    ): Response<BaseResponse<Any>>
    
    @PUT("auth/notification-preferences")
    suspend fun updateNotificationPreferences(
        @Header("Authorization") token: String,
        @Body request: NotificationPreferencesRequest
    ): Response<BaseResponse<Any>>
    
    @GET("auth/notification-preferences")
    suspend fun getNotificationPreferences(
        @Header("Authorization") token: String
    ): Response<BaseResponse<NotificationPreferencesData>>
}
```

#### 📁 repository/AuthRepository.kt
```kotlin
package com.sako.app.repository
import com.sako.app.data.remote.ApiService
import com.sako.app.utils.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun register(request: RegisterRequest): NetworkResult<UserData> {
        return try {
            val response = apiService.register(request)
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(response.body()?.data!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Registration failed")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun login(request: LoginRequest): NetworkResult<LoginData> {
        return try {
            val response = apiService.login(request)
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(response.body()?.data!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Login failed")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun updateFcmToken(token: String, fcmToken: String): NetworkResult<Boolean> {
        return try {
            val response = apiService.updateFcmToken(
                "Bearer $token",
                UpdateFcmTokenRequest(fcmToken)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(true)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Update FCM token failed")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
}
```

---

## 🗺️ MODUL MAP

### 📡 ENDPOINT BACKEND YANG TERSEDIA

| Method | Endpoint | Auth Required | Deskripsi |
|--------|----------|---------------|-----------|
| GET | `/api/map/detail/:id` | ⚠️ Optional | Detail tempat wisata |
| POST | `/api/map/favorite/toggle` | ✅ | Toggle favorit |
| GET | `/api/map/favorites` | ✅ | Daftar favorit user |
| POST | `/api/map/review/add` | ✅ | Tambah review |
| GET | `/api/map/review/:tourist_place_id` | ❌ | Daftar review tempat |
| POST | `/api/map/scan/qr` | ✅ | Scan QR code |
| GET | `/api/map/scan/history` | ✅ | History scan user |

### 📄 REQUEST & RESPONSE STRUCTURES

#### 1. GET PLACE DETAIL
**Request:** `GET /api/map/detail/:id`
- **Path Parameter:** `id` (tourist_place_id)
- **Header (Optional):** `Authorization: Bearer jwt_token`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Detail tempat berhasil diambil",
  "data": {
    "tourist_place_id": "TP001",
    "name": "Candi Borobudur",
    "description": "Candi Buddha terbesar di dunia...",
    "address": "Jl. Badrawati, Borobudur, Magelang",
    "latitude": -7.6079,
    "longitude": 110.2038,
    "category": "Candi",
    "images": [
      "https://storage.url/image1.jpg",
      "https://storage.url/image2.jpg"
    ],
    "operating_hours": "06:00 - 17:00",
    "contact_info": "+62274123456",
    "facilities": ["Toilet", "Parkir", "Musholla"],
    "entrance_fee": "Rp 50.000",
    "website": "https://borobudurpark.com",
    "social_media": "instagram.com/borobudur",
    "total_reviews": 150,
    "average_rating": "4.5",
    "recent_reviews": [
      {
        "review_id": "REV001",
        "user_full_name": "John Doe",
        "rating": 5,
        "review_text": "Tempat yang sangat indah!",
        "total_likes": 12,
        "is_liked_by_me": false,
        "created_at": "2025-12-01T10:00:00.000Z"
      }
    ],
    "is_favorite": true,
    "user_logged_in": true,
    "created_at": "2025-11-01T10:00:00.000Z",
    "updated_at": "2025-12-01T10:00:00.000Z"
  }
}
```

#### 2. TOGGLE FAVORITE
**Request:** `POST /api/map/favorite/toggle`
```json
{
  "tourist_place_id": "TP001"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Tempat berhasil ditambahkan ke favorit",
  "data": {
    "tourist_place_id": "TP001",
    "is_favorite": true,
    "action": "added"
  }
}
```

#### 3. ADD REVIEW
**Request:** `POST /api/map/review/add`
```json
{
  "tourist_place_id": "TP001",
  "rating": 5,
  "review_text": "Tempat yang sangat indah dan bersejarah!"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Review berhasil ditambahkan",
  "data": {
    "review_id": "REV123",
    "tourist_place_id": "TP001",
    "rating": 5,
    "review_text": "Tempat yang sangat indah dan bersejarah!",
    "created_at": "2025-12-01T10:00:00.000Z"
  }
}
```

#### 4. SCAN QR CODE
**Request:** `POST /api/map/scan/qr`
```json
{
  "code_value": "SAKO_TP001_2025",
  "tourist_place_id": "TP001",
  "latitude": -7.6079,
  "longitude": 110.2038
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "QR Code berhasil discan! Anda telah mengunjungi Candi Borobudur",
  "data": {
    "scan_id": "SCAN123",
    "tourist_place_id": "TP001",
    "place_name": "Candi Borobudur",
    "scan_timestamp": "2025-12-01T10:00:00.000Z",
    "points_earned": 10,
    "is_new_visit": true,
    "notification_sent": true
  }
}
```

### 🔧 ANDROID KOTLIN IMPLEMENTATION

#### 📁 data/remote/request/MapRequest.kt
```kotlin
package com.sako.app.data.remote.request
import com.google.gson.annotations.SerializedName

data class FavoriteToggleRequest(
    @SerializedName("tourist_place_id") val touristPlaceId: String
)

data class ReviewRequest(
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("rating") val rating: Int,
    @SerializedName("review_text") val reviewText: String
)

data class ScanQrRequest(
    @SerializedName("code_value") val codeValue: String,
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("latitude") val latitude: Double? = null,
    @SerializedName("longitude") val longitude: Double? = null
)
```

#### 📁 data/remote/response/MapResponse.kt
```kotlin
package com.sako.app.data.remote.response
import com.google.gson.annotations.SerializedName

data class MapDetailData(
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("address") val address: String,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("category") val category: String,
    @SerializedName("images") val images: List<String>,
    @SerializedName("operating_hours") val operatingHours: String?,
    @SerializedName("contact_info") val contactInfo: String?,
    @SerializedName("facilities") val facilities: List<String>,
    @SerializedName("entrance_fee") val entranceFee: String?,
    @SerializedName("website") val website: String?,
    @SerializedName("social_media") val socialMedia: String?,
    @SerializedName("total_reviews") val totalReviews: Int,
    @SerializedName("average_rating") val averageRating: String,
    @SerializedName("recent_reviews") val recentReviews: List<ReviewItem>,
    @SerializedName("is_favorite") val isFavorite: Boolean,
    @SerializedName("user_logged_in") val userLoggedIn: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

data class ReviewItem(
    @SerializedName("review_id") val reviewId: String,
    @SerializedName("user_full_name") val userFullName: String,
    @SerializedName("rating") val rating: Int,
    @SerializedName("review_text") val reviewText: String,
    @SerializedName("total_likes") val totalLikes: Int,
    @SerializedName("is_liked_by_me") val isLikedByMe: Boolean,
    @SerializedName("created_at") val createdAt: String
)

data class FavoriteToggleData(
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("is_favorite") val isFavorite: Boolean,
    @SerializedName("action") val action: String // "added" or "removed"
)

data class FavoriteItem(
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("address") val address: String,
    @SerializedName("image_url") val imageUrl: String,
    @SerializedName("average_rating") val averageRating: String,
    @SerializedName("total_reviews") val totalReviews: Int,
    @SerializedName("added_to_favorites_at") val addedToFavoritesAt: String
)

data class ReviewData(
    @SerializedName("review_id") val reviewId: String,
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("rating") val rating: Int,
    @SerializedName("review_text") val reviewText: String,
    @SerializedName("created_at") val createdAt: String
)

data class ScanData(
    @SerializedName("scan_id") val scanId: String,
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("place_name") val placeName: String,
    @SerializedName("scan_timestamp") val scanTimestamp: String,
    @SerializedName("points_earned") val pointsEarned: Int,
    @SerializedName("is_new_visit") val isNewVisit: Boolean,
    @SerializedName("notification_sent") val notificationSent: Boolean
)

data class ScanHistoryItem(
    @SerializedName("scan_id") val scanId: String,
    @SerializedName("tourist_place_id") val touristPlaceId: String,
    @SerializedName("place_name") val placeName: String,
    @SerializedName("scan_date") val scanDate: String,
    @SerializedName("scan_time") val scanTime: String,
    @SerializedName("points_earned") val pointsEarned: Int
)
```

#### 📁 data/remote/ApiService.kt (Map Extension)
```kotlin
interface ApiService {
    
    // ====== MAP ENDPOINTS ======
    @GET("map/detail/{id}")
    suspend fun getPlaceDetail(
        @Path("id") placeId: String,
        @Header("Authorization") token: String? = null
    ): Response<BaseResponse<MapDetailData>>
    
    @POST("map/favorite/toggle")
    suspend fun toggleFavorite(
        @Header("Authorization") token: String,
        @Body request: FavoriteToggleRequest
    ): Response<BaseResponse<FavoriteToggleData>>
    
    @GET("map/favorites")
    suspend fun getUserFavorites(
        @Header("Authorization") token: String
    ): Response<BaseResponse<List<FavoriteItem>>>
    
    @POST("map/review/add")
    suspend fun addReview(
        @Header("Authorization") token: String,
        @Body request: ReviewRequest
    ): Response<BaseResponse<ReviewData>>
    
    @GET("map/review/{tourist_place_id}")
    suspend fun getPlaceReviews(
        @Path("tourist_place_id") touristPlaceId: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10
    ): Response<BaseResponse<List<ReviewItem>>>
    
    @POST("map/scan/qr")
    suspend fun scanQrCode(
        @Header("Authorization") token: String,
        @Body request: ScanQrRequest
    ): Response<BaseResponse<ScanData>>
    
    @GET("map/scan/history")
    suspend fun getScanHistory(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<BaseResponse<List<ScanHistoryItem>>>
}
```

#### 📁 repository/MapRepository.kt
```kotlin
package com.sako.app.repository
import com.sako.app.data.remote.ApiService
import com.sako.app.utils.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MapRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun getPlaceDetail(placeId: String, token: String? = null): NetworkResult<MapDetailData> {
        return try {
            val response = apiService.getPlaceDetail(
                placeId = placeId,
                token = token?.let { "Bearer $it" }
            )
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(response.body()?.data!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Failed to get place detail")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun toggleFavorite(token: String, touristPlaceId: String): NetworkResult<FavoriteToggleData> {
        return try {
            val response = apiService.toggleFavorite(
                "Bearer $token",
                FavoriteToggleRequest(touristPlaceId)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(response.body()?.data!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Failed to toggle favorite")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun addReview(token: String, request: ReviewRequest): NetworkResult<ReviewData> {
        return try {
            val response = apiService.addReview("Bearer $token", request)
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(response.body()?.data!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Failed to add review")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
    
    suspend fun scanQrCode(token: String, request: ScanQrRequest): NetworkResult<ScanData> {
        return try {
            val response = apiService.scanQrCode("Bearer $token", request)
            if (response.isSuccessful && response.body()?.success == true) {
                NetworkResult.Success(response.body()?.data!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Failed to scan QR code")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Network error")
        }
    }
}
```

### 🔧 UTILS YANG DIPERLUKAN

#### 📁 utils/NetworkResult.kt
```kotlin
package com.sako.app.utils

sealed class NetworkResult<T>(
    val data: T? = null,
    val message: String? = null
) {
    class Success<T>(data: T) : NetworkResult<T>(data)
    class Error<T>(message: String, data: T? = null) : NetworkResult<T>(data, message)
    class Loading<T> : NetworkResult<T>()
}
```

#### 📁 utils/TokenManager.kt
```kotlin
package com.sako.app.utils
import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val PREF_NAME = "sako_prefs"
        private const val TOKEN_KEY = "jwt_token"
        private const val USER_ID_KEY = "user_id"
    }
    
    private val sharedPref: SharedPreferences = 
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    
    fun saveToken(token: String) {
        sharedPref.edit().putString(TOKEN_KEY, token).apply()
    }
    
    fun getToken(): String? {
        return sharedPref.getString(TOKEN_KEY, null)
    }
    
    fun saveUserId(userId: String) {
        sharedPref.edit().putString(USER_ID_KEY, userId).apply()
    }
    
    fun getUserId(): String? {
        return sharedPref.getString(USER_ID_KEY, null)
    }
    
    fun clearToken() {
        sharedPref.edit()
            .remove(TOKEN_KEY)
            .remove(USER_ID_KEY)
            .apply()
    }
    
    fun isLoggedIn(): Boolean {
        return getToken() != null
    }
}
```

### 🔥 FIREBASE FCM INTEGRATION

#### 📁 firebase/MyFirebaseMessagingService.kt
```kotlin
package com.sako.app.firebase
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.sako.app.MainActivity
import com.sako.app.R
import com.sako.app.repository.AuthRepository
import com.sako.app.utils.TokenManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class MyFirebaseMessagingService : FirebaseMessagingService() {
    
    @Inject
    lateinit var authRepository: AuthRepository
    
    @Inject
    lateinit var tokenManager: TokenManager
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Update FCM token ke backend jika user sedang login
        tokenManager.getToken()?.let { jwtToken ->
            CoroutineScope(Dispatchers.IO).launch {
                authRepository.updateFcmToken(jwtToken, token)
            }
        }
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Handle notification dari backend
        remoteMessage.notification?.let {
            sendNotification(
                title = it.title ?: "SAKO",
                body = it.body ?: "",
                data = remoteMessage.data
            )
        }
    }
    
    private fun sendNotification(title: String, body: String, data: Map<String, String>) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            // Handle deep link berdasarkan data dari backend
            when (data["type"]) {
                "map_visit" -> {
                    putExtra("navigate_to", "map_detail")
                    putExtra("place_id", data["tourist_place_id"])
                }
                "review_submitted" -> {
                    putExtra("navigate_to", "map_reviews")
                    putExtra("place_id", data["tourist_place_id"])
                }
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val channelId = "sako_notifications"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel untuk Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "SAKO Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }
        
        notificationManager.notify(0, notificationBuilder.build())
    }
}
```

### 🏗️ ARSITEKTUR FOLDER LENGKAP ANDROID STUDIO

```
app/src/main/java/com/sako/app/
├── data/
│   ├── local/
│   │   ├── dao/
│   │   ├── database/
│   │   └── entities/
│   └── remote/
│       ├── request/
│       │   ├── AuthRequest.kt ✅
│       │   └── MapRequest.kt ✅
│       ├── response/
│       │   ├── AuthResponse.kt ✅
│       │   └── MapResponse.kt ✅
│       └── ApiService.kt ✅
├── di/
│   ├── DatabaseModule.kt
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
├── firebase/
│   └── MyFirebaseMessagingService.kt ✅
├── repository/
│   ├── AuthRepository.kt ✅
│   └── MapRepository.kt ✅
├── ui/
│   ├── screen/
│   │   ├── auth/
│   │   │   ├── LoginScreen.kt
│   │   │   ├── RegisterScreen.kt
│   │   │   └── AuthViewModel.kt
│   │   └── map/
│   │       ├── MapDetailScreen.kt
│   │       ├── MapFavoritesScreen.kt
│   │       ├── QrScanScreen.kt
│   │       └── MapViewModel.kt
│   ├── components/
│   │   ├── LoadingDialog.kt
│   │   ├── ErrorDialog.kt
│   │   └── ReviewCard.kt
│   └── navigation/
│       └── Navigation.kt
├── utils/
│   ├── NetworkResult.kt ✅
│   ├── TokenManager.kt ✅
│   ├── Constants.kt
│   └── Extensions.kt
├── MainActivity.kt
└── SakoApplication.kt
```

### 📱 CONTOH PENGGUNAAN DI UI

#### ui/screen/map/MapDetailScreen.kt
```kotlin
@Composable
fun MapDetailScreen(
    placeId: String,
    viewModel: MapViewModel = hiltViewModel(),
    navController: NavController
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(placeId) {
        viewModel.getPlaceDetail(placeId)
    }
    
    when (val result = uiState.placeDetail) {
        is NetworkResult.Loading -> {
            LoadingDialog()
        }
        is NetworkResult.Success -> {
            val place = result.data
            LazyColumn {
                item {
                    PlaceDetailContent(
                        place = place,
                        onFavoriteClick = { viewModel.toggleFavorite(placeId) },
                        onReviewClick = { 
                            navController.navigate("add_review/$placeId")
                        },
                        onQrScanClick = {
                            navController.navigate("qr_scan/$placeId")
                        }
                    )
                }
            }
        }
        is NetworkResult.Error -> {
            ErrorDialog(
                message = result.message ?: "Error occurred",
                onRetry = { viewModel.getPlaceDetail(placeId) }
            )
        }
    }
}
```

### 🔐 SECURITY & BEST PRACTICES

1. **JWT Token Management**
   - Simpan token di SharedPreferences dengan encryption
   - Auto refresh token sebelum expired
   - Clear token saat logout

2. **Network Security**
   - Gunakan HTTPS untuk semua request
   - Implement certificate pinning
   - Validate response signature

3. **FCM Token Management**
   - Update token saat login/register
   - Handle token refresh otomatis
   - Sync dengan backend secara berkala

4. **Error Handling**
   - Implement retry mechanism
   - Handle network timeout
   - Show user-friendly error messages

### 📋 CHECKLIST IMPLEMENTASI

#### Backend (Sudah Ready ✅)
- [x] Auth endpoints (7 endpoints)
- [x] Map endpoints (7 endpoints)  
- [x] Firebase Admin SDK integration
- [x] JWT middleware
- [x] Response standardization
- [x] Logging system

#### Android yang perlu dibuat:
- [ ] Setup Retrofit dengan base URL backend
- [ ] Implement AuthRepository & MapRepository
- [ ] Setup Firebase FCM client
- [ ] Create TokenManager untuk JWT
- [ ] Implement all Request/Response data classes
- [ ] Create UI screens dengan Jetpack Compose
- [ ] Setup Navigation component
- [ ] Implement error handling & loading states

**BASE URL Backend:** `http://localhost:5000/api/` (development) atau URL production yang sudah di-deploy dengan Ngrok.