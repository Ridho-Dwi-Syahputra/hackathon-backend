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
            console.error('Error checking user visit status:', error);
            throw error;
        }
    }

    /**
     * Get user's own review for a tourist place
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} User review or null if not found
     */
    static async getUserReview(userId, touristPlaceId) {
        try {
            const query = `
                SELECT 
                    r.review_id,
                    r.users_id,
                    r.tourist_place_id,
                    r.rating,
                    r.review_text,
                    r.total_likes,
                    r.created_at,
                    r.updated_at,
                    u.full_name as user_full_name,
                    CASE 
                        WHEN rl.review_like_id IS NOT NULL THEN true 
                        ELSE false 
                    END as is_liked_by_me
                FROM review r
                JOIN users u ON r.users_id = u.users_id
                LEFT JOIN review_like rl ON r.review_id = rl.review_id AND rl.users_id = ?
                WHERE r.tourist_place_id = ? AND r.users_id = ?
            `;
            
            const result = await db.query(query, [userId, touristPlaceId, userId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting user review:', error);
            throw error;
        }
    }

    /**
     * Get other users' reviews (excluding current user)
     * @param {string} userId - Current user ID  
     * @param {string} touristPlaceId - Tourist place ID
     * @param {number} limit - Number of reviews to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Array>} Array of reviews
     */
    static async getOtherReviews(userId, touristPlaceId, limit = 5, offset = 0) {
        try {
            const query = `
                SELECT 
                    r.review_id,
                    r.users_id,
                    r.tourist_place_id,
                    r.rating,
                    r.review_text,
                    r.total_likes,
                    r.created_at,
                    r.updated_at,
                    u.full_name as user_full_name,
                    u.user_image_url,
                    CASE 
                        WHEN rl.review_like_id IS NOT NULL THEN true 
                        ELSE false 
                    END as is_liked_by_me
                FROM review r
                JOIN users u ON r.users_id = u.users_id
                LEFT JOIN review_like rl ON r.review_id = rl.review_id AND rl.users_id = ?
                WHERE r.tourist_place_id = ? AND r.users_id != ?
                ORDER BY r.total_likes DESC, r.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await db.query(query, [userId, touristPlaceId, userId, limit, offset]);
            return result;
        } catch (error) {
            console.error('Error getting other reviews:', error);
            throw error;
        }
    }

    /**
     * Get all reviews for a tourist place with pagination
     * @param {string} userId - Current user ID for like status
     * @param {string} touristPlaceId - Tourist place ID
     * @param {number} limit - Number of reviews per page
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Array>} Array of all reviews
     */
    static async getAllReviews(userId, touristPlaceId, limit = 10, offset = 0) {
        try {
            const query = `
                SELECT 
                    r.review_id,
                    r.users_id,
                    r.tourist_place_id,
                    r.rating,
                    r.review_text,
                    r.total_likes,
                    r.created_at,
                    r.updated_at,
                    u.full_name as user_full_name,
                    u.user_image_url,
                    CASE 
                        WHEN rl.review_like_id IS NOT NULL THEN true 
                        ELSE false 
                    END as is_liked_by_me
                FROM review r
                JOIN users u ON r.users_id = u.users_id
                LEFT JOIN review_like rl ON r.review_id = rl.review_id AND rl.users_id = ?
                WHERE r.tourist_place_id = ?
                ORDER BY r.total_likes DESC, r.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const result = await db.query(query, [userId, touristPlaceId, limit, offset]);
            return result;
        } catch (error) {
            console.error('Error getting all reviews:', error);
            throw error;
        }
    }

    /**
     * Count total reviews for pagination
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<number>} Total number of reviews
     */
    static async countReviews(touristPlaceId) {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM review 
                WHERE tourist_place_id = ?
            `;
            
            const result = await db.query(query, [touristPlaceId]);
            return result[0].total;
        } catch (error) {
            console.error('Error counting reviews:', error);
            throw error;
        }
    }

    /**
     * Check if review exists
     * @param {string} reviewId - Review ID
     * @returns {Promise<Object|null>} Review info or null if not found
     */
    static async getReviewById(reviewId) {
        try {
            const query = `
                SELECT 
                    review_id,
                    users_id,
                    tourist_place_id,
                    rating,
                    review_text,
                    total_likes,
                    created_at,
                    updated_at
                FROM review 
                WHERE review_id = ?
            `;
            
            const result = await db.query(query, [reviewId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting review by ID:', error);
            throw error;
        }
    }

    /**
     * Check if user already liked a review
     * @param {string} userId - User ID
     * @param {string} reviewId - Review ID
     * @returns {Promise<Object|null>} Like record or null if not found
     */
    static async getUserReviewLike(userId, reviewId) {
        try {
            const query = `
                SELECT 
                    review_like_id,
                    users_id,
                    review_id,
                    created_at
                FROM review_like 
                WHERE users_id = ? AND review_id = ?
            `;
            
            const result = await db.query(query, [userId, reviewId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error checking user review like:', error);
            throw error;
        }
    }

    /**
     * Add like to review
     * @param {string} userId - User ID
     * @param {string} reviewId - Review ID
     * @returns {Promise<boolean>} Success status
     */
    static async addReviewLike(userId, reviewId) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            // Insert like record
            const likeQuery = `
                INSERT INTO review_like (users_id, review_id, created_at) 
                VALUES (?, ?, NOW())
            `;
            await db.query(likeQuery, [userId, reviewId]);

            // Update total likes
            const updateQuery = `
                UPDATE review 
                SET total_likes = total_likes + 1, updated_at = NOW()
                WHERE review_id = ?
            `;
            await db.query(updateQuery, [reviewId]);

            await db.query('COMMIT');
            return true;
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error adding review like:', error);
            throw error;
        }
    }

    /**
     * Remove like from review
     * @param {string} userId - User ID
     * @param {string} reviewId - Review ID
     * @returns {Promise<boolean>} Success status
     */
    static async removeReviewLike(userId, reviewId) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            // Delete like record
            const likeQuery = `
                DELETE FROM review_like 
                WHERE users_id = ? AND review_id = ?
            `;
            await db.query(likeQuery, [userId, reviewId]);

            // Update total likes
            const updateQuery = `
                UPDATE review 
                SET total_likes = total_likes - 1, updated_at = NOW()
                WHERE review_id = ?
            `;
            await db.query(updateQuery, [reviewId]);

            await db.query('COMMIT');
            return true;
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error removing review like:', error);
            throw error;
        }
    }

    /**
     * Get updated total likes for a review
     * @param {string} reviewId - Review ID
     * @returns {Promise<number>} Updated total likes
     */
    static async getTotalLikes(reviewId) {
        try {
            const query = `
                SELECT total_likes 
                FROM review 
                WHERE review_id = ?
            `;
            
            const result = await db.query(query, [reviewId]);
            return result.length > 0 ? result[0].total_likes : 0;
        } catch (error) {
            console.error('Error getting total likes:', error);
            throw error;
        }
    }
}

module.exports = DetailMapModel;