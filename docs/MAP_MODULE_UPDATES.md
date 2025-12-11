# 🗺️ Map Module Updates - Backend API

## 📅 Update Date: December 5, 2025

## 🆕 **New Endpoint Added**

### **GET /api/map/visited** - List Visited Places

**Purpose**: Mengambil daftar tempat wisata yang sudah dikunjungi oleh user dengan pagination

**Authentication**: Required (Enhanced Token Auth)

**Request**:
```http
GET /api/map/visited?page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Halaman data yang diminta |
| `limit` | integer | 10 | Jumlah data per halaman |

**Response Success (200)**:
```json
{
  "success": true,
  "message": "List tempat yang dikunjungi berhasil diambil",
  "data": {
    "visited_places": [
      {
        "tourist_place_id": "TP001",
        "name": "Candi Borobudur",
        "description": "Warisan dunia UNESCO...",
        "address": "Jl. Badrawati, Borobudur...",
        "image_url": "https://example.com/borobudur.jpg",
        "average_rating": 4.8,
        "status": "visited",
        "visited_at": "2025-12-05T10:30:00.000Z",
        "first_visit": "2025-12-05T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 25,
      "limit": 10,
      "has_next": true,
      "has_previous": false
    }
  },
  "timestamp": "2025-12-05T16:34:37.123Z",
  "statusCode": 200
}
```

**Response Error (401)**:
```json
{
  "success": false,
  "message": "Token tidak ditemukan",
  "timestamp": "2025-12-05T16:34:37.123Z",
  "statusCode": 401
}
```

**Response Error (500)**:
```json
{
  "success": false,
  "message": "Terjadi kesalahan saat mengambil list tempat yang dikunjungi",
  "timestamp": "2025-12-05T16:34:37.123Z",
  "statusCode": 500
}
```

---

## 🔧 **Backend Implementation Details**

### **1. Controller Method Added**

**File**: `src/controllers/modul-map/detailMapController.js`

```javascript
/**
 * ADDITIONAL: List tempat wisata yang sudah dikunjungi user
 * Endpoint: GET /api/map/visited
 * Response: Array tempat wisata yang sudah dikunjungi dengan pagination
 */
getVisitedPlaces: async (req, res) => {
    const startTime = Date.now();
    const userId = req.user?.users_id;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Implementation details...
    } catch (error) {
        // Error handling...
    }
}
```

### **2. Model Methods Added**

**File**: `src/models/modul-map/detailMapModel.js`

#### **getVisitedPlacesByUser(userId, limit, offset)**
```javascript
static async getVisitedPlacesByUser(userId, limit, offset) {
    const query = `
        SELECT 
            tp.tourist_place_id,
            tp.name,
            tp.description,
            tp.address,
            tp.image_url,
            tp.average_rating,
            uv.status,
            uv.visited_at,
            uv.created_at as first_visit
        FROM user_visit uv
        JOIN tourist_place tp ON uv.tourist_place_id = tp.tourist_place_id
        WHERE uv.user_id = ? AND uv.status = 'visited' AND tp.is_active = 1
        ORDER BY uv.visited_at DESC
        LIMIT ? OFFSET ?
    `;
    
    return await db.query(query, [userId, limit, offset]);
}
```

#### **getVisitedPlacesCount(userId)**
```javascript
static async getVisitedPlacesCount(userId) {
    const query = `
        SELECT COUNT(*) as total_count
        FROM user_visit uv
        JOIN tourist_place tp ON uv.tourist_place_id = tp.tourist_place_id
        WHERE uv.user_id = ? AND uv.status = 'visited' AND tp.is_active = 1
    `;
    
    const result = await db.query(query, [userId]);
    return result[0]?.total_count || 0;
}
```

### **3. Route Added**

**File**: `src/routes/mapRoutes.js`

```javascript
// ADDITIONAL: List tempat wisata yang sudah dikunjungi
// GET /api/map/visited
router.get('/visited', authenticateTokenEnhanced, detailMapController.getVisitedPlaces);
```

---

## 🗃️ **Database Query Logic**

### **Data Source**: Tabel `user_visit`

**Primary Query**:
```sql
SELECT 
    tp.tourist_place_id,
    tp.name,
    tp.description,
    tp.address,
    tp.image_url,
    tp.average_rating,
    uv.status,              -- Status dari user_visit table
    uv.visited_at,          -- Waktu kunjungan terakhir
    uv.created_at as first_visit
FROM user_visit uv          -- Source utama: user_visit
JOIN tourist_place tp ON uv.tourist_place_id = tp.tourist_place_id
WHERE uv.user_id = ?        -- Filter by user yang login
  AND uv.status = 'visited' -- Hanya yang status 'visited'
  AND tp.is_active = 1      -- Tempat wisata yang aktif
