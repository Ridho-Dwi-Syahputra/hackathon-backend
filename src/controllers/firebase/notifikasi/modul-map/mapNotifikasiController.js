const { sendNotification } = require('../../firebaseConfig');
const { pool } = require('../../../../config/database');

// Import core logs utility - INI YANG DIPERBAIKI
const { writeLog, getIndonesianTime } = require('../../../../utils/logsGenerator');

// Logger khusus untuk Map Notifications dengan folder terpisah
const mapLogger = {
    
    reviewAdded: (userName, placeName, rating, notifSent) => {
        const status = notifSent ? 'berhasil dikirim' : 'tidak dikirim';
        const message = `⭐ Review ${userName} untuk ${placeName} (${rating} bintang) - Notifikasi ${status}`;
        
        return writeLog('map/reviews', 'INFO', message, {
            user: userName,
            place: placeName,
            rating: rating,
            notification_sent: notifSent,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
    },
    
    placeVisited: (userName, placeName, visitType) => {
        const message = `🏛️ ${userName} mengunjungi ${placeName} melalui ${visitType}`;
        
        return writeLog('map/visits', 'INFO', message, {
            user: userName,
            place: placeName,
            visit_type: visitType,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
    },

    preferences: (userName, oldPrefs, newPrefs) => {
        const message = `⚙️ ${userName} mengubah pengaturan notifikasi map`;
        
        return writeLog('map/preferences', 'INFO', message, {
            user: userName,
            perubahan_dari: oldPrefs,
            perubahan_ke: newPrefs,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
    },

    error: (action, userName, errorMessage, details = {}) => {
        const message = `❌ Error ${action} untuk ${userName}: ${errorMessage}`;
        
        return writeLog('map/errors', 'ERROR', message, {
            action: action,
            user: userName,
            error: errorMessage,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime(),
            ...details
        });
    }
};

/**
 * MAP NOTIFICATION CONTROLLER SESUAI DATABASE SAKO.SQL
 * - Review added notification (berdasarkan tabel review)
 * - Place visited notification (berdasarkan tabel user_visit setelah scan QR)
 * - Sesuai arsitektur Android Kotlin + FCM
 */

// Cek apakah user mengaktifkan notifikasi map
const checkMapNotificationEnabled = async (userId, notificationType) => {
    try {
        // Query sesuai dengan struktur tabel users di sako.sql
        const [user] = await pool.execute(
            'SELECT notification_preferences, fcm_token, full_name FROM users WHERE users_id = ?',
            [userId]
        );

        if (user.length === 0) {
            return { enabled: false, fcmToken: null, userName: null };
        }

        const preferences = user[0].notification_preferences;
        const fcmToken = user[0].fcm_token;
        const userName = user[0].full_name;

        if (!preferences) {
            return { enabled: true, fcmToken, userName };
        }

        // Parse JSON preferences
        let parsedPreferences;
        try {
            parsedPreferences = typeof preferences === 'string' 
                ? JSON.parse(preferences) 
                : preferences;
        } catch (parseError) {
            console.warn('⚠️ Error parsing notification preferences, using defaults');
            return { enabled: true, fcmToken, userName };
        }

        const mapNotifications = parsedPreferences.map_notifications || {};
        const isEnabled = mapNotifications[notificationType] !== false;

        return { 
            enabled: isEnabled, 
            fcmToken: fcmToken,
            userName: userName
        };

    } catch (error) {
        console.error('❌ Error cek notification preferences:', error);
        
        // Log error menggunakan local logger
        mapLogger.error('check_preferences', `User ID: ${userId}`, error.message, {
            notification_type: notificationType
        });
        
        return { enabled: false, fcmToken: null, userName: null };
    }
};

// Notifikasi: Review berhasil ditambahkan (berdasarkan tabel review)
const sendReviewAddedNotification = async (userId, touristPlaceId, rating) => {
    try {
        console.log(`📝 Mempersiapkan notifikasi review untuk User ID: ${userId}`);

        // Get user data (sesuai tabel users di sako.sql)
        const [userResult] = await pool.execute(
            'SELECT users_id, full_name, fcm_token, notification_preferences FROM users WHERE users_id = ?',
            [userId]
        );

        // Get tourist place data (sesuai tabel tourist_place di sako.sql)
        const [placeResult] = await pool.execute(
            'SELECT tourist_place_id, name, description FROM tourist_place WHERE tourist_place_id = ?',
            [touristPlaceId]
        );

        if (userResult.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        if (placeResult.length === 0) {
            throw new Error('Tourist place tidak ditemukan');
        }

        const user = userResult[0];
        const place = placeResult[0];
        
        const userName = user.full_name;
        const placeName = place.name;
        const fcmToken = user.fcm_token;

        // Cek notification setting
        const { enabled } = await checkMapNotificationEnabled(userId, 'review_added');

        if (!enabled) {
            console.log('🔕 User menonaktifkan notifikasi review');
            
            mapLogger.reviewAdded(userName, placeName, rating, false);
            
            return { success: true, message: 'Notifikasi dinonaktifkan oleh user' };
        }

        if (!fcmToken) {
            console.log('📱 FCM token tidak ditemukan untuk user');
            
            mapLogger.error('review_notification', userName, 'FCM token tidak ditemukan', {
                place_name: placeName,
                rating: rating
            });
            mapLogger.reviewAdded(userName, placeName, rating, false);
            
            return { success: false, error: 'FCM token tidak ditemukan' };
        }

        // Buat pesan notifikasi untuk Android
        const title = '⭐ Ulasan Berhasil Ditambahkan!';
        const body = `Halo ${userName}! Ulasan Anda untuk ${placeName} (${rating} bintang) telah berhasil disimpan. Terima kasih atas kontribusinya! 🙏`;

        const data = {
            type: 'review_added',
            module: 'map',
            tourist_place_id: touristPlaceId.toString(),
            place_name: placeName,
            user_name: userName,
            rating: rating.toString(),
            action: 'open_place_detail',
            // Data untuk Android intent
            screen: 'PlaceDetailScreen',
            place_id: touristPlaceId.toString()
        };

        const options = {
            priority: 'high',
            sound: 'default',
            channelId: 'sako_map_reviews',
            ttl: 3600000 // 1 hour
        };

        // Kirim notifikasi ke Android
        const result = await sendNotification(fcmToken, title, body, data, options);

        // Log hasil menggunakan local logger
        mapLogger.reviewAdded(userName, placeName, rating, result.success);

        if (result.success) {
            console.log(`✅ Notifikasi review berhasil dikirim ke Android untuk ${userName}`);
        }

        return result;

    } catch (error) {
        console.error('❌ Error mengirim notifikasi review:', error);
        
        // Log error menggunakan local logger
        mapLogger.error('send_review_notification', `User ID: ${userId}`, error.message, {
            tourist_place_id: touristPlaceId,
            rating: rating,
            stack: error.stack
        });
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Notifikasi: Tempat wisata berhasil dikunjungi (berdasarkan tabel user_visit setelah scan QR)
const sendPlaceVisitedNotification = async (userId, touristPlaceId, qrCodeValue = null) => {
    try {
        console.log(`🏛️ Mempersiapkan notifikasi kunjungan untuk User ID: ${userId}`);

        // Get user data
        const [userResult] = await pool.execute(
            'SELECT users_id, full_name, fcm_token, notification_preferences FROM users WHERE users_id = ?',
            [userId]
        );

        // Get tourist place data
        const [placeResult] = await pool.execute(
            'SELECT tourist_place_id, name, description, address FROM tourist_place WHERE tourist_place_id = ?',
            [touristPlaceId]
        );

        if (userResult.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        if (placeResult.length === 0) {
            throw new Error('Tourist place tidak ditemukan');
        }

        const user = userResult[0];
        const place = placeResult[0];
        
        const userName = user.full_name;
        const placeName = place.name;
        const fcmToken = user.fcm_token;

        // Cek notification setting
        const { enabled } = await checkMapNotificationEnabled(userId, 'place_visited');

        if (!enabled) {
            console.log('🔕 User menonaktifkan notifikasi kunjungan tempat');
            
            mapLogger.placeVisited(userName, placeName, 'qr_code_scan');
            
            return { success: true, message: 'Notifikasi dinonaktifkan oleh user' };
        }

        if (!fcmToken) {
            console.log('📱 FCM token tidak ditemukan untuk user');
            
            mapLogger.error('place_visit_notification', userName, 'FCM token tidak ditemukan', {
                place_name: placeName
            });
            
            return { success: false, error: 'FCM token tidak ditemukan' };
        }

        // Buat pesan notifikasi untuk Android
        const title = '🏛️ Tempat Wisata Dikunjungi!';
        const body = `${userName}, terima kasih telah mengunjungi ${placeName}! Jangan lupa tinggalkan ulasan untuk membantu wisatawan lain. 📝`;

        const data = {
            type: 'place_visited',
            module: 'map',
            tourist_place_id: touristPlaceId.toString(),
            place_name: placeName,
            user_name: userName,
            qr_code_value: qrCodeValue || '',
            action: 'open_add_review',
            // Data untuk Android intent
            screen: 'AddReviewScreen',
            place_id: touristPlaceId.toString()
        };

        const options = {
            priority: 'normal',
            sound: 'default',
            channelId: 'sako_map_visits',
            ttl: 3600000 // 1 hour
        };

        // Kirim notifikasi ke Android
        const result = await sendNotification(fcmToken, title, body, data, options);

        // Log hasil
        mapLogger.placeVisited(userName, placeName, 'qr_code_scan');

        if (result.success) {
            console.log(`✅ Notifikasi kunjungan tempat berhasil dikirim ke Android untuk ${userName}`);
        }

        return result;

    } catch (error) {
        console.error('❌ Error mengirim notifikasi kunjungan tempat:', error);
        
        // Log error menggunakan local logger
        mapLogger.error('send_place_visit_notification', `User ID: ${userId}`, error.message, {
            tourist_place_id: touristPlaceId,
            qr_code_value: qrCodeValue,
            stack: error.stack
        });
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Update notification preferences untuk map dengan logging
const updateMapNotificationPreferences = async (userId, preferences) => {
    try {
        // Get current preferences
        const [user] = await pool.execute(
            'SELECT notification_preferences, full_name FROM users WHERE users_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        const userName = user[0].full_name;
        
        // Parse current preferences
        let currentPrefs = {};
        try {
            currentPrefs = user[0].notification_preferences 
                ? (typeof user[0].notification_preferences === 'string' 
                    ? JSON.parse(user[0].notification_preferences) 
                    : user[0].notification_preferences)
                : {};
        } catch (parseError) {
            console.warn('⚠️ Error parsing current preferences, using empty object');
            currentPrefs = {};
        }

        const oldMapPrefs = currentPrefs.map_notifications || {};
        
        // Update map notification preferences
        currentPrefs.map_notifications = {
            ...oldMapPrefs,
            ...preferences
        };

        // Save to database as JSON string
        await pool.execute(
            'UPDATE users SET notification_preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE users_id = ?',
            [JSON.stringify(currentPrefs), userId]
        );

        console.log(`✅ Pengaturan notifikasi map berhasil diupdate untuk user ${userName}`);

        // Log perubahan preferences menggunakan local logger
        mapLogger.preferences(userName, {
            map_notifications: oldMapPrefs
        }, {
            map_notifications: currentPrefs.map_notifications
        });

        return {
            success: true,
            preferences: currentPrefs.map_notifications
        };

    } catch (error) {
        console.error('❌ Error mengupdate pengaturan notifikasi map:', error);
        
        mapLogger.error('update_preferences', `User ID: ${userId}`, error.message, {
            attempted_preferences: preferences
        });
        
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendReviewAddedNotification,
    sendPlaceVisitedNotification,
    updateMapNotificationPreferences,
    checkMapNotificationEnabled
};