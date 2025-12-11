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
        console.log('✅ Query 3 result:', visitStats);        const result = {
            user: user,
            stats: {
                total_attempts: quizStats[0]?.total_attempts || 0,
                completed_levels: quizStats[0]?.completed_levels || 0,
                total_points: quizStats[0]?.total_points || 0,
                visited_places: visitStats[0]?.visited_count || 0
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

/**
 * Update user profile (name and email)
 * @param {string} userId - User ID
 * @param {Object} data - Profile data {full_name, email}
 * @returns {Promise<Boolean>} Success status
 */
exports.updateProfile = async (userId, data) => {
    try {
        const { full_name, email } = data;
        
        await db.query(
            `UPDATE users 
             SET full_name = ?, 
                 email = ?, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE users_id = ?`,
            [full_name, email, userId]
        );

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Check if email exists for another user
 * @param {string} email - Email to check
 * @param {string} excludeUserId - User ID to exclude from check
 * @returns {Promise<Boolean>} True if email exists
 */
exports.checkEmailExists = async (email, excludeUserId) => {
    try {
        const users = await db.query(
            'SELECT users_id FROM users WHERE email = ? AND users_id != ?',
            [email, excludeUserId]
        );

        return users.length > 0;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user profile image
 * @param {string} userId - User ID
 * @param {string} imageUrl - New image URL/path
 * @returns {Promise<Object>} Old and new image info
 */
exports.updateProfileImage = async (userId, imageUrl) => {
    try {
        // Get old image URL
        const users = await db.query(
            'SELECT user_image_url FROM users WHERE users_id = ?',
            [userId]
        );

        const oldImageUrl = users[0]?.user_image_url || null;

        // Update with new image
        await db.query(
            `UPDATE users 
             SET user_image_url = ?, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE users_id = ?`,
            [imageUrl, userId]
        );

        return {
            old_image_url: oldImageUrl,
            new_image_url: imageUrl
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get user password hash for verification
 * @param {string} userId - User ID
 * @returns {Promise<string>} Password hash
 */
exports.getPasswordHash = async (userId) => {
    try {
        const users = await db.query(
            'SELECT password_hash FROM users WHERE users_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return null;
        }

        return users[0].password_hash;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} newPasswordHash - New password hash
 * @returns {Promise<Boolean>} Success status
 */
exports.updatePassword = async (userId, newPasswordHash) => {
    try {
        await db.query(
            `UPDATE users 
             SET password_hash = ?, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE users_id = ?`,
            [newPasswordHash, userId]
        );

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Check if user exists and is active
 * @param {string} userId - User ID
 * @returns {Promise<Boolean>} True if user exists and active
 */
exports.checkUserExists = async (userId) => {
    try {
        const users = await db.query(
            "SELECT users_id FROM users WHERE users_id = ? AND status = 'active'",
            [userId]
        );

        return users.length > 0;
    } catch (error) {
        throw error;
    }
};