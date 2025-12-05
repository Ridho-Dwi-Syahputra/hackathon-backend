const { sendNotification } = require('../../firebaseConfig');
const { pool } = require('../../../../config/database');

// Import core logs utility
const { writeLog, getIndonesianTime } = require('../../../../utils/logsGenerator');

// Logger khusus untuk System Notifications dengan folder terpisah
const systemLogger = {
    
    welcome: (userName, notifSent) => {
        const status = notifSent ? 'berhasil dikirim' : 'tidak dikirim';
        const message = `👋 Welcome message untuk ${userName} - Notifikasi ${status}`;
        
        return writeLog('system/welcome', 'INFO', message, {
            user: userName,
            notification_sent: notifSent,
            timestamp_indo: getIndonesianTime()
        });
    },
    
    maintenance: (message, totalUsers, successCount) => {
        const logMessage = `🔧 Notifikasi maintenance dikirim ke ${successCount}/${totalUsers} users`;
        
        return writeLog('system/maintenance', 'INFO', logMessage, {
            maintenance_message: message,
            total_users: totalUsers,
            success_count: successCount,
            failed_count: totalUsers - successCount,
            timestamp_indo: getIndonesianTime()
        });
    },
    
    appUpdate: (version, totalUsers, successCount, isForced) => {
        const type = isForced ? 'WAJIB' : 'OPSIONAL';
        const message = `📲 Notifikasi update ${type} v${version} dikirim ke ${successCount}/${totalUsers} users`;
        
        return writeLog('system/updates', 'INFO', message, {
            version: version,
            update_type: type,
            total_users: totalUsers,
            success_count: successCount,
            failed_count: totalUsers - successCount,
            is_forced: isForced,
            timestamp_indo: getIndonesianTime()
        });
    },

    preferences: (userName, oldPrefs, newPrefs) => {
        const message = `⚙️ ${userName} mengubah pengaturan notifikasi system`;
        
        return writeLog('system/preferences', 'INFO', message, {
            user: userName,
            perubahan_dari: oldPrefs,
            perubahan_ke: newPrefs,
            timestamp_indo: getIndonesianTime()
        });
    },

    error: (action, userName, errorMessage, details = {}) => {
        const message = `❌ Error ${action} untuk ${userName}: ${errorMessage}`;
        
        return writeLog('system/errors', 'ERROR', message, {
            action: action,
            user: userName,
            error: errorMessage,
            timestamp_indo: getIndonesianTime(),
            ...details
        });
    },

    broadcast: (type, totalUsers, successCount, failedCount, details = {}) => {
        const message = `📢 Broadcast ${type} - Berhasil: ${successCount}, Gagal: ${failedCount} dari ${totalUsers} users`;
        
        return writeLog('system/broadcast', 'INFO', message, {
            broadcast_type: type,
            total_users: totalUsers,
            success_count: successCount,
            failed_count: failedCount,
            success_rate: ((successCount / totalUsers) * 100).toFixed(2) + '%',
            timestamp_indo: getIndonesianTime(),
            ...details
        });
    },

    tokenUpdate: (userName, tokenStatus, details = {}) => {
        const message = `📱 FCM Token ${userName} telah ${tokenStatus}`;
        
        return writeLog('system/tokens', 'INFO', message, {
            user: userName,
            status: tokenStatus,
            timestamp_indo: getIndonesianTime(),
            ...details
        });
    }
};

/**
 * SYSTEM NOTIFICATION CONTROLLER DENGAN ORGANIZED LOGGING
 * Logs tersimpan dalam folder: src/logs/notifikasi/system/
 */

// Cek apakah user mengaktifkan notifikasi system
const checkSystemNotificationEnabled = async (userId, notificationType) => {
    try {
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

        const systemNotifications = preferences.system_notifications || {};
        const isEnabled = systemNotifications[notificationType] !== false;

        return { 
            enabled: isEnabled, 
            fcmToken: fcmToken,
            userName: userName
        };

    } catch (error) {
        console.error('❌ Error cek system notification preferences:', error);
        
        // Log error menggunakan local logger
        systemLogger.error('check_preferences', `User ID: ${userId}`, error.message, {
            notification_type: notificationType
        });
        
        return { enabled: false, fcmToken: null, userName: null };
    }
};

