// profileModel.js

const db = require('../../config/database');

/**
 * Get user profile with stats
 * @param {string} userId - User ID (users_id)
 * @returns {Promise<Object>} User profile data
 */
exports.getUserProfile = async (userId) => {
    try {
        console.log('📊 ProfileModel.getUserProfile called with userId:', userId);
        
        // Get user basic info
        console.log('🔍 Query 1: Fetching user basic info...');
        const users = await db.query(
            `SELECT 
                users_id as id,
                full_name,
                email,
                total_xp,
                user_image_url,
                status,
                created_at,
                updated_at
             FROM users 
             WHERE users_id = ? AND status = 'active'`,
            [userId]
        );
        console.log('✅ Query 1 result:', users.length, 'rows');

        if (users.length === 0) {
            console.log('⚠️ User not found or inactive');
            return null;
        }

        const user = users[0];
        console.log('✅ User found:', user.id);

        // Get quiz stats - total attempts and completed levels
        console.log('🔍 Query 2: Fetching quiz stats...');
        const quizStatsRows = await db.query(
            `SELECT 
                COUNT(DISTINCT qa.id) as total_attempts,
                COUNT(DISTINCT CASE 
                    WHEN qa.status = 'submitted' AND qa.percent_correct >= 70 
                    THEN qa.level_id 
                END) as completed_levels,
                COALESCE(SUM(CASE WHEN qa.status = 'submitted' THEN qa.score_points ELSE 0 END), 0) as total_points
             FROM quiz_attempt qa
             WHERE qa.user_id = ?`,
            [userId]
        );
        const quizStats = quizStatsRows[0];
        console.log('✅ Query 2 result:', quizStats);

        // Get visited places count
        console.log('🔍 Query 3: Fetching visit stats...');
        const visitStatsRows = await db.query(
            `SELECT COUNT(*) as visited_count
             FROM user_visit 
             WHERE user_id = ? AND status = 'visited'`,
            [userId]
        );
        const visitStats = visitStatsRows[0];
        console.log('✅ Query 3 result:', visitStats);

        const result = {
            user: user,
            stats: {
                total_attempts: quizStats[0]?.total_attempts || 0,
                completed_levels: quizStats[0]?.completed_levels || 0,
                total_points: quizStats[0]?.total_points || 0,
                visited_places: visitStats?.visited_count || 0
            }
        };
        
        console.log('✅ ProfileModel.getUserProfile completed successfully');
        return result;
    } catch (error) {
        console.error('❌ ProfileModel.getUserProfile ERROR:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
};

/**
 * Get user badges (limited to 5 most recent)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of badges
 */
exports.getUserBadges = async (userId) => {
    try {
        const badges = await db.query(
            `SELECT 
                b.id,
                b.name,
                b.description,
                b.image_url,
                ub.earned_at
             FROM user_badge ub
             JOIN badge b ON ub.badge_id = b.id
             WHERE ub.user_id = ?
             ORDER BY ub.earned_at DESC
             LIMIT 5`,
            [userId]
        );

        return badges;
    } catch (error) {
        throw error;
    }
};

// Note: Functions for updateProfile, checkEmailExists, updateProfileImage, 
// getPasswordHash, updatePassword, and checkUserExists have been moved to 
// changeProfileModel.js to avoid redundancy and better organize code