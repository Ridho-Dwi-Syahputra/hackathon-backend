//profileController.js

const bcrypt = require('bcryptjs');
const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Get Profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const [users] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.total_xp, u.user_image_url, u.status,
              up.total_points, up.lifetime_points
       FROM users u
       LEFT JOIN user_points up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = users[0];

    // Get badges
    const [badges] = await db.query(
      `SELECT b.id, b.name, b.description, b.image_url, ub.earned_at
       FROM user_badge ub
       JOIN badge b ON ub.badge_id = b.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        total_xp: user.total_xp,
        profile_image: user.user_image_url,
        total_points: user.total_points || 0,
        lifetime_points: user.lifetime_points || 0,
        badges: badges
      }
    });

  } catch (error) {
    next(error);
  }
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { full_name, email } = req.body;

    // Validation
    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap dan email harus diisi'
      });
    }

    // Check if email already used by another user
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan'
      });
    }

    // Update user
    await db.query(
      'UPDATE users SET full_name = ?, email = ?, updated_at = NOW() WHERE id = ?',
      [full_name, email, userId]
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui'
    });

  } catch (error) {
    next(error);
  }
};

// Update Profile Image
exports.updateProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File gambar harus diupload'
      });
    }

    // Get old image
    const [users] = await db.query(
      'SELECT user_image_url FROM users WHERE id = ?',
      [userId]
    );

    const oldImage = users[0]?.user_image_url;

    // Delete old image if exists
    if (oldImage) {
      const oldImagePath = path.join(__dirname, '../../public', oldImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image path
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    
    await db.query(
      'UPDATE users SET user_image_url = ?, updated_at = NOW() WHERE id = ?',
      [imagePath, userId]
    );

    res.json({
      success: true,
      message: 'Foto profil berhasil diperbarui',
      data: {
        image_url: imagePath
      }
    });

  } catch (error) {
    next(error);
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { current_password, new_password } = req.body;

    // Validation
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru harus diisi'
      });
    }

    // Get current password hash
    const [users] = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, users[0].password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    next(error);
  }
};
