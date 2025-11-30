//authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Register
exports.register = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    // Check if email exists
    const [existingUsers] = await connection.query(
      'SELECT users_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await connection.beginTransaction();

    // Insert user
    await connection.query(
      `INSERT INTO users (users_id, full_name, email, password_hash, total_xp, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 0, 'active', NOW(), NOW())`,
      [userId, full_name, email, hashedPassword]
    );

    // Initialize user_points
    await connection.query(
      `INSERT INTO user_points (user_id, total_points, lifetime_points, created_at, last_updated_at) 
       VALUES (?, 0, 0, NOW(), NOW())`,
      [userId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil'
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    // Get user
    const [users] = await db.query(
      'SELECT users_id, email, full_name, password_hash, total_xp, status, user_image_url FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Akun tidak aktif'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate token
    const token = generateToken(user.users_id);

    // Save token to database
    await db.query(
      'UPDATE users SET token = ?, token_validity = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE users_id = ?',
      [token, user.users_id]
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          users_id: user.users_id,
          email: user.email,
          full_name: user.full_name,
          total_xp: user.total_xp,
          status: user.status,
          user_image_url: user.user_image_url
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    // Clear token from database
    await db.query(
      'UPDATE users SET token = NULL, token_validity = NULL WHERE users_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Logout berhasil'
    });

  } catch (error) {
    next(error);
  }
};

// GET Profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const [users] = await db.query(`
      SELECT 
        users_id,
        full_name,
        email,
        total_xp,
        status,
        user_image_url,
        created_at
      FROM users 
      WHERE users_id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    next(error);
  }
};

// Update FCM Token
exports.updateFcmToken = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token harus diisi'
      });
    }

    // Update FCM token
    await db.query(
      'UPDATE users SET fcm_token = ? WHERE users_id = ?',
      [fcm_token, userId]
    );

    res.json({
      success: true,
      message: 'FCM token berhasil diupdate'
    });

  } catch (error) {
    next(error);
  }
};

// Update Notification Preferences
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { notification_preferences } = req.body;

    if (!notification_preferences || typeof notification_preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences harus berupa object'
      });
    }

    // Validate preference keys
    const validKeys = ['quiz_reminder', 'achievement_unlock', 'cultural_event', 'weekly_challenge', 'friend_activity', 'marketing'];
    const invalidKeys = Object.keys(notification_preferences).filter(key => !validKeys.includes(key));
    
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid preference keys: ${invalidKeys.join(', ')}`
      });
    }

    // Update preferences
    await db.query(
      'UPDATE users SET notification_preferences = ? WHERE users_id = ?',
      [JSON.stringify(notification_preferences), userId]
    );

    res.json({
      success: true,
      message: 'Notification preferences berhasil diupdate'
    });

  } catch (error) {
    next(error);
  }
};

// Get Notification Preferences
exports.getNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const [users] = await db.query(
      'SELECT notification_preferences FROM users WHERE users_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Parse JSON preferences
    let preferences = users[0].notification_preferences;
    if (typeof preferences === 'string') {
      preferences = JSON.parse(preferences);
    }

    res.json({
      success: true,
      data: {
        notification_preferences: preferences || {
          quiz_reminder: true,
          achievement_unlock: true,
          cultural_event: true,
          weekly_challenge: true,
          friend_activity: false,
          marketing: false
        }
      }
    });

  } catch (error) {
    next(error);
  }
};