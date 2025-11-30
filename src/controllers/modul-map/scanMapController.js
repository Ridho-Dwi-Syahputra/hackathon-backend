/*
 * SCAN MAP CONTROLLER - SAKO BACKEND
 * Menangani operasi scan QR code dan pencatatan kunjungan
 * Berdasarkan database sako.sql dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const { scanMapModel } = require('../../models/modul-map/scanMapModel');
const { responseHelper } = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');
const { sendQrScanSuccessNotification } = require('../firebase/notifikasi/modul-map/mapNotifikasiController');

// Setup logging untuk modul scan map
const logScan = (level, message, data = null) => {
    return writeLog('map', level, `[SCAN] ${message}`, data);
};

const scanMapController = {

    /**
     * FUNGSIONAL 6: Scan QR code di tempat wisata dan catat kunjungan
     * Endpoint: POST /api/map/scan/qr
     * Body: { qr_code_value, latitude?, longitude? }
     * Response: Data tempat wisata + pencatatan kunjungan + notifikasi FCM
     */
    scanQRCode: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { qr_code_value, latitude, longitude } = req.body;
            userId = req.user?.users_id;

            // Log permintaan scan QR
            logScan('map/scan', 'INFO', 
                `QR Code scan diminta - QR: ${qr_code_value}`, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    user_latitude: latitude || null,
                    user_longitude: longitude || null,
                    action: 'scan_qr_code',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi user login
            if (!userId) {
                const errorMsg = 'User harus login untuk scan QR code';
                
                logScan('map/errors', 'ERROR', errorMsg, {
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    error_type: 'unauthorized',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 401, 'UNAUTHORIZED');
            }

            // Validasi parameter QR code
            if (!qr_code_value || qr_code_value.trim().length === 0) {
                const errorMsg = 'QR code value tidak boleh kosong';
                
                logScan('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    validation_error: 'empty_qr_code',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Validasi koordinat jika diberikan
            if (latitude !== undefined || longitude !== undefined) {
                if (latitude === undefined || longitude === undefined || 
                    isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
                    const errorMsg = 'Koordinat latitude dan longitude harus keduanya valid';
                    
                    logScan('map/errors', 'ERROR', errorMsg, {
                        user_id: userId,
                        qr_code_value: qr_code_value,
                        latitude: latitude,
                        longitude: longitude,
                        action: 'scan_qr_code',
                        validation_error: 'invalid_coordinates',
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    });

                    return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
                }
            }

            // Cari tempat wisata berdasarkan QR code
            const touristPlace = await scanMapModel.findPlaceByQR(qr_code_value.trim());

            if (!touristPlace) {
                const errorMsg = 'QR code tidak valid atau tempat wisata tidak ditemukan';
                
                logScan('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    error_type: 'invalid_qr_code',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 404, 'INVALID_QR_CODE');
            }

            // Validasi lokasi jika koordinat disediakan
            let locationValid = true;
            let distanceFromPlace = null;

            if (latitude !== undefined && longitude !== undefined) {
                const userLat = parseFloat(latitude);
                const userLng = parseFloat(longitude);
                const placeLat = parseFloat(touristPlace.latitude);
                const placeLng = parseFloat(touristPlace.longitude);

                // Hitung jarak menggunakan formula Haversine
                distanceFromPlace = scanMapModel.calculateDistance(userLat, userLng, placeLat, placeLng);
                
                // Radius maksimal 500 meter dari tempat wisata
                const MAX_DISTANCE_KM = 0.5;
                locationValid = distanceFromPlace <= MAX_DISTANCE_KM;

                if (!locationValid) {
                    const errorMsg = `Anda terlalu jauh dari ${touristPlace.name}. Jarak: ${(distanceFromPlace * 1000).toFixed(0)}m (maksimal 500m)`;
                    
                    logScan('map/errors', 'ERROR', errorMsg, {
                        user_id: userId,
                        qr_code_value: qr_code_value,
                        tourist_place_id: touristPlace.tourist_place_id,
                        place_name: touristPlace.name,
                        distance_km: distanceFromPlace,
                        max_distance_km: MAX_DISTANCE_KM,
                        user_latitude: userLat,
                        user_longitude: userLng,
                        place_latitude: placeLat,
                        place_longitude: placeLng,
                        action: 'scan_qr_code',
                        error_type: 'location_too_far',
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    });

                    return responseHelper.error(res, errorMsg, 403, 'LOCATION_TOO_FAR');
                }
            }

            // Cek apakah user sudah pernah mengunjungi tempat ini hari ini
            const existingVisit = await scanMapModel.checkTodayVisit(userId, touristPlace.tourist_place_id);
            
            let visitData = null;
            let isFirstVisitToday = true;

            if (existingVisit) {
                visitData = existingVisit;
                isFirstVisitToday = false;
                
                logScan('map/scan', 'INFO', 
                    `User sudah mengunjungi tempat ini hari ini`, {
                        user_id: userId,
                        tourist_place_id: touristPlace.tourist_place_id,
                        place_name: touristPlace.name,
                        first_visit_today: existingVisit.visit_date,
                        action: 'scan_qr_code',
                        is_repeat_visit: true,
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    }
                );
            } else {
                // Catat kunjungan baru
                visitData = await scanMapModel.recordVisit({
                    user_id: userId,
                    tourist_place_id: touristPlace.tourist_place_id,
                    qr_code_value: qr_code_value.trim(),
                    user_latitude: latitude || null,
                    user_longitude: longitude || null,
                    distance_from_place: distanceFromPlace
                });

                // Kirim notifikasi FCM untuk kunjungan pertama hari ini
                try {
                    await sendPlaceVisitedNotification(
                        userId, 
                        touristPlace.tourist_place_id, 
                        qr_code_value.trim()
                    );
                    
                    logScan('map/scan', 'INFO', 
                        `Notifikasi kunjungan berhasil dikirim`, {
                            user_id: userId,
                            tourist_place_id: touristPlace.tourist_place_id,
                            place_name: touristPlace.name,
                            notification_sent: true,
                            platform: 'android_kotlin',
                            timestamp_indo: getIndonesianTime()
                        }
                    );
                } catch (notifError) {
                    console.warn('⚠️ Gagal mengirim notifikasi kunjungan:', notifError);
                    
                    logScan('map/scan', 'WARNING', 
                        `Gagal mengirim notifikasi kunjungan: ${notifError.message}`, {
                            user_id: userId,
                            tourist_place_id: touristPlace.tourist_place_id,
                            place_name: touristPlace.name,
                            notification_sent: false,
                            notification_error: notifError.message,
                            platform: 'android_kotlin',
                            timestamp_indo: getIndonesianTime()
                        }
                    );
                }
            }

            // Ambil statistik kunjungan user
            const visitStats = await scanMapModel.getUserVisitStats(userId);

            // Format response untuk Android
            const response = {
                scan_success: true,
                tourist_place: {
                    tourist_place_id: touristPlace.tourist_place_id,
                    name: touristPlace.name,
                    description: touristPlace.description,
                    address: touristPlace.address,
                    latitude: parseFloat(touristPlace.latitude),
                    longitude: parseFloat(touristPlace.longitude),
                    category: touristPlace.category,
                    images: touristPlace.images ? touristPlace.images.split(',').map(img => img.trim()) : [],
                    operating_hours: touristPlace.operating_hours,
                    facilities: touristPlace.facilities ? touristPlace.facilities.split(',').map(f => f.trim()) : []
                },
                visit_info: {
                    visit_id: visitData.visit_id,
                    visit_date: visitData.visit_date,
                    visit_time: visitData.visit_time,
                    is_first_visit_today: isFirstVisitToday,
                    user_location: {
                        latitude: latitude || null,
                        longitude: longitude || null,
                        distance_from_place_m: distanceFromPlace ? Math.round(distanceFromPlace * 1000) : null,
                        location_verified: locationValid
                    }
                },
                user_stats: visitStats,
                qr_code_info: {
                    qr_code_value: qr_code_value.trim(),
                    scan_timestamp: new Date().toISOString()
                },
                suggestions: {
                    add_review: !isFirstVisitToday, // Suggest review if user has visited before
                    explore_nearby: true,
                    collect_badge: visitStats.unique_places_visited >= 5 // Suggest badge collection
                }
            };

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logScan('map/scan', 'SUCCESS', 
                `QR scan berhasil - ${touristPlace.name}`, {
                    user_id: userId,
                    tourist_place_id: touristPlace.tourist_place_id,
                    place_name: touristPlace.name,
                    qr_code_value: qr_code_value,
                    visit_id: visitData.visit_id,
                    is_first_visit_today: isFirstVisitToday,
                    distance_from_place_m: distanceFromPlace ? Math.round(distanceFromPlace * 1000) : null,
                    action: 'scan_qr_code',
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            const message = isFirstVisitToday 
                ? `Selamat datang di ${touristPlace.name}! Kunjungan Anda telah tercatat.`
                : `Selamat datang kembali di ${touristPlace.name}!`;

            return responseHelper.success(res, message, response);

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error scan QR code:', error);

            logScan('map/errors', 'ERROR', 
                `Error scan QR code: ${error.message}`, {
                    user_id: userId,
                    qr_code_value: req.body.qr_code_value,
                    action: 'scan_qr_code',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat memproses scan QR code', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    },

    /**
     * BONUS: Mendapatkan riwayat kunjungan user
     * Endpoint: GET /api/map/scan/history
     * Query: ?page=1&limit=10
     * Response: Riwayat kunjungan user dengan pagination
     */
    getUserVisitHistory: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { page = 1, limit = 10 } = req.query;
            userId = req.user?.users_id;

            // Log permintaan riwayat
            logScan('map/scan', 'INFO', 
                `Riwayat kunjungan diminta`, {
                    user_id: userId,
                    page: page,
                    limit: limit,
                    action: 'get_visit_history',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi user login
            if (!userId) {
                const errorMsg = 'User harus login untuk melihat riwayat kunjungan';
                
                logScan('map/errors', 'ERROR', errorMsg, {
                    action: 'get_visit_history',
                    error_type: 'unauthorized',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 401, 'UNAUTHORIZED');
            }

            // Validasi pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
                const errorMsg = 'Parameter pagination tidak valid (page >= 1, limit 1-50)';
                
                logScan('map/errors', 'ERROR', errorMsg, {
                    user_id: userId,
                    page: pageNum,
                    limit: limitNum,
                    action: 'get_visit_history',
                    validation_error: 'invalid_pagination',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Ambil riwayat dari model
            const historyResult = await scanMapModel.getUserVisitHistory(userId, pageNum, limitNum);

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logScan('map/scan', 'SUCCESS', 
                `Riwayat kunjungan berhasil diambil`, {
                    user_id: userId,
                    total_visits: historyResult.total_visits,
                    unique_places: historyResult.unique_places,
                    page: pageNum,
                    limit: limitNum,
                    action: 'get_visit_history',
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.success(res, 
                'Riwayat kunjungan berhasil diambil', 
                {
                    history: historyResult.visits,
                    stats: {
                        total_visits: historyResult.total_visits,
                        unique_places_visited: historyResult.unique_places,
                        first_visit: historyResult.first_visit,
                        last_visit: historyResult.last_visit
                    },
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total_pages: historyResult.total_pages,
                        total_visits: historyResult.total_visits,
                        has_next: pageNum < historyResult.total_pages,
                        has_prev: pageNum > 1
                    }
                }
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error get visit history:', error);

            logScan('map/errors', 'ERROR', 
                `Error mengambil riwayat kunjungan: ${error.message}`, {
                    user_id: userId,
                    action: 'get_visit_history',
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengambil riwayat kunjungan', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
};

module.exports = { scanMapController };
