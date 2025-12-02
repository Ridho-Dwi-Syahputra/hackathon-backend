# ANALISIS FUNGSIONAL CONTROLLER MODUL-MAP SAKO

## DETAILMAPCONTROLLER.JS

### ✅ FUNGSIONAL 1: List Tempat Wisata dengan Status Kunjungan
**Endpoint:** `GET /api/map/places`  
**Controller:** `detailMapController.getPlacesWithVisitStatus()`  
**Model:** `detailMapModel.getPlacesWithVisitStatus()`  
**Database:** `SELECT tourist_place LEFT JOIN user_visit`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Array dengan is_visited status dan format waktu Indonesia

**Fungsi Detail:**
- Menampilkan semua tempat wisata dengan status sudah dikunjungi atau belum
- Menggunakan LEFT JOIN antara tourist_place dan user_visit  
- Status `is_visited: true/false` berdasarkan ada tidaknya record di user_visit
- Include informasi waktu kunjungan terakhir jika pernah dikunjungi

**Request:**
```http
GET /api/map/places
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "List tempat wisata dengan status kunjungan berhasil diambil",
  "data": [
    {
      "tourist_place_id": "TP001",
      "name": "Jam Gadang",
      "description": "Jam Gadang adalah ikon pariwisata Kota Bukittinggi...",
      "address": "Jl. Raya Bukittinggi - Payakumbuh, Benteng Ps. Atas, Bukittinggi",
      "image_url": "https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP001-jam-gadang.jpg",
      "average_rating": 0.0,
      "is_visited": true,
      "visited_at": "2024-12-01T14:30:00.000Z"
    }
  ]
}
```

**Implementasi Utils:**
- **Logging:** `writeLog('map', 'INFO', message)` + `getIndonesianTime()` untuk timestamp log
- **Response:** `responseHelper.success/error()` untuk standardisasi response  
- **Database Fields:** Sesuai sako.sql - tourist_place_id (char36), name, description, address, image_url, average_rating (decimal), is_visited (computed), visited_at (timestamp)

---

### ✅ FUNGSIONAL 2: Detail Tempat Wisata + Validasi Scan QR
**Endpoint:** `GET /api/map/detail/:id`  
**Controller:** `detailMapController.getPlaceDetail()`  
**Model:** `detailMapModel.getPlaceDetail()`, `detailMapModel.getUserReview()`, `detailMapModel.getOtherReviews()`  
**Database:** `SELECT tourist_place + review data`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Detail lengkap + is_scan_enabled flag

**Fungsi Detail:**
- Menampilkan detail lengkap tempat wisata termasuk rating dan reviews
- Validasi tombol scan QR: enabled jika belum pernah dikunjungi hari ini
- Menampilkan review user sendiri dan 5 review terbaru dari user lain
- Perhitungan average_rating dari semua review

**Request:**
```http
GET /api/map/detail/1
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Detail tempat wisata berhasil diambil",
  "data": {
    "tourist_place_id": "TP001",
    "name": "Jam Gadang",
    "description": "Jam Gadang adalah ikon pariwisata Kota Bukittinggi...",
    "address": "Jl. Raya Bukittinggi - Payakumbuh, Benteng Ps. Atas, Bukittinggi",
    "image_url": "https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP001-jam-gadang.jpg",
    "average_rating": 0.0,
    "is_scan_enabled": false,
    "created_at": "2025-11-29T15:16:28.000Z",
    "updated_at": "2025-11-30T03:33:33.000Z"
  }
}
```

**Implementasi Utils:**
- **Logging:** Detail logging per step dengan duration tracking  
- **Response:** `responseHelper.success()` dengan data terstruktur
- **Database Fields:** tourist_place_id (char36), created_at/updated_at (timestamp), is_active (tinyint)
- **Logic:** is_scan_enabled based on user_visit.status != 'visited' for today

---

## REVIEWMAPCONTROLLER.JS

