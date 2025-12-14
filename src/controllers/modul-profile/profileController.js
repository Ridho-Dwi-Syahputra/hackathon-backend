//profileController.js

const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Import Models
const ProfileModel = require('../../models/modul-profile/profileModel');

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
    return writeLog('profile', logType, `${action} ${status}`, {
        action: action,
        status: status,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

const logError = async (errorType, error, data) => {
    return writeLog('profile/errors', 'ERROR', `${errorType}: ${error.message}`, {
        error_type: errorType,
        error_message: error.message,
        error_stack: error.stack,
        timestamp_indo: getIndonesianTime(),
        ...data
    });
};

/**
 * Get user profile with stats and badges
 * GET /auth/profile or /users/profile
 */
exports.getProfile = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const userId = req.user.users_id; // Dari auth middleware
        
        console.log('🔍 GET PROFILE - User ID:', userId);
        
        await logProfile('get_profile', 'attempt', {
            user_id: userId,
            ip: req.ip
        });

        // Get user profile with stats
        console.log('📊 Fetching user profile...');
        const profileData = await ProfileModel.getUserProfile(userId);
        console.log('✅ Profile data:', profileData ? 'Found' : 'Not found');
        
        if (!profileData) {
            await logProfile('get_profile', 'failed', {
                user_id: userId,
                reason: 'User not found or inactive'
            });
            
            return notFoundResponse(res, 'User tidak ditemukan atau tidak aktif');
        }

        // Get user badges
        console.log('🏆 Fetching badges...');
        const badges = await ProfileModel.getUserBadges(userId);
        console.log('✅ Badges count:', badges.length);

        const processingTime = Date.now() - startTime;

        await logProfile('get_profile', 'success', {
            user_id: userId,
            processing_time_ms: processingTime
        });

        // Response format sesuai ProfileResponse.kt
        return successResponse(res, {
            user: {
                id: profileData.user.id,
                fullName: profileData.user.full_name,
                email: profileData.user.email,
                totalXp: profileData.user.total_xp,
                userImageUrl: profileData.user.user_image_url,
                status: profileData.user.status,
                createdAt: profileData.user.created_at,
                updatedAt: profileData.user.updated_at
            },
            stats: {
                totalAttempts: profileData.stats.total_attempts,
                completedLevels: profileData.stats.completed_levels,
                totalPoints: profileData.stats.total_points,
                visitedPlaces: profileData.stats.visited_places
            },
            badges: badges.map(badge => ({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                imageUrl: badge.image_url,
                earnedAt: badge.earned_at
            }))
        }, 'Profil berhasil dimuat');

    } catch (error) {
        await logError('get_profile_error', error, {
            user_id: req.user?.users_id,
            ip: req.ip
        });
        
        return errorResponse(res, 'Terjadi kesalahan saat mengambil profil', 500);
    }
};

// Note: updateProfile, updateProfileImage, and changePassword functions
// have been moved to changeProfileController.js to avoid redundancy