ORDER BY uv.visited_at DESC -- Urut kunjungan terbaru
```

**Count Query**:
```sql
SELECT COUNT(*) as total_count
FROM user_visit uv
JOIN tourist_place tp ON uv.tourist_place_id = tp.tourist_place_id
WHERE uv.user_id = ? 
  AND uv.status = 'visited' 
  AND tp.is_active = 1
```

---

## 📊 **Updated API Endpoints Summary**

### **Map Module Endpoints (Total: 9)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/map/places` | List semua tempat dengan status kunjungan | ✅ Enhanced |
| GET | `/api/map/visited` | **[NEW]** List tempat yang dikunjungi | ✅ Enhanced |
| GET | `/api/map/places/:id` | Detail tempat wisata | ✅ Enhanced |
| GET | `/api/map/places/:id/reviews` | List review tempat | ✅ Enhanced |
| POST | `/api/map/places/:id/reviews/add` | Tambah review | ✅ Enhanced |
| PUT | `/api/map/reviews/:id/edit` | Edit review | ✅ Enhanced |
| DELETE | `/api/map/reviews/:id/delete` | Hapus review | ✅ Enhanced |
| POST | `/api/map/reviews/:id/toggle-like` | Toggle like review | ✅ Enhanced |
| POST | `/api/map/scan/qr` | Scan QR code | ✅ Enhanced |

---

## 🔒 **Security & Authentication**

- **Authentication Type**: Enhanced Token Authentication
- **Required**: Valid JWT token in Authorization header
- **Format**: `Authorization: Bearer <jwt_token>`
- **Middleware**: `authenticateTokenEnhanced` dari `middleware/token.js`

---

## 📝 **Logging Implementation**

Setiap request ke endpoint ini akan tercatat di:
- **File**: `src/logs/map/`
- **Format**: JSON dengan timestamp Indonesia
- **Data yang dicatat**:
  - User ID
  - Action yang dilakukan
  - Response time
  - Total data yang dikembalikan
  - Error message (jika ada)

**Example Log**:
```json
{
  "level": "SUCCESS",
  "message": "[DETAIL] Berhasil mengambil 15 tempat yang dikunjungi",
  "data": {
    "user_id": "U001",
    "total_visited": 15,
    "total_count": 15,
    "page": 1,
    "response_time_ms": 45,
    "timestamp_indo": "2025-12-05T23:34:37+07:00"
  }
}
```

---

## 🧪 **Testing**

### **Manual Testing with cURL**:

```bash
# Login dulu untuk mendapatkan token
curl -X POST http://10.0.2.2:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Test endpoint visited places
curl -X GET "http://10.0.2.2:5000/api/map/visited?page=1&limit=10" \
  -H "Authorization: Bearer <your_jwt_token>"
```

### **Expected Scenarios**:
1. ✅ **Success**: User memiliki data kunjungan → Return list dengan pagination
2. ✅ **Empty**: User belum pernah berkunjungi → Return empty array dengan pagination
3. ❌ **Unauthorized**: Token tidak valid → Return 401 error
4. ❌ **Server Error**: Database error → Return 500 error

---

## 🚀 **Integration Notes**

### **Untuk Android Developer**:
1. **Base URL**: `http://10.0.2.2:5000/api/` (emulator) 
2. **Content-Type**: `application/json`
3. **Authorization**: Wajib include Bearer token dari login response
4. **Pagination**: Support query parameters `page` dan `limit`
5. **Error Handling**: Check `success` field dalam response

### **Data Flow**:
```
Android App → HTTP Request → Backend API → Database Query → 
user_visit JOIN tourist_place → JSON Response → Android App
```

---

## ⚡ **Performance Considerations**

- **Database Indexing**: Pastikan ada index pada `user_visit.user_id` dan `user_visit.tourist_place_id`
- **Pagination**: Default limit 10, maksimal yang disarankan 50
- **Caching**: Belum diimplementasikan, bisa ditambahkan untuk improve performance
- **Query Optimization**: Menggunakan JOIN efisien antara `user_visit` dan `tourist_place`

---

## 🔄 **Future Enhancements**

Potential improvements yang bisa ditambahkan:
1. **Filter by date range**: `?from=2025-01-01&to=2025-12-31`
2. **Sort options**: `?sort=name|date|rating`
3. **Search functionality**: `?search=borobudur`
4. **Export functionality**: Export visited places to PDF/Excel
5. **Statistics**: Total distance traveled, favorite categories, etc.

---

## 📞 **Support**

Jika ada masalah dengan endpoint ini:
1. Check logs di `src/logs/map/`
2. Verify JWT token validity
3. Confirm database connection
4. Check user permissions

**Server Status**: ✅ Running on `http://localhost:5000`  
**Last Updated**: December 5, 2025, 16:34 WIB