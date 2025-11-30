/**
 * Scan Map Model
 * Handles QR code scanning and user visit tracking operations
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

const db = require('../../config/database');

class ScanMapModel {
    /**
     * Get all tourist places with user visit status
     * @param {string} userId - User ID for visit status check
     * @returns {Promise<Array>} Array of tourist places with visit status
     */
    static async getAllPlacesWithVisitStatus(userId) {
        try {
            const query = `
                SELECT 
                    tp.tourist_place_id,
                    tp.name,
                    tp.description,
                    tp.address,
                    tp.image_url,
                    tp.is_active,
                    tp.average_rating,
                    tp.created_at,
                    tp.updated_at,
                    CASE 
                        WHEN uv.status = 'visited' THEN true 
                        ELSE false 
                    END as is_visited,
                    uv.visited_at,
                    uv.status as visit_status
                FROM tourist_place tp
                LEFT JOIN user_visit uv ON tp.tourist_place_id = uv.tourist_place_id AND uv.users_id = ?
                WHERE tp.is_active = 1
                ORDER BY tp.name ASC
            `;

            const result = await db.query(query, [userId]);
            return result;
        } catch (error) {
            console.error('Error getting places with visit status:', error);
            throw error;
        }
    }

    /**
     * Get tourist places with pagination and visit status
     * @param {string} userId - User ID
     * @param {number} limit - Number of places per page
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Array>} Array of tourist places
     */
    static async getPlacesWithPagination(userId, limit = 10, offset = 0) {
        try {
            const query = `
                SELECT 
                    tp.tourist_place_id,
                    tp.name,
                    tp.description,
                    tp.address,
                    tp.image_url,
                    tp.is_active,
                    tp.average_rating,
                    tp.created_at,
                    tp.updated_at,
                    CASE 
                        WHEN uv.status = 'visited' THEN true 
                        ELSE false 
                    END as is_visited,
                    uv.visited_at,
                    uv.status as visit_status
                FROM tourist_place tp
                LEFT JOIN user_visit uv ON tp.tourist_place_id = uv.tourist_place_id AND uv.users_id = ?
                WHERE tp.is_active = 1
                ORDER BY tp.name ASC
                LIMIT ? OFFSET ?
            `;

            const result = await db.query(query, [userId, limit, offset]);
            return result;
        } catch (error) {
            console.error('Error getting places with pagination:', error);
            throw error;
        }
    }

    /**
     * Count total active tourist places
     * @returns {Promise<number>} Total count
     */
    static async countActivePlaces() {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM tourist_place 
                WHERE is_active = 1
            `;

            const result = await db.query(query);
            return result[0].total;
        } catch (error) {
            console.error('Error counting active places:', error);
            throw error;
        }
    }

    /**
     * Validate QR code and get associated tourist place
     * @param {string} codeValue - QR code value
     * @returns {Promise<Object|null>} QR code data with place info or null
     */
    static async validateQrCode(codeValue) {
        try {
            const query = `
                SELECT 
                    qc.qr_code_id,
                    qc.tourist_place_id,
                    qc.code_value,
                    qc.is_active,
                    qc.created_at,
                    qc.updated_at,
                    tp.name as place_name,
                    tp.description as place_description,
                    tp.address as place_address
                FROM qr_code qc
                JOIN tourist_place tp ON qc.tourist_place_id = tp.tourist_place_id
                WHERE qc.code_value = ? AND qc.is_active = 1 AND tp.is_active = 1
            `;

            const result = await db.query(query, [codeValue]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error validating QR code:', error);
            throw error;
        }
    }

    /**
     * Get user visit record
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Visit record or null
     */
    static async getUserVisit(userId, touristPlaceId) {
        try {
            const query = `
                SELECT 
                    user_visit_id,
                    users_id,
                    tourist_place_id,
                    status,
                    visited_at,
                    created_at,
                    updated_at
                FROM user_visit 
                WHERE users_id = ? AND tourist_place_id = ?
            `;

            const result = await db.query(query, [userId, touristPlaceId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting user visit:', error);
            throw error;
        }
    }

    /**
     * Create new visit record
     * @param {Object} visitData - Visit data
     * @param {string} visitData.user_visit_id - Visit ID
     * @param {string} visitData.users_id - User ID
     * @param {string} visitData.tourist_place_id - Tourist place ID
     * @param {string} visitData.status - Visit status ('visited' or 'not_visited')
     * @returns {Promise<Object>} Created visit record
     */
    static async createUserVisit(visitData) {
        try {
            const { user_visit_id, users_id, tourist_place_id, status } = visitData;

            const insertQuery = `
                INSERT INTO user_visit (
                    user_visit_id,
                    users_id, 
                    tourist_place_id, 
                    status, 
                    visited_at,
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ${status === 'visited' ? 'NOW()' : 'NULL'}, NOW(), NOW())
            `;

            await db.query(insertQuery, [
                user_visit_id,
                users_id, 
                tourist_place_id, 
                status
            ]);

            return await this.getUserVisit(users_id, tourist_place_id);
        } catch (error) {
            console.error('Error creating user visit:', error);
            throw error;
        }
    }

    /**
     * Update visit status to visited
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object>} Update result
     */
    static async updateVisitToVisited(userId, touristPlaceId) {
        try {
            const updateQuery = `
                UPDATE user_visit 
                SET 
                    status = 'visited', 
                    visited_at = NOW(), 
                    updated_at = NOW()
                WHERE users_id = ? AND tourist_place_id = ? AND status = 'not_visited'
            `;

            const result = await db.query(updateQuery, [userId, touristPlaceId]);
            return result;
        } catch (error) {
            console.error('Error updating visit to visited:', error);
            throw error;
        }
    }

    /**
     * Get user notification info for scan notifications
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User notification data
     */
    static async getUserNotificationInfo(userId) {
        try {
            const query = `
                SELECT 
                    users_id,
                    full_name,
                    email,
                    fcm_token,
                    notification_preferences
                FROM users 
                WHERE users_id = ?
            `;

            const result = await db.query(query, [userId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting user notification info:', error);
            throw error;
        }
    }

    /**
     * Get tourist place basic info
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Tourist place data
     */
    static async getTouristPlaceInfo(touristPlaceId) {
        try {
            const query = `
                SELECT 
                    tourist_place_id,
                    name,
                    description,
                    address,
                    image_url,
                    is_active,
                    average_rating,
                    created_at,
                    updated_at
                FROM tourist_place 
                WHERE tourist_place_id = ? AND is_active = 1
            `;

            const result = await db.query(query, [touristPlaceId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting tourist place info:', error);
            throw error;
        }
    }

    /**
     * Get user visit statistics
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Visit statistics
     */
    static async getUserVisitStats(userId) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_places_available,
                    SUM(CASE WHEN uv.status = 'visited' THEN 1 ELSE 0 END) as places_visited,
                    SUM(CASE WHEN uv.status = 'not_visited' OR uv.status IS NULL THEN 1 ELSE 0 END) as places_not_visited
                FROM tourist_place tp
                LEFT JOIN user_visit uv ON tp.tourist_place_id = uv.tourist_place_id AND uv.users_id = ?
                WHERE tp.is_active = 1
            `;

            const result = await db.query(query, [userId]);
            
            if (result.length > 0) {
                const stats = result[0];
                return {
                    total_places: stats.total_places_available,
                    visited: stats.places_visited || 0,
                    not_visited: stats.places_not_visited || stats.total_places_available,
                    completion_percentage: stats.total_places_available > 0 
                        ? ((stats.places_visited || 0) / stats.total_places_available * 100).toFixed(1)
                        : 0
                };
            }
            
            return {
                total_places: 0,
                visited: 0,
                not_visited: 0,
                completion_percentage: 0
            };
        } catch (error) {
            console.error('Error getting user visit stats:', error);
            throw error;
        }
    }

    /**
     * Get recently visited places by user
     * @param {string} userId - User ID
     * @param {number} limit - Number of recent visits
     * @returns {Promise<Array>} Recent visits
     */
    static async getRecentVisits(userId, limit = 5) {
        try {
            const query = `
                SELECT 
                    uv.user_visit_id,
                    uv.users_id,
                    uv.tourist_place_id,
                    uv.status,
                    uv.visited_at,
                    tp.name as place_name,
                    tp.address as place_address,
                    tp.image_url as place_image
                FROM user_visit uv
                JOIN tourist_place tp ON uv.tourist_place_id = tp.tourist_place_id
                WHERE uv.users_id = ? AND uv.status = 'visited'
                ORDER BY uv.visited_at DESC
                LIMIT ?
            `;

            const result = await db.query(query, [userId, limit]);
            return result;
        } catch (error) {
            console.error('Error getting recent visits:', error);
            throw error;
        }
    }

    /**
     * Check if place has valid QR codes
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<boolean>} Has valid QR codes
     */
    static async placeHasValidQrCodes(touristPlaceId) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM qr_code 
                WHERE tourist_place_id = ? AND is_active = 1
            `;

            const result = await db.query(query, [touristPlaceId]);
            return result[0].count > 0;
        } catch (error) {
            console.error('Error checking place QR codes:', error);
            throw error;
        }
    }
}

module.exports = ScanMapModel;