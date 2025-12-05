// videoCollectionController.js

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Create New Collection
exports.createCollection = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { nama_koleksi, deskripsi, thumbnail_url } = req.body;

        // Validation
        if (!nama_koleksi || nama_koleksi.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nama koleksi tidak boleh kosong',
            });
        }

        if (nama_koleksi.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Nama koleksi maksimal 100 karakter',
            });
        }

        // Check if collection name already exists for this user
        const existingResult = await db.query('SELECT id FROM video_collection WHERE id_user = ? AND nama_koleksi = ?', [userId, nama_koleksi.trim()]);
        const existing = existingResult;

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Nama koleksi sudah digunakan',
            });
        }

        // Create collection
        const collectionId = uuidv4();
        await db.query('INSERT INTO video_collection (id, id_user, nama_koleksi, deskripsi, thumbnail_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [collectionId, userId, nama_koleksi.trim(), deskripsi || null, thumbnail_url || null]);

        res.status(201).json({
            success: true,
            message: 'Koleksi berhasil dibuat',
            data: {
                id: collectionId,
                nama_koleksi: nama_koleksi.trim(),
                deskripsi: deskripsi || null,
                thumbnail_url: thumbnail_url || null,
                jumlah_video: 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get All Collections for User
exports.getCollections = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        const collections = await db.query(
            `SELECT 
                vc.*,
                (SELECT v.thumbnail_url FROM collection_video cv 
                 JOIN video v ON cv.id_video = v.id 
                 WHERE cv.id_collection = vc.id 
                 ORDER BY cv.tanggal_ditambah DESC 
                 LIMIT 1) as latest_video_thumbnail
            FROM video_collection vc
            WHERE vc.id_user = ?
            ORDER BY vc.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: collections,
        });
    } catch (error) {
        next(error);
    }
};

// Get Collection Detail with Videos
exports.getCollectionDetail = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { collectionId } = req.params;

        // Get collection info
        const collectionResult = await db.query('SELECT * FROM video_collection WHERE id = ? AND id_user = ?', [collectionId, userId]);
        const collectionData = collectionResult;

        if (collectionData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Koleksi tidak ditemukan',
            });
        }

        // Get videos in collection
        const videosResult = await db.query(
            `SELECT 
                v.*,
                cv.tanggal_ditambah as added_to_collection_at,
                1 as is_favorited,
                1 as is_in_collection
            FROM collection_video cv
            JOIN video v ON cv.id_video = v.id
            WHERE cv.id_collection = ? AND v.is_active = 1
            ORDER BY cv.tanggal_ditambah DESC`,
            [collectionId]
        );
        const videos = videosResult;

        res.json({
            success: true,
            data: {
                collection: collectionData[0],
                videos: videos,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Add Video to Collection
exports.addVideoToCollection = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { collectionId, videoId } = req.params;

        // Check if collection belongs to user
        const collectionResult = await db.query('SELECT id FROM video_collection WHERE id = ? AND id_user = ?', [collectionId, userId]);
        const collection = collectionResult;

        if (collection.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Koleksi tidak ditemukan',
            });
        }

        // Check if video exists and is active
        const videoResult = await db.query('SELECT id FROM video WHERE id = ? AND is_active = 1', [videoId]);
        const video = videoResult;

        if (video.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Video tidak ditemukan',
            });
        }

        // Check if video is in user's favorites
        const favoriteResult = await db.query('SELECT id FROM favorit_video WHERE id_user = ? AND id_video = ?', [userId, videoId]);
        const favorite = favoriteResult;

        if (favorite.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Video harus ada di favorit terlebih dahulu',
            });
        }

        // Check if video already in collection
        const existingResult = await db.query('SELECT id FROM collection_video WHERE id_collection = ? AND id_video = ?', [collectionId, videoId]);
        const existing = existingResult;

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Video sudah ada di koleksi ini',
            });
        }

        // Add video to collection
        await db.query('INSERT INTO collection_video (id, id_collection, id_video, tanggal_ditambah) VALUES (?, ?, ?, NOW())', [uuidv4(), collectionId, videoId]);

        res.json({
            success: true,
            message: 'Video berhasil ditambahkan ke koleksi',
        });
    } catch (error) {
        next(error);
    }
};

// Remove Video from Collection
exports.removeVideoFromCollection = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { collectionId, videoId } = req.params;

        // Check if collection belongs to user
        const collectionResult = await db.query('SELECT id FROM video_collection WHERE id = ? AND id_user = ?', [collectionId, userId]);
        const collection = collectionResult;

        if (collection.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Koleksi tidak ditemukan',
            });
        }

        // Remove video from collection
        const result = await db.query('DELETE FROM collection_video WHERE id_collection = ? AND id_video = ?', [collectionId, videoId]);

        const affectedRows = result.affectedRows ?? 0;

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Video tidak ditemukan di koleksi ini',
            });
        }

        res.json({
            success: true,
            message: 'Video berhasil dihapus dari koleksi',
        });
    } catch (error) {
        next(error);
    }
};

// Update Collection
exports.updateCollection = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { collectionId } = req.params;
        const { nama_koleksi, deskripsi, thumbnail_url } = req.body;

        // Check if collection belongs to user
        const collectionResult = await db.query('SELECT id FROM video_collection WHERE id = ? AND id_user = ?', [collectionId, userId]);
        const collection = collectionResult;

        if (collection.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Koleksi tidak ditemukan',
            });
        }

        // Validation
        if (nama_koleksi && nama_koleksi.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Nama koleksi tidak boleh kosong',
            });
        }

        if (nama_koleksi && nama_koleksi.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Nama koleksi maksimal 100 karakter',
            });
        }

        // Check duplicate name (exclude current collection)
        if (nama_koleksi) {
            const existingResult = await db.query('SELECT id FROM video_collection WHERE id_user = ? AND nama_koleksi = ? AND id != ?', [userId, nama_koleksi.trim(), collectionId]);
            const existing = existingResult;

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama koleksi sudah digunakan',
                });
            }
        }

        // Build update query
        const updates = [];
        const params = [];

        if (nama_koleksi !== undefined) {
            updates.push('nama_koleksi = ?');
            params.push(nama_koleksi.trim());
        }
        if (deskripsi !== undefined) {
            updates.push('deskripsi = ?');
            params.push(deskripsi || null);
        }
        if (thumbnail_url !== undefined) {
            updates.push('thumbnail_url = ?');
            params.push(thumbnail_url || null);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada data yang diupdate',
            });
        }

        params.push(collectionId);

        await db.query(`UPDATE video_collection SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

        res.json({
            success: true,
            message: 'Koleksi berhasil diupdate',
        });
    } catch (error) {
        next(error);
    }
};

// Delete Collection
exports.deleteCollection = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { collectionId } = req.params;

        // Check if collection belongs to user
        const collectionResult = await db.query('SELECT id FROM video_collection WHERE id = ? AND id_user = ?', [collectionId, userId]);
        const collection = collectionResult;

        if (collection.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Koleksi tidak ditemukan',
            });
        }

        // Delete collection (cascade will delete collection_video entries)
        await db.query('DELETE FROM video_collection WHERE id = ?', [collectionId]);

        res.json({
            success: true,
            message: 'Koleksi berhasil dihapus',
        });
    } catch (error) {
        next(error);
    }
};

// Get Collections for a Specific Video (where can I add this video?)
exports.getCollectionsForVideo = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { videoId } = req.params;

        // Get all user's collections with flag if video is already in collection
        const collections = await db.query(
            `SELECT 
                vc.*,
                CASE WHEN cv.id IS NOT NULL THEN 1 ELSE 0 END as video_in_collection
            FROM video_collection vc
            LEFT JOIN collection_video cv ON vc.id = cv.id_collection AND cv.id_video = ?
            WHERE vc.id_user = ?
            ORDER BY vc.created_at DESC`,
            [videoId, userId]
        );

        res.json({
            success: true,
            data: collections,
        });
    } catch (error) {
        next(error);
    }
};
