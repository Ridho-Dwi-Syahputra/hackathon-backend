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
     * FUNGSIONAL 3: Get all reviews for a place with pagination
     * @param {string} touristPlaceId - Tourist place ID
     * @param {string} userId - Current user ID (for like status)
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Reviews with pagination
     */
    static async getPlaceReviews(touristPlaceId, userId = null, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            // Get user's own review
            let userReview = null;
            if (userId && userId !== 'GUEST') {
                const userReviewQuery = `
                    SELECT 
                        r.review_id,
                        u.full_name as user_full_name,
                        r.rating,
                        r.review_text,
                        r.total_likes,
                        r.created_at,
                        true as is_liked_by_me
                    FROM review r
                    JOIN users u ON r.user_id = u.users_id
                    WHERE r.user_id = ? AND r.tourist_place_id = ?
                    LIMIT 1
                `;
                
                const userReviewResult = await db.query(userReviewQuery, [userId, touristPlaceId]);
                userReview = userReviewResult.length > 0 ? userReviewResult[0] : null;
            }

            // Get other users' reviews
            const otherReviewsQuery = `
                SELECT 
                    r.review_id,
                    u.full_name as user_full_name,
                    r.rating,
                    r.review_text,
                    r.total_likes,
                    r.created_at,
                    CASE 
                        WHEN rl.review_like_id IS NOT NULL THEN true
                        ELSE false
                    END as is_liked_by_me
                FROM review r
                JOIN users u ON r.user_id = u.users_id
                LEFT JOIN review_like rl ON r.review_id = rl.review_id AND rl.user_id = ?
                WHERE r.tourist_place_id = ? AND r.user_id != COALESCE(?, '')
                ORDER BY r.total_likes DESC, r.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            const otherReviewsResult = await db.query(otherReviewsQuery, [
                userId || '', touristPlaceId, userId || '', limit, offset
            ]);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM review 
                WHERE tourist_place_id = ? AND user_id != COALESCE(?, '')
            `;
            const countResult = await db.query(countQuery, [touristPlaceId, userId || '']);
            const totalOtherReviews = countResult[0].total;

            return {
                user_review: userReview,
                other_reviews: otherReviewsResult,
                pagination: {
                    page: page,
                    limit: limit,
                    total: totalOtherReviews,
                    total_pages: Math.ceil(totalOtherReviews / limit)
                }
            };
        } catch (error) {
            console.error('Error getting place reviews:', error);
            throw error;
        }
    }

    /**
     * FUNGSIONAL 4: Toggle like on a review
     * @param {string} userId - User ID
     * @param {string} reviewId - Review ID
     * @param {string} reviewLikeId - Custom generated ID for review_like
     * @returns {Promise<Object>} Like status and total likes
     */
    static async toggleReviewLike(userId, reviewId, reviewLikeId = null) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            // Check if review exists
            const reviewQuery = `SELECT review_id FROM review WHERE review_id = ?`;
            const reviewResult = await db.query(reviewQuery, [reviewId]);
            
            if (reviewResult.length === 0) {
                await db.query('ROLLBACK');
                throw new Error('Review tidak ditemukan');
            }

            // Check if user already liked this review
            const likeQuery = `
                SELECT review_like_id 
                FROM review_like 
                WHERE user_id = ? AND review_id = ?
            `;
            const likeResult = await db.query(likeQuery, [userId, reviewId]);

            let action;
            if (likeResult.length === 0) {
                // Add like - use provided reviewLikeId or generate one (fallback)
                const likeId = reviewLikeId || `RL${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
                const insertLikeQuery = `
                    INSERT INTO review_like (review_like_id, user_id, review_id, created_at)
                    VALUES (?, ?, ?, NOW())
                `;
                await db.query(insertLikeQuery, [likeId, userId, reviewId]);

                // Update total likes (+1)
                const updateQuery = `
                    UPDATE review 
                    SET total_likes = total_likes + 1 
                    WHERE review_id = ?
                `;
                await db.query(updateQuery, [reviewId]);
                action = 'liked';
            } else {
                // Remove like
                const deleteLikeQuery = `
                    DELETE FROM review_like 
                    WHERE user_id = ? AND review_id = ?
                `;
                await db.query(deleteLikeQuery, [userId, reviewId]);

                // Update total likes (-1)
                const updateQuery = `
                    UPDATE review 
                    SET total_likes = GREATEST(total_likes - 1, 0) 
                    WHERE review_id = ?
                `;
                await db.query(updateQuery, [reviewId]);
                action = 'unliked';
            }

            // Get updated total likes
            const totalLikesQuery = `
                SELECT total_likes 
                FROM review 
                WHERE review_id = ?
            `;
            const totalLikesResult = await db.query(totalLikesQuery, [reviewId]);
            const totalLikes = totalLikesResult[0].total_likes;

            await db.query('COMMIT');

            return {
                action: action,
                total_likes: totalLikes
            };
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error toggling review like:', error);
            throw error;
        }
    }

    /**
     * FUNGSIONAL 5: Update user's review
     * @param {string} userId - User ID
     * @param {string} reviewId - Review ID
     * @param {number} rating - New rating
     * @param {string} reviewText - New review text
     * @returns {Promise<Object>} Updated review
     */
    static async updateReview(userId, reviewId, rating, reviewText) {
        try {
            // Check if review belongs to user
            const checkQuery = `
                SELECT review_id, tourist_place_id 
                FROM review 
                WHERE review_id = ? AND user_id = ?
            `;
            const checkResult = await db.query(checkQuery, [reviewId, userId]);
            
            if (checkResult.length === 0) {
                throw new Error('Review tidak ditemukan atau Anda tidak memiliki akses');
            }

            const touristPlaceId = checkResult[0].tourist_place_id;

            // Start transaction
            await db.query('START TRANSACTION');

            // Update review
            const updateQuery = `
                UPDATE review 
                SET rating = ?, review_text = ?, updated_at = NOW() 
                WHERE review_id = ? AND user_id = ?
            `;
            await db.query(updateQuery, [rating, reviewText, reviewId, userId]);

            // Recalculate average rating for the place
            await this.updateTouristPlaceRating(touristPlaceId);

            await db.query('COMMIT');

            // Return updated review
            const getUpdatedQuery = `
                SELECT 
                    r.review_id,
                    r.rating,
                    r.review_text,
                    r.total_likes,
                    r.updated_at
                FROM review r
                WHERE r.review_id = ?
            `;
            const updatedResult = await db.query(getUpdatedQuery, [reviewId]);
            
            return updatedResult[0];
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error updating review:', error);
            throw error;
        }
    }

    /**
     * FUNGSIONAL 5: Delete user's review
     * @param {string} userId - User ID
     * @param {string} reviewId - Review ID
     */
    static async deleteReview(userId, reviewId) {
        try {
            // Check if review belongs to user
            const checkQuery = `
                SELECT review_id, tourist_place_id 
                FROM review 
                WHERE review_id = ? AND user_id = ?
            `;
            const checkResult = await db.query(checkQuery, [reviewId, userId]);
            
            if (checkResult.length === 0) {
                throw new Error('Review tidak ditemukan atau Anda tidak memiliki akses');
            }

            const touristPlaceId = checkResult[0].tourist_place_id;

            // Start transaction
            await db.query('START TRANSACTION');

            // Delete review likes first
            const deleteLikesQuery = `DELETE FROM review_like WHERE review_id = ?`;
            await db.query(deleteLikesQuery, [reviewId]);

            // Delete review
            const deleteQuery = `DELETE FROM review WHERE review_id = ? AND user_id = ?`;
            await db.query(deleteQuery, [reviewId, userId]);

            // Recalculate average rating for the place
            await this.updateTouristPlaceRating(touristPlaceId);

            await db.query('COMMIT');
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    /**
     * Create a new review (untuk addReview controller)
     * @param {Object} reviewData - Review data
     * @param {string} reviewData.review_id - Review ID
     * @param {string} reviewData.user_id - User ID
     * @param {string} reviewData.tourist_place_id - Tourist place ID
     * @param {number} reviewData.rating - Rating (1-5)
     * @param {string} reviewData.review_text - Review text
     * @returns {Promise<Object>} Created review data
     */
    static async createReview(reviewData) {
        try {
            // Start transaction
            await db.query('START TRANSACTION');

            const { review_id, user_id, tourist_place_id, rating, review_text } = reviewData;

            // Insert review
            const insertQuery = `
                INSERT INTO review (
                    review_id, 
                    user_id, 
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
                user_id, 
                tourist_place_id, 
                rating, 
                review_text
            ]);

            // Update tourist place average rating
            await this.updateTouristPlaceRating(tourist_place_id);

            await db.query('COMMIT');

            // Get created review with place info
            const getCreatedQuery = `
                SELECT 
                    r.review_id,
                    r.user_id,
                    r.tourist_place_id,
                    r.rating,
                    r.review_text,
                    r.total_likes,
                    r.created_at,
                    r.updated_at,
                    u.full_name as user_full_name,
                    tp.name as place_name,
                    tp.average_rating,
                    (
                        SELECT COUNT(*) 
                        FROM review 
                        WHERE tourist_place_id = r.tourist_place_id
                    ) as total_reviews
                FROM review r
                JOIN users u ON r.user_id = u.users_id
                JOIN tourist_place tp ON r.tourist_place_id = tp.tourist_place_id
                WHERE r.review_id = ?
            `;
            
            const result = await db.query(getCreatedQuery, [review_id]);
            return result[0];
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error creating review:', error);
            throw error;
        }
    }

    /**
     * Check if user already reviewed a tourist place (untuk addReview controller)
     * @param {string} userId - User ID
     * @param {string} touristPlaceId - Tourist place ID
     * @returns {Promise<Object|null>} Existing review or null
     */
    static async checkExistingReview(userId, touristPlaceId) {
        try {
            const query = `
                SELECT 
                    review_id,
                    user_id,
                    tourist_place_id,
                    rating,
                    review_text,
                    created_at
                FROM review 
                WHERE user_id = ? AND tourist_place_id = ?
                LIMIT 1
            `;

            const result = await db.query(query, [userId, touristPlaceId]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error checking existing review:', error);
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
}

const reviewMapModel = ReviewMapModel;
module.exports = { reviewMapModel };
