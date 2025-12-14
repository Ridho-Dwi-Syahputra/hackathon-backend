const homeModel = require('../models/HomeModel');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Home Controller
 * Handles dashboard and home screen data
 */

/**
 * GET /api/home/dashboard
 * Get comprehensive dashboard data for home screen
 */
const getDashboardData = async (req, res) => {
    console.log('🏠 HOME DASHBOARD - Request received');
    console.log('🔍 User from token:', req.user);
    
    try {
        const userId = req.user?.users_id;
        
        console.log('📋 User ID extracted:', userId);
        
        if (!userId) {
            console.log('❌ No user ID found');
            return errorResponse(res, 'User ID tidak ditemukan', 401);
        }
        
        console.log('✅ Starting to fetch dashboard data for user:', userId);

        // Get all dashboard data in parallel
        const [
            userStats,
            recentQuizAttempts,
            popularVideos,
            nearbyPlaces,
            achievements
        ] = await Promise.all([
            homeModel.getUserStats(userId),
            homeModel.getRecentQuizAttempts(userId, 5),
            homeModel.getPopularVideos(5),
            homeModel.getNearbyPlaces(userId, 3),
            homeModel.getUserAchievements(userId)
        ]);

        const dashboardData = {
            user_stats: userStats,
            recent_activities: {
                quiz_attempts: recentQuizAttempts
            },
            popular_content: {
                videos: popularVideos,
                places: nearbyPlaces
            },
            achievements: achievements
        };

        return successResponse(res, dashboardData, 'Dashboard data berhasil dimuat');
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        return errorResponse(res, 'Gagal memuat data dashboard', 500);
    }
};

/**
 * GET /api/home/stats
 * Get user statistics only
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.user?.users_id;
        
        if (!userId) {
            return errorResponse(res, 'User ID tidak ditemukan', 401);
        }

        const stats = await homeModel.getUserStats(userId);
        
        return successResponse(res, stats, 'Statistik pengguna berhasil dimuat');
    } catch (error) {
        console.error('Error getting user stats:', error);
        return errorResponse(res, 'Gagal memuat statistik pengguna', 500);
    }
};

/**
 * GET /api/home/activities
 * Get recent user activities
 */
const getRecentActivities = async (req, res) => {
    try {
        const userId = req.user?.users_id;
        const limit = parseInt(req.query.limit) || 10;
        
        if (!userId) {
            return errorResponse(res, 'User ID tidak ditemukan', 401);
        }

        const activities = await homeModel.getRecentQuizAttempts(userId, limit);
        
        return successResponse(res, { activities }, 'Aktivitas terbaru berhasil dimuat');
    } catch (error) {
        console.error('Error getting recent activities:', error);
        return errorResponse(res, 'Gagal memuat aktivitas terbaru', 500);
    }
};

/**
 * GET /api/home/popular
 * Get popular content (videos and places)
 */
const getPopularContent = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const [videos, places] = await Promise.all([
            homeModel.getPopularVideos(limit),
            homeModel.getPopularPlaces(limit)
        ]);

        const popularContent = {
            videos,
            places
        };
        
        return successResponse(res, popularContent, 'Konten populer berhasil dimuat');
    } catch (error) {
        console.error('Error getting popular content:', error);
        return errorResponse(res, 'Gagal memuat konten populer', 500);
    }
};

module.exports = {
    getDashboardData,
    getUserStats,
    getRecentActivities,
    getPopularContent
};
