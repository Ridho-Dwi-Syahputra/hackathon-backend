/*
 * DETAIL MAP CONTROLLER - SAKO BACKEND
 * Menangani operasi detail tempat wisata dan status kunjungan
 * Berdasarkan database sako.sql dan integrasi dengan notification system
 * Arsitektur: Android Kotlin + Node.js + MySQL + FCM
 */

const { detailMapModel } = require('../../models/modul-map/detailMapModel');
const { responseHelper } = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');

// Setup logging untuk modul detail map
const logDetail = (level, message, data = null) => {
    return writeLog('map', level, `[DETAIL] ${message}`, data);
};

const detailMapController = {

    /**
     * FUNGSIONAL 1: List lokasi budaya dengan status kunjungan
     * Endpoint: GET /api/map/places (ALREADY EXPLICIT)
     * Response: Array lokasi dengan is_visited status
     */
    getPlacesWithVisitStatus: async (req, res) => {
        const startTime = Date.now();
        const userId = req.user?.users_id;

        try {
            logDetail('INFO', 
                `User ${userId} mengakses list tempat wisata dengan status kunjungan`, {
                    user_id: userId,
                    endpoint: 'GET /api/map/places',
                    ip_address: req.ip,
                    timestamp_indo: getIndonesianTime()
                }
            );

            // Ambil semua tempat wisata dengan status kunjungan user
            const placesWithVisitStatus = await detailMapModel.getPlacesWithVisitStatus(userId);

            if (!placesWithVisitStatus || placesWithVisitStatus.length === 0) {
                return responseHelper.error(res, 'Tidak ada tempat wisata yang ditemukan', 404);
            }

            // Return data sesuai format database tanpa modifikasi tambahan
            const formattedPlaces = placesWithVisitStatus;

            const duration = Date.now() - startTime;
            logDetail('SUCCESS', 
                `Berhasil mengambil ${formattedPlaces.length} tempat wisata dengan status kunjungan`, {
                    user_id: userId,
                    total_places: formattedPlaces.length,
                    response_time_ms: duration,
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.success(res, 
                'List tempat wisata dengan status kunjungan berhasil diambil', 
                formattedPlaces
            );

        } catch (error) {
            const duration = Date.now() - startTime;
            logDetail('ERROR', 
                `Gagal mengambil list tempat wisata: ${error.message}`, {
                    user_id: userId,
                    error_message: error.message,
                    error_stack: error.stack,
                    response_time_ms: duration,
                    timestamp_indo: getIndonesianTime()
                }
            );

            return responseHelper.error(res, 
                'Terjadi kesalahan saat mengambil list tempat wisata', 
                500
            );
        }
    },

    /**
     * FUNGSIONAL 2: Mendapatkan detail lengkap tempat wisata + validasi scan QR
     * Endpoint: GET /api/map/places/:id (ALREADY EXPLICIT)
     * Response: Data detail tempat wisata dengan is_scan_enabled
     */
    getPlaceDetail: async (req, res) => {
        const startTime = Date.now();
        let userId = null;

        try {
            const { id: touristPlaceId } = req.params;
            userId = req.user?.users_id;

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
                
                logDetail('ERROR', errorMsg, {
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
            const placeDetail = await detailMapModel.getTouristPlaceDetail(touristPlaceId);

            if (!placeDetail) {
                const errorMsg = 'Tempat wisata tidak ditemukan';
                
                logDetail('ERROR', errorMsg, {
                    user_id: userId,
                    tourist_place_id: touristPlaceId,
                    action: 'get_place_detail',
                    error_type: 'not_found',
                    platform: 'android_kotlin',
                    timestamp_indo: getIndonesianTime()
                });

                return responseHelper.error(res, errorMsg, 404, 'PLACE_NOT_FOUND');
            }

            // FUNGSIONAL 2: Validasi tombol scan QR berdasarkan visit status
            // Cek status kunjungan untuk validasi scan QR
            const visitStatus = await detailMapModel.getUserVisitStatus(userId, touristPlaceId);
            // Tombol scan ENABLED jika belum pernah berkunjung (status = 'not_visited' atau null)
            const isScanEnabled = !visitStatus || visitStatus.status === 'not_visited';

            // Format response sesuai spesifikasi Fungsional 2
            const response = {
                tourist_place_id: placeDetail.tourist_place_id,
                name: placeDetail.name,
                description: placeDetail.description,
                address: placeDetail.address,
                image_url: placeDetail.image_url,
                average_rating: parseFloat(placeDetail.average_rating || 0),
                is_scan_enabled: isScanEnabled, // FUNGSIONAL 2: Validasi scan QR
                created_at: placeDetail.created_at,
                updated_at: placeDetail.updated_at
            };

            // Log sukses dengan durasi response
            const duration = Date.now() - startTime;
            logDetail('SUCCESS', 
                `Detail tempat berhasil diambil - ${placeDetail.name}`, {
                    user_id: userId,
                    tourist_place_id: touristPlaceId,
                    place_name: placeDetail.name,
                    is_scan_enabled: isScanEnabled,
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

            logDetail('ERROR', 
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
    }
};

module.exports = { detailMapController };
