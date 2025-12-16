const { sendNotification } = require('../../firebaseConfig');
const { pool } = require('../../../../config/database');

// Import core logs utility
const { writeLog, getIndonesianTime } = require('../../../../utils/logsGenerator');

// Logger khusus untuk Quiz Notifications dengan folder terpisah
const kuisLogger = {
    
    quizCompleted: (userName, levelName, score, isPassed, notifSent) => {
        const status = notifSent ? 'berhasil dikirim' : 'tidak dikirim';
        const result = isPassed ? 'LULUS' : 'BELUM LULUS';
        const message = `🎯 Kuis ${userName} untuk ${levelName} - ${result} (${score}%) - Notifikasi ${status}`;
        
        return writeLog('kuis/completions', 'INFO', message, {
            user: userName,
            level: levelName,
            score: score,
            is_passed: isPassed,
            notification_sent: notifSent,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
    },
    
    perfectScore: (userName, levelName, xpEarned) => {
        const message = `🏆 ${userName} mendapat PERFECT SCORE di ${levelName} (+${xpEarned} XP)`;
        
        return writeLog('kuis/achievements', 'INFO', message, {
            user: userName,
            level: levelName,
            xp_earned: xpEarned,
            achievement: 'perfect_score',
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
    },

    preferences: (userName, oldPrefs, newPrefs) => {
        const message = `⚙️ ${userName} mengubah pengaturan notifikasi kuis`;
        
        return writeLog('kuis/preferences', 'INFO', message, {
            user: userName,
            perubahan_dari: oldPrefs,
            perubahan_ke: newPrefs,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
    },

    error: (action, userName, errorMessage, details = {}) => {
        const message = `❌ Error ${action} untuk ${userName}: ${errorMessage}`;
        
        return writeLog('kuis/errors', 'ERROR', message, {
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
 * QUIZ NOTIFICATION CONTROLLER
 * - Quiz completed notification (berdasarkan tabel quiz_attempt)
 * - Perfect score achievement notification
 * - Sesuai arsitektur Android Kotlin + FCM
 */

// Cek apakah user mengaktifkan notifikasi kuis
const checkQuizNotificationEnabled = async (userId, notificationType) => {
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

        const quizNotifications = parsedPreferences.quiz_notifications || {};
        
        // Check specific type first, fallback to general 'quiz_completed'
        let isEnabled = true;
        if (quizNotifications.hasOwnProperty(notificationType)) {
            isEnabled = quizNotifications[notificationType] !== false;
        } else if (quizNotifications.hasOwnProperty('quiz_completed')) {
            isEnabled = quizNotifications['quiz_completed'] !== false;
        }

        return { 
            enabled: isEnabled, 
            fcmToken: fcmToken,
            userName: userName
        };

    } catch (error) {
        console.error('❌ Error cek notification preferences:', error);
        
        // Log error menggunakan local logger
        kuisLogger.error('check_preferences', `User ID: ${userId}`, error.message, {
            notification_type: notificationType
        });
        
        return { enabled: false, fcmToken: null, userName: null };
    }
};

// Notifikasi: Kuis selesai dengan hasil (berdasarkan tabel quiz_attempt)
const sendQuizCompletedNotification = async (userId, attemptId, quizResult) => {
    try {
        console.log(`\n🎯 ========== SENDING QUIZ NOTIFICATION ==========`);
        console.log(`📝 User ID: ${userId}`);
        console.log(`📝 Attempt ID: ${attemptId}`);
        console.log(`📊 Quiz Result:`, JSON.stringify(quizResult, null, 2));

        // Get user data (sesuai tabel users di sako.sql)
        const [userResult] = await pool.execute(
            'SELECT users_id, full_name, fcm_token, notification_preferences FROM users WHERE users_id = ?',
            [userId]
        );

        // Get attempt data (sesuai tabel quiz_attempt di sako.sql)
        const [attemptResult] = await pool.execute(
            `SELECT qa.*, l.name as level_name, qc.name as category_name 
             FROM quiz_attempt qa
             JOIN level l ON qa.level_id = l.id
             JOIN quiz_category qc ON l.category_id = qc.id
             WHERE qa.id = ?`,
            [attemptId]
        );

        if (userResult.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        if (attemptResult.length === 0) {
            throw new Error('Quiz attempt tidak ditemukan');
        }

        const user = userResult[0];
        const attempt = attemptResult[0];
        
        const userName = user.full_name;
        const levelName = attempt.level_name;
        const categoryName = attempt.category_name;
        const fcmToken = user.fcm_token;

        console.log(`👤 User: ${userName}`);
        console.log(`📚 Level: ${levelName} (${categoryName})`);
        console.log(`🔑 FCM Token: ${fcmToken ? fcmToken.substring(0, 50) + '...' : 'NULL'}`);

        const isPassed = quizResult.is_passed;
        const percentCorrect = quizResult.percent_correct;
        const xpEarned = quizResult.xp_earned || 0;

        // Tentukan tipe notifikasi berdasarkan hasil
        let notificationType = 'quiz_completed';
        // Use >= 99.99 to handle floating point precision issues
        if (percentCorrect >= 99.99) {
            notificationType = 'quiz_perfect_score';
        } else if (isPassed) {
            notificationType = 'quiz_passed';
        } else {
            notificationType = 'quiz_failed';
        }

        console.log(`🎯 Notification Type: ${notificationType}`);
        console.log(`📊 Score: ${percentCorrect}%, XP: ${xpEarned}, Passed: ${isPassed}`);

        // Cek notification setting
        const { enabled } = await checkQuizNotificationEnabled(userId, notificationType);

        console.log(`🔔 Notification enabled: ${enabled}`);

        if (!enabled) {
            console.log('🔕 User menonaktifkan notifikasi kuis');
            console.log(`========== NOTIFICATION SKIPPED (USER PREFERENCE) ==========\n`);
            
            kuisLogger.quizCompleted(userName, levelName, percentCorrect, isPassed, false);
            
            return { success: true, message: 'Notifikasi dinonaktifkan oleh user' };
        }

        if (!fcmToken) {
            console.log('📱 FCM token tidak ditemukan untuk user');
            console.log(`========== NOTIFICATION FAILED (NO FCM TOKEN) ==========\n`);
            
            kuisLogger.error('quiz_notification', userName, 'FCM token tidak ditemukan', {
                level_name: levelName,
                score: percentCorrect
            });
            kuisLogger.quizCompleted(userName, levelName, percentCorrect, isPassed, false);
            
            return { success: false, error: 'FCM token tidak ditemukan' };
        }

        // Buat pesan notifikasi untuk Android berdasarkan hasil
        let title, body;
        
        if (percentCorrect >= 99.99) {
            // Perfect Score!
            title = '🏆 PERFECT SCORE!';
            body = `Luar biasa, ${userName}! Kamu mendapat nilai sempurna di kuis "${levelName}"! Kamu mendapat ${xpEarned} XP! 🎉`;
            
            kuisLogger.perfectScore(userName, levelName, xpEarned);
        } else if (isPassed) {
            // Lulus tapi tidak perfect
            title = '✅ Selamat, Kamu Lulus!';
            body = `Hebat, ${userName}! Kamu berhasil menyelesaikan kuis "${levelName}" dengan skor ${percentCorrect.toFixed(0)}%. Kamu mendapat ${xpEarned} XP! 🎯`;
        } else {
            // Belum lulus
            title = '😢 Belum Berhasil';
            body = `Tetap semangat, ${userName}! Kuis "${levelName}" belum berhasil diselesaikan (skor ${percentCorrect.toFixed(0)}%). Coba lagi, kamu pasti bisa! 💪`;
        }

        const data = {
            type: notificationType,
            module: 'quiz',
            attempt_id: attemptId.toString(),
            level_name: levelName,
            category_name: categoryName,
            user_name: userName,
            score_points: quizResult.score_points.toString(),
            percent_correct: percentCorrect.toString(),
            xp_earned: xpEarned.toString(),
            is_passed: isPassed.toString(),
            correct_count: quizResult.correct_count.toString(),
            wrong_count: quizResult.wrong_count.toString(),
            action: 'open_quiz_result',
            // Data untuk Android intent
            screen: 'QuizResultScreen',
            attempt_id_nav: attemptId.toString()
        };

        const options = {
            priority: 'high',
            sound: isPassed ? 'success' : 'default',
            channelId: isPassed ? 'sako_quiz_success' : 'sako_quiz_general',
            ttl: 3600000 // 1 hour
        };

        console.log(`📤 Mengirim notifikasi kuis: ${title}`);
        console.log(`📧 FCM Data:`, JSON.stringify(data, null, 2));
        console.log(`⚙️ Options:`, JSON.stringify(options, null, 2));

        // Kirim notifikasi
        const result = await sendNotification(fcmToken, title, body, data, options);

        console.log(`✅ Notifikasi kuis berhasil dikirim`);
        console.log(`🆔 Message ID: ${result.messageId}`);
        console.log(`========== NOTIFICATION SENT SUCCESSFULLY ==========\n`);

        // Log sukses
        kuisLogger.quizCompleted(userName, levelName, percentCorrect, isPassed, true);

        return { 
            success: true, 
            messageId: result.messageId,
            notificationType: notificationType
        };

    } catch (error) {
        console.error('❌ Error mengirim notifikasi kuis:', error);
        console.error(error.stack);
        console.log(`========== NOTIFICATION FAILED (ERROR) ==========\n`);
        
        // Log error
        kuisLogger.error('send_quiz_notification', 'System', error.message, {
            attempt_id: attemptId,
            user_id: userId,
            error_stack: error.stack
        });
        
        return { success: false, error: error.message };
    }
};

// Export functions
module.exports = {
    sendQuizCompletedNotification,
    checkQuizNotificationEnabled
};
