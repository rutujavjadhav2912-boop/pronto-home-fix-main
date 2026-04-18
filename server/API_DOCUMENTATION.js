/**
 * COMPLETE API DOCUMENTATION
 * 
 * Base URL: http://localhost:5000/api
 * Each request (except login/register) requires Authorization header:
 * Authorization: Bearer <your_jwt_token>
 */

// ==================== AUTHENTICATION ====================

/**
 * 1. REGISTER USER
 * POST /api/register
 * 
 * Request Body:
 * {
 *   "full_name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "1234567890",
 *   "password": "password123",
 *   "role": "user",  // 'user', 'worker', or 'admin'
 *   "address": "123 Main St"
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "User registered successfully",
 *   "userId": 1
 * }
 */

/**
 * 2. LOGIN USER
 * POST /api/login
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Logged in successfully",
 *   "token": "eyJhbGciOiJIUzI1NiIs...",
 *   "user": {
 *     "id": 1,
 *     "full_name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "1234567890",
 *     "role": "user"
 *   }
 * }
 */

// ==================== USER ENDPOINTS ====================

/**
 * 3. GET USER PROFILE
 * GET /api/profile
 * Headers: Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "user": {
 *     "id": 1,
 *     "full_name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "1234567890",
 *     "address": "123 Main St",
 *     "role": "user",
 *     "is_active": true,
 *     "created_at": "2024-01-01T10:00:00Z"
 *   }
 * }
 */

/**
 * 4. UPDATE USER PROFILE
 * PUT /api/profile
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "full_name": "Jane Doe",
 *   "phone": "9876543210",
 *   "address": "456 Oak Ave"
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Profile updated successfully"
 * }
 */

/**
 * 5. GET ALL USERS (Admin Only)
 * GET /api/users?limit=50&offset=0
 * Headers: Authorization: Bearer <admin_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [ {...user objects...} ],
 *   "pagination": {
 *     "total": 100,
 *     "limit": 50,
 *     "offset": 0
 *   }
 * }
 */

/**
 * 6. GET STATISTICS
 * GET /api/stats
 * Headers: Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "stats": {
 *     "totalUsers": 50,
 *     "totalWorkers": 10
 *   }
 * }
 */

// ==================== WORKER ENDPOINTS ====================

/**
 * 7. CREATE WORKER PROFILE
 * POST /api/worker/profile
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Request Body:
 * {
 *   "service_category": "plumber",  // plumber, electrician, ac_technician, etc.
 *   "experience_years": 5,
 *   "hourly_rate": 500.00,
 *   "service_area": "Downtown, Suburbs",
 *   "id_proof_url": "https://example.com/proof.jpg"
 * }
 * 
 * Response (201):
 * {
 *   "status": "ok",
 *   "message": "Worker profile created successfully",
 *   "workerId": 1
 * }
 */

/**
 * 8. GET WORKER PROFILE
 * GET /api/worker/profile
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "worker": {
 *     "id": 1,
 *     "user_id": 2,
 *     "service_category": "plumber",
 *     "experience_years": 5,
 *     "hourly_rate": 500.00,
 *     "service_area": "Downtown",
 *     "verification_status": "pending",
 *     "is_available": true,
 *     "rating": 4.5,
 *     "total_jobs": 20,
 *     "full_name": "John Doe",
 *     "email": "john@example.com"
 *   }
 * }
 */

/**
 * 9. GET WORKER BY ID
 * GET /api/worker/{workerId}
 * 
 * Response (200): Same as GET /api/worker/profile
 */

/**
 * 10. GET WORKERS BY CATEGORY
 * GET /api/workers/category/{category}?limit=50
 * 
 * Categories: plumber, electrician, ac_technician, tv_repair, painter, carpenter
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...worker objects...]
 * }
 */

/**
 * 11. SEARCH WORKERS
 * GET /api/workers/search?category=plumber&minRating=4&available=true
 * Query Parameters:
 * - category: Service category (optional)
 * - minRating: Minimum rating filter (optional)
 * - available: true/false (optional)
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...worker objects...]
 * }
 */

/**
 * 12. UPDATE WORKER AVAILABILITY
 * PUT /api/worker/availability
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Request Body:
 * {
 *   "isAvailable": true
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Worker is now available"
 * }
 */

/**
 * 13. GET PENDING WORKER VERIFICATIONS (Admin Only)
 * GET /api/worker/pending?limit=50
 * Headers: Authorization: Bearer <admin_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...unverified worker objects...]
 * }
 */

/**
 * 14. VERIFY/REJECT WORKER (Admin Only)
 * PUT /api/worker/{workerId}/verify
 * Headers: Authorization: Bearer <admin_token>
 * 
 * Request Body:
 * {
 *   "status": "verified"  // or "rejected"
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Worker verified successfully"
 * }
 */

/**
 * 15. GET WORKER BOOKINGS
 * GET /api/worker/bookings
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...booking objects...]
 * }
 */

/**
 * 16. GET WORKER REVIEWS
 * GET /api/worker/reviews
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "reviews": [...review objects...],
 *   "summary": {
 *     "average_rating": 4.5,
 *     "total_reviews": 12
 *   }
 * }
 */

// ==================== BOOKING ENDPOINTS ====================