// Notifikasi: Welcome user baru
const sendWelcomeNotification = async (userId, userName) => {
    try {
        console.log(`👋 Mempersiapkan welcome message untuk user baru: ${userName}`);

        const { enabled, fcmToken, userName: dbUserName } = await checkSystemNotificationEnabled(userId, 'welcome');
        const finalUserName = dbUserName || userName;

        if (!enabled) {
            console.log('🔕 User menonaktifkan notifikasi welcome');
            
            systemLogger.welcome(finalUserName, false);
            
            return { success: true, message: 'Notifikasi welcome dinonaktifkan oleh user' };
        }

        if (!fcmToken) {
            console.log('📱 FCM token tidak ditemukan untuk user');
            
            systemLogger.error('welcome_notification', finalUserName, 'FCM token tidak ditemukan');
            systemLogger.welcome(finalUserName, false);
            
            return { success: false, error: 'FCM token tidak ditemukan' };
        }

        // Buat pesan notifikasi welcome
        const title = '🎉 Selamat Datang di SAKO!';
        const body = `Halo ${finalUserName}! Selamat bergabung dengan SAKO - Sistem Aplikasi Kebudayaan Online. Mari jelajahi kebudayaan Indonesia bersama! 🇮🇩`;

        const data = {
            type: 'welcome',
            module: 'system',
            user_name: finalUserName,
            action: 'open_app_tour'
        };

        const options = {
            priority: 'high',
            sound: 'default',
            channelId: 'sako_system_welcome'
        };

        // Kirim notifikasi
        const result = await sendNotification(fcmToken, title, body, data, options);

        // Log hasil menggunakan local logger
        systemLogger.welcome(finalUserName, result.success);

        if (result.success) {
            console.log(`✅ Welcome notification berhasil dikirim ke ${finalUserName}`);
        }

        return result;

    } catch (error) {
        console.error('❌ Error mengirim welcome notification:', error);
        
        // Log error menggunakan local logger
        systemLogger.error('send_welcome_notification', userName, error.message, {
            stack: error.stack
        });
        
        systemLogger.welcome(userName, false);
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Notifikasi: Maintenance (broadcast ke semua user)
const sendMaintenanceNotification = async (message, scheduledTime) => {
    try {
        console.log('🔧 Mempersiapkan notifikasi maintenance untuk semua users');

        // Get all users with FCM token dan system notifications enabled
        const [users] = await pool.execute(`
            SELECT users_id, full_name, fcm_token, notification_preferences 
            FROM users 
            WHERE fcm_token IS NOT NULL 
            AND fcm_token != ''
            AND status = 'active'
        `);

        if (users.length === 0) {
            console.log('📱 Tidak ada users dengan FCM token yang ditemukan');
            
            systemLogger.maintenance(message, 0, 0);
            
            return { success: true, message: 'Tidak ada users untuk dinotifikasi' };
        }

        const title = '🔧 Maintenance SAKO';
        const body = message || `Sistem SAKO akan maintenance pada ${scheduledTime}. Terima kasih atas pengertiannya.`;

        const data = {
            type: 'maintenance',
            module: 'system',
            scheduled_time: scheduledTime,
            action: 'show_maintenance_info'
        };

        const options = {
            priority: 'high',
            sound: 'default',
            channelId: 'sako_system_maintenance'
        };

        let successCount = 0;
        let failureCount = 0;
        const results = [];

        // Send to all eligible users
        for (const user of users) {
            try {
                // Check if user has system notifications enabled
                const preferences = user.notification_preferences;
                const systemNotifs = preferences?.system_notifications || {};
                const isEnabled = systemNotifs.maintenance !== false;

                if (isEnabled && user.fcm_token) {
                    const result = await sendNotification(user.fcm_token, title, body, {
                        ...data,
                        user_name: user.full_name
                    }, options);
                    
                    if (result.success) {
                        successCount++;
                        results.push({
                            user: user.full_name,
                            status: 'success',
                            messageId: result.messageId
                        });
                    } else {
                        failureCount++;
                        results.push({
                            user: user.full_name,
                            status: 'failed',
                            error: result.error
                        });
                    }
                } else {
                    results.push({
                        user: user.full_name,
                        status: 'disabled',
                        reason: 'Notifikasi maintenance dinonaktifkan'
                    });
                }
                
                // Small delay untuk menghindari rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (userError) {
                failureCount++;
                console.error(`❌ Error sending to ${user.full_name}:`, userError.message);
                
                results.push({
                    user: user.full_name,
                    status: 'error',
                    error: userError.message
                });
            }
        }

        console.log(`✅ Maintenance notification selesai: ${successCount} berhasil, ${failureCount} gagal dari ${users.length} users`);

        // Log hasil broadcast menggunakan local logger
        systemLogger.maintenance(message, users.length, successCount);
        systemLogger.broadcast('maintenance', users.length, successCount, failureCount, {
            scheduled_time: scheduledTime,
            message: message
        });

        return {
            success: true,
            totalUsers: users.length,
            successCount,
            failureCount,
            results: results
        };

    } catch (error) {
        console.error('❌ Error mengirim maintenance notification:', error);
        
        // Log error menggunakan local logger
        systemLogger.error('send_maintenance_notification', 'BROADCAST', error.message, {
            stack: error.stack
        });
        
        return { 
            success: false, 
            error: error.message 
        };
    }
};

// Notifikasi: App updates (broadcast ke semua user)
const sendAppUpdateNotification = async (version, features, isForced = false) => {
    try {
        console.log(`📲 Mempersiapkan notifikasi app update untuk version: ${version}`);

        const [users] = await pool.execute(`
            SELECT users_id, full_name, fcm_token, notification_preferences 
            FROM users 
            WHERE fcm_token IS NOT NULL 
            AND fcm_token != ''
            AND status = 'active'
        `);

        if (users.length === 0) {
            console.log('📱 Tidak ada users dengan FCM token yang ditemukan');
            
            systemLogger.appUpdate(version, 0, 0, isForced);
            
            return { success: true, message: 'Tidak ada users untuk dinotifikasi' };
        }

        const title = isForced ? '🚨 Update Wajib SAKO' : '📲 Update Tersedia SAKO';
        const body = isForced 
            ? `SAKO versi ${version} wajib diupdate untuk melanjutkan. Fitur baru: ${features}`
            : `SAKO versi ${version} tersedia! Fitur baru: ${features}. Update sekarang untuk pengalaman lebih baik.`;

        const data = {
            type: 'app_update',
            module: 'system',
            version: version,
            features: features,
            is_forced: isForced.toString(),
            action: 'open_app_store'
        };

        const options = {
            priority: isForced ? 'high' : 'normal',
            sound: 'default',
            channelId: 'sako_system_updates'
        };

        let successCount = 0;
        let failureCount = 0;
        const results = [];

        // Send to all eligible users
        for (const user of users) {
            try {
                const preferences = user.notification_preferences;
                const systemNotifs = preferences?.system_notifications || {};
                const isEnabled = systemNotifs.updates !== false;

                if (isEnabled && user.fcm_token) {
                    const result = await sendNotification(user.fcm_token, title, body, {
                        ...data,
                        user_name: user.full_name
                    }, options);
                    
                    if (result.success) {
                        successCount++;
                        results.push({
                            user: user.full_name,
                            status: 'success',
                            messageId: result.messageId
                        });
                    } else {
                        failureCount++;
                        results.push({
                            user: user.full_name,
                            status: 'failed',
                            error: result.error
                        });
                    }
                } else {
                    results.push({
                        user: user.full_name,
                        status: 'disabled',
                        reason: 'Notifikasi update dinonaktifkan'
                    });
                }
                
                // Small delay untuk menghindari rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (userError) {
                failureCount++;
                console.error(`❌ Error sending to ${user.full_name}:`, userError.message);
                
                results.push({
                    user: user.full_name,
                    status: 'error',
                    error: userError.message
                });
            }
        }

        console.log(`✅ App update notification selesai: ${successCount} berhasil, ${failureCount} gagal dari ${users.length} users`);

        // Log hasil broadcast menggunakan local logger
        systemLogger.appUpdate(version, users.length, successCount, isForced);
        systemLogger.broadcast('app_update', users.length, successCount, failureCount, {
            version: version,
            features: features,
            is_forced: isForced
        });

        return {
            success: true,
            totalUsers: users.length,
            successCount,
            failureCount,
            results: results
        };

    } catch (error) {
        console.error('❌ Error mengirim app update notification:', error);
        
        // Log error menggunakan local logger
        systemLogger.error('send_app_update_notification', 'BROADCAST', error.message, {
            version: version,
            features: features,
            is_forced: isForced,
            stack: error.stack
        });
        
        return { 
            success: false, 
            error: error.message 
        };
    }
};

// Update notification preferences untuk system dengan logging
const updateSystemNotificationPreferences = async (userId, preferences) => {
    try {
        const [user] = await pool.execute(
            'SELECT notification_preferences, full_name FROM users WHERE users_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        const userName = user[0].full_name;
        const currentPrefs = user[0].notification_preferences || {};
        const oldSystemPrefs = currentPrefs.system_notifications || {};
        
        // Update system notification preferences
        currentPrefs.system_notifications = {
            ...oldSystemPrefs,
            ...preferences
        };

        // Save to database
        await pool.execute(
            'UPDATE users SET notification_preferences = ? WHERE users_id = ?',
            [JSON.stringify(currentPrefs), userId]
        );

        console.log(`✅ Pengaturan notifikasi system berhasil diupdate untuk user ${userName}`);

        // Log perubahan preferences menggunakan local logger
        systemLogger.preferences(userName, {
            system_notifications: oldSystemPrefs
        }, {
            system_notifications: currentPrefs.system_notifications
        });

        return {
            success: true,
            preferences: currentPrefs.system_notifications
        };

    } catch (error) {
        console.error('❌ Error mengupdate pengaturan notifikasi system:', error);
        
        // Log error menggunakan local logger
        systemLogger.error('update_preferences', `User ID: ${userId}`, error.message, {
            attempted_preferences: preferences
        });
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Update FCM Token user dengan logging
const updateUserFCMToken = async (userId, fcmToken) => {
    try {
        const [user] = await pool.execute(
            'SELECT full_name FROM users WHERE users_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        const userName = user[0].full_name;

        await pool.execute(
            'UPDATE users SET fcm_token = ?, updated_at = NOW() WHERE users_id = ?',
            [fcmToken, userId]
        );

        console.log(`✅ FCM Token berhasil diupdate untuk user: ${userName}`);

        // Log update token menggunakan local logger
        systemLogger.tokenUpdate(userName, 'diperbarui', {
            fcm_token_preview: fcmToken ? fcmToken.substring(0, 20) + '...' : null
        });

        return { 
            success: true,
            message: 'FCM Token berhasil diupdate'
        };

    } catch (error) {
        console.error('❌ Error mengupdate FCM token:', error);
        
        // Log error menggunakan local logger
        systemLogger.error('update_fcm_token', `User ID: ${userId}`, error.message);
        
        return { 
            success: false, 
            error: error.message 
        };
    }
};

module.exports = {
    sendWelcomeNotification,
    sendMaintenanceNotification,
    sendAppUpdateNotification,
    updateSystemNotificationPreferences,
    updateUserFCMToken,
    checkSystemNotificationEnabled
};