### ✅ FUNGSIONAL 3: List Review Tempat Wisata dengan Paginasi
**Endpoint:** `GET /api/map/places/:id/reviews?page=1&limit=10`  
**Controller:** `reviewMapController.getPlaceReviews()`  
**Model:** `reviewMapModel.getPlaceReviews()`  
**Database:** `SELECT review JOIN users dengan pagination`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Pagination + user_review + other_reviews

**Fungsi Detail:**
- Menampilkan review user sendiri di bagian teratas (jika ada)
- Menampilkan review user lain dengan sistem pagination
- Format waktu relatif ("5 menit yang lalu") dan format Indonesia
- Include informasi user yang me-review (username, profile_picture)

**Request:**
```http
GET /api/map/places/1/reviews?page=1&limit=5
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review berhasil diambil",
  "data": {
    "user_review": {
      "review_id": "char36-uuid",
      "user_id": "char36-uuid",
      "tourist_place_id": "TP001",
      "rating": 5,
      "review_text": "Tempat yang luar biasa!",
      "total_likes": 12,
      "created_at": "2024-12-01T10:30:00.000Z",
      "updated_at": "2024-12-01T10:30:00.000Z"
    },
    "other_reviews": [
      {
        "review_id": "char36-uuid-2",
        "user_id": "char36-uuid-2",
        "rating": 4,
        "review_text": "Bagus tapi crowded",
        "total_likes": 5,
        "created_at": "2024-12-01T14:20:00.000Z",
        "updated_at": "2024-12-01T14:20:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_reviews": 15,
      "reviews_per_page": 5
    }
  }
}
```

**Implementasi Utils:**
- **Logging:** `writeLog('map', 'INFO')` + tracking user dan pagination  
- **Response:** Complex nested response dengan user_review terpisah
- **Database Fields:** review_id (char36), user_id (char36), tourist_place_id (char36), rating (int 1-5), review_text (text), total_likes (int), created_at/updated_at (timestamp)
- **Joins:** review JOIN users untuk mendapatkan user info jika diperlukan

---

### ✅ FUNGSIONAL 4: Toggle Like/Unlike Review
**Endpoint:** `POST /api/reviews/:id/toggle-like`  
**Controller:** `reviewMapController.toggleReviewLike()`  
**Model:** `reviewMapModel.toggleReviewLike()`  
**Database:** `INSERT/DELETE review_like, UPDATE review.total_likes`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Action status + total_likes

**Fungsi Detail:**
- User me-like atau unlike review orang lain (tidak bisa like review sendiri)
- Menggunakan composite primary key (review_id, user_id) di tabel review_like
- Jika belum like: INSERT data baru + UPDATE total_likes (+1)  
- Jika sudah like: DELETE data + UPDATE total_likes (-1)
- Database trigger otomatis maintain consistency

**Request:**
```http
POST /api/reviews/101/toggle-like
Authorization: Bearer <jwt_token>
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "message": "Review berhasil disukai",
  "data": {
    "review_id": "char36-uuid",
    "action": "liked",
    "total_likes": 13
  }
}
```

**Implementasi Utils:**
- **Logging:** `writeLog('map', 'INFO')` dengan review_id dan user_id tracking  
- **Response:** `responseHelper.success()` dengan action status
- **Database Logic:** INSERT/DELETE di review_like (review_like_id char36, user_id char36, review_id char36)
- **Triggers:** Database trigger otomatis update total_likes di tabel review

---

### ✅ FUNGSIONAL 5: Add Review dan Rating
**Endpoint:** `POST /api/map/places/:id/review`  
**Controller:** `reviewMapController.addReview()`  
**Model:** `reviewMapModel.addReview()`  
**Database:** `INSERT review + UPDATE tourist_place.average_rating`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Review baru + notifikasi FCM

**Fungsi Detail:**
- User menambahkan review dan rating (1-5) untuk tempat wisata
- Validasi: user hanya bisa 1 review per tempat (ON DUPLICATE KEY UPDATE)
- Auto-generate review_id menggunakan custom ID generator
- Update average_rating tempat wisata secara otomatis  
- Kirim notifikasi FCM ke sistem untuk review baru

