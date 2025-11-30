/**
 * Review Map Model
 * Handles CRUD operations for tourist place reviews
 * 
 * @author SAKO Development Team
 * @version 1.0.0
 */

const db = require('../../config/database');

class ReviewMapModel {
    /**
     * Create a new review
     * @param {Object} reviewData - Review data
     * @param {string} reviewData.review_id - Review ID
     * @param {string} reviewData.users_id - User ID
     * @param {string} reviewData.tourist_place_id - Tourist place ID
     * @param {number} reviewData.rating - Rating (1-5)
     * @param {string} reviewData.review_text - Review text
     * @returns {Promise<Object>} Created review data
     */
    static async createReview(reviewData) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            const { review_id, users_id, tourist_place_id, rating, review_text } = reviewData;

            // Insert review
            const insertQuery = `
                INSERT INTO review (
                    review_id, 
                    users_id, 
                    tourist_place_id, 
                    rating, 
                    review_text, 
                    total_likes,
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())
            `;

            await db.query(insertQuery, [
                review_id, 
                users_id, 
                tourist_place_id, 
                rating, 
                review_text
            ]);

            // Update tourist place average rating
            await this.updateTouristPlaceRating(tourist_place_id);

            await db.query('COMMIT');

            // Return created review
            return await this.getReviewById(review_id);
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error creating review:', error);
            throw error;
        }
    }

    /**
     * Update an existing review
     * @param {string} reviewId - Review ID
     * @param {Object} updateData - Update data
     * @param {number} updateData.rating - New rating
     * @param {string} updateData.review_text - New review text
     * @returns {Promise<Object>} Updated review data
     */
    static async updateReview(reviewId, updateData) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            const { rating, review_text } = updateData;

            // Get tourist_place_id for rating update
            const reviewInfo = await this.getReviewById(reviewId);
            if (!reviewInfo) {
                throw new Error('Review not found');
            }

            // Update review
            const updateQuery = `
                UPDATE review 
                SET rating = ?, review_text = ?, updated_at = NOW() 
                WHERE review_id = ?
            `;

            const result = await db.query(updateQuery, [rating, review_text, reviewId]);

            if (result.affectedRows === 0) {
                throw new Error('Failed to update review');
            }

            // Update tourist place average rating
            await this.updateTouristPlaceRating(reviewInfo.tourist_place_id);

            await db.query('COMMIT');

            // Return updated review
            return await this.getReviewById(reviewId);
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error updating review:', error);
            throw error;
        }
    }

    /**
     * Delete a review
     * @param {string} reviewId - Review ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteReview(reviewId) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            // Get review info before deletion
            const reviewInfo = await this.getReviewById(reviewId);
            if (!reviewInfo) {
                throw new Error('Review not found');
            }

            // Delete related likes first
            await db.query('DELETE FROM review_like WHERE review_id = ?', [reviewId]);

            // Delete review
            const deleteQuery = 'DELETE FROM review WHERE review_id = ?';
            const result = await db.query(deleteQuery, [reviewId]);

            if (result.affectedRows === 0) {
                throw new Error('Failed to delete review');
            }

            // Update tourist place average rating
            await this.updateTouristPlaceRating(reviewInfo.tourist_place_id);

            await db.query('COMMIT');
            return true;
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    /**
     * Get review by ID
     * @param {string} reviewId - Review ID
     * @returns {Promise<Object|null>} Review data or null if not found
     */
    static async getReviewById(reviewId) {
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
                    tp.name as place_name
                FROM review r
                JOIN users u ON r.users_id = u.users_id
                JOIN tourist_place tp ON r.tourist_place_id = tp.tourist_place_id
                WHERE r.review_id = ?
            `;

            const result = await db.query(query, [reviewId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting review by ID:', error);
            throw error;
        }
    }

    /**
     * Check if user already reviewed a tourist place
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Existing review or null
     */
    static async getUserExistingReview(userId, touristPlaceId) {
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
                WHERE users_id = ? AND tourist_place_id = ?
            `;

            const result = await db.query(query, [userId, touristPlaceId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error checking existing review:', error);
            throw error;
        }
    }

    /**
     * Get tourist place info
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Tourist place data or null
     */
    static async getTouristPlaceById(touristPlaceId) {
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
            console.error('Error getting tourist place by ID:', error);
            throw error;
        }
    }

    /**
     * Update tourist place average rating
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<boolean>} Success status
     */
    static async updateTouristPlaceRating(touristPlaceId) {
        try {
            const updateQuery = `
                UPDATE tourist_place 
                SET 
                    average_rating = (
                        SELECT COALESCE(AVG(rating), 0)
                        FROM review 
                        WHERE tourist_place_id = ?
                    ),
                    updated_at = NOW()
                WHERE tourist_place_id = ?
            `;

            await db.query(updateQuery, [touristPlaceId, touristPlaceId]);
            return true;
        } catch (error) {
            console.error('Error updating tourist place rating:', error);
            throw error;
        }
    }

    /**
     * Get user info for notifications
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User data with FCM token
     */
    static async getUserNotificationInfo(userId) {
        try {
            const query = `
                SELECT 
                    users_id,
                    full_name,
                    email,
                    fcm_token
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
     * Get reviews for a tourist place with user context
     * @param {string} touristPlaceId - Tourist place ID
     * @param {string} userId - Current user ID for like status
     * @param {number} limit - Number of reviews
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Array>} Array of reviews
     */
    static async getReviewsByPlace(touristPlaceId, userId, limit = 10, offset = 0) {
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
                    END as is_liked_by_me,
                    CASE 
                        WHEN r.users_id = ? THEN true 
                        ELSE false 
                    END as is_my_review
                FROM review r
                JOIN users u ON r.users_id = u.users_id
                LEFT JOIN review_like rl ON r.review_id = rl.review_id AND rl.users_id = ?
                WHERE r.tourist_place_id = ?
                ORDER BY r.total_likes DESC, r.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const result = await db.query(query, [userId, userId, touristPlaceId, limit, offset]);
            return result;
        } catch (error) {
            console.error('Error getting reviews by place:', error);
            throw error;
        }
    }

    /**
     * Count reviews for a tourist place
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<number>} Total reviews count
     */
    static async countReviewsByPlace(touristPlaceId) {
        try {
            const query = `
                SELECT COUNT(*) as total 
                FROM review 
                WHERE tourist_place_id = ?
            `;

            const result = await db.query(query, [touristPlaceId]);
            return result[0].total;
        } catch (error) {
            console.error('Error counting reviews by place:', error);
            throw error;
        }
    }
}

module.exports = ReviewMapModel;