/**
 * 17. CREATE BOOKING
 * POST /api/bookings
 * Headers: Authorization: Bearer <user_token>
 * 
 * Request Body:
 * {
 *   "worker_id": 1,
 *   "service_category": "plumber",
 *   "scheduled_date": "2024-03-15",
 *   "scheduled_time": "10:30",
 *   "address": "123 Main St, City",
 *   "description": "Fix leaking tap",
 *   "is_emergency": false,
 *   "total_amount": 500.00
 * }
 * 
 * Response (201):
 * {
 *   "status": "ok",
 *   "message": "Booking created successfully",
 *   "bookingId": 1
 * }
 */

/**
 * 18. GET BOOKING
 * GET /api/bookings/{bookingId}
 * Headers: Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "booking": {
 *     "id": 1,
 *     "user_id": 1,
 *     "worker_id": 1,
 *     "service_category": "plumber",
 *     "scheduled_date": "2024-03-15",
 *     "scheduled_time": "10:30",
 *     "address": "123 Main St",
 *     "status": "pending",
 *     "is_emergency": false,
 *     "total_amount": 500.00,
 *     "user_name": "John Doe",
 *     "worker_name": "Jane Smith",
 *     "created_at": "2024-03-01T10:00:00Z"
 *   }
 * }
 */

/**
 * 19. GET USER BOOKINGS
 * GET /api/user/bookings
 * Headers: Authorization: Bearer <user_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...booking objects...]
 * }
 */

/**
 * 20. UPDATE BOOKING STATUS
 * PUT /api/bookings/{bookingId}/status
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "status": "accepted"  // pending, accepted, in_progress, completed, cancelled
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Booking status updated successfully"
 * }
 */

/**
 * 21. CANCEL BOOKING
 * PUT /api/bookings/{bookingId}/cancel
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "reason": "Emergency came up"
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Booking cancelled successfully"
 * }
 */

/**
 * 22. GET PENDING BOOKINGS (Worker Only)
 * GET /api/bookings/pending
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...pending booking objects...]
 * }
 */

/**
 * 23. GET ACTIVE BOOKINGS (Worker Only)
 * GET /api/bookings/active
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...active booking objects...]
 * }
 */

/**
 * 24. GET ALL BOOKINGS (Admin Only)
 * GET /api/bookings?limit=100
 * Headers: Authorization: Bearer <admin_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...booking objects...],
 *   "pagination": {
 *     "total": 500,
 *     "limit": 100
 *   }
 * }
 */

/**
 * 25. GET EMERGENCY BOOKINGS (Admin Only)
 * GET /api/bookings/emergency
 * Headers: Authorization: Bearer <admin_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "data": [...emergency booking objects...]
 * }
 */

// ==================== REVIEW ENDPOINTS ====================

/**
 * 26. CREATE REVIEW
 * POST /api/reviews
 * Headers: Authorization: Bearer <user_token>
 * 
 * Request Body:
 * {
 *   "booking_id": 1,
 *   "rating": 5,  // 1-5
 *   "comment": "Excellent work, very professional"
 * }
 * 
 * Response (201):
 * {
 *   "status": "ok",
 *   "message": "Review created successfully",
 *   "reviewId": 1
 * }
 */

/**
 * 27. GET REVIEW BY BOOKING
 * GET /api/reviews/booking/{bookingId}
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "review": {
 *     "id": 1,
 *     "booking_id": 1,
 *     "rating": 5,
 *     "comment": "Excellent work",
 *     "reviewer_name": "John Doe",
 *     "created_at": "2024-03-10T15:30:00Z"
 *   }
 * }
 */

/**
 * 28. GET WORKER REVIEWS
 * GET /api/reviews/worker
 * Headers: Authorization: Bearer <worker_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "reviews": [...review objects...],
 *   "summary": {
 *     "average_rating": 4.8,
 *     "total_reviews": 15
 *   }
 * }
 */

/**
 * 29. UPDATE REVIEW
 * PUT /api/reviews/{reviewId}
 * Headers: Authorization: Bearer <user_token>
 * 
 * Request Body:
 * {
 *   "rating": 4,
 *   "comment": "Good work, minor issue"
 * }
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Review updated successfully"
 * }
 */

/**
 * 30. DELETE REVIEW
 * DELETE /api/reviews/{reviewId}
 * Headers: Authorization: Bearer <user_token>
 * 
 * Response (200):
 * {
 *   "status": "ok",
 *   "message": "Review deleted successfully"
 * }
 */

// ==================== ERROR RESPONSES ====================

/**
 * 400 Bad Request
 * {
 *   "status": "error",
 *   "message": "Error description"
 * }
 */

/**
 * 401 Unauthorized
 * {
 *   "status": "error",
 *   "message": "Invalid or expired token"
 * }
 */

/**
 * 403 Forbidden
 * {
 *   "status": "error",
 *   "message": "Access denied"
 * }
 */

/**
 * 404 Not Found
 * {
 *   "status": "error",
 *   "message": "Resource not found"
 * }
 */

/**
 * 500 Internal Server Error
 * {
 *   "status": "error",
 *   "message": "Internal server error"
 * }
 */

// ==================== SERVICE CATEGORIES ====================
/*
Available service categories:
- plumber
- electrician
- ac_technician
- tv_repair
- painter
- carpenter
*/

// ==================== BOOKING STATUSES ====================
/*
Available booking statuses:
- pending: Booking created, waiting for worker acceptance
- accepted: Worker accepted the booking
- in_progress: Service is being provided
- completed: Service completed successfully
- cancelled: Booking cancelled
*/

// ==================== WORKER VERIFICATION STATUSES ====================
/*
Available verification statuses:
- pending: Awaiting admin verification
- verified: Worker is verified and can accept bookings
- rejected: Worker verification rejected
*/

module.exports = {};
