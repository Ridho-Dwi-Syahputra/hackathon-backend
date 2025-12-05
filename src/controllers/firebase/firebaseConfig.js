const admin = require('firebase-admin');
require('dotenv').config();

// Import core logs utility
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');

console.log('🔥 Menginisialisasi Firebase Admin SDK untuk SAKO...');
console.log('📋 Project ID:', process.env.FIREBASE_PROJECT_ID);

// Validasi environment variables
const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Konfigurasi Firebase tidak lengkap di file .env');
    console.error('🔧 Variable yang hilang:', missingVars.join(', '));
    console.error('📝 Pastikan file .env berisi:');
    console.error('   FIREBASE_PROJECT_ID=your-project-id');
    console.error('   FIREBASE_CLIENT_EMAIL=your-service-account-email');  
    console.error('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."');
    
    writeLog('firebase/connection', 'ERROR', 'Konfigurasi Firebase tidak lengkap', {
        missing_vars: missingVars,
        timestamp_indo: getIndonesianTime()
    });
    
    process.exit(1);
}

try {
    // Initialize Firebase Admin SDK
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log('✅ Firebase Admin SDK berhasil diinisialisasi');
    
    // Log sukses
    writeLog('firebase/connection', 'SUCCESS', 'Firebase berhasil diinisialisasi', {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        platform: 'android_kotlin',
        timestamp_indo: getIndonesianTime()
    });

} catch (error) {
    console.error('❌ Gagal inisialisasi Firebase Admin SDK:', error.message);
    
    // Log error
    writeLog('firebase/connection', 'ERROR', `Firebase gagal diinisialisasi: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        timestamp_indo: getIndonesianTime()
    });
    
    process.exit(1);
}

// Function untuk kirim notifikasi
const sendNotification = async (fcmToken, title, body, data = {}, options = {}) => {
    const userName = data.user_name || 'Unknown User';
    const notificationType = data.type || 'unknown';
    
    try {
        if (!fcmToken || fcmToken.length === 0) {
            throw new Error('FCM Token tidak valid atau kosong');
        }

        const message = {
            token: fcmToken,
            notification: {
                title: title,
                body: body
            },
            data: {
                ...data,
                timestamp: new Date().toISOString(),
                source: 'sako_backend',
                platform: 'android_kotlin'
            },
            android: {
                priority: options.priority || 'high',
                notification: {
                    title: title,
                    body: body,
                    sound: options.sound || 'default',
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    channel_id: options.channelId || 'sako_default',
                    icon: 'ic_notification',
                    color: '#FF6B35'
                },
                ttl: options.ttl || 3600000
            }
        };

        const response = await admin.messaging().send(message);
        
        console.log('✅ Notifikasi berhasil dikirim');
        console.log('🆔 Message ID:', response);
        
        // Log sukses
        writeLog('firebase/notifications', 'SUCCESS', `Notifikasi ${notificationType} berhasil dikirim ke ${userName}`, {
            message_id: response,
            title: title,
            user: userName,
            type: notificationType,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
        
        return {
            success: true,
            messageId: response,
            platform: 'android'
        };

    } catch (error) {
        console.error('❌ Gagal kirim notifikasi:', error.message);
        
        // Log error
        writeLog('firebase/notifications', 'ERROR', `Notifikasi ${notificationType} gagal dikirim ke ${userName}: ${error.message}`, {
            error: error.message,
            error_code: error.code,
            title: title,
            user: userName,
            type: notificationType,
            platform: 'android_kotlin',
            timestamp_indo: getIndonesianTime()
        });
        
        return {
            success: false,
            error: error.message,
            platform: 'android'
        };
    }
};

module.exports = {
    admin,
    sendNotification
};