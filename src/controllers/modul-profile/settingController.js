// settingController.js

const SettingModel = require('../../models/modul-profile/settingModel');
const { successResponse, validationErrorResponse, notFoundResponse, errorResponse } = require('../../utils/responseHelper');
const { writeLog } = require('../../utils/logsGenerator');

/**
 * Update notification preferences
 * Endpoint: PUT /api/profile/settings/notification-preferences
 */
exports.updateNotificationPreferences = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { notification_preferences } = req.body;

        console.log('🔔 [SETTING] Update notification preferences attempt:', {
            users_id: userId,
            preferences: notification_preferences
        });

        // Log notification preferences update attempt
        writeLog('setting', 'info', `Update notification preferences attempt by user ${userId}`);

        if (!notification_preferences || typeof notification_preferences !== 'object') {
            return validationErrorResponse(res, 'Notification preferences harus berupa object');
        }

        // Validate notification preferences structure sesuai implementasi aktual
        const validTopLevelKeys = ['system_announcements', 'marketing', 'map_notifications', 'video_notifications', 'quiz_notifications'];
        const validMapNotificationKeys = ['review_added', 'place_visited'];
        
        const providedKeys = Object.keys(notification_preferences);
        
        const invalidKeys = providedKeys.filter(key => !validTopLevelKeys.includes(key));
        if (invalidKeys.length > 0) {
            writeLog('setting', 'warn', `Invalid notification keys by user ${userId}: ${invalidKeys.join(', ')}`);
            
            return validationErrorResponse(res, `Invalid notification preference keys: ${invalidKeys.join(', ')}. Valid keys: ${validTopLevelKeys.join(', ')}`);
        }
        
        // Validate map_notifications structure if provided
        if (notification_preferences.map_notifications) {
            const mapKeys = Object.keys(notification_preferences.map_notifications);
            const invalidMapKeys = mapKeys.filter(key => !validMapNotificationKeys.includes(key));
            if (invalidMapKeys.length > 0) {
                writeLog('setting', 'warn', `Invalid map notification keys by user ${userId}: ${invalidMapKeys.join(', ')}`);
                
                return validationErrorResponse(res, `Invalid map notification keys: ${invalidMapKeys.join(', ')}. Valid keys: ${validMapNotificationKeys.join(', ')}`);
            }
        }

        // Update notification preferences
        await SettingModel.updateNotificationPreferences(userId, notification_preferences);

        console.log('✅ [SETTING] Notification preferences updated successfully');

        // Log successful update
        writeLog('setting', 'info', `Notification preferences updated successfully by user ${userId}`, notification_preferences);

        return successResponse(res, null, 'Preferensi notifikasi berhasil diupdate');

    } catch (error) {
        console.error('❌ [SETTING] Update notification preferences error:', error);
        
        writeLog('setting', 'error', `Update notification preferences error: ${error.message}`, {
            users_id: req.user?.users_id,
            stack: error.stack
        });
        
        return errorResponse(res, 500, 'Gagal mengupdate preferensi notifikasi');
    }
};

/**
 * Get notification preferences
 * Endpoint: GET /api/profile/settings/notification-preferences
 */
exports.getNotificationPreferences = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        console.log('🔍 [SETTING] Get notification preferences:', {
            users_id: userId
        });

        // Log preferences access
        writeLog('setting', 'info', `Get notification preferences by user ${userId}`);

        // Get user notification preferences
        const result = await SettingModel.getNotificationPreferences(userId);

        if (!result) {
            return notFoundResponse(res, 'User tidak ditemukan');
        }

        let notificationPreferences = null;
        try {
            notificationPreferences = result.notification_preferences ? 
                JSON.parse(result.notification_preferences) : {
                    // Default structure sesuai implementasi aktual
                    system_announcements: true,
                    marketing: false,
                    map_notifications: {
                        review_added: true,      // sendReviewAddedNotification()
                        place_visited: true      // sendPlaceVisitedNotification()
                    },
                    video_notifications: true,
                    quiz_notifications: true
                };
        } catch (parseError) {
            writeLog('setting', 'error', `Parse notification preferences error: ${parseError.message}`, {
                users_id: userId,
                raw_data: result.notification_preferences
            });
            
            // Return default preferences jika parse error
            notificationPreferences = {
                system_announcements: true,
                marketing: false,
                map_notifications: {
                    review_added: true,
                    place_visited: true
                },
                video_notifications: true,
                quiz_notifications: true
            };
        }

        console.log('✅ [SETTING] Notification preferences retrieved:', notificationPreferences);

        // Log successful access
        writeLog('setting', 'info', `Notification preferences retrieved by user ${userId}`);

        return successResponse(res, { notification_preferences: notificationPreferences }, 'Berhasil mendapatkan preferensi notifikasi');

    } catch (error) {
        console.error('❌ [SETTING] Get notification preferences error:', error);
        
        writeLog('setting', 'error', `Get notification preferences error: ${error.message}`, {
            users_id: req.user?.users_id,
            stack: error.stack
        });
        
        return errorResponse(res, 500, 'Gagal mendapatkan preferensi notifikasi');
    }
};
