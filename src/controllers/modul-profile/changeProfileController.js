//changeProfileController.js
// Controller untuk menghandle perubahan profil user (edit profile & change password)

const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Import Models
const ChangeProfileModel = require('../../models/modul-profile/changeProfileModel');

// Import Utils
const { 
    successResponse, 
    errorResponse, 
    validationErrorResponse,
    unauthorizedResponse,
    notFoundResponse,
    conflictResponse
} = require('../../utils/responseHelper');
const { writeLog, getIndonesianTime } = require('../../utils/logsGenerator');

// Helper logging functions
const logProfile = async (action, status, data) => {
    const logType = status === 'success' ? 'SUCCESS' : 
                   status === 'failed' ? 'ERROR' : 'INFO';
    return writeLog('profile/change', logType, `${action} ${status}`, {
        action: action,
        status: status,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

const logError = async (errorType, error, data) => {
    return writeLog('profile/change/errors', 'ERROR', `${errorType}: ${error.message}`, {
        error_type: errorType,
        error_message: error.message,
        error_stack: error.stack,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

/**
 * Update user profile (name and email)
 * PUT /auth/profile
 */
exports.updateProfile = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const userId = req.user.users_id;
        const { full_name, email } = req.body;

        await logProfile('update_profile', 'attempt', {
            user_id: userId,
            full_name,
            email,
            ip: req.ip
        });

        // Validasi input
        if (!full_name || !email) {
            await logProfile('update_profile', 'failed', {
                user_id: userId,
                reason: 'Missing required fields'
            });
            
            return validationErrorResponse(res, [
                { field: 'full_name', message: 'Nama lengkap harus diisi' },
                { field: 'email', message: 'Email harus diisi' }
            ], 'Data tidak lengkap');
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            await logProfile('update_profile', 'failed', {
                user_id: userId,
                reason: 'Invalid email format'
            });
            
            return validationErrorResponse(res, 'Format email tidak valid');
        }

        // Check if email already used by another user
        const emailExists = await ChangeProfileModel.checkEmailExists(email, userId);
        if (emailExists) {
            await logProfile('update_profile', 'failed', {
                user_id: userId,
                email,
                reason: 'Email already in use'
            });
            
            return conflictResponse(res, 'Email sudah digunakan oleh pengguna lain');
        }

        // Update profile
        await ChangeProfileModel.updateProfile(userId, { full_name, email });

        // Get updated user data to return
        const AuthModel = require('../../models/authModel');
        const updatedUser = await AuthModel.findUserById(userId);

        const processingTime = Date.now() - startTime;

        await logProfile('update_profile', 'success', {
            user_id: userId,
            full_name,
            email,
            processing_time_ms: processingTime
        });

        return successResponse(res, {
            user: {
                users_id: updatedUser.users_id,
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                total_xp: updatedUser.total_xp,
                status: updatedUser.status,
                user_image_url: updatedUser.user_image_url,
                fcm_token: updatedUser.fcm_token,
                created_at: updatedUser.created_at
            }
        }, 'Profil berhasil diperbarui');

    } catch (error) {
        await logError('update_profile_error', error, {
            user_id: req.user?.users_id,
            ip: req.ip
        });
        
        return errorResponse(res, 'Terjadi kesalahan saat memperbarui profil', 500);
    }
};

/**
 * Update user profile image
 * PUT /auth/profile/image
 */
exports.updateProfileImage = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const userId = req.user.users_id;

        await logProfile('update_profile_image', 'attempt', {
            user_id: userId,
            ip: req.ip
        });

        // Check if file uploaded
        if (!req.file) {
            await logProfile('update_profile_image', 'failed', {
                user_id: userId,
                reason: 'No file uploaded'
            });
            
            return validationErrorResponse(res, 'File gambar harus diupload');
        }

        // New image path
        const imagePath = `/uploads/profiles/${req.file.filename}`;

        // Update database and get old image
        const imageInfo = await ChangeProfileModel.updateProfileImage(userId, imagePath);

        // Delete old image if exists
        if (imageInfo.old_image_url) {
            const oldImagePath = path.join(__dirname, '../../../public', imageInfo.old_image_url);
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                    await logProfile('delete_old_image', 'success', {
                        user_id: userId,
                        old_image: imageInfo.old_image_url
                    });
                } catch (err) {
                    await logError('delete_old_image_error', err, {
                        user_id: userId,
                        old_image_path: oldImagePath
                    });
                }
            }
        }

        // Get updated user data to return
        const AuthModel = require('../../models/authModel');
        const updatedUser = await AuthModel.findUserById(userId);

        const processingTime = Date.now() - startTime;

        await logProfile('update_profile_image', 'success', {
            user_id: userId,
            new_image: imagePath,
            file_size: req.file.size,
            processing_time_ms: processingTime
        });

        return successResponse(res, {
            user: {
                users_id: updatedUser.users_id,
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                total_xp: updatedUser.total_xp,
                status: updatedUser.status,
                user_image_url: updatedUser.user_image_url,
                fcm_token: updatedUser.fcm_token,
                created_at: updatedUser.created_at
            },
            image_url: imagePath
        }, 'Foto profil berhasil diperbarui');

    } catch (error) {
        await logError('update_profile_image_error', error, {
            user_id: req.user?.users_id,
            ip: req.ip
        });
        
        return errorResponse(res, 'Terjadi kesalahan saat memperbarui foto profil', 500);
    }
};

/**
 * Change user password
 * PUT /auth/password
 */
exports.changePassword = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const userId = req.user.users_id;
        const { current_password, new_password } = req.body;

        await logProfile('change_password', 'attempt', {
            user_id: userId,
            ip: req.ip
        });

        // Validasi input
        if (!current_password || !new_password) {
            await logProfile('change_password', 'failed', {
                user_id: userId,
                reason: 'Missing required fields'
            });
            
            return validationErrorResponse(res, [
                { field: 'current_password', message: 'Password lama harus diisi' },
                { field: 'new_password', message: 'Password baru harus diisi' }
            ], 'Data tidak lengkap');
        }

        // Validasi panjang password baru
        if (new_password.length < 6) {
            await logProfile('change_password', 'failed', {
                user_id: userId,
                reason: 'New password too short'
            });
            
            return validationErrorResponse(res, 'Password baru minimal 6 karakter');
        }

        // Get current password hash
        const currentPasswordHash = await ChangeProfileModel.getPasswordHash(userId);
        
        if (!currentPasswordHash) {
            await logProfile('change_password', 'failed', {
                user_id: userId,
                reason: 'User not found'
            });
            
            return notFoundResponse(res, 'User tidak ditemukan');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(current_password, currentPasswordHash);
        
        if (!isPasswordValid) {
            await logProfile('change_password', 'failed', {
                user_id: userId,
                reason: 'Current password incorrect'
            });
            
            return unauthorizedResponse(res, 'Password lama salah');
        }

        // Hash new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

        // Update password
        await ChangeProfileModel.updatePassword(userId, newPasswordHash);

        const processingTime = Date.now() - startTime;

        await logProfile('change_password', 'success', {
            user_id: userId,
            processing_time_ms: processingTime
        });

        return successResponse(res, null, 'Password berhasil diubah');

    } catch (error) {
        await logError('change_password_error', error, {
            user_id: req.user?.users_id,
            ip: req.ip
        });
        
        return errorResponse(res, 'Terjadi kesalahan saat mengubah password', 500);
    }
};
