//middleware/auth.js

const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // Debug log untuk troubleshooting
    console.log('🔍 Auth Debug:', {
      authHeader: authHeader ? `Bearer ${authHeader.split(' ')[1]?.substring(0, 20)}...` : 'Missing',
      hasBearer: authHeader?.startsWith('Bearer '),
      timestamp: new Date().toISOString()
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token tidak ditemukan atau format salah');
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Token kosong atau tidak valid');
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified untuk user:', decoded.users_id);
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token telah kadaluarsa'
        });
      }
      throw jwtError;
    }

    // Check if user exists and is active
    // Get user data untuk attach ke request (include total_xp, user_image_url for map module compatibility)
    const users = await db.query(
      'SELECT users_id, email, full_name, total_xp, status, user_image_url, fcm_token, notification_preferences FROM users WHERE users_id = ? AND status = "active"',
      [decoded.users_id]
    );

    if (users.length === 0) {
      console.log('❌ User tidak ditemukan atau tidak aktif:', decoded.users_id);
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau user tidak aktif'
      });
    }

    // Parse notification_preferences jika ada
    const user = users[0];
    if (user.notification_preferences && typeof user.notification_preferences === 'string') {
      try {
        user.notification_preferences = JSON.parse(user.notification_preferences);
      } catch (e) {
        console.warn('⚠️ Error parsing notification preferences untuk user:', user.users_id);
        user.notification_preferences = null;
      }
    }

    // Attach user to request with complete structure for map module compatibility
    req.user = {
      users_id: user.users_id,
      email: user.email,
      full_name: user.full_name,
      total_xp: user.total_xp || 0,
      status: user.status,
      user_image_url: user.user_image_url,
      fcm_token: user.fcm_token,
      notification_preferences: user.notification_preferences
    };
    req.token = token;
    
    console.log('✅ Auth successful untuk user:', user.users_id);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi token'
    });
  }
};

module.exports = authMiddleware;