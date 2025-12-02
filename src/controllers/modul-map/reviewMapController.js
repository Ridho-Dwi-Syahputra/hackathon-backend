/*
 * REVIEW MAP CONTROLLER - SAKO BACKEND
 * Menangani operasi review dan rating tempat wisata
 * Berdasarkan database sako.sql dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const { reviewMapModel } = require('../../models/modul-map/reviewMapModel');
const { responseHelper } = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');
const { generateCustomId } = require('../../utils/customIdGenerator');
const { sendReviewAddedNotification } = require('../firebase/notifikasi/modul-map/mapNotifikasiController');
const db = require('../../config/database');

// Setup logging untuk modul review map
const logReview = (level, message, data = null) => {
    return writeLog('map', level, `[REVIEW] ${message}`, data);
};

const reviewMapController = {

    /**
     * FUNGSIONAL 3: Mendapatkan semua review untuk tempat wisata (dengan paginasi)
     * Endpoint: GET /api/map/places/:id/reviews
     * Response: { user_review, other_reviews, pagination }
     */
    getPlaceReviews: async (req, res) => {
        const startTime = Date.now();
        const { id: touristPlaceId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user?.users_id;

        try {
            logReview('INFO', 
                `Mengambil review untuk tempat ID: ${touristPlaceId}`, {
                    tourist_place_id: touristPlaceId,
                    user_id: userId,
                    page: page,
                    limit: limit,
                    timestamp_indo: getIndonesianTime()
                }
            );

            const reviews = await reviewMapModel.getPlaceReviews(touristPlaceId, userId, parseInt(page), parseInt(limit));

            return responseHelper.success(res, 
                'Review tempat wisata berhasil diambil', 
                reviews
            );

        } catch (error) {
            logReview('ERROR', 
                `Gagal mengambil review: ${error.message}`, {
                    tourist_place_id: touristPlaceId,
                    user_id: userId,
                    error_message: error.message,
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengambil review', 
                500
            );
        }
    },

    /**
     * FUNGSIONAL 4: Toggle like pada review
     * Endpoint: POST /api/map/reviews/:id/toggle-like (ALREADY EXPLICIT)
     * Response: Status like berhasil ditambah/dihapus
     */
    toggleReviewLike: async (req, res) => {
        const startTime = Date.now();
        const { id: reviewId } = req.params;
        const userId = req.user?.users_id;

        try {
            logReview('INFO', 
                `Toggle like review ID: ${reviewId} oleh user: ${userId}`, {
                    review_id: reviewId,
                    user_id: userId,
                    action: 'toggle_review_like',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Generate custom ID untuk review_like
            const reviewLikeId = await generateCustomId(require('../../config/database'), 'RL', 'review_like', 'review_like_id', 3);
            
            const result = await reviewMapModel.toggleReviewLike(userId, reviewId, reviewLikeId);

            return responseHelper.success(res, 
                result.action === 'liked' ? 'Review berhasil disukai' : 'Like review berhasil dihapus', 
                {
                    review_id: reviewId,
                    action: result.action,
                    total_likes: result.total_likes,
                    is_liked_by_me: result.action === 'liked'
                }
            );

        } catch (error) {
            logReview('ERROR', 
                `Gagal toggle like review: ${error.message}`, {
                    review_id: reviewId,
                    user_id: userId,
                    error_message: error.message,
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                error.message.includes('tidak ditemukan') ? 'Review tidak ditemukan' : 'Terjadi kesalahan saat memproses like', 
                error.message.includes('tidak ditemukan') ? 404 : 500
            );
        }
    },

    /**
     * FUNGSIONAL 5: Edit review user
     * Endpoint: PUT /api/map/reviews/:id/edit (EXPLICIT ACTION)
     * Body: { rating, review_text }
     */
    editReview: async (req, res) => {
        const startTime = Date.now();
        const { id: reviewId } = req.params;
        const { rating, review_text } = req.body;
        const userId = req.user?.users_id;

        try {
            logReview('INFO', 
                `Edit review ID: ${reviewId} oleh user: ${userId}`, {
                    review_id: reviewId,
                    user_id: userId,
                    new_rating: rating,
                    action: 'edit_review',
                    timestamp_indo: getIndonesianTime()
                }
            );

            const result = await reviewMapModel.updateReview(userId, reviewId, rating, review_text);

            return responseHelper.success(res, 
                'Review berhasil diperbarui', 
                result
            );

        } catch (error) {
            logReview('ERROR', 
                `Gagal edit review: ${error.message}`, {
                    review_id: reviewId,
                    user_id: userId,
                    error_message: error.message,
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                error.message.includes('tidak ditemukan') ? 'Review tidak ditemukan atau Anda tidak memiliki akses' : 'Terjadi kesalahan saat memperbarui review', 
                error.message.includes('tidak ditemukan') ? 404 : 500
            );
        }
    },

    /**
     * FUNGSIONAL 5: Hapus review user
     * Endpoint: DELETE /api/map/reviews/:id/delete (EXPLICIT ACTION)
     */
    deleteReview: async (req, res) => {
        const startTime = Date.now();
        const { id: reviewId } = req.params;
        const userId = req.user?.users_id;

        try {
            logReview('INFO', 
                `Hapus review ID: ${reviewId} oleh user: ${userId}`, {
                    review_id: reviewId,
                    user_id: userId,
                    action: 'delete_review',
                    timestamp_indo: getIndonesianTime()
                }
            );

            await reviewMapModel.deleteReview(userId, reviewId);

            return responseHelper.success(res, 
                'Review berhasil dihapus', 
                { review_id: reviewId }
            );

        } catch (error) {
            logReview('ERROR', 
                `Gagal hapus review: ${error.message}`, {
                    review_id: reviewId,
                    user_id: userId,
                    error_message: error.message,
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                error.message.includes('tidak ditemukan') ? 'Review tidak ditemukan atau Anda tidak memiliki akses' : 'Terjadi kesalahan saat menghapus review', 
                error.message.includes('tidak ditemukan') ? 404 : 500
            );
        }
    },

    /**
     * FUNGSIONAL 5: Menambahkan review dan rating untuk tempat wisata
     * Endpoint: POST /api/map/places/:id/reviews/add (EXPLICIT ACTION)
     * Body: { tourist_place_id, rating, review_text }
     * Response: Review yang baru ditambahkan + notifikasi FCM
     */
    addReview: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { tourist_place_id, rating, review_text } = req.body;
            userId = req.user?.users_id;

            // Log permintaan tambah review
            logReview('map/review', 'INFO', 
                `Review baru diminta - Place ID: ${tourist_place_id}, Rating: ${rating}`, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    rating: rating,
                    action: 'add_review',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi user login
            if (!userId) {
                const errorMsg = 'User harus login untuk menambahkan review';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    tourist_place_id: tourist_place_id,
                    action: 'add_review',
                    error_type: 'unauthorized',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 401, 'UNAUTHORIZED');
            }

            // Validasi parameter wajib
            if (!tourist_place_id || isNaN(tourist_place_id)) {
                const errorMsg = 'ID tempat wisata tidak valid';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'add_review',
                    validation_error: 'invalid_place_id',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            if (!rating || rating < 1 || rating > 5) {
                const errorMsg = 'Rating harus antara 1-5';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    rating: rating,
                    action: 'add_review',
                    validation_error: 'invalid_rating',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            if (!review_text || review_text.trim().length === 0) {
                const errorMsg = 'Review text tidak boleh kosong';
                
                logReview('ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'add_review',
                    validation_error: 'empty_review_text',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Validasi panjang review text (maksimal 500 karakter)
            if (review_text.trim().length > 500) {
                const errorMsg = 'Review text maksimal 500 karakter';
                
                logReview('ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    review_text_length: review_text.trim().length,
                    action: 'add_review',
                    validation_error: 'review_text_too_long',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Cek apakah user sudah pernah review tempat ini
            const existingReview = await reviewMapModel.checkExistingReview(userId, parseInt(tourist_place_id));
            if (existingReview) {
                const errorMsg = 'Anda sudah memberikan review untuk tempat ini';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'add_review',
                    error_type: 'duplicate_review',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 409, 'DUPLICATE_REVIEW');
            }

            // Generate custom ID untuk review (format: RV001, RV002, ...)
            const reviewId = await generateCustomId(db, 'RV', 'review', 'review_id', 3);

            // Simpan review baru
            const reviewData = {
                review_id: reviewId,
                user_id: userId,
                tourist_place_id: tourist_place_id,
                rating: parseInt(rating),
                review_text: review_text
            };

            const newReview = await reviewMapModel.createReview(reviewData);

            // Kirim notifikasi FCM ke user
            try {
                await sendReviewAddedNotification(userId, parseInt(tourist_place_id), parseInt(rating));
                
                logReview('map/review', 'INFO', 
                    `Notifikasi review berhasil dikirim`, {
                        user_id: userId,
                        tourist_place_id: tourist_place_id,
                        rating: rating,
                        notification_sent: true,
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    }
                );
            } catch (notifError) {
                console.warn('⚠️ Gagal mengirim notifikasi review:', notifError);
                
                logReview('map/review', 'WARNING', 
                    `Gagal mengirim notifikasi review: ${notifError.message}`, {
                        user_id: userId,
                        tourist_place_id: tourist_place_id,
                        rating: rating,
                        notification_sent: false,
                        notification_error: notifError.message,
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    }
                );
            }

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logReview('map/review', 'SUCCESS', 
                `Review berhasil ditambahkan - ${newReview.place_name}`, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    place_name: newReview.place_name,
                    rating: rating,
                    review_id: newReview.review_id,
                    action: 'add_review',
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Return response sesuai database tanpa modifikasi
            return responseHelper.success(res, 
                'Review berhasil ditambahkan', 
                {
                    review: newReview,
                    place_stats: {
                        total_reviews: newReview.total_reviews,
                        average_rating: parseFloat(newReview.average_rating).toFixed(1)
                    }
                }
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error add review:', error);

            logReview('map/errors', 'ERROR', 
                `Error menambahkan review: ${error.message}`, {
                    user_id: userId,
                    tourist_place_id: req.body.tourist_place_id,
                    action: 'add_review',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat menambahkan review', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
};

module.exports = { reviewMapController };
