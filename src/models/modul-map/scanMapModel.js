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
                    user_id,
                    tourist_place_id,
                    status,
                    visited_at,
                    created_at,
                    updated_at
                FROM user_visit 
                WHERE user_id = ? AND tourist_place_id = ?
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
     * @param {string} visitData.user_id - User ID
     * @param {string} visitData.tourist_place_id - Tourist place ID
     * @param {string} visitData.status - Visit status ('visited' or 'not_visited')
     * @returns {Promise<Object>} Created visit record
     */
    static async createUserVisit(visitData) {
        try {
            const { user_visit_id, user_id, tourist_place_id, status } = visitData;

            const insertQuery = `
                INSERT INTO user_visit (
                    user_visit_id,
                    user_id, 
                    tourist_place_id, 
                    status, 
                    visited_at,
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ${status === 'visited' ? 'NOW()' : 'NULL'}, NOW(), NOW())
            `;

            await db.query(insertQuery, [
                user_visit_id,
                user_id, 
                tourist_place_id, 
                status
            ]);

            return await this.getUserVisit(user_id, tourist_place_id);
        } catch (error) {
            console.error('Error creating user visit:', error);
            throw error;
        }
    }

    /**
     * Update visit status to visited
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object>} Updated visit record
     */
    static async updateVisitToVisited(userId, touristPlaceId) {
        try {
            const updateQuery = `
                UPDATE user_visit 
                SET 
                    status = 'visited', 
                    visited_at = NOW(), 
                    updated_at = NOW()
                WHERE user_id = ? AND tourist_place_id = ? AND status = 'not_visited'
            `;

            const result = await db.query(updateQuery, [userId, touristPlaceId]);
            
            // Return the updated visit record
            return await this.getUserVisit(userId, touristPlaceId);
        } catch (error) {
            console.error('Error updating visit to visited:', error);
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
}

const scanMapModel = ScanMapModel;
module.exports = { scanMapModel };
