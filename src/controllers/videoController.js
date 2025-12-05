//videoController.js

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Get Videos with Pagination and Filters
exports.getVideos = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { search, kategori, page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = 'v.is_active = 1';
    const params = [];

    if (search) {
      whereClause += ' AND (v.judul LIKE ? OR v.deskripsi LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (kategori) {
      whereClause += ' AND v.kategori = ?';
      params.push(kategori);
    }

    // Get videos
    const [videos] = await db.query(
      `SELECT 
         v.*,
         CASE WHEN fv.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited
       FROM video v
       LEFT JOIN favorit_video fv ON v.id = fv.id_video AND fv.id_user = ?
       WHERE ${whereClause}
       ORDER BY v.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, ...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM video v WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get Video Detail
exports.getVideoDetail = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { videoId } = req.params;

    const [videos] = await db.query(
      `SELECT 
         v.*,
         CASE WHEN fv.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited
       FROM video v
       LEFT JOIN favorit_video fv ON v.id = fv.id_video AND fv.id_user = ?
       WHERE v.id = ? AND v.is_active = 1`,
      [userId, videoId]
    );

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: videos[0]
    });

  } catch (error) {
    next(error);
  }
};

// Add Favorite Video
exports.addFavoriteVideo = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { videoId } = req.params;

    // Check if video exists
    const [videos] = await db.query(
      'SELECT id FROM video WHERE id = ? AND is_active = 1',
      [videoId]
    );

    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan'
      });
    }

    // Check if already favorited
    const [existing] = await db.query(
      'SELECT id FROM favorit_video WHERE id_user = ? AND id_video = ?',
      [userId, videoId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Video sudah ada di favorit'
      });
    }

    // Add to favorites
    await db.query(
      'INSERT INTO favorit_video (id, id_user, id_video, tanggal_ditambah) VALUES (?, ?, ?, NOW())',
      [uuidv4(), userId, videoId]
    );

    res.json({
      success: true,
      message: 'Video berhasil ditambahkan ke favorit'
    });

  } catch (error) {
    next(error);
  }
};

// Remove Favorite Video
exports.removeFavoriteVideo = async (req, res, next) => {
  try {
    const userId = req.user.users_id;
    const { videoId } = req.params;

    const result = await db.query(
      'DELETE FROM favorit_video WHERE id_user = ? AND id_video = ?',
      [userId, videoId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video tidak ditemukan di favorit'
      });
    }

    res.json({
      success: true,
      message: 'Video berhasil dihapus dari favorit'
    });

  } catch (error) {
    next(error);
  }
};

// Get Favorite Videos
exports.getFavoriteVideos = async (req, res, next) => {
  try {
    const userId = req.user.users_id;

    const [videos] = await db.query(
      `SELECT v.*, fv.tanggal_ditambah, 1 as is_favorited
       FROM favorit_video fv
       JOIN video v ON fv.id_video = v.id
       WHERE fv.id_user = ? AND v.is_active = 1
       ORDER BY fv.tanggal_ditambah DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: videos
    });

  } catch (error) {
    next(error);
  }
};
