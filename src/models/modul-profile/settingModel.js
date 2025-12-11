// settingModel.js

const db = require('../../config/database');

/**
 * Setting Model
 * Handles database operations for user settings (notification preferences, etc)
 */
class SettingModel {
    
    /**
     * Get notification preferences
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
     * Update notification preferences
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
}

module.exports = SettingModel;