**Request:**
```http
POST /api/map/places/1/review
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tourist_place_id": "TP001",
  "rating": 5,
  "review_text": "Tempat yang sangat indah dan bersejarah!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review berhasil ditambahkan",
  "data": {
    "review_id": "RV001",
    "user_id": "char36-uuid",
    "tourist_place_id": "TP001",
    "rating": 5,
    "review_text": "Tempat yang sangat indah dan bersejarah!",
    "total_likes": 0,
    "created_at": "2024-12-02T04:01:00.000Z",
    "updated_at": "2024-12-02T04:01:00.000Z"
  }
}
```

**Implementasi Utils:**
- **Logging:** Comprehensive logging termasuk FCM notification status
- **Response:** `responseHelper.success()` dengan data sesuai database  
- **Custom ID:** `generateCustomId(db, 'RV', 'review', 'review_id', 3)` format RV001, RV002, ...
- **Database Fields:** review_id (char36), user_id (char36), tourist_place_id (char36), rating (int 1-5), review_text (text), total_likes (int), created_at/updated_at (timestamp)
- **Auto Features:** Database trigger update average_rating di tourist_place
- **Notification:** `sendReviewAddedNotification()` untuk FCM integration

---

### ✅ FUNGSIONAL 6: Edit Review User
**Endpoint:** `PUT /api/reviews/:id`  
**Controller:** `reviewMapController.editReview()`  
**Model:** `reviewMapModel.updateReview()`  
**Database:** `UPDATE review WHERE review_id AND user_id`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Updated review data

**Fungsi Detail:**
- User hanya bisa edit review miliknya sendiri (validasi user_id)
- Update rating dan/atau review_text
- Auto-update updated_at timestamp  
- Recalculate average_rating tempat wisata jika rating berubah

**Request:**
```http
PUT /api/reviews/char36-uuid
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 4,
  "review_text": "Tempat bagus tapi agak crowded pada weekend"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review berhasil diperbarui",
  "data": {
    "review_id": "char36-uuid",
    "rating": 4,
    "review_text": "Tempat bagus tapi agak crowded pada weekend",
    "updated_at": "2024-12-02T04:15:00.000Z"
  }
}
```

**Implementasi Utils:**
- **Logging:** Track edit action dengan old vs new values
- **Response:** Simple success response dengan updated data
- **Database Logic:** UPDATE review WHERE review_id AND user_id (ownership validation)
- **Auto Update:** Database trigger recalculate average_rating di tourist_place

---

### ✅ FUNGSIONAL 7: Delete Review User  
**Endpoint:** `DELETE /api/reviews/:id`  
**Controller:** `reviewMapController.deleteReview()`  
**Model:** `reviewMapModel.deleteReview()`  
**Database:** `DELETE review + CASCADE delete review_like`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Simple confirmation

**Fungsi Detail:**
- User hanya bisa hapus review miliknya sendiri
- Auto-delete semua like untuk review tersebut (CASCADE)
- Recalculate average_rating tempat wisata
- Soft delete atau hard delete based on business requirement

**Request:**
```http
DELETE /api/reviews/char36-uuid
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review berhasil dihapus",
  "data": {
    "review_id": "char36-uuid"
  }
}
```

**Implementasi Utils:**
- **Logging:** Log deletion dengan review_id dan user confirmation
- **Response:** Minimal response untuk DELETE operation
- **Database Logic:** DELETE review WHERE review_id AND user_id
- **Auto Cleanup:** Database trigger CASCADE delete review_like dan update tourist_place.average_rating

---

## SCANMAPCONTROLLER.JS

### ✅ FUNGSIONAL 8: Scan QR Code dan Catat Kunjungan
**Endpoint:** `POST /api/map/scan/qr`  
**Controller:** `scanMapController.scanQRCode()`  
**Model:** `scanMapModel.scanQRCode()`, `scanMapModel.recordVisit()`  
**Database:** `INSERT/UPDATE user_visit + SELECT tourist_place`  
**Authentication:** ✅ Required (authenticateToken)  
**Response Format:** ✅ Place data + visit info + notifikasi FCM

