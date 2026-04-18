/**
 * Worker Controller - Handles worker-related API logic
 */
const WorkerModel = require('../models/workerModel');
const BookingModel = require('../models/bookingModel');
const ReviewModel = require('../models/reviewModel');
const WorkerScheduleModel = require('../models/workerScheduleModel');

class WorkerController {
    /**
     * Create worker profile
     */
    static async createProfile(req, res) {
        try {
            const userId = req.user.id;
            const {
                service_category,
                experience_years,
                hourly_rate,
                service_area,
                id_proof_url
            } = req.body;

            if (!service_category) {
                return res.status(400).json({
                    status: 'error',
                    message: 'service_category is required'
                });
            }

            const result = await WorkerModel.create({
                user_id: userId,
                service_category,
                experience_years: experience_years || 0,
                hourly_rate: hourly_rate || 0,
                service_area: service_area || '',
                id_proof_url: id_proof_url || null
            });

            res.status(201).json({
                status: 'ok',
                message: 'Worker profile created successfully',
                workerId: result.insertId
            });
        } catch (error) {
            console.error('Create worker profile error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to create worker profile'
            });
        }
    }

    /**
     * Get worker profile
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const worker = await WorkerModel.getByUserId(userId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            res.json({
                status: 'ok',
                worker
            });
        } catch (error) {
            console.error('Get worker profile error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get worker profile'
            });
        }
    }

    /**
     * Get worker by ID
     */
    static async getWorkerById(req, res) {
        try {
            const { workerId } = req.params;
            const worker = await WorkerModel.getById(workerId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker not found'
                });
            }

            res.json({
                status: 'ok',
                worker
            });
        } catch (error) {
            console.error('Get worker error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get worker'
            });
        }
    }

    /**
     * Get workers by category
     */
    static async getByCategory(req, res) {
        try {
            const { category } = req.params;
            const limit = parseInt(req.query.limit) || 50;

            const workers = await WorkerModel.getByCategory(category, limit);

            res.json({
                status: 'ok',
                data: workers
            });
        } catch (error) {
            console.error('Get workers by category error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get workers'
            });
        }
    }

    /**
     * Search workers
     */
    static async search(req, res) {
        try {
            const filters = {
                category: req.query.category,
                minRating: req.query.minRating ? parseFloat(req.query.minRating) : null,
                available: req.query.available === 'true'
            };

            const workers = await WorkerModel.search(filters);

            res.json({
                status: 'ok',
                data: workers
            });
        } catch (error) {
            console.error('Search workers error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to search workers'
            });
        }
    }

    /**
     * Update worker availability
     */
    static async updateAvailability(req, res) {
        try {
            const userId = req.user.id;
            const { isAvailable } = req.body;

            const worker = await WorkerModel.getByUserId(userId);
            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            await WorkerModel.updateAvailability(worker.id, isAvailable);

            res.json({
                status: 'ok',
                message: `Worker is now ${isAvailable ? 'available' : 'offline'}`
            });
        } catch (error) {
            console.error('Update availability error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to update availability'
            });
        }
    }

    /**
     * Get pending verifications (admin)
     */
    static async getPending(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const limit = parseInt(req.query.limit) || 50;
            const workers = await WorkerModel.getPending(limit);

            res.json({
                status: 'ok',
                data: workers
            });
        } catch (error) {
            console.error('Get pending workers error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get pending workers'
            });
        }
    }

    /**
     * Verify worker (admin)
     */
    static async verify(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const { workerId } = req.params;
            const { status } = req.body; // 'verified' or 'rejected'

            if (!['verified', 'rejected'].includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status. Must be verified or rejected'
                });
            }

            await WorkerModel.updateVerificationStatus(workerId, status);

            res.json({
                status: 'ok',
                message: `Worker ${status} successfully`
            });
        } catch (error) {
            console.error('Verify worker error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to verify worker'
            });
        }
    }

    /**
     * Get worker bookings
     */
    static async getBookings(req, res) {
        try {
            const userId = req.user.id;
            const worker = await WorkerModel.getByUserId(userId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            const bookings = await BookingModel.getWorkerBookings(worker.id);

            res.json({
                status: 'ok',
                data: bookings
            });
        } catch (error) {
            console.error('Get worker bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get bookings'
            });
        }
    }

    /**
     * Get worker schedule
     */
    static async getSchedule(req, res) {
        try {
            const userId = req.user.id;
            const worker = await WorkerModel.getByUserId(userId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            const schedule = await WorkerScheduleModel.getScheduleByWorker(worker.id);
            const blockedDates = await WorkerScheduleModel.getBlockedDates(worker.id);

            res.json({
                status: 'ok',
                data: { schedule, blockedDates }
            });
        } catch (error) {
            console.error('Get worker schedule error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get schedule'
            });
        }
    }

    /**
     * Set worker weekly schedule
     */
    static async setSchedule(req, res) {
        try {
            const userId = req.user.id;
            const scheduleRows = req.body.schedule;

            if (!Array.isArray(scheduleRows)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'schedule must be an array of availability rows'
                });
            }

            const worker = await WorkerModel.getByUserId(userId);
            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            await WorkerScheduleModel.setWeeklyAvailability(worker.id, scheduleRows);

            res.json({
                status: 'ok',
                message: 'Schedule updated successfully'
            });
        } catch (error) {
            console.error('Set worker schedule error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to save schedule'
            });
        }
    }

    /**
     * Block a date in worker schedule
     */
    static async blockDate(req, res) {
        try {
            const userId = req.user.id;
            const { blocked_date, reason } = req.body;

            if (!blocked_date) {
                return res.status(400).json({
                    status: 'error',
                    message: 'blocked_date is required'
                });
            }

            const worker = await WorkerModel.getByUserId(userId);
            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            await WorkerScheduleModel.blockDate(worker.id, blocked_date, reason || 'Unavailable');

            res.json({
                status: 'ok',
                message: 'Date blocked successfully'
            });
        } catch (error) {
            console.error('Block worker date error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to block date'
            });
        }
    }

    /**
     * Get worker reviews
     */
    static async getReviews(req, res) {
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

            res.json({
                status: 'ok',
                data: reviews
            });
        } catch (error) {
            console.error('Get worker reviews error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get reviews'
            });
        }
    }
}

module.exports = WorkerController;
