//authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendNotification } = require('./firebase/firebaseConfig');

// Import Utils
const { generateCustomId } = require('../utils/customIdGenerator');
const { 
    successResponse, 
    createdResponse, 
    errorResponse, 
    validationErrorResponse,
    unauthorizedResponse,
    conflictResponse,
    notFoundResponse
} = require('../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../utils/logsGenerator');

// Helper logging functions untuk kompatibilitas
const logAuth = async (action, status, data) => {
    const logType = status === 'success' ? 'SUCCESS' : 
                   status === 'failed' ? 'ERROR' : 'INFO';
    return writeLog('auth', logType, `${action} ${status}`, {
        action: action,
        status: status,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

const logActivity = async (activity, status, data) => {
    const logType = status === 'success' ? 'SUCCESS' : 'INFO';
    return writeLog('auth/activity', logType, `${activity} ${status}`, {
        activity: activity,
        status: status,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

const logError = async (errorType, error, data) => {
    return writeLog('auth/errors', 'ERROR', `${errorType}: ${error.message}`, {
        error_type: errorType,
        error_message: error.message,
        error_stack: error.stack,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

// Helper function untuk find user by email
const findUserByEmail = async (email) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        throw error;
    }
};

// Helper function untuk find user by ID
const findUserById = async (userId) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE users_id = ?', [userId]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        throw error;
    }
};

/**
 * Register user baru
 */
exports.register = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const { full_name, email, password, fcm_token } = req.body;
        
        // Log register attempt
        await logAuth('register', 'attempt', {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        }, 'modul-autentikasi');

        // Validasi input
        if (!full_name || !email || !password) {
            await logAuth('register', 'failed', {
                email,
                reason: 'Missing required fields',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return validationErrorResponse(res, [
                { field: 'full_name', message: 'Full name harus diisi' },
                { field: 'email', message: 'Email harus diisi' },
                { field: 'password', message: 'Password harus diisi' }
            ], 'Data tidak lengkap');
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await logAuth('register', 'failed', {
                email,
                reason: 'Invalid email format',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return validationErrorResponse(res, 'Format email tidak valid');
        }

        // Validasi panjang password
        if (password.length < 6) {
            await logAuth('register', 'failed', {
                email,
                reason: 'Password too short',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return validationErrorResponse(res, 'Password minimal 6 karakter');
        }

        // Cek email sudah terdaftar atau belum
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            await logAuth('register', 'failed', {
                email,
                reason: 'Email already exists',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return conflictResponse(res, 'Email sudah terdaftar');
        }

        // Generate custom user ID
        const users_id = await generateCustomId(db, 'U', 'users', 'users_id', 3);
        
        await logActivity('user_id_generated', 'success', {
            generated_id: users_id,
            for_email: email
        }, 'modul-autentikasi');

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Default values
        const defaultNotificationPreferences = {
            quiz_reminder: true,
            achievement_unlock: true,
            cultural_event: true,
            weekly_challenge: true,
            friend_activity: false,
            marketing: false
        };

        // Insert user ke database
        const insertQuery = `
            INSERT INTO users (
                users_id, 
                full_name, 
                email, 
                password, 
                total_xp, 
                status, 
                user_image_url, 
                fcm_token,
                notification_preferences,
                created_at, 
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await db.query(insertQuery, [
            users_id,
            full_name,
            email,
            hashedPassword,
            0, // default total_xp
            'active', // default status
            null, // default user_image_url
            fcm_token || null,
            JSON.stringify(defaultNotificationPreferences)
        ]);

        // Insert initial XP record
        const xpQuery = `
            INSERT INTO user_points (users_id, points_earned, activity_type, description, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        await db.query(xpQuery, [
            users_id,
            0,
            'registration',
            'Initial registration'
        ]);

        const processingTime = Date.now() - startTime;

        // Log successful registration
        await logAuth('register', 'success', {
            users_id,
            email,
            full_name,
            ip: req.ip,
            processing_time_ms: processingTime,
            fcm_token_provided: !!fcm_token
        }, 'modul-autentikasi');

        // Response success
        return createdResponse(res, {
            users_id,
            full_name,
            email,
            total_xp: 0,
            status: 'active'
        }, 'Pendaftaran berhasil');

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        await logError('register_error', error, {
            email: req.body.email,
            ip: req.ip,
            processing_time_ms: processingTime,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const { email, password, fcm_token } = req.body;

        // Log login attempt
        await logAuth('login', 'attempt', {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            fcm_token_provided: !!fcm_token
        }, 'modul-autentikasi');

        // Validasi input
        if (!email || !password) {
            await logAuth('login', 'failed', {
                email,
                reason: 'Missing credentials',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return validationErrorResponse(res, 'Email dan password harus diisi');
        }

        // Cari user berdasarkan email
        const user = await findUserByEmail(email);
        if (!user) {
            await logAuth('login', 'failed', {
                email,
                reason: 'User not found',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return unauthorizedResponse(res, 'Email atau password salah');
        }

        // Cek status user
        if (user.status !== 'active') {
            await logAuth('login', 'failed', {
                email,
                users_id: user.users_id,
                reason: 'Account not active',
                current_status: user.status,
                ip: req.ip
            }, 'modul-autentikasi');
            
            return unauthorizedResponse(res, 'Akun tidak aktif');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            await logAuth('login', 'failed', {
                email,
                users_id: user.users_id,
                reason: 'Invalid password',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return unauthorizedResponse(res, 'Email atau password salah');
        }

        // Generate JWT token
        const tokenPayload = {
            users_id: user.users_id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });

        // Update FCM token jika disediakan
        if (fcm_token) {
            try {
                await db.query(
                    'UPDATE users SET fcm_token = ?, updated_at = NOW() WHERE users_id = ?',
                    [fcm_token, user.users_id]
                );
                
                await logActivity('fcm_token_updated', 'success', {
                    users_id: user.users_id,
                    email: user.email
                }, 'modul-autentikasi');
            } catch (fcmError) {
                await logError('fcm_update_error', fcmError, {
                    users_id: user.users_id,
                    email: user.email
                }, 'modul-autentikasi');
            }
        }

        // Update last login
        await db.query(
            'UPDATE users SET updated_at = NOW() WHERE users_id = ?',
            [user.users_id]
        );

        const processingTime = Date.now() - startTime;

        // Log successful login
        await logAuth('login', 'success', {
            users_id: user.users_id,
            email: user.email,
            ip: req.ip,
            processing_time_ms: processingTime,
            token_generated: true,
            fcm_token_updated: !!fcm_token
        }, 'modul-autentikasi');

        // Parse notification preferences
        let notificationPreferences = null;
        try {
            notificationPreferences = user.notification_preferences ? 
                JSON.parse(user.notification_preferences) : null;
        } catch (parseError) {
            await logError('notification_preferences_parse_error', parseError, {
                users_id: user.users_id,
                raw_data: user.notification_preferences
            }, 'modul-autentikasi');
        }

        // Response success dengan data user
        return successResponse(res, {
            token,
            user: {
                users_id: user.users_id,
                email: user.email,
                full_name: user.full_name,
                total_xp: user.total_xp || 0,
                status: user.status,
                user_image_url: user.user_image_url,
                fcm_token: fcm_token || user.fcm_token,
                notification_preferences: notificationPreferences
            }
        }, 'Login berhasil');

    } catch (error) {
        const processingTime = Date.now() - startTime;
        
        await logError('login_error', error, {
            email: req.body.email,
            ip: req.ip,
            processing_time_ms: processingTime,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Log logout attempt
        await logAuth('logout', 'attempt', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        // Clear FCM token
        await db.query(
            'UPDATE users SET fcm_token = NULL, updated_at = NOW() WHERE users_id = ?',
            [userId]
        );

        // Log successful logout
        await logAuth('logout', 'success', {
            users_id: userId,
            ip: req.ip,
            fcm_token_cleared: true
        }, 'modul-autentikasi');

        return successResponse(res, null, 'Logout berhasil');

    } catch (error) {
        await logError('logout_error', error, {
            users_id: req.user?.users_id,
            ip: req.ip,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Log profile access
        await logActivity('profile_access', 'attempt', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        // Get user data
        const user = await findUserById(userId);
        if (!user) {
            await logActivity('profile_access', 'failed', {
                users_id: userId,
                reason: 'User not found',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return notFoundResponse(res, 'User tidak ditemukan');
        }

        // Parse notification preferences
        let notificationPreferences = null;
        try {
            notificationPreferences = user.notification_preferences ? 
                JSON.parse(user.notification_preferences) : null;
        } catch (parseError) {
            await logError('notification_preferences_parse_error', parseError, {
                users_id: userId,
                raw_data: user.notification_preferences
            }, 'modul-autentikasi');
        }

        // Log successful profile access
        await logActivity('profile_access', 'success', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        return successResponse(res, {
            users_id: user.users_id,
            full_name: user.full_name,
            email: user.email,
            total_xp: user.total_xp || 0,
            status: user.status,
            user_image_url: user.user_image_url,
            notification_preferences: notificationPreferences,
            created_at: user.created_at
        }, 'Data profil berhasil diambil');

    } catch (error) {
        await logError('get_profile_error', error, {
            users_id: req.user?.users_id,
            ip: req.ip,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};

/**
 * Update FCM Token
 */
exports.updateFcmToken = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { fcm_token } = req.body;

        // Log FCM update attempt
        await logActivity('fcm_update', 'attempt', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        if (!fcm_token) {
            await logActivity('fcm_update', 'failed', {
                users_id: userId,
                reason: 'FCM token not provided',
                ip: req.ip
            }, 'modul-autentikasi');
            
            return validationErrorResponse(res, 'FCM token harus diisi');
        }

        // Update FCM token
        await db.query(
            'UPDATE users SET fcm_token = ?, updated_at = NOW() WHERE users_id = ?',
            [fcm_token, userId]
        );

        // Log successful FCM update
        await logActivity('fcm_update', 'success', {
            users_id: userId,
            ip: req.ip,
            fcm_token_length: fcm_token.length
        }, 'modul-autentikasi');

        return successResponse(res, null, 'FCM token berhasil diupdate');

    } catch (error) {
        await logError('update_fcm_token_error', error, {
            users_id: req.user?.users_id,
            ip: req.ip,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};

/**
 * Update notification preferences
 */
exports.updateNotificationPreferences = async (req, res, next) => {
    try {
        const userId = req.user.users_id;
        const { notification_preferences } = req.body;

        // Log notification preferences update attempt
        await logActivity('notification_preferences_update', 'attempt', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        if (!notification_preferences || typeof notification_preferences !== 'object') {
            return validationErrorResponse(res, 'Notification preferences harus berupa object');
        }

        // Validate notification preferences structure
        const validKeys = ['quiz_reminder', 'achievement_unlock', 'cultural_event', 'weekly_challenge', 'friend_activity', 'marketing'];
        const providedKeys = Object.keys(notification_preferences);
        
        const invalidKeys = providedKeys.filter(key => !validKeys.includes(key));
        if (invalidKeys.length > 0) {
            await logActivity('notification_preferences_update', 'failed', {
                users_id: userId,
                reason: 'Invalid keys',
                invalid_keys: invalidKeys,
                ip: req.ip
            }, 'modul-autentikasi');
            
            return validationErrorResponse(res, `Invalid notification preference keys: ${invalidKeys.join(', ')}`);
        }

        // Update notification preferences
        await db.query(
            'UPDATE users SET notification_preferences = ?, updated_at = NOW() WHERE users_id = ?',
            [JSON.stringify(notification_preferences), userId]
        );

        // Log successful update
        await logActivity('notification_preferences_update', 'success', {
            users_id: userId,
            updated_preferences: notification_preferences,
            ip: req.ip
        }, 'modul-autentikasi');

        return successResponse(res, null, 'Preferensi notifikasi berhasil diupdate');

    } catch (error) {
        await logError('update_notification_preferences_error', error, {
            users_id: req.user?.users_id,
            ip: req.ip,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};

/**
 * Get notification preferences
 */
exports.getNotificationPreferences = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Log preferences access
        await logActivity('get_notification_preferences', 'attempt', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        // Get user notification preferences
        const result = await db.query(
            'SELECT notification_preferences FROM users WHERE users_id = ?',
            [userId]
        );

        if (result.length === 0) {
            return notFoundResponse(res, 'User tidak ditemukan');
        }

        let notificationPreferences = null;
        try {
            notificationPreferences = result[0].notification_preferences ? 
                JSON.parse(result[0].notification_preferences) : {
                    quiz_reminder: true,
                    achievement_unlock: true,
                    cultural_event: true,
                    weekly_challenge: true,
                    friend_activity: false,
                    marketing: false
                };
        } catch (parseError) {
            await logError('notification_preferences_parse_error', parseError, {
                users_id: userId,
                raw_data: result[0].notification_preferences
            }, 'modul-autentikasi');
            
            // Return default preferences jika parse error
            notificationPreferences = {
                quiz_reminder: true,
                achievement_unlock: true,
                cultural_event: true,
                weekly_challenge: true,
                friend_activity: false,
                marketing: false
            };
        }

        // Log successful access
        await logActivity('get_notification_preferences', 'success', {
            users_id: userId,
            ip: req.ip
        }, 'modul-autentikasi');

        return successResponse(res, notificationPreferences, 'Preferensi notifikasi berhasil diambil');

    } catch (error) {
        await logError('get_notification_preferences_error', error, {
            users_id: req.user?.users_id,
            ip: req.ip,
            stack: error.stack
        }, 'modul-autentikasi');
        
        next(error);
    }
};