//authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendNotification } = require('./firebase/firebaseConfig');

// Import Models
const AuthModel = require('../models/authModel');

// Import Utils
const { generateCustomId } = require('../utils/customIdGenerator');
const { successResponse, createdResponse, errorResponse, validationErrorResponse, unauthorizedResponse, conflictResponse, notFoundResponse } = require('../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../utils/logsGenerator');

// Helper logging functions untuk kompatibilitas
const logAuth = async (action, status, data) => {
    const logType = status === 'success' ? 'SUCCESS' : status === 'failed' ? 'ERROR' : 'INFO';
    return writeLog('auth', logType, `${action} ${status}`, {
        action: action,
        status: status,
        timestamp_indo: getIndonesianTime(),
        ...data,
    });
};

const logActivity = async (activity, status, data) => {
    const logType = status === 'success' ? 'SUCCESS' : 'INFO';
    return writeLog('auth/activity', logType, `${activity} ${status}`, {
        activity: activity,
        status: status,
        timestamp_indo: getIndonesianTime(),
        ...data,
    });
};

const logError = async (errorType, error, data) => {
    return writeLog('auth/errors', 'ERROR', `${errorType}: ${error.message}`, {
        error_type: errorType,
        error_message: error.message,
        error_stack: error.stack,
        timestamp_indo: getIndonesianTime(),
        ...data,
    });
};

/**
 * Register user baru
 */
