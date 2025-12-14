// changeProfileModel.js
// Model untuk menghandle perubahan profil user (edit profile & change password)

const db = require('../../config/database');

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
