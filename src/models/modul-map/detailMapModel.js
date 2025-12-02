/**
 * Detail Map Model
 * Handles operations for tourist place details, reviews, and user interactions
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

const db = require('../../config/database');

class DetailMapModel {
    /**
     * FUNGSIONAL 1: Get all tourist places with visit status for logged user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of places with visit status
     */
    static async getPlacesWithVisitStatus(userId) {
        try {
            const query = `
                SELECT 
                    tp.tourist_place_id,
                    tp.name,
                    tp.description,
                    tp.address,
                    tp.image_url,
                    tp.average_rating,
                    CASE 
                        WHEN uv.status = 'visited' THEN true
                        ELSE false
                    END as is_visited,
                    uv.visited_at
                FROM tourist_place tp
                LEFT JOIN user_visit uv ON tp.tourist_place_id = uv.tourist_place_id 
                    AND uv.user_id = ?
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
     * Get tourist place detail with average rating
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Place detail or null if not found
     */
    static async getTouristPlaceDetail(touristPlaceId) {
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
                    COUNT(r.review_id) as total_reviews
                FROM tourist_place tp
                LEFT JOIN review r ON tp.tourist_place_id = r.tourist_place_id
                WHERE tp.tourist_place_id = ? AND tp.is_active = 1
                GROUP BY tp.tourist_place_id
            `;
            
            const result = await db.query(query, [touristPlaceId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting tourist place detail:', error);
            throw error;
        }
    }

    /**
     * Check user visit status for scan QR validation
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Visit status or null if not found
     */
    static async getUserVisitStatus(userId, touristPlaceId) {
        try {
            const query = `
                SELECT status, visited_at, created_at
                FROM user_visit 
                WHERE user_id = ? AND tourist_place_id = ?
                LIMIT 1
            `;
            
            const result = await db.query(query, [userId, touristPlaceId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting user visit status:', error);
            throw error;
        }
    }
}

const detailMapModel = DetailMapModel;
module.exports = { detailMapModel };
