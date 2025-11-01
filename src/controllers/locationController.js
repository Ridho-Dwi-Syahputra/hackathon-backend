//locationController.js

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Get Tourist Places
exports.getTouristPlaces = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    
    let whereClause = 'tp.is_active = 1';
    const params = [userId];

    if (search) {
      whereClause += ' AND (tp.name LIKE ? OR tp.description LIKE ? OR tp.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [places] = await db.query(
      `SELECT 
         tp.*,
         CASE WHEN uv.id IS NOT NULL THEN 'visited' ELSE 'not_visited' END as visit_status,
         uv.visited_at,
         COALESCE(AVG(r.rating), 0) as average_rating,
         COUNT(DISTINCT r.id) as total_reviews
       FROM tourist_place tp
       LEFT JOIN user_visit uv ON tp.id = uv.tourist_place_id AND uv.user_id = ?
       LEFT JOIN review r ON tp.id = r.tourist_place_id
       WHERE ${whereClause}
       GROUP BY tp.id
       ORDER BY tp.name ASC`,
      params
    );

    res.json({
      success: true,
      data: places
    });

  } catch (error) {
    next(error);
  }
};

// Get Tourist Place Detail
exports.getTouristPlaceDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { placeId } = req.params;

    const [places] = await db.query(
      `SELECT 
         tp.*,
         CASE WHEN uv.id IS NOT NULL THEN 'visited' ELSE 'not_visited' END as visit_status,
         uv.visited_at,
         COALESCE(AVG(r.rating), 0) as average_rating,
         COUNT(DISTINCT r.id) as total_reviews
       FROM tourist_place tp
       LEFT JOIN user_visit uv ON tp.id = uv.tourist_place_id AND uv.user_id = ?
       LEFT JOIN review r ON tp.id = r.tourist_place_id
       WHERE tp.id = ? AND tp.is_active = 1
       GROUP BY tp.id`,
      [userId, placeId]
    );

    if (places.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lokasi tidak ditemukan'
      });
    }

    // Get reviews
    const [reviews] = await db.query(
      `SELECT 
         r.*,
         u.full_name as user_name,
         u.user_image_url as user_image,
         CASE WHEN r.user_id = ? THEN 1 ELSE 0 END as is_own_review
       FROM review r
       JOIN users u ON r.user_id = u.id
       WHERE r.tourist_place_id = ?
       ORDER BY r.created_at DESC`,
      [userId, placeId]
    );

    res.json({
      success: true,
      data: {
        ...places[0],
        reviews
      }
    });

  } catch (error) {
    next(error);
  }
};

// Checkin Location (QR Code Scan)
exports.checkinLocation = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const userId = req.user.id;
    const { qr_code, latitude, longitude } = req.body;

    if (!qr_code || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'QR code dan koordinat harus diisi'
      });
    }

    await connection.beginTransaction();

    // Get location from QR code
    const [qrCodes] = await connection.query(
      `SELECT qr.*, tp.id as place_id, tp.name, tp.location_lat, tp.location_lng
       FROM qr_code qr
       JOIN tourist_place tp ON qr.tourist_place_id = tp.id
       WHERE qr.code_value = ? AND qr.is_active = 1 AND tp.is_active = 1`,
      [qr_code]
    );

    if (qrCodes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'QR Code tidak valid'
      });
    }

    const location = qrCodes[0];

    // Validate distance (max 100 meters = 0.1 km)
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(location.location_lat),
      parseFloat(location.location_lng)
    );

    if (distance > 0.1) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Anda terlalu jauh dari lokasi. Jarak Anda: ' + (distance * 1000).toFixed(0) + ' meter'
      });
    }

    // Check if already visited
    const [existingVisit] = await connection.query(
      'SELECT id FROM user_visit WHERE user_id = ? AND tourist_place_id = ?',
      [userId, location.place_id]
    );

    let xpGained = 50; // Default XP for checkin

    if (existingVisit.length === 0) {
      // First time visit
      await connection.query(
        `INSERT INTO user_visit (id, user_id, tourist_place_id, status, visited_at, created_at, updated_at) 
         VALUES (?, ?, ?, 'visited', NOW(), NOW(), NOW())`,
        [uuidv4(), userId, location.place_id]
      );
    } else {
      // Update existing visit
      await connection.query(
        'UPDATE user_visit SET status = "visited", visited_at = NOW(), updated_at = NOW() WHERE id = ?',
        [existingVisit[0].id]
      );
      xpGained = 25; // Less XP for repeat visit
    }

    // Update user XP
    await connection.query(
      'UPDATE users SET total_xp = total_xp + ?, updated_at = NOW() WHERE id = ?',
      [xpGained, userId]
    );

    await connection.commit();

    // Get updated user data
    const [userData] = await connection.query(
      'SELECT total_xp FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Check-in berhasil!',
      data: {
        place_name: location.name,
        xp_gained: xpGained,
        total_xp: userData[0].total_xp,
        is_first_visit: existingVisit.length === 0
      }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Get Visited Places
exports.getVisitedPlaces = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [places] = await db.query(
      `SELECT 
         tp.*,
         uv.visited_at,
         COALESCE(AVG(r.rating), 0) as average_rating,
         COUNT(DISTINCT r.id) as total_reviews
       FROM user_visit uv
       JOIN tourist_place tp ON uv.tourist_place_id = tp.id
       LEFT JOIN review r ON tp.id = r.tourist_place_id
       WHERE uv.user_id = ? AND uv.status = 'visited' AND tp.is_active = 1
       GROUP BY tp.id
       ORDER BY uv.visited_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: places
    });

  } catch (error) {
    next(error);
  }
};