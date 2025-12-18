/**
 * 🔍 DEBUGGING SCRIPT - QUIZ NOTIFICATION TROUBLESHOOTING
 * 
 * Script ini akan mengecek:
 * 1. FCM Token tersimpan di database
 * 2. Notification preferences user
 * 3. Test kirim notifikasi quiz langsung
 * 4. Verifikasi backend logs
 * 
 * Cara pakai:
 * node test-quiz-notification-debug.js USER_ID ATTEMPT_ID
 * 
 * Contoh:
 * node test-quiz-notification-debug.js USR001 AT001
 */

require('dotenv').config();
const { pool } = require('./src/config/database');
const { sendQuizCompletedNotification } = require('./src/controllers/firebase/notifikasi/modul-kuis/kuisNotifikasiController');

// ANSI Colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
    step: (msg) => console.log(`\n${colors.magenta}🔍 ${msg}${colors.reset}`),
};

async function debugQuizNotification() {
    const userId = process.argv[2];
    const attemptId = process.argv[3];

    console.log('\n' + '='.repeat(70));
    console.log('🐛 QUIZ NOTIFICATION DEBUG TOOL');
    console.log('='.repeat(70));

    if (!userId || !attemptId) {
        log.error('Missing arguments!');
        console.log('\nUsage: node test-quiz-notification-debug.js USER_ID ATTEMPT_ID');
        console.log('Example: node test-quiz-notification-debug.js USR001 AT001\n');
        process.exit(1);
    }

    log.info(`User ID: ${userId}`);
    log.info(`Attempt ID: ${attemptId}`);

    try {
        // STEP 1: Cek user exists dan FCM token
        log.step('STEP 1: Checking user FCM token...');
        const [userResult] = await pool.execute(
            'SELECT users_id, full_name, email, fcm_token, notification_preferences FROM users WHERE users_id = ?',
            [userId]
        );

        if (userResult.length === 0) {
            log.error(`User ${userId} tidak ditemukan!`);
            process.exit(1);
        }

        const user = userResult[0];
        console.log('\n📋 User Info:');
        console.log(`   Name: ${user.full_name}`);
        console.log(`   Email: ${user.email}`);
        
        if (user.fcm_token) {
            log.success(`FCM Token found: ${user.fcm_token.substring(0, 50)}...`);
            console.log(`   Token length: ${user.fcm_token.length} characters`);
        } else {
            log.error('FCM Token TIDAK ADA!');
            log.warning('User harus login dari app untuk mendapatkan FCM token');
            console.log('\n📱 Solusi:');
            console.log('   1. Buka app Android');
            console.log('   2. Login dengan user ini');
            console.log('   3. FCM token akan otomatis tersimpan');
            console.log('   4. Jalankan script ini lagi\n');
            process.exit(1);
        }

        // STEP 2: Cek notification preferences
        log.step('STEP 2: Checking notification preferences...');
        if (user.notification_preferences) {
            try {
                const prefs = typeof user.notification_preferences === 'string' 
                    ? JSON.parse(user.notification_preferences) 
                    : user.notification_preferences;
                
                console.log('\n⚙️  Notification Preferences:');
                console.log(JSON.stringify(prefs, null, 2));

                const quizPrefs = prefs.quiz_notifications || {};
                console.log('\n🎯 Quiz Notification Settings:');
                console.log(`   quiz_completed: ${quizPrefs.quiz_completed !== false ? 'ENABLED' : 'DISABLED'}`);
                console.log(`   quiz_perfect_score: ${quizPrefs.quiz_perfect_score !== false ? 'ENABLED' : 'DISABLED'}`);
                console.log(`   quiz_passed: ${quizPrefs.quiz_passed !== false ? 'ENABLED' : 'DISABLED'}`);
                console.log(`   quiz_failed: ${quizPrefs.quiz_failed !== false ? 'ENABLED' : 'DISABLED'}`);

                const allEnabled = Object.values(quizPrefs).every(val => val !== false);
                if (allEnabled) {
                    log.success('Semua notifikasi quiz ENABLED');
                } else {
                    log.warning('Ada notifikasi quiz yang DISABLED');
                }
            } catch (e) {
                log.warning('Error parsing preferences, using defaults (all enabled)');
            }
        } else {
            log.info('No preferences set, defaulting to ALL ENABLED');
        }

        // STEP 3: Cek quiz attempt
        log.step('STEP 3: Checking quiz attempt...');
        const [attemptResult] = await pool.execute(
            `SELECT qa.*, l.name as level_name, c.name as category_name 
             FROM quiz_attempt qa
             JOIN level l ON qa.level_id = l.id
             JOIN category c ON l.category_id = c.id
             WHERE qa.id = ?`,
            [attemptId]
        );

        if (attemptResult.length === 0) {
            log.error(`Quiz attempt ${attemptId} tidak ditemukan!`);
            process.exit(1);
        }

        const attempt = attemptResult[0];
        console.log('\n📝 Quiz Attempt Info:');
        console.log(`   Level: ${attempt.level_name}`);
        console.log(`   Category: ${attempt.category_name}`);
        console.log(`   Score: ${attempt.score_points} points`);
        console.log(`   XP Earned: ${attempt.xp_earned} XP`);
        console.log(`   Status: ${attempt.is_passed ? 'PASSED ✅' : 'FAILED ❌'}`);
        console.log(`   Completed: ${attempt.completed_at || 'Not yet'}`);

        if (!attempt.completed_at) {
            log.warning('Quiz belum diselesaikan (completed_at NULL)');
        } else {
            log.success('Quiz sudah diselesaikan');
        }

        // STEP 4: Verify user_id match
        log.step('STEP 4: Verifying user ownership...');
        if (attempt.user_id !== userId) {
            log.error(`User mismatch! Attempt belongs to ${attempt.user_id}, not ${userId}`);
            process.exit(1);
        }
        log.success('User ownership verified');

        // STEP 5: Prepare quiz result data
        log.step('STEP 5: Preparing notification data...');
        
        // Calculate percent correct
        const totalQuestions = attempt.correct_count + attempt.wrong_count + attempt.unanswered_count;
        const percentCorrect = totalQuestions > 0 
            ? (attempt.correct_count / totalQuestions) * 100 
            : 0;

        const quizResultData = {
            attempt_id: attemptId,
            score_points: attempt.score_points,
            correct_count: attempt.correct_count,
            wrong_count: attempt.wrong_count,
            unanswered_count: attempt.unanswered_count,
            percent_correct: parseFloat(percentCorrect.toFixed(2)),
            xp_earned: attempt.xp_earned || 0,
            points_earned: attempt.score_points,
            is_passed: attempt.is_passed === 1,
            new_total_xp: 0, // Will be calculated by controller
            badges_earned: []
        };

        console.log('\n📊 Notification Data:');
        console.log(JSON.stringify(quizResultData, null, 2));

        // Determine notification type
        let notifType = 'quiz_completed';
        if (percentCorrect >= 99.99) {
            notifType = 'quiz_perfect_score';
        } else if (quizResultData.is_passed) {
            notifType = 'quiz_passed';
        } else {
            notifType = 'quiz_failed';
        }
        log.info(`Notification type: ${notifType}`);

        // STEP 6: Send test notification
        log.step('STEP 6: Sending test notification...');
        console.log('\n⏳ Please wait...\n');

        const result = await sendQuizCompletedNotification(userId, attemptId, quizResultData);

        console.log('\n' + '='.repeat(70));
        if (result.success) {
            log.success('NOTIFICATION SENT SUCCESSFULLY! 🎉');
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Notification Type: ${result.notificationType}`);
            console.log('\n📱 Check your Android device now!');
        } else {
            log.error('NOTIFICATION FAILED!');
            console.log(`   Error: ${result.error}`);
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check Firebase console for errors');
            console.log('   2. Verify FCM token is valid (not expired)');
            console.log('   3. Check app is installed and FCM is configured');
            console.log('   4. Try re-login from app to refresh token');
        }
        console.log('='.repeat(70));

        // STEP 7: Show backend logs location
        log.step('STEP 7: Check backend logs...');
        console.log('\n📂 Log files to check:');
        console.log('   - backend/src/logs/kuis/completions/*.log');
        console.log('   - backend/src/logs/kuis/achievements/*.log (if perfect score)');
        console.log('   - backend/src/logs/kuis/errors/*.log (if error)');
        
        console.log('\n💡 Tips:');
        console.log('   - Logs menggunakan waktu Indonesia (WIB)');
        console.log('   - Check terminal backend untuk real-time logs');
        console.log('   - Notification should appear within 2-5 seconds');

    } catch (error) {
        console.log('\n');
        log.error('UNEXPECTED ERROR!');
        console.error(error);
        console.error('\nStack trace:');
        console.error(error.stack);
    } finally {
        await pool.end();
        console.log('\n✅ Database connection closed\n');
    }
}

// Run debug
debugQuizNotification();
