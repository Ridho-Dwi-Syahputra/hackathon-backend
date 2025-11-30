/*
 * REVIEW MAP CONTROLLER - SAKO BACKEND
 * Menangani operasi review dan rating tempat wisata
 * Berdasarkan database sako.sql dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const { reviewMapModel } = require('../../models/modul-map/reviewMapModel');
const { responseHelper } = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');
const { sendReviewSubmittedNotification } = require('../firebase/notifikasi/modul-map/mapNotifikasiController');

// Setup logging untuk modul review map
const logReview = (level, message, data = null) => {
    return writeLog('map', level, `[REVIEW] ${message}`, data);
};

const reviewMapController = {

    /**
     * FUNGSIONAL 4: Menambahkan review dan rating untuk tempat wisata
     * Endpoint: POST /api/map/review/add
     * Body: { tourist_place_id, rating, comment }
     * Response: Review yang baru ditambahkan + notifikasi FCM
     */
    addReview: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { tourist_place_id, rating, comment } = req.body;
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

            if (!comment || comment.trim().length === 0) {
                const errorMsg = 'Komentar tidak boleh kosong';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'add_review',
                    validation_error: 'empty_comment',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Validasi panjang komentar (maksimal 500 karakter)
            if (comment.trim().length > 500) {
                const errorMsg = 'Komentar maksimal 500 karakter';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    comment_length: comment.trim().length,
                    action: 'add_review',
                    validation_error: 'comment_too_long',
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

            // Simpan review baru
            const reviewData = {
                user_id: userId,
                tourist_place_id: parseInt(tourist_place_id),
                rating: parseInt(rating),
                comment: comment.trim()
            };

            const newReview = await reviewMapModel.addReview(reviewData);

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
    },

    /**
     * FUNGSIONAL 5: Mendapatkan semua review untuk tempat wisata tertentu
     * Endpoint: GET /api/map/review/:tourist_place_id
     * Query: ?page=1&limit=10&sort=newest|oldest|highest|lowest
     * Response: Daftar review dengan pagination
     */
    getPlaceReviews: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { tourist_place_id } = req.params;
            const { page = 1, limit = 10, sort = 'newest' } = req.query;
            userId = req.user?.users_id || 'GUEST';

            // Log permintaan daftar review
            logReview('map/review', 'INFO', 
                `Daftar review diminta - Place ID: ${tourist_place_id}`, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    page: page,
                    limit: limit,
                    sort: sort,
                    action: 'get_place_reviews',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi parameter
            if (!tourist_place_id || isNaN(tourist_place_id)) {
                const errorMsg = 'ID tempat wisata tidak valid';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'get_place_reviews',
                    validation_error: 'invalid_place_id',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Validasi pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
                const errorMsg = 'Parameter pagination tidak valid (page >= 1, limit 1-50)';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    page: pageNum,
                    limit: limitNum,
                    action: 'get_place_reviews',
                    validation_error: 'invalid_pagination',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Validasi sort parameter
            const validSorts = ['newest', 'oldest', 'highest', 'lowest'];
            if (!validSorts.includes(sort)) {
                const errorMsg = 'Parameter sort tidak valid (newest, oldest, highest, lowest)';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    sort: sort,
                    action: 'get_place_reviews',
                    validation_error: 'invalid_sort',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Ambil review dari model
            const reviewsResult = await reviewMapModel.getPlaceReviews(
                parseInt(tourist_place_id), 
                pageNum, 
                limitNum, 
                sort
            );

            if (!reviewsResult) {
                const errorMsg = 'Tempat wisata tidak ditemukan';
                
                logReview('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    action: 'get_place_reviews',
                    error_type: 'place_not_found',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 404, 'PLACE_NOT_FOUND');
            }

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logReview('map/review', 'SUCCESS', 
                `Review berhasil diambil - ${reviewsResult.place_name}`, {
                    user_id: userId,
                    tourist_place_id: tourist_place_id,
                    place_name: reviewsResult.place_name,
                    total_reviews: reviewsResult.total_reviews,
                    page: pageNum,
                    limit: limitNum,
                    sort: sort,
                    action: 'get_place_reviews',
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.success(res, 
                'Review berhasil diambil', 
                {
                    place: {
                        tourist_place_id: parseInt(tourist_place_id),
                        name: reviewsResult.place_name,
                        total_reviews: reviewsResult.total_reviews,
                        average_rating: reviewsResult.average_rating
                    },
                    reviews: reviewsResult.reviews,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total_pages: reviewsResult.total_pages,
                        total_reviews: reviewsResult.total_reviews,
                        has_next: pageNum < reviewsResult.total_pages,
                        has_prev: pageNum > 1
                    },
                    sort: sort
                }
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error get place reviews:', error);

            logReview('map/errors', 'ERROR', 
                `Error mengambil review: ${error.message}`, {
                    user_id: userId,
                    tourist_place_id: req.params.tourist_place_id,
                    action: 'get_place_reviews',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengambil review', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
};

module.exports = { reviewMapController };
