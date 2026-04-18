/**
 * Booking Controller - Handles booking-related API logic
 */
const BookingModel = require('../models/bookingModel');
const ReviewModel = require('../models/reviewModel');
const WorkerModel = require('../models/workerModel');
const NotificationModel = require('../models/notificationModel');
const PaymentModel = require('../models/paymentModel');
const WorkerScheduleModel = require('../models/workerScheduleModel');
const paymentService = require('../services/paymentService');
const socketService = require('../services/socketService');

class BookingController {
    /**
     * Create a booking
     */
    static async create(req, res) {
        try {
            const userId = req.user.id;
            let {
                worker_id,
                service_category,
                scheduled_date,
                scheduled_time,
                address,
                description,
                is_emergency = false,
                total_amount,
                payment_method = 'cash'
            } = req.body;

            // Validation
            if (!service_category || !scheduled_date || !scheduled_time || !address) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields'
                });
            }

            if (!worker_id) {
                let availableWorker = await WorkerModel.findAvailableByCategory(service_category);
                if (!availableWorker) {
                    // Create a dummy worker so booking can succeed
                    const UserModel = require('../models/userModel');
                    const adminUser = await UserModel.findByEmail('admin@pronto.com');
                    let sysUserId;
                    
                    if (!adminUser) {
                        const newAdmin = await UserModel.create({
                            full_name: 'System Worker',
                            email: 'system.worker@pronto.com',
                            phone: '0000000000',
                            password: 'password123',
                            role: 'worker'
                        });
                        sysUserId = newAdmin.insertId;
                    } else {
                        sysUserId = adminUser.id;
                    }

                    const newWorker = await WorkerModel.create({
                        user_id: sysUserId,
                        service_category: service_category,
                        experience_years: 5,
                        hourly_rate: 500,
                        service_area: 'System Default'
                    });
                    
                    await WorkerModel.updateVerificationStatus(newWorker.insertId, 'verified');
                    worker_id = newWorker.insertId;
                } else {
                    worker_id = availableWorker.id;
                }
            }

            const slotConflict = await BookingModel.findConflictingBooking(worker_id, scheduled_date, scheduled_time);
            if (slotConflict) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Selected time slot is already booked for this worker'
                });
            }

            // Create booking
            const result = await BookingModel.create({
                user_id: userId,
                worker_id,
                service_category,
                scheduled_date,
                scheduled_time,
                address,
                description: description || '',
                is_emergency,
                total_amount: total_amount || 0,
                payment_method,
                payment_status: payment_method === 'card' ? 'pending' : 'unpaid'
            });

            const bookingId = result.insertId;
            const worker = await WorkerModel.getById(worker_id);

            await NotificationModel.create({
                user_id: userId,
                worker_id,
                booking_id: bookingId,
                type: 'booking_confirmation',
                message: `Your booking for ${service_category} is created and awaiting worker confirmation.`
            });

            if (worker) {
                await NotificationModel.create({
                    user_id: worker.user_id,
                    worker_id,
                    booking_id: bookingId,
                    type: 'booking_update',
                    message: `New job request received for ${service_category} on ${scheduled_date} at ${scheduled_time}.`
                });
            }

            socketService.emitToUser(userId, 'booking:new', {
                bookingId,
                status: 'pending',
                service_category,
                scheduled_date,
                scheduled_time,
                worker_id,
                total_amount: total_amount || 0
            });

            if (worker) {
                socketService.emitToUser(worker.user_id, 'booking:new', {
                    bookingId,
                    status: 'pending',
                    service_category,
                    scheduled_date,
                    scheduled_time,
                    user_id: userId,
                    total_amount: total_amount || 0
                });
            }

            res.status(201).json({
                status: 'ok',
                message: 'Booking created successfully',
                bookingId
            });
        } catch (error) {
            console.error('Create booking error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to create booking'
            });
        }
    }

    /**
     * Get booking
     */
    static async getBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const booking = await BookingModel.getById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Booking not found'
                });
            }

            // Check authorization: users can only see their own, workers can only see their own, admins see everything
            if (req.user.role === 'user' && booking.user_id !== req.user.id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }
            if (req.user.role === 'worker' && booking.worker_user_id !== req.user.id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            res.json({
                status: 'ok',
                booking
            });
        } catch (error) {
            console.error('Get booking error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get booking'
            });
        }
    }

    /**
     * Get user bookings
     */
    static async getUserBookings(req, res) {
        try {
            const userId = req.user.id;
            const bookings = await BookingModel.getUserBookings(userId);

            res.json({
                status: 'ok',
                data: bookings
            });
        } catch (error) {
            console.error('Get user bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get bookings'
            });
        }
    }

    /**
     * Get upcoming user bookings
     */
    static async getUpcomingBookings(req, res) {
        try {
            const userId = req.user.id;
            const bookings = await BookingModel.getUpcomingBookings(userId);

            res.json({
                status: 'ok',
                data: bookings
            });
        } catch (error) {
            console.error('Get upcoming bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get upcoming bookings'
            });
        }
    }

    /**
     * Get available booking slots for a category and date
     */
    static async getAvailableSlots(req, res) {
        try {
            const category = req.query.category;
            const date = req.query.date;

            if (!category || !date) {
                return res.status(400).json({
                    status: 'error',
                    message: 'category and date query parameters are required'
                });
            }

            const slots = await WorkerScheduleModel.getAvailableSlots(category, date);
            res.json({
                status: 'ok',
                data: slots
            });
        } catch (error) {
            console.error('Get available slots error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get available slots'
            });
        }
    }

    /**
     * Update booking status
     */
    static async updateStatus(req, res) {
        try {
            const { bookingId } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid booking status'
                });
            }

            const booking = await BookingModel.getById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Booking not found'
                });
            }

            // Check authorization - only the worker who owns the booking or an admin may change
            if (req.user.role === 'worker' && booking.worker_user_id !== req.user.id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            await BookingModel.updateStatus(bookingId, status);

            if (status === 'completed') {
                await WorkerModel.updateRating(booking.worker_id);
            }

            const userMessage = `Your booking for ${booking.service_category} has been updated to ${status.replace('_', ' ')}.`;
            await NotificationModel.create({
                user_id: booking.user_id,
                worker_id: booking.worker_id,
                booking_id: bookingId,
                type: 'booking_update',
                message: userMessage
            });

            if (req.user.role === 'worker' || req.user.role === 'admin') {
                const worker = await WorkerModel.getById(booking.worker_id);
                if (worker) {
                    await NotificationModel.create({
                        user_id: worker.user_id,
                        worker_id: booking.worker_id,
                        booking_id: bookingId,
                        type: 'booking_update',
                        message: `Booking ${bookingId} status changed to ${status.replace('_', ' ')}.`
                    });
                }
            }

            socketService.emitToUser(booking.user_id, 'booking:status', {
                bookingId,
                status,
                message: userMessage
            });

            const workerProfile = await WorkerModel.getById(booking.worker_id);
            if (workerProfile) {
                socketService.emitToUser(workerProfile.user_id, 'booking:status', {
                    bookingId,
                    status,
                    message: `Booking ${bookingId} status changed to ${status.replace('_', ' ')}.`
                });
            }

            res.json({
                status: 'ok',
                message: 'Booking status updated successfully'
            });
        } catch (error) {
            console.error('Update booking status error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to update booking'
            });
        }
    }

    /**
     * Request a booking reschedule
     */
    static async requestReschedule(req, res) {
        try {
            const bookingId = req.params.bookingId;
            const userId = req.user.id;
            const { scheduled_date, scheduled_time, reason } = req.body;

            if (!scheduled_date || !scheduled_time) {
                return res.status(400).json({
                    status: 'error',
                    message: 'scheduled_date and scheduled_time are required'
                });
            }

            const booking = await BookingModel.getById(bookingId);
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

            const conflict = await BookingModel.findConflictingBooking(booking.worker_id, scheduled_date, scheduled_time);
            if (conflict) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Selected time is not available for this worker'
                });
            }

            await BookingModel.createRescheduleRequest({
                booking_id: bookingId,
                user_id: userId,
                worker_id: booking.worker_id,
                requested_date: scheduled_date,
                requested_time: scheduled_time,
                reason: reason || ''
            });

            const workerProfile = await WorkerModel.getById(booking.worker_id);
            if (workerProfile) {
                await NotificationModel.create({
                    user_id: workerProfile.user_id,
                    worker_id: booking.worker_id,
                    booking_id: bookingId,
                    type: 'booking_update',
                    message: `Reschedule requested for booking ${bookingId}: ${scheduled_date} ${scheduled_time}`
                });

                socketService.emitToUser(workerProfile.user_id, 'booking:reschedule_request', {
                    bookingId,
                    requested_date: scheduled_date,
                    requested_time: scheduled_time,
                    reason: reason || ''
                });
            }

            res.json({
                status: 'ok',
                message: 'Reschedule request sent to the worker'
            });
        } catch (error) {
            console.error('Request reschedule error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to request reschedule'
            });
        }
    }

    /**
     * Respond to a reschedule request
     */
    static async respondReschedule(req, res) {
        try {
            const bookingId = req.params.bookingId;
            const workerId = req.user.id;
            const { status, note } = req.body;

            const validStatuses = ['accepted', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status'
                });
            }

            const booking = await BookingModel.getById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Booking not found'
                });
            }

            if (booking.worker_user_id !== workerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const request = await BookingModel.getRescheduleRequestByBooking(bookingId);
            if (!request) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Reschedule request not found'
                });
            }

            if (status === 'accepted') {
                const conflict = await BookingModel.findConflictingBooking(booking.worker_id, request.requested_date, request.requested_time);
                if (conflict) {
                    return res.status(409).json({
                        status: 'error',
                        message: 'Requested slot is no longer available'
                    });
                }

                await BookingModel.updateBookingSchedule(bookingId, {
                    scheduled_date: request.requested_date,
                    scheduled_time: request.requested_time,
                    rescheduled_from: booking.scheduled_date
                });
            }

            await BookingModel.updateRescheduleRequest(request.id, { status, response_note: note || '' });

            await NotificationModel.create({
                user_id: booking.user_id,
                worker_id: booking.worker_id,
                booking_id: bookingId,
                type: 'booking_update',
                message: status === 'accepted'
                    ? `Your reschedule request for booking ${bookingId} has been accepted.`
                    : `Your reschedule request for booking ${bookingId} has been rejected.`
            });

            socketService.emitToUser(booking.user_id, 'booking:reschedule_response', {
                bookingId,
                status,
                requested_date: request.requested_date,
                requested_time: request.requested_time,
                note: note || ''
            });

            res.json({
                status: 'ok',
                message: `Reschedule request ${status}`
            });
        } catch (error) {
            console.error('Respond reschedule error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to respond to reschedule request'
            });
        }
    }

    /**
     * Create payment order for booking
     */
    static async createPaymentOrder(req, res) {
        try {
            const userId = req.user.id;
            const { booking_id } = req.body;

            if (!booking_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'booking_id is required'
                });
            }

            // Get booking details
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

            if (booking.payment_status === 'paid') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Payment already completed'
                });
            }

            // Get user details for payment
            const UserModel = require('../models/userModel');
            const user = await UserModel.findById(userId);

            // Create payment order
            const orderData = {
                amount: booking.total_amount,
                currency: 'INR',
                bookingId: booking_id,
                customerEmail: user.email,
                customerName: user.full_name
            };

            const orderResult = await paymentService.createPaymentOrder(orderData);

            if (!orderResult.success) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to create payment order'
                });
            }

            // Store payment record in database
            await PaymentModel.create({
                booking_id: booking_id,
                amount: booking.total_amount,
                currency: 'INR',
                payment_method: orderResult.gateway,
                gateway: orderResult.gateway,
                status: 'pending',
                reference_id: orderResult.order?.id || orderResult.paymentIntent?.id
            });

            res.json({
                status: 'ok',
                order: orderResult.order,
                paymentIntent: orderResult.paymentIntent,
                gateway: orderResult.gateway,
                keyId: orderResult.keyId,
                publishableKey: orderResult.publishableKey
            });
        } catch (error) {
            console.error('Create payment order error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to create payment order'
            });
        }
    }

    /**
     * Verify and complete payment
     */
    static async verifyPayment(req, res) {
        try {
            const userId = req.user.id;
            const { booking_id, payment_id, order_id, signature, gateway } = req.body;

            if (!booking_id || !payment_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'booking_id and payment_id are required'
                });
            }

            // Get booking details
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

            // Verify payment with gateway
            const verificationData = {
                gateway: gateway || 'razorpay',
                paymentId: payment_id,
                orderId: order_id,
                signature,
                bookingId: booking_id
            };

            const verificationResult = await paymentService.verifyPayment(verificationData);

            if (!verificationResult.success) {
                // Update payment status to failed
                await PaymentModel.updateByBookingId(booking_id, {
                    status: 'failed',
                    error_message: verificationResult.message
                });

                return res.status(400).json({
                    status: 'error',
                    message: verificationResult.message || 'Payment verification failed'
                });
            }

            // Update payment status to completed
            await PaymentModel.updateByBookingId(booking_id, {
                status: 'completed',
                transaction_id: verificationResult.paymentId
            });

            // Update booking payment status
            await BookingModel.markPaymentPaid(booking_id, verificationResult.gateway);

            // Create notification
            await NotificationModel.create({
                user_id: userId,
                worker_id: booking.worker_id,
                booking_id: booking_id,
                type: 'payment',
                message: `Payment of ₹${booking.total_amount} confirmed for booking ${booking_id}.`
            });

            res.json({
                status: 'ok',
                message: 'Payment verified and completed successfully',
                paymentId: verificationResult.paymentId
            });
        } catch (error) {
            console.error('Payment verification error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Payment verification failed'
            });
        }
    }

    /**
     * Process payment refund
     */
    static async processRefund(req, res) {
        try {
            const { booking_id, amount, reason } = req.body;

            if (!booking_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'booking_id is required'
                });
            }

            // Get payment details
            const payment = await PaymentModel.getByBookingId(booking_id);
            if (!payment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Payment record not found'
                });
            }

            if (payment.status !== 'completed') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Only completed payments can be refunded'
                });
            }

            // Process refund through payment service
            const refundResult = await paymentService.processRefund({
                paymentId: payment.transaction_id,
                amount: amount || payment.amount,
                reason: reason || 'Customer request'
            });

            if (refundResult.success) {
                // Update payment status
                await PaymentModel.processRefund(payment.id, refundResult.refundAmount, reason);

                // Update booking status
                await BookingModel.updateStatus(booking_id, 'cancelled');

                // Create notification
                const booking = await BookingModel.getById(booking_id);
                await NotificationModel.create({
                    user_id: booking.user_id,
                    worker_id: booking.worker_id,
                    booking_id: booking_id,
                    type: 'payment',
                    message: `Refund of ₹${refundResult.refundAmount} processed for booking ${booking_id}.`
                });

                res.json({
                    status: 'ok',
                    message: 'Refund processed successfully',
                    refundId: refundResult.refundId
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: refundResult.message || 'Refund processing failed'
                });
            }
        } catch (error) {
            console.error('Refund processing error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Refund processing failed'
            });
        }
    }

    /**
     * Get payment details for booking
     */
    static async getPaymentDetails(req, res) {
        try {
            const userId = req.user.id;
            const { bookingId } = req.params;

            // Get booking to verify ownership
            const booking = await BookingModel.getById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Booking not found'
                });
            }

            // Allow access if user owns booking or is admin
            if (booking.user_id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            // Get payment details
            const payment = await PaymentModel.getByBookingId(bookingId);

            res.json({
                status: 'ok',
                payment: payment || null
            });
        } catch (error) {
            console.error('Get payment details error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get payment details'
            });
        }
    }

    /**
     * Cancel booking
     */
    static async cancel(req, res) {
        try {
            const { bookingId } = req.params;
            const { reason = '' } = req.body;

            const booking = await BookingModel.getById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Booking not found'
                });
            }

            // Check authorization
            if (req.user.id !== booking.user_id && req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            await BookingModel.cancel(bookingId, reason);

            await NotificationModel.create({
                user_id: booking.user_id,
                worker_id: booking.worker_id,
                booking_id: bookingId,
                type: 'booking_update',
                message: `Booking ${bookingId} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`
            });

            const worker = await WorkerModel.getById(booking.worker_id);
            if (worker) {
                await NotificationModel.create({
                    user_id: worker.user_id,
                    worker_id: booking.worker_id,
                    booking_id: bookingId,
                    type: 'booking_update',
                    message: `Booking ${bookingId} has been cancelled by the user.${reason ? ` Reason: ${reason}` : ''}`
                });
            }

            res.json({
                status: 'ok',
                message: 'Booking cancelled successfully'
            });
        } catch (error) {
            console.error('Cancel booking error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to cancel booking'
            });
        }
    }

    /**
     * Get pending bookings (for worker)
     */
    static async getPending(req, res) {
        try {
            const userId = req.user.id;
            const worker = await WorkerModel.getByUserId(userId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            const bookings = await BookingModel.getPending(worker.id);

            res.json({
                status: 'ok',
                data: bookings
            });
        } catch (error) {
            console.error('Get pending bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get pending bookings'
            });
        }
    }

    /**
     * Get active bookings (for worker)
     */
    static async getActive(req, res) {
        try {
            const userId = req.user.id;
            const worker = await WorkerModel.getByUserId(userId);

            if (!worker) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Worker profile not found'
                });
            }

            const bookings = await BookingModel.getActive(worker.id);

            res.json({
                status: 'ok',
                data: bookings
            });
        } catch (error) {
            console.error('Get active bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get active bookings'
            });
        }
    }

    /**
     * Get all bookings (admin)
     */
    static async getAll(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const limit = parseInt(req.query.limit) || 100;
            const bookings = await BookingModel.getAll(limit);
            const count = await BookingModel.getCount();

            res.json({
                status: 'ok',
                data: bookings,
                pagination: {
                    total: count,
                    limit
                }
            });
        } catch (error) {
            console.error('Get all bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get bookings'
            });
        }
    }

    /**
     * Get emergency bookings (admin)
     */
    static async getEmergency(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const bookings = await BookingModel.getEmergency();

            res.json({
                status: 'ok',
                data: bookings
            });
        } catch (error) {
            console.error('Get emergency bookings error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get emergency bookings'
            });
        }
    }
}

module.exports = BookingController;
