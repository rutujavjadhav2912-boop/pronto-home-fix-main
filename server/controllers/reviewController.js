/**
 * Review Controller - Handles review and rating API logic
 */
const ReviewModel = require('../models/reviewModel');
const BookingModel = require('../models/bookingModel');
const WorkerModel = require('../models/workerModel');

class ReviewController {
    /**
     * Create a review
     */
    static async create(req, res) {
        try {
            const userId = req.user.id;
            const { booking_id, rating, comment = '' } = req.body;

            // Validation
            if (!booking_id || !rating) {
                return res.status(400).json({
                    status: 'error',
                    message: 'booking_id and rating are required'
                });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Rating must be between 1 and 5'
                });
            }

            // Check booking exists and belongs to user
            const booking = await BookingModel.getById(booking_id);
            if (!booking) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Booking not found'
                });
            }

            if (booking.user_id !== userId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            // Check if booking is completed
            if (booking.status !== 'completed') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Can only review completed bookings'
                });
            }

            // Check if review already exists
            const existing = await ReviewModel.exists(booking_id);
            if (existing) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Review already exists for this booking'
                });
            }

            // Create review
            const result = await ReviewModel.create({
                booking_id,
                user_id: userId,
                worker_id: booking.worker_id,
                rating,
                comment
            });

            // Update worker rating
            await WorkerModel.updateRating(booking.worker_id);

            res.status(201).json({
                status: 'ok',
                message: 'Review created successfully',
                reviewId: result.insertId
            });
        } catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to create review'
            });
        }
    }

    /**
     * Get review by booking ID
     */
    static async getByBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const review = await ReviewModel.getByBookingId(bookingId);

            if (!review) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Review not found'
                });
            }

            res.json({
                status: 'ok',
                review
            });
        } catch (error) {
            console.error('Get review error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get review'
            });
        }
    }

    /**
     * Get worker reviews
     */
    static async getWorkerReviews(req, res) {
        try {
            const userId = req.user.id;
            const worker = await WorkerModel.getByUserId(userId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            const reviews = await ReviewModel.getWorkerReviews(worker.id);
            const avgRating = await ReviewModel.getAverageRating(worker.id);

            res.json({
                status: 'ok',
                reviews,
                summary: avgRating
            });
        } catch (error) {
            console.error('Get worker reviews error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get reviews'
            });
        }
    }

    /**
     * Update review
     */
    static async update(req, res) {
        try {
            const userId = req.user.id;
            const { reviewId } = req.params;
            const { rating, comment = '' } = req.body;

            // Validation
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Rating must be between 1 and 5'
                });
            }

            // Check review exists and belongs to user
            const review = await ReviewModel.getById(reviewId);
            if (!review) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Review not found'
                });
            }

            if (review.user_id !== userId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            await ReviewModel.update(reviewId, { rating, comment });

            // Update worker rating
            const booking = await BookingModel.getById(review.booking_id);
            if (booking) {
                await WorkerModel.updateRating(booking.worker_id);
            }

            res.json({
                status: 'ok',
                message: 'Review updated successfully'
            });
        } catch (error) {
            console.error('Update review error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to update review'
            });
        }
    }

    /**
     * Delete review
     */
    static async delete(req, res) {
        try {
            const userId = req.user.id;
            const { reviewId } = req.params;

            // Check review exists and belongs to user
            const review = await ReviewModel.getById(reviewId);
            if (!review) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Review not found'
                });
            }

            if (review.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            await ReviewModel.delete(reviewId);

            // Update worker rating
            const booking = await BookingModel.getById(review.booking_id);
            if (booking) {
                await WorkerModel.updateRating(booking.worker_id);
            }

            res.json({
                status: 'ok',
                message: 'Review deleted successfully'
            });
        } catch (error) {
            console.error('Delete review error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to delete review'
            });
        }
    }
}

module.exports = ReviewController;
