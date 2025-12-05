/**
 * Authentication Model
 * Handles database operations for user authentication, profile management, and notifications
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

const db = require('../config/database');

class AuthModel {
    /**
     * FUNGSIONAL AUTH 1: Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User data or null if not found
     */
    static async findUserByEmail(email) {
        try {
            const query = 'SELECT users_id, full_name, email, password_hash as password, total_xp, status, user_image_url, fcm_token, notification_preferences, created_at, updated_at FROM users WHERE email = ?';
            const result = await db.query(query, [email]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 2: Find user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User data or null if not found
     */
    static async findUserById(userId) {
        try {
            const query = 'SELECT users_id, full_name, email, total_xp, status, user_image_url, fcm_token, notification_preferences, created_at, updated_at FROM users WHERE users_id = ?';
            const result = await db.query(query, [userId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 3: Create new user
     * @param {Object} userData - User data for registration
     * @returns {Promise<Object>} Created user data
     */
    static async createUser(userData) {
        try {
            const {
                users_id,
                full_name,
                email,
                hashedPassword,
                fcm_token,
                notification_preferences
            } = userData;

            const insertQuery = `
                INSERT INTO users (
                    users_id, 
                    full_name, 
                    email, 
                    password_hash, 
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
                JSON.stringify(notification_preferences)
            ]);

            // User points and other related records will be initialized by database triggers if configured

            return {
                users_id,
                full_name,
                email,
                total_xp: 0,
                status: 'active'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 4: Update FCM token
     * @param {string} userId - User ID
     * @param {string} fcmToken - FCM token
     * @returns {Promise<void>}
     */
    static async updateFcmToken(userId, fcmToken) {
        try {
            const query = 'UPDATE users SET fcm_token = ?, updated_at = NOW() WHERE users_id = ?';
            await db.query(query, [fcmToken, userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 5: Clear FCM token (logout)
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    static async clearFcmToken(userId) {
        try {
            const query = 'UPDATE users SET fcm_token = NULL, updated_at = NOW() WHERE users_id = ?';
            await db.query(query, [userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 6: Update last login
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    static async updateLastLogin(userId) {
        try {
            const query = 'UPDATE users SET updated_at = NOW() WHERE users_id = ?';
            await db.query(query, [userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 7: Update notification preferences
     * @param {string} userId - User ID
     * @param {Object} preferences - Notification preferences
     * @returns {Promise<void>}
     */
    static async updateNotificationPreferences(userId, preferences) {
        try {
            const query = 'UPDATE users SET notification_preferences = ?, updated_at = NOW() WHERE users_id = ?';
            await db.query(query, [JSON.stringify(preferences), userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 8: Get notification preferences only
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} Notification preferences or null
     */
    static async getNotificationPreferences(userId) {
        try {
            const query = 'SELECT notification_preferences FROM users WHERE users_id = ?';
            const result = await db.query(query, [userId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 9: Save token to database
     * @param {string} userId - User ID
     * @param {string} token - Generated token
     * @param {Date} expiresAt - Token expiration date
     * @returns {Promise<void>}
     */
    static async saveToken(userId, token, expiresAt) {
        try {
            const query = 'UPDATE users SET token = ?, token_validity = ?, updated_at = NOW() WHERE users_id = ?';
            await db.query(query, [token, expiresAt, userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 10: Find user by token
     * @param {string} token - Token to search
     * @returns {Promise<Object|null>} User data or null if token invalid/expired
     */
    static async findUserByToken(token) {
        try {
            const query = `
                SELECT users_id, email, full_name, total_xp, status, user_image_url, fcm_token, notification_preferences, token_validity
                FROM users 
                WHERE token = ? AND token_validity > NOW() AND status = 'active'
            `;
            const result = await db.query(query, [token]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 11: Clear token (logout)
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    static async clearToken(userId) {
        try {
            const query = 'UPDATE users SET token = NULL, token_validity = NULL, updated_at = NOW() WHERE users_id = ?';
            await db.query(query, [userId]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * FUNGSIONAL AUTH 12: Clear expired tokens (cleanup)
     * @returns {Promise<number>} Number of cleared tokens
     */
    static async clearExpiredTokens() {
        try {
            const query = 'UPDATE users SET token = NULL, token_validity = NULL WHERE token_validity <= NOW()';
            const result = await db.query(query);
            return result.affectedRows || 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthModel;