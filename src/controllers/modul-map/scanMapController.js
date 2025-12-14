/*
 * SCAN MAP CONTROLLER - SAKO BACKEND
 * Menangani operasi scan QR code dan pencatatan kunjungan
 * Berdasarkan database sako.sql dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const { scanMapModel } = require('../../models/modul-map/scanMapModel');
const { 
    successResponse, 
    errorResponse, 
    unauthorizedResponse,
    notFoundResponse,
    conflictResponse
} = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');
const { generateCustomId } = require('../../utils/customIdGenerator');
const { validateProximity, formatDistance } = require('../../utils/geoHelper');
const { sendPlaceVisitedNotification } = require('../firebase/notifikasi/modul-map/mapNotifikasiController');
const db = require('../../config/database');

// Setup logging untuk modul scan map
const logScan = (level, message, data = null) => {
    return writeLog('map', level, `[SCAN] ${message}`, data);
};

const scanMapController = {

    /**
     * FUNGSIONAL 6: Scan QR code di tempat wisata dan catat kunjungan
     * Endpoint: POST /api/map/scan/qr (ALREADY EXPLICIT)
     * Body: { qr_code_value, user_latitude, user_longitude }
     * Response: Data tempat wisata + pencatatan kunjungan + notifikasi FCM + XP Reward
     */
    scanQRCode: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { qr_code_value, user_latitude, user_longitude } = req.body;
            userId = req.user?.users_id;

            // Log permintaan scan QR
            logScan('INFO', 
                `QR Code scan diminta - QR: ${qr_code_value}`, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Validasi user login
            if (!userId) {
                const errorMsg = 'User harus login untuk scan QR code';
                
                logScan('ERROR', errorMsg, {
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    error_type: 'unauthorized',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 401, 'UNAUTHORIZED');
            }

            // Validasi parameter QR code
            if (!qr_code_value || qr_code_value.trim().length === 0) {
                const errorMsg = 'QR code value tidak boleh kosong';
                
                logScan('ERROR', errorMsg, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    validation_error: 'empty_qr_code',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 400, 'VALIDATION_ERROR');
            }

            // Validasi koordinat user
            if (user_latitude === undefined || user_longitude === undefined) {
                const errorMsg = 'Lokasi user tidak tersedia. Pastikan GPS aktif.';
                
                logScan('ERROR', errorMsg, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    validation_error: 'missing_coordinates',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 400, 'MISSING_LOCATION');
            }

            // Validasi tipe data koordinat
            const userLat = parseFloat(user_latitude);
            const userLon = parseFloat(user_longitude);

            if (isNaN(userLat) || isNaN(userLon)) {
                const errorMsg = 'Format koordinat tidak valid';
                
                logScan('ERROR', errorMsg, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    user_latitude: user_latitude,
                    user_longitude: user_longitude,
                    action: 'scan_qr_code',
                    validation_error: 'invalid_coordinate_format',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 400, 'INVALID_COORDINATES');
            }

            // Cari tempat wisata berdasarkan QR code
            const qrData = await scanMapModel.validateQrCode(qr_code_value.trim());

            if (!qrData) {
                const errorMsg = 'QR code tidak valid atau tempat wisata tidak ditemukan';
                
                logScan('ERROR', errorMsg, {
                    user_id: userId,
                    qr_code_value: qr_code_value,
                    action: 'scan_qr_code',
                    error_type: 'invalid_qr_code',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 404, 'INVALID_QR_CODE');
            }

            // Ambil detail tempat wisata (dengan latitude & longitude)
            const touristPlace = await scanMapModel.getTouristPlaceInfo(qrData.tourist_place_id);

            // Validasi keberadaan koordinat tempat wisata
            if (!touristPlace.latitude || !touristPlace.longitude) {
                const errorMsg = 'Lokasi tempat wisata belum terdaftar. Silakan hubungi administrator.';
                
                logScan('ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: touristPlace.tourist_place_id,
                    place_name: touristPlace.name,
                    action: 'scan_qr_code',
                    error_type: 'missing_place_coordinates',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 500, 'PLACE_COORDINATES_MISSING');
            }

            // Validasi jarak user dengan lokasi wisata (Geofencing)
            const proximityCheck = validateProximity(
                userLat, 
                userLon, 
                parseFloat(touristPlace.latitude), 
                parseFloat(touristPlace.longitude),
                200 // Radius 200 meter
            );

            if (!proximityCheck.isValid) {
                const errorMsg = `Anda terlalu jauh dari lokasi ${touristPlace.name}. Jarak Anda: ${formatDistance(proximityCheck.distance)}. Harap mendekat ke lokasi (maksimal ${proximityCheck.maxRadius}m).`;
                
                logScan('ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: touristPlace.tourist_place_id,
                    place_name: touristPlace.name,
                    user_latitude: userLat,
                    user_longitude: userLon,
                    place_latitude: touristPlace.latitude,
                    place_longitude: touristPlace.longitude,
                    distance_meters: proximityCheck.distance,
                    max_radius_meters: proximityCheck.maxRadius,
                    action: 'scan_qr_code',
                    error_type: 'distance_too_far',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return errorResponse(res, errorMsg, 400, 'LOCATION_TOO_FAR');
            }

            logScan('INFO', 
                `Validasi jarak berhasil - User dalam radius ${proximityCheck.distance}m`, {
                    user_id: userId,
                    tourist_place_id: touristPlace.tourist_place_id,
                    place_name: touristPlace.name,
                    distance_meters: proximityCheck.distance,
                    max_radius_meters: proximityCheck.maxRadius,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Cek apakah user sudah pernah mengunjungi tempat ini
            const existingVisit = await scanMapModel.getUserVisit(userId, touristPlace.tourist_place_id);
            
            // Jika user sudah pernah berkunjung (status 'visited'), berikan pesan khusus
            if (existingVisit && existingVisit.status === 'visited') {
                const errorMsg = `Anda telah berkunjung ke ${touristPlace.name} pada ${existingVisit.visited_at}`;
                
                logScan('INFO', 
                    `User sudah pernah berkunjung ke tempat ini`, {
                        user_id: userId,
                        tourist_place_id: touristPlace.tourist_place_id,
                        place_name: touristPlace.name,
                        visit_status: existingVisit.status,
                        last_visited: existingVisit.visited_at,
                        action: 'scan_qr_code_already_visited',
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    }
                );

                return errorResponse(res, errorMsg, 409, 'ALREADY_VISITED');
            }
            
            let visitData = null;

            // Validasi: Harus ada record 'not_visited' di user_visit
            if (!existingVisit || existingVisit.status !== 'not_visited') {
                const errorMsg = 'Data kunjungan tidak ditemukan. Silakan hubungi administrator.';
                
                logScan('ERROR', 
                    `Record user_visit tidak ditemukan atau status tidak valid`, {
                        user_id: userId,
                        tourist_place_id: touristPlace.tourist_place_id,
                        place_name: touristPlace.name,
                        existing_visit: existingVisit,
                        action: 'scan_qr_code_no_visit_record',
                        platform: 'android_kotlin',
                        timestamp_indo: getIndonesianTime()
                    }
                );

                return errorResponse(res, errorMsg, 404, 'VISIT_RECORD_NOT_FOUND');
            }

            // Update status dari 'not_visited' menjadi 'visited' dengan visited_at = NOW()
            await scanMapModel.updateVisitToVisited(userId, touristPlace.tourist_place_id);
            
            // Ambil data visit yang sudah di-update
            visitData = await scanMapModel.getUserVisit(userId, touristPlace.tourist_place_id);

            // Tambahkan XP reward (+50 XP)
            const XP_REWARD = 50;
            const updatedUserXP = await scanMapModel.addUserXP(userId, XP_REWARD);

            logScan('INFO', 
                `XP reward diberikan - User ${updatedUserXP.full_name} mendapat +${XP_REWARD} XP`, {
                    user_id: userId,
                    user_name: updatedUserXP.full_name,
                    xp_reward: XP_REWARD,
                    total_xp: updatedUserXP.total_xp,
                    tourist_place_id: touristPlace.tourist_place_id,
                    place_name: touristPlace.name,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );
                
                // Kirim notifikasi FCM untuk kunjungan pertama dengan info XP
                try {
                    await sendPlaceVisitedNotification(
                        userId, 
                        touristPlace.tourist_place_id, 
                        qr_code_value.trim(),
                        XP_REWARD
                    );
                    
                    logScan('INFO', 
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
                    
                    logScan('WARNING', 
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
                    image_url: touristPlace.image_url,
                    average_rating: parseFloat(touristPlace.average_rating || 0),
                    is_active: Boolean(touristPlace.is_active)
                },
                visit_info: {
                    user_visit_id: visitData.user_visit_id,
                    user_id: visitData.user_id,
                    tourist_place_id: visitData.tourist_place_id,
                    status: visitData.status,
                    visited_at: visitData.visited_at,
                    created_at: visitData.created_at,
                    updated_at: visitData.updated_at
                },
                location_validation: {
                    user_latitude: userLat,
                    user_longitude: userLon,
                    place_latitude: parseFloat(touristPlace.latitude),
                    place_longitude: parseFloat(touristPlace.longitude),
                    distance_meters: proximityCheck.distance,
                    is_valid: proximityCheck.isValid
                },
                reward_info: {
                    xp_earned: XP_REWARD,
                    total_xp: updatedUserXP.total_xp
                },
                qr_code_info: {
                    qr_code_value: qr_code_value.trim(),
                    scan_timestamp: new Date().toISOString()
                }
            };

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logScan('SUCCESS', 
                `QR scan berhasil - ${touristPlace.name}`, {
                    user_id: userId,
                    tourist_place_id: touristPlace.tourist_place_id,
                    place_name: touristPlace.name,
                    qr_code_value: qr_code_value,
                    visit_id: visitData.user_visit_id,
                    xp_reward: XP_REWARD,
                    total_xp: updatedUserXP.total_xp,
                    distance_meters: proximityCheck.distance,
                    action: 'scan_qr_code_success',
                    response_time_ms: duration,
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                }
            );

            const message = `Selamat datang di ${touristPlace.name}! Kunjungan Anda telah tercatat. +${XP_REWARD} XP (Total: ${updatedUserXP.total_xp} XP)`;

            return successResponse(res, response, message);

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error('❌ Error scan QR code:', error);

            logScan('ERROR', 
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

            return errorResponse(res, 
                'Terjadi kesalahan saat memproses scan QR code', 
                500, 
                'INTERNAL_SERVER_ERROR'
            );
        }
    }
};

module.exports = { scanMapController };