exports.register = async (req, res, next) => {
    const startTime = Date.now();

    try {
        const { full_name, email, password, fcm_token } = req.body;

        // Log register attempt
        await logAuth(
            'register',
            'attempt',
            {
                email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
            },
            'modul-autentikasi'
        );

        // Validasi input
        if (!full_name || !email || !password) {
            await logAuth(
                'register',
                'failed',
                {
                    email,
                    reason: 'Missing required fields',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return validationErrorResponse(
                res,
                [
                    { field: 'full_name', message: 'Full name harus diisi' },
                    { field: 'email', message: 'Email harus diisi' },
                    { field: 'password', message: 'Password harus diisi' },
                ],
                'Data tidak lengkap'
            );
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await logAuth(
                'register',
                'failed',
                {
                    email,
                    reason: 'Invalid email format',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return validationErrorResponse(res, 'Format email tidak valid');
        }

        // Validasi panjang password
        if (password.length < 6) {
            await logAuth(
                'register',
                'failed',
                {
                    email,
                    reason: 'Password too short',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return validationErrorResponse(res, 'Password minimal 6 karakter');
        }

        // Cek email sudah terdaftar atau belum
        const existingUser = await AuthModel.findUserByEmail(email);
        if (existingUser) {
            await logAuth(
                'register',
                'failed',
                {
                    email,
                    reason: 'Email already exists',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return conflictResponse(res, 'Email sudah terdaftar');
        }

        // Generate custom user ID
        const users_id = await generateCustomId(require('../config/database'), 'U', 'users', 'users_id', 3);

        // Validasi apakah ID yang di-generate sudah unik
        const existingUserWithId = await AuthModel.findUserById(users_id);
        if (existingUserWithId) {
            // Jika masih duplikat, coba generate ulang dengan timestamp
            const timestamp = Date.now().toString().slice(-3);
            const fallbackId = `U${timestamp.padStart(3, '0')}`;

            await logActivity(
                'user_id_collision_detected',
                'warning',
                {
                    original_id: users_id,
                    fallback_id: fallbackId,
                    for_email: email,
                },
                'modul-autentikasi'
            );

            users_id = fallbackId;
        }

        await logActivity(
            'user_id_generated',
            'success',
            {
                generated_id: users_id,
                for_email: email,
            },
            'modul-autentikasi'
        );

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Default values sesuai implementasi aktual (2 map notifications only)
        const defaultNotificationPreferences = {
            // System notifications (basic)
            system_announcements: true,
            marketing: false,

            // Map module notifications (hanya 2 yang diimplementasikan)
            map_notifications: {
                review_added: true, // dari sendReviewAddedNotification()
                place_visited: true, // dari sendPlaceVisitedNotification()
            },

            // TODO: Quiz system belum ada di sako.sql - akan diaktifkan nanti
            // quiz_reminder: true,
            // achievement_unlock: true,
        };

        // Create user through model
        const userData = {
            users_id,
            full_name,
            email,
            hashedPassword,
            fcm_token,
            notification_preferences: defaultNotificationPreferences,
        };

        const createdUser = await AuthModel.createUser(userData);

        // Generate JWT token untuk auto-login setelah register
        const accessToken = jwt.sign({ users_id: users_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate database token untuk auto-login 30 hari
        const databaseToken = `T${Date.now()}-${users_id}`;
        const databaseTokenExpiry = new Date();
        databaseTokenExpiry.setDate(databaseTokenExpiry.getDate() + 30);

        // Save database token
        await AuthModel.saveToken(users_id, databaseToken, databaseTokenExpiry);

        const processingTime = Date.now() - startTime;

        // Log successful registration
        await logAuth(
            'register',
            'success',
            {
                users_id,
                email,
                full_name,
                ip: req.ip,
                processing_time_ms: processingTime,
                fcm_token_provided: !!fcm_token,
                token_generated: true,
            },
            'modul-autentikasi'
        );

        // Response success dengan token (sama seperti login)
        return createdResponse(
            res,
            {
                user: {
                    users_id: createdUser.users_id,
                    full_name: createdUser.full_name,
                    email: createdUser.email,
                    total_xp: createdUser.total_xp,
                    status: createdUser.status,
                    user_image_url: null,
                    fcm_token: fcm_token || null,
                },
                access_token: accessToken,
                database_token: databaseToken,
                expires_in: 3600,
            },
            'Pendaftaran berhasil'
        );
    } catch (error) {
        const processingTime = Date.now() - startTime;

        await logError(
            'register_error',
            error,
            {
                email: req.body.email,
                ip: req.ip,
                processing_time_ms: processingTime,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

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
        await logAuth(
            'login',
            'attempt',
            {
                email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                fcm_token_provided: !!fcm_token,
            },
            'modul-autentikasi'
        );

        // Validasi input
        if (!email || !password) {
            await logAuth(
                'login',
                'failed',
                {
                    email,
                    reason: 'Missing credentials',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return validationErrorResponse(res, 'Email dan password harus diisi');
        }

        // Cari user berdasarkan email
        const user = await AuthModel.findUserByEmail(email);
        if (!user) {
            await logAuth(
                'login',
                'failed',
                {
                    email,
                    reason: 'User not found',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return unauthorizedResponse(res, 'Email atau password salah');
        }

        // Cek status user
        if (user.status !== 'active') {
            await logAuth(
                'login',
                'failed',
                {
                    email,
                    users_id: user.users_id,
                    reason: 'Account not active',
                    current_status: user.status,
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return unauthorizedResponse(res, 'Akun tidak aktif');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            await logAuth(
                'login',
                'failed',
                {
                    email,
                    users_id: user.users_id,
                    reason: 'Invalid password',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return unauthorizedResponse(res, 'Email atau password salah');
        }

        // Generate JWT access token (1 hour)
        const accessTokenPayload = {
            users_id: user.users_id,
            iat: Math.floor(Date.now() / 1000),
        };

        const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Generate database token untuk auto-login (30 days)
        const databaseToken = `T${Date.now()}-${user.users_id}`;

        // Calculate token expiry date for database storage (30 days)
        const expiresInDays = 30;
        const tokenExpiryDate = new Date();
        tokenExpiryDate.setDate(tokenExpiryDate.getDate() + expiresInDays);

        // Save database token (bukan JWT) untuk auto-login 30 hari
        console.log(`💾 Saving database token to DB:`, {
            users_id: user.users_id,
            database_token: databaseToken,
            token_length: databaseToken.length,
            expiry_date: tokenExpiryDate.toISOString(),
        });

        try {
            await AuthModel.saveToken(user.users_id, databaseToken, tokenExpiryDate);
            console.log(`✅ Database token saved successfully for ${user.users_id}`);

            await logActivity(
                'tokens_saved_to_db',
                'success',
                {
                    users_id: user.users_id,
                    access_token_expiry: '1h',
                    database_token: databaseToken,
                    database_token_expiry: tokenExpiryDate.toISOString(),
                    auto_login_days: 30,
                },
                'modul-autentikasi'
            );
        } catch (tokenSaveError) {
            await logError(
                'token_save_error',
                tokenSaveError,
                {
                    users_id: user.users_id,
                    email: user.email,
                },
                'modul-autentikasi'
            );
            // Continue with login even if token save fails
        }

        // Update FCM token jika disediakan
        let updatedFcmToken = user.fcm_token; // Keep existing token as fallback

        if (fcm_token && fcm_token.trim() !== '') {
            try {
                console.log(`🔔 Updating FCM token for user ${user.users_id}`);
                await AuthModel.updateFcmToken(user.users_id, fcm_token);
                updatedFcmToken = fcm_token; // Use new token

                await logActivity(
                    'fcm_token_updated',
                    'success',
                    {
                        users_id: user.users_id,
                        email: user.email,
                        new_token_length: fcm_token.length,
                    },
                    'modul-autentikasi'
                );
            } catch (fcmError) {
                console.error('❌ FCM token update failed:', fcmError.message);
                await logError(
                    'fcm_update_error',
                    fcmError,
                    {
                        users_id: user.users_id,
                        email: user.email,
                        token_length: fcm_token ? fcm_token.length : 0,
                    },
                    'modul-autentikasi'
                );
                // Don't fail login if FCM update fails, use existing token
            }
        } else {
            console.log(`📝 No FCM token provided for user ${user.users_id}`);
        }

        // Update last login
        await AuthModel.updateLastLogin(user.users_id);

        const processingTime = Date.now() - startTime;

        // Log successful login
        await logAuth(
            'login',
            'success',
            {
                users_id: user.users_id,
                email: user.email,
                ip: req.ip,
                processing_time_ms: processingTime,
                token_generated: true,
                fcm_token_updated: !!fcm_token,
            },
            'modul-autentikasi'
        );

        // Parse notification preferences
        let notificationPreferences = null;
        try {
            notificationPreferences = user.notification_preferences ? JSON.parse(user.notification_preferences) : null;
        } catch (parseError) {
            await logError(
                'notification_preferences_parse_error',
                parseError,
                {
                    users_id: user.users_id,
                    raw_data: user.notification_preferences,
                },
                'modul-autentikasi'
            );
        }

        // Response success dengan format SAMA seperti register
        console.log(`📤 Sending login response:`, {
            access_token_length: accessToken.length,
            database_token: databaseToken,
            database_token_length: databaseToken.length,
            user_id: user.users_id,
        });

        return successResponse(
            res,
            {
                access_token: accessToken, // JWT 1 hour
                database_token: databaseToken, // Database token 30 days
                expires_in: 3600, // 1 hour in seconds
                user: {
                    users_id: user.users_id,
                    email: user.email,
                    full_name: user.full_name,
                    total_xp: user.total_xp || 0,
                    status: user.status,
                    user_image_url: user.user_image_url,
                    fcm_token: updatedFcmToken,
                    notification_preferences: notificationPreferences,
                },
            },
            'Login berhasil'
        );
    } catch (error) {
        const processingTime = Date.now() - startTime;

        await logError(
            'login_error',
            error,
            {
                email: req.body.email,
                ip: req.ip,
                processing_time_ms: processingTime,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

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
        await logAuth(
            'logout',
            'attempt',
            {
                users_id: userId,
                ip: req.ip,
            },
            'modul-autentikasi'
        );

        // Clear FCM token and database token
        await AuthModel.clearFcmToken(userId);
        await AuthModel.clearToken(userId);

        // Log successful logout
        await logAuth(
            'logout',
            'success',
            {
                users_id: userId,
                ip: req.ip,
                fcm_token_cleared: true,
                database_token_cleared: true,
            },
            'modul-autentikasi'
        );

        return successResponse(res, null, 'Logout berhasil');
    } catch (error) {
        await logError(
            'logout_error',
            error,
            {
                users_id: req.user?.users_id,
                ip: req.ip,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

        next(error);
    }
};

/**
 * Get user profile
 *
 * ⚠️ DEPRECATED: This function has been moved to profileController.js
 *
 * Reason: ProfileScreen needs comprehensive stats (quiz attempts, completed levels,
 * visited places, badges) which are not available in this basic profile endpoint.
 *
 * New endpoint: GET /api/auth/profile (handled by profileController.getProfile)
 *
 * This function is kept here for backward compatibility but is NOT used by any route.
 * Consider removing in future cleanup.
 */
exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Log profile access
        await logActivity(
            'profile_access',
            'attempt',
            {
                users_id: userId,
                ip: req.ip,
                deprecated_warning: 'Using deprecated authController.getProfile',
            },
            'modul-autentikasi'
        );

        // Get user data
        const user = await AuthModel.findUserById(userId);
        if (!user) {
            await logActivity(
                'profile_access',
                'failed',
                {
                    users_id: userId,
                    reason: 'User not found',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return notFoundResponse(res, 'User tidak ditemukan');
        }

        // Parse notification preferences
        let notificationPreferences = null;
        try {
            notificationPreferences = user.notification_preferences ? JSON.parse(user.notification_preferences) : null;
        } catch (parseError) {
            await logError(
                'notification_preferences_parse_error',
                parseError,
                {
                    users_id: userId,
                    raw_data: user.notification_preferences,
                },
                'modul-autentikasi'
            );
        }

        // Log successful profile access
        await logActivity(
            'profile_access',
            'success',
            {
                users_id: userId,
                ip: req.ip,
                deprecated_warning: 'Using deprecated authController.getProfile - migrate to profileController',
            },
            'modul-autentikasi'
        );

        return successResponse(
            res,
            {
                users_id: user.users_id,
                full_name: user.full_name,
                email: user.email,
                total_xp: user.total_xp || 0,
                status: user.status,
                user_image_url: user.user_image_url,
                notification_preferences: notificationPreferences,
                created_at: user.created_at,
            },
            'Data profil berhasil diambil (DEPRECATED - gunakan /api/auth/profile)'
        );
    } catch (error) {
        await logError(
            'get_profile_error',
            error,
            {
                users_id: req.user?.users_id,
                ip: req.ip,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

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
        await logActivity(
            'fcm_update',
            'attempt',
            {
                users_id: userId,
                ip: req.ip,
            },
            'modul-autentikasi'
        );

        if (!fcm_token) {
            await logActivity(
                'fcm_update',
                'failed',
                {
                    users_id: userId,
                    reason: 'FCM token not provided',
                    ip: req.ip,
                },
                'modul-autentikasi'
            );

            return validationErrorResponse(res, 'FCM token harus diisi');
        }

        // Update FCM token
        await AuthModel.updateFcmToken(userId, fcm_token);

        // Log successful FCM update
        await logActivity(
            'fcm_update',
            'success',
            {
                users_id: userId,
                ip: req.ip,
                fcm_token_length: fcm_token.length,
            },
            'modul-autentikasi'
        );

        return successResponse(res, null, 'FCM token berhasil diupdate');
    } catch (error) {
        await logError(
            'update_fcm_token_error',
            error,
            {
                users_id: req.user?.users_id,
                ip: req.ip,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

        next(error);
    }
};

// NOTE: updateNotificationPreferences dan getNotificationPreferences
// dipindahkan ke settingController.js (modul-profile/settingController.js)

/**
 * FUNGSIONAL AUTH BARU: Auto Login (30 Days Token Validation)
 * Untuk auto-login user tanpa perlu input password lagi
 */
exports.autoLogin = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Generate new JWT access token (1 hour)
        const accessToken = jwt.sign({ users_id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('🔄 Auto-login generating new JWT access token');
        console.log('   User ID:', userId);
        console.log('   New JWT token length:', accessToken.length);

        // Log auto login
        await logActivity(
            'auto_login',
            'success',
            {
                users_id: userId,
                ip: req.ip,
                token_expires: req.user.token_validity,
                remaining_days: Math.ceil((new Date(req.user.token_validity) - new Date()) / (1000 * 60 * 60 * 24)),
            },
            'modul-autentikasi'
        );

        // Return user data sama seperti login biasa dengan JWT baru
        return successResponse(
            res,
            {
                access_token: accessToken, // JWT baru untuk API calls (1 hour)
                database_token: req.token, // Token database untuk auto-refresh (30 days)
                expires_in: 3600, // 1 hour in seconds
                user: {
                    users_id: req.user.users_id,
                    email: req.user.email,
                    full_name: req.user.full_name,
                    total_xp: req.user.total_xp || 0,
                    status: req.user.status,
                    user_image_url: req.user.user_image_url,
                    fcm_token: req.user.fcm_token,
                    notification_preferences: req.user.notification_preferences,
                },
            },
            'Auto-login berhasil'
        );
    } catch (error) {
        await logError(
            'auto_login_error',
            error,
            {
                users_id: req.user?.users_id,
                ip: req.ip,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

        next(error);
    }
};

/**
 * FUNGSIONAL AUTH BARU: Revoke Token (Force Logout)
 * Untuk force logout user dari semua device
 */
exports.revokeToken = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Log revoke attempt
        await logActivity(
            'token_revoke',
            'attempt',
            {
                users_id: userId,
                ip: req.ip,
            },
            'modul-autentikasi'
        );

        // Clear token dari database
        await AuthModel.clearToken(userId);

        // Log successful revoke
        await logActivity(
            'token_revoke',
            'success',
            {
                users_id: userId,
                ip: req.ip,
            },
            'modul-autentikasi'
        );

        return successResponse(res, null, 'Token berhasil dicabut. Silakan login kembali.');
    } catch (error) {
        await logError(
            'revoke_token_error',
            error,
            {
                users_id: req.user?.users_id,
                ip: req.ip,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

        next(error);
    }
};

/**
 * FUNGSIONAL AUTH BARU: Validate Token
 * Untuk check apakah token masih valid
 */
exports.validateToken = async (req, res, next) => {
    try {
        const userId = req.user.users_id;

        // Log validation
        await logActivity(
            'token_validation',
            'success',
            {
                users_id: userId,
                ip: req.ip,
                token_expires: req.user.token_validity,
            },
            'modul-autentikasi'
        );

        return successResponse(
            res,
            {
                valid: true,
                users_id: userId,
                email: req.user.email,
                expires_at: req.user.token_validity,
            },
            'Token masih valid'
        );
    } catch (error) {
        await logError(
            'validate_token_error',
            error,
            {
                users_id: req.user?.users_id,
                ip: req.ip,
                stack: error.stack,
            },
            'modul-autentikasi'
        );

        next(error);
    }
};
