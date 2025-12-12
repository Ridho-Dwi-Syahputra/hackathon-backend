/**
 * Database Token Authentication Middleware
 * Alternative middleware untuk authentication menggunakan token yang disimpan di database
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authModel');

/**
 * Database Token Authentication Middleware
 * Verifikasi token dari database bukan hanya JWT verification
 */
const authenticateTokenFromDB = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const token = authHeader.split(' ')[1];

    console.log(`🔍 Validating token from database:`, {
      token_preview: token.substring(0, 20) + '...',
      token_length: token.length,
      is_jwt_format: token.includes('.')
    });

    // Check token in database (tidak perlu JWT verify karena database token bukan JWT!)
    const user = await AuthModel.findUserByToken(token);
    
    if (!user) {
      console.log(`❌ Token not found in database or expired:`, {
        token_preview: token.substring(0, 20) + '...'
      });
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid, telah kadaluarsa, atau user tidak aktif'
      });
    }
    
    console.log(`✅ Token validated successfully for user:`, {
      users_id: user.users_id,
      email: user.email
    });

    // Parse notification_preferences jika ada
    if (user.notification_preferences && typeof user.notification_preferences === 'string') {
      try {
        user.notification_preferences = JSON.parse(user.notification_preferences);
      } catch (e) {
        user.notification_preferences = null;
      }
    }

    // Attach user to request with complete data
    req.user = {
      users_id: user.users_id,
      email: user.email,
      full_name: user.full_name,
      total_xp: user.total_xp || 0,
      status: user.status,
      user_image_url: user.user_image_url,
      fcm_token: user.fcm_token,
      notification_preferences: user.notification_preferences,
      token_validity: user.token_validity
    };
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Database token auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi token'
    });
  }
};

/**
 * Cleanup expired tokens middleware
 * Bisa dijalankan secara periodic atau per request
 */
const cleanupExpiredTokens = async (req, res, next) => {
  try {
    // Cleanup expired tokens (optional, bisa dijadwalkan terpisah)
    const clearedCount = await AuthModel.clearExpiredTokens();
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired tokens`);
    }
    next();
  } catch (error) {
    console.error('Token cleanup error:', error);
    // Continue with request even if cleanup fails
    next();
  }
};

module.exports = {
  authenticateTokenFromDB,
  cleanupExpiredTokens
};