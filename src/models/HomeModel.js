const db = require('../config/database');

/**
 * Home Model
 * Database queries for home/dashboard data
 */

/**
 * Get comprehensive user statistics
 */
const getUserStats = async (userId) => {
    try {
        const query = `
            SELECT 
                u.users_id,
                u.full_name,
                u.total_xp,
                u.user_image_url,
                -- Quiz statistics
                COUNT(DISTINCT qa.id) as total_quiz_attempts,
                COUNT(DISTINCT CASE WHEN qa.status = 'submitted' THEN qa.id END) as completed_quizzes,
                COALESCE(SUM(CASE WHEN qa.status = 'submitted' THEN qa.score_points ELSE 0 END), 0) as total_quiz_points,
                -- Video statistics  
                COUNT(DISTINCT fv.id) as total_favorite_videos,
                COUNT(DISTINCT vc.id) as total_collections,
                -- Map statistics
                COUNT(DISTINCT CASE WHEN uv.status = 'visited' THEN uv.user_visit_id END) as places_visited,
                COUNT(DISTINCT r.review_id) as total_reviews,
                -- Achievement statistics
                COUNT(DISTINCT ub.id) as badges_earned
            FROM users u
            LEFT JOIN quiz_attempt qa ON u.users_id = qa.user_id
            LEFT JOIN favorit_video fv ON u.users_id = fv.id_user
            LEFT JOIN video_collection vc ON u.users_id = vc.id_user
            LEFT JOIN user_visit uv ON u.users_id = uv.user_id
            LEFT JOIN review r ON u.users_id = r.user_id
            LEFT JOIN user_badge ub ON u.users_id = ub.user_id
            WHERE u.users_id = ?
            GROUP BY u.users_id
        `;
        
        const result = await db.query(query, [userId]);
        console.log('📊 Raw query result:', { userId, resultType: typeof result, resultLength: result?.length, result: result });
        
        // db.query returns array directly (not nested)
        const rows = result;
        console.log('📊 Rows extracted:', { rowsType: typeof rows, rowsLength: rows?.length, firstRow: rows?.[0] });
        
        if (!rows || rows.length === 0) {
            console.log('⚠️ No user found with ID:', userId);
            return null;
        }
        
        const stats = rows[0];
        console.log('📋 Stats object:', stats);
        
        // Calculate level based on XP - SAME LOGIC AS ProfileViewModel
        const levels = [
            { threshold: 0, name: 'Newbie' },           // 0-99 XP
            { threshold: 100, name: 'Beginner' },       // 100-299 XP
            { threshold: 300, name: 'Enthusiast' },     // 300-599 XP
            { threshold: 600, name: 'Explorer' },       // 600-999 XP
            { threshold: 1000, name: 'Adventurer' },    // 1000-1499 XP
            { threshold: 1500, name: 'Expert' },        // 1500-2499 XP
            { threshold: 2500, name: 'Master' },        // 2500-3999 XP
            { threshold: 4000, name: 'Legend' }         // 4000+ XP
        ];
        
        let currentLevel = 1;
        let levelTitle = 'Newbie';
        let currentLevelXp = stats.total_xp;
        let nextLevelXp = 100;
        
        for (let i = 0; i < levels.length; i++) {
            if (stats.total_xp >= levels[i].threshold) {
                currentLevel = i + 1;
                levelTitle = levels[i].name;
                currentLevelXp = stats.total_xp - levels[i].threshold;
                
                // Calculate next level XP
                if (i < levels.length - 1) {
                    nextLevelXp = levels[i + 1].threshold - levels[i].threshold;
                } else {
                    // Max level reached
                    nextLevelXp = currentLevelXp;
                }
            } else {
                break;
            }
        }
        
        const levelProgress = nextLevelXp > 0 ? Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100)) : 100;
        
        return {
            user_id: stats.users_id,
            full_name: stats.full_name,
            user_image_url: stats.user_image_url,
            total_xp: stats.total_xp,
            level: {
                current_level: currentLevel,
                title: levelTitle,
                xp_current: currentLevelXp,         // XP in current level
                xp_for_next_level: nextLevelXp,    // XP needed for next level
                progress_percentage: levelProgress
            },
            quiz_stats: {
                total_attempts: stats.total_quiz_attempts,
                completed: stats.completed_quizzes,
                total_points: stats.total_quiz_points
            },
            video_stats: {
                favorites: stats.total_favorite_videos,
                collections: stats.total_collections
            },
            map_stats: {
                places_visited: stats.places_visited,
                reviews_written: stats.total_reviews
            },
            achievements: {
                badges_earned: stats.badges_earned
            }
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
};

