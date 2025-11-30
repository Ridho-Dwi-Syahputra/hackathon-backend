/*
 * DETAIL MAP CONTROLLER - SAKO BACKEND
 * Menangani operasi detail tempat wisata dan manajemen favorit
 * Berdasarkan database sako.sql dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const { detailMapModel } = require('../../models/modul-map/detailMapModel');
const { responseHelper } = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');
const { sendPlaceVisitedNotification } = require('../firebase/notifikasi/modul-map/mapNotifikasiController');

// Setup logging untuk modul detail map
const logDetail = (level, message, data = null) => {
    return writeLog('map', level, `[DETAIL] ${message}`, data);
};

const detailMapController = {

    /**
     * FUNGSIONAL 1: Mendapatkan detail lengkap tempat wisata
     * Endpoint: GET /api/map/detail/:id
     * Response: Data detail tempat wisata dengan informasi review
     */
    getPlaceDetail: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { id: touristPlaceId } = req.params;
            userId = req.user?.users_id || 'GUEST';

            // Log permintaan detail tempat
            logDetail('INFO', 
                `Detail tempat wisata diminta - Place ID: ${touristPlaceId}`, {
                    user_id: userId,
                    tourist_place_id: touristPlaceId,
                    action: 'get_place_detail',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi parameter
            if (!touristPlaceId || isNaN(touristPlaceId)) {
                const errorMsg = 'ID tempat wisata tidak valid';
                
                logDetail('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: touristPlaceId,
                    action: 'get_place_detail',
                    validation_error: 'invalid_place_id',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Ambil detail tempat wisata dari model
            const placeDetail = await detailMapModel.getPlaceDetail(parseInt(touristPlaceId));

            if (!placeDetail) {
                const errorMsg = 'Tempat wisata tidak ditemukan';
                
                logDetail('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: touristPlaceId,
                    action: 'get_place_detail',
                    error_type: 'not_found',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 404, 'PLACE_NOT_FOUND');
            }

            // Cek status favorit jika user login
            let isFavorite = false;
            if (userId !== 'GUEST') {
                isFavorite = await detailMapModel.checkFavoriteStatus(userId, parseInt(touristPlaceId));
            }

            // Format response sesuai kebutuhan Android
            const response = {
                tourist_place_id: placeDetail.tourist_place_id,
                name: placeDetail.name,
                description: placeDetail.description,
                address: placeDetail.address,
                latitude: parseFloat(placeDetail.latitude),
                longitude: parseFloat(placeDetail.longitude),
                category: placeDetail.category,
                images: placeDetail.images ? placeDetail.images.split(',').map(img => img.trim()) : [],
                operating_hours: placeDetail.operating_hours,
                contact_info: placeDetail.contact_info,
                facilities: placeDetail.facilities ? placeDetail.facilities.split(',').map(f => f.trim()) : [],
                entrance_fee: placeDetail.entrance_fee,
                website: placeDetail.website,
                social_media: placeDetail.social_media,
                created_at: placeDetail.created_at,
                updated_at: placeDetail.updated_at,
                // Informasi review dan rating
                total_reviews: placeDetail.total_reviews || 0,
                average_rating: placeDetail.average_rating ? parseFloat(placeDetail.average_rating).toFixed(1) : '0.0',
                recent_reviews: placeDetail.recent_reviews || [],
                // Status favorit
                is_favorite: isFavorite,
                // Status user
                user_logged_in: userId !== 'GUEST'
            };

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logDetail('map/detail', 'SUCCESS', 
                `Detail tempat berhasil diambil - ${placeDetail.name}`, {
                    user_id: userId,
                    tourist_place_id: touristPlaceId,
                    place_name: placeDetail.name,
                    action: 'get_place_detail',
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.success(res, 
                'Detail tempat wisata berhasil diambil', 
                response
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error get place detail:', error);

            logDetail('map/errors', 'ERROR', 
                `Error mengambil detail tempat: ${error.message}`, {
                    user_id: userId,
                    tourist_place_id: req.params.id,
                    action: 'get_place_detail',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengambil detail tempat wisata', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    },

    /**
     * FUNGSIONAL 2: Menambahkan/menghapus tempat dari daftar favorit
     * Endpoint: POST /api/map/favorite/toggle
     * Body: { tourist_place_id }
     * Response: Status favorit terbaru
     */
    toggleFavorite: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { tourist_place_id } = req.body;
            userId = req.user?.users_id;

            // Log permintaan toggle favorit
            logDetail('map/favorite', 'INFO', 
                `Toggle favorit diminta - Place ID: ${tourist_place_id}`, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'toggle_favorite',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi user login
            if (!userId) {
                const errorMsg = 'User harus login untuk menambah favorit';
                
                logDetail('map/errors', 'ERROR', errorMsg, {
                    tourist_place_id: tourist_place_id,
                    action: 'toggle_favorite',
                    error_type: 'unauthorized',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 401, 'UNAUTHORIZED');
            }

            // Validasi parameter
            if (!tourist_place_id || isNaN(tourist_place_id)) {
                const errorMsg = 'ID tempat wisata tidak valid';
                
                logDetail('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'toggle_favorite',
                    validation_error: 'invalid_place_id',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Cek apakah tempat wisata ada
            const placeExists = await detailMapModel.checkPlaceExists(parseInt(tourist_place_id));
            if (!placeExists) {
                const errorMsg = 'Tempat wisata tidak ditemukan';
                
                logDetail('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'toggle_favorite',
                    error_type: 'place_not_found',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 404, 'PLACE_NOT_FOUND');
            }

            // Toggle status favorit
            const result = await detailMapModel.toggleFavorite(userId, parseInt(tourist_place_id));

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logDetail('map/favorite', 'SUCCESS', 
                `Favorit ${result.action} - Place ID: ${tourist_place_id}`, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    place_name: result.place_name,
                    action: 'toggle_favorite',
                    favorite_action: result.action, // 'added' atau 'removed'
                    is_favorite: result.is_favorite,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            const message = result.action === 'added' 
                ? `${result.place_name} ditambahkan ke favorit`
                : `${result.place_name} dihapus dari favorit`;

            return responseHelper.success(res, message, {
                tourist_place_id: parseInt(tourist_place_id),
                place_name: result.place_name,
                is_favorite: result.is_favorite,
                action: result.action,
                total_favorites: result.total_favorites
            });

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error toggle favorite:', error);

            logDetail('map/errors', 'ERROR', 
                `Error toggle favorit: ${error.message}`, {
                    user_id: userId,
                    tourist_place_id: req.body.tourist_place_id,
                    action: 'toggle_favorite',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengubah status favorit', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    },

    /**
     * FUNGSIONAL 3: Mendapatkan daftar tempat favorit user
     * Endpoint: GET /api/map/favorites
     * Response: Daftar tempat wisata favorit user
     */
    getUserFavorites: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            userId = req.user?.users_id;

            // Log permintaan daftar favorit
            logDetail('map/favorite', 'INFO', 
                `Daftar favorit diminta oleh user`, {
                    user_id: userId,
                    action: 'get_user_favorites',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi user login
            if (!userId) {
                const errorMsg = 'User harus login untuk melihat favorit';
                
                logDetail('map/errors', 'ERROR', errorMsg, {
                    action: 'get_user_favorites',
                    error_type: 'unauthorized',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 401, 'UNAUTHORIZED');
            }

            // Ambil daftar favorit dari model
            const favorites = await detailMapModel.getUserFavorites(userId);

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logDetail('map/favorite', 'SUCCESS', 
                `Daftar favorit berhasil diambil - Total: ${favorites.length}`, {
                    user_id: userId,
                    action: 'get_user_favorites',
                    total_favorites: favorites.length,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.success(res, 
                'Daftar tempat favorit berhasil diambil', 
                {
                    total_favorites: favorites.length,
                    favorites: favorites
                }
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error get user favorites:', error);

            logDetail('map/errors', 'ERROR', 
                `Error mengambil daftar favorit: ${error.message}`, {
                    user_id: userId,
                    action: 'get_user_favorites',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengambil daftar favorit', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
};

module.exports = { detailMapController };
