/**
 * API Routes
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const UserController = require('../controllers/userController');
const WorkerController = require('../controllers/workerController');
const BookingController = require('../controllers/bookingController');
const ReviewController = require('../controllers/reviewController');
const NotificationController = require('../controllers/notificationController');
const AdminController = require('../controllers/adminController');

const {
    verifyToken,
    requireAdmin,
    requireWorker,
    requireUser,
    requireOwnership,
    rateLimit
} = require('../middleware/auth');

// Apply rate limiting to auth routes
const authLimiter = rateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth
const apiLimiter = rateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes for general API

// ======= AUTH ROUTES =======
router.post('/register', authLimiter, UserController.register);
router.post('/login', authLimiter, UserController.login);
router.post('/logout', verifyToken, UserController.logout); // NEW: Logout endpoint

// ======= USER ROUTES =======
router.get('/profile', verifyToken, UserController.getProfile);
router.put('/profile', verifyToken, UserController.updateProfile);
router.get('/users', verifyToken, requireAdmin, UserController.getAllUsers);
router.get('/stats', verifyToken, UserController.getStats);

// ======= WORKER ROUTES =======
router.post('/worker/profile', verifyToken, WorkerController.createProfile);
router.get('/worker/profile', verifyToken, WorkerController.getProfile);
    // (moved /worker/:workerId down to avoid intercepting static routes)
router.get('/workers/category/:category', WorkerController.getByCategory); // Public endpoint
router.get('/workers/search', WorkerController.search); // Public endpoint
router.put('/worker/availability', verifyToken, requireWorker, WorkerController.updateAvailability);
router.get('/worker/schedule', verifyToken, requireWorker, WorkerController.getSchedule);
router.put('/worker/schedule', verifyToken, requireWorker, WorkerController.setSchedule);
router.post('/worker/blocked-dates', verifyToken, requireWorker, WorkerController.blockDate);
router.get('/worker/pending', verifyToken, requireAdmin, WorkerController.getPending);
router.put('/worker/:workerId/verify', verifyToken, requireAdmin, WorkerController.verify);
router.get('/worker/bookings', verifyToken, requireWorker, WorkerController.getBookings);
router.get('/worker/reviews', verifyToken, requireWorker, WorkerController.getReviews);

// This must come after the other /worker/... static routes
router.get('/worker/:workerId', WorkerController.getWorkerById); // Public endpoint

// ======= BOOKING ROUTES =======
router.post('/bookings', verifyToken, apiLimiter, BookingController.create);
    // (moved /bookings/:bookingId down to avoid intercepting static routes)
router.get('/user/bookings', verifyToken, BookingController.getUserBookings);
router.get('/user/bookings/upcoming', verifyToken, BookingController.getUpcomingBookings);
router.put('/bookings/:bookingId/status', verifyToken, BookingController.updateStatus);
router.put('/bookings/:bookingId/cancel', verifyToken, requireOwnership('booking'), BookingController.cancel);
router.post('/bookings/:bookingId/reschedule', verifyToken, requireOwnership('booking'), BookingController.requestReschedule);
router.put('/bookings/:bookingId/reschedule', verifyToken, requireWorker, BookingController.respondReschedule);
router.get('/bookings/slots', verifyToken, BookingController.getAvailableSlots);
router.get('/bookings/pending', verifyToken, requireWorker, BookingController.getPending);
router.get('/bookings/active', verifyToken, requireWorker, BookingController.getActive);
router.get('/bookings', verifyToken, requireAdmin, BookingController.getAll);
router.get('/bookings/emergency', verifyToken, requireAdmin, BookingController.getEmergency);

// This must come after the other /bookings/... static routes
router.get('/bookings/:bookingId', verifyToken, requireOwnership('booking'), BookingController.getBooking);

// ======= PAYMENT ROUTES =======
router.post('/payments/create-order', verifyToken, BookingController.createPaymentOrder);
router.post('/payments/verify', verifyToken, BookingController.verifyPayment);
router.post('/payments/refund', verifyToken, requireAdmin, BookingController.processRefund);
router.get('/payments/booking/:bookingId', verifyToken, BookingController.getPaymentDetails);

// ======= ADMIN ANALYTICS =======
router.get('/admin/stats', verifyToken, requireAdmin, AdminController.getStats);
router.get('/admin/revenue', verifyToken, requireAdmin, AdminController.getRevenueTimeline);

// ======= NOTIFICATION ROUTES =======
router.get('/notifications', verifyToken, NotificationController.getNotifications);
router.put('/notifications/:notificationId/read', verifyToken, requireOwnership('notification'), NotificationController.markAsRead);

// ======= REVIEW ROUTES =======
router.post('/reviews', verifyToken, ReviewController.create);
router.get('/reviews/booking/:bookingId', ReviewController.getByBooking); // Public endpoint
router.get('/reviews/worker', verifyToken, requireWorker, ReviewController.getWorkerReviews);
router.put('/reviews/:reviewId', verifyToken, requireOwnership('review'), ReviewController.update);
router.delete('/reviews/:reviewId', verifyToken, requireOwnership('review'), ReviewController.delete);

// ======= HEALTH CHECK =======
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