/**
 * Get recent quiz attempts
 */
const getRecentQuizAttempts = async (userId, limit = 5) => {
    try {
        const query = `
            SELECT 
                qa.id,
                qa.level_id,
                l.name as level_name,
                qc.name as category_name,
                qa.score_points,
                qa.percent_correct,
                qa.status,
                qa.started_at,
                qa.finished_at
            FROM quiz_attempt qa
            JOIN level l ON qa.level_id = l.id
            JOIN quiz_category qc ON l.category_id = qc.id
            WHERE qa.user_id = ? AND qa.status = 'submitted'
            ORDER BY qa.finished_at DESC
            LIMIT ?
        `;
        
        const rows = await db.query(query, [userId, limit]);
        return rows;
    } catch (error) {
        console.error('Error getting recent quiz attempts:', error);
        throw error;
    }
};

/**
 * Get popular videos
 */
const getPopularVideos = async (limit = 5) => {
    try {
        const query = `
            SELECT 
                v.id,
                v.judul,
                v.deskripsi,
                v.thumbnail_url,
                v.kategori,
                COUNT(DISTINCT fv.id) as favorite_count
            FROM video v
            LEFT JOIN favorit_video fv ON v.id = fv.id_video
            WHERE v.is_active = 1
            GROUP BY v.id
            ORDER BY favorite_count DESC, v.created_at DESC
            LIMIT ?
        `;
        
        const rows = await db.query(query, [limit]);
        return rows;
    } catch (error) {
        console.error('Error getting popular videos:', error);
        throw error;
    }
};

/**
 * Get popular tourist places
 */
const getPopularPlaces = async (limit = 5) => {
    try {
        const query = `
            SELECT 
                tp.tourist_place_id as id,
                tp.name,
                tp.description,
                tp.latitude,
                tp.longitude,
                tp.image_url,
                tp.average_rating,
                COUNT(DISTINCT r.review_id) as review_count
            FROM tourist_place tp
            LEFT JOIN review r ON tp.tourist_place_id = r.tourist_place_id
            WHERE tp.is_active = 1
            GROUP BY tp.tourist_place_id
            ORDER BY review_count DESC, tp.average_rating DESC
            LIMIT ?
        `;
        
        const rows = await db.query(query, [limit]);
        return rows;
    } catch (error) {
        console.error('Error getting popular places:', error);
        throw error;
    }
};

/**
 * Get nearby places (for now returns popular, later can use geolocation)
 */
const getNearbyPlaces = async (userId, limit = 3) => {
    try {
        // For now, return unvisited popular places
        const query = `
            SELECT 
                tp.tourist_place_id as id,
                tp.name,
                tp.description,
                tp.latitude,
                tp.longitude,
                tp.image_url,
                tp.average_rating,
                uv.status,
                COUNT(DISTINCT r.review_id) as review_count
            FROM tourist_place tp
            LEFT JOIN user_visit uv ON tp.tourist_place_id = uv.tourist_place_id AND uv.user_id = ?
            LEFT JOIN review r ON tp.tourist_place_id = r.tourist_place_id
            WHERE (uv.status = 'not_visited' OR uv.status IS NULL) AND tp.is_active = 1
            GROUP BY tp.tourist_place_id
            ORDER BY review_count DESC, tp.average_rating DESC
            LIMIT ?
        `;
        
        const rows = await db.query(query, [userId, limit]);
        return rows;
    } catch (error) {
        console.error('Error getting nearby places:', error);
        throw error;
    }
};

/**
 * Get user achievements/badges
 */
const getUserAchievements = async (userId) => {
    try {
        const query = `
            SELECT 
                b.id,
                b.name,
                b.description,
                b.image_url,
                b.criteria_type,
                ub.earned_at
            FROM user_badge ub
            JOIN badge b ON ub.badge_id = b.id
            WHERE ub.user_id = ? AND b.is_active = 1
            ORDER BY ub.earned_at DESC
            LIMIT 5
        `;
        
        const rows = await db.query(query, [userId]);
        return rows;
    } catch (error) {
        console.error('Error getting user achievements:', error);
        throw error;
    }
};

module.exports = {
    getUserStats,
    getRecentQuizAttempts,
    getPopularVideos,
    getPopularPlaces,
    getNearbyPlaces,
    getUserAchievements
};