**Fungsi Detail:**
- Validasi QR code value dan cek tourist_place yang sesuai
- Record kunjungan dengan status "visited" dan timestamp  
- Cek apakah kunjungan pertama hari ini (untuk notifikasi)
- Kirim notifikasi FCM jika kunjungan pertama hari ini
- Include informasi tempat wisata dan detail kunjungan

**Request:**
```http
POST /api/map/scan/qr  
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "qr_code_value": "TP001_QR_CODE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Selamat datang di Jam Gadang! Kunjungan Anda telah tercatat.",
  "data": {
    "scan_success": true,
    "tourist_place": {
      "tourist_place_id": "TP001",
      "name": "Jam Gadang",
      "description": "Jam Gadang adalah ikon pariwisata Kota Bukittinggi...",
      "address": "Jl. Raya Bukittinggi - Payakumbuh, Benteng Ps. Atas, Bukittinggi",
      "image_url": "https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP001-jam-gadang.jpg",
      "average_rating": 0.0,
      "is_active": 1
    },
    "visit_info": {
      "user_visit_id": "UV001",
      "user_id": "char36-uuid",
      "tourist_place_id": "TP001",
      "status": "visited",
      "visited_at": "2024-12-02T04:30:00.000Z",
      "created_at": "2024-12-02T04:30:00.000Z",
      "updated_at": "2024-12-02T04:30:00.000Z",
      "is_first_visit_today": true
    },
    "qr_code_info": {
      "qr_code_value": "TP001_QR_CODE",
      "scan_timestamp": "2024-12-02T04:30:00.000Z"
    }
  }
}
```

**Implementasi Utils:**
- **Logging:** Detailed logging untuk QR scan termasuk success/failure tracking
- **Response:** Complex nested response dengan tourist_place dan visit_info
- **Custom ID:** `generateCustomId(db, 'UV', 'user_visit', 'user_visit_id', 3)` format UV001, UV002, ...
- **Database Logic:** CREATE/UPDATE user_visit SET status='visited', visited_at=NOW() WHERE user_id AND tourist_place_id  
- **QR Validation:** Match qr_code_value dengan qr_code table untuk find tourist_place_id
- **Notification:** `sendPlaceVisitedNotification()` untuk FCM jika first visit today
- **Database Fields:** user_visit_id/user_id/tourist_place_id (char36), status (enum), visited_at/created_at/updated_at (timestamp)

---

## SUMMARY IMPLEMENTASI UTILS

### 🔧 **Logging System (logsGenerator.js)**
- **Function:** `writeLog(category, level, message, data)`
- **Usage:** Semua controller menggunakan untuk audit trail
- **Format:** `[02/12/2025, 04.01.26] [INFO] message` + JSON data
- **Location:** `src/logs/notifikasi/map.log`

### 📅 **Time Formatting (indoTimeGenerator.js)**
- **formatDatabaseTimeToIndo():** "Hari ini 11:30" atau "02-12-2024 11:30"  
- **formatIndoDate():** "02-12-2024" (DD-MM-YYYY)
- **formatRelativeIndoTime():** "5 menit yang lalu", "2 jam yang lalu"
- **Usage:** Response API untuk user-friendly datetime display

### 📨 **Response Helper (responseHelper.js)**
- **success():** Standardized success response format
- **error():** Standardized error response dengan HTTP status
- **Usage:** Semua endpoint menggunakan untuk consistency

### 🆔 **Custom ID Generator (customIdGenerator.js)**  
- **generateCustomId('review'):** "RV-001-20241202"
- **generateCustomId('user_visit'):** "UV-001-20241202"  
- **Usage:** Review dan user_visit menggunakan custom ID format

### 🔔 **FCM Notification (mapNotifikasiController.js)**
- **sendPlaceVisitedNotification():** Notifikasi kunjungan tempat baru
- **sendReviewAddedNotification():** Notifikasi review baru ditambahkan  
- **Usage:** Background notification untuk engagement

### 🔐 **Authentication (auth.js)**
- **authenticateToken:** JWT validation middleware
- **Usage:** Semua endpoint map module protected
- **Extract:** `req.user.users_id` untuk user identification