# Pronto Home Fix - Production Enhancement Implementation Guide

## Phase 1: Security & Infrastructure Enhancements ✅ COMPLETED

### 1.1 Security Hardening
**Files Modified:**
- `server/.env` - Enhanced JWT secrets and added environment configuration
- `server/middleware/auth.js` - NEW: Comprehensive authorization middleware
- `server/routes/api.js` - Updated with security middleware and role-based access control
- `server/index.js` - Added Helmet security headers, CORS configuration, error handling

**Changes Made:**
- ✅ JWT Secret strengthened and externalized
- ✅ Role-based access control middleware implemented
- ✅ Resource ownership verification added
- ✅ Rate limiting middleware for auth endpoints (5 requests per 15 min)
- ✅ General API rate limiting (100 requests per 15 min)
- ✅ Helmet security headers enabled
- ✅ Better CORS configuration with environment-aware domains
- ✅ Logout endpoint added (POST /api/logout)
- ✅ Enhanced error handling with environment-aware error details

**Security Middleware Includes:**
- `verifyToken()` - Enhanced JWT verification with specific error codes
- `requireAdmin()` - Route middleware for admin-only endpoints
- `requireWorker()` - Route middleware for worker endpoints
- `requireUser()` - Route middleware for authenticated users
- `requireOwnership()` - Validates resource ownership before access
- `rateLimit()` - Basic rate limiting implementation

### 1.2 New Environment Variables
Add to `server/.env`:
```
# Security
JWT_SECRET=pronto_home_fix_secure_jwt_secret_2024_production_key_change_in_deployment
JWT_REFRESH_SECRET=pronto_home_fix_refresh_token_secret_2024_secure_key
NODE_ENV=development

# Payment Gateway Configuration
DEFAULT_PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**Deployment Checklist:**
- [ ] Change JWT_SECRET to production-grade random string (40+ chars)
- [ ] Change JWT_REFRESH_SECRET to production-grade random string
- [ ] Set NODE_ENV=production in production
- [ ] Add Razorpay credentials to production .env
- [ ] Add Stripe credentials if using Stripe
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Set up rate limiting thresholds appropriately
- [ ] Enable HTTPS (SSL/TLS) on production server

---

## Phase 2: Payment Gateway Integration ✅ COMPLETED

### 2.1 Payment Service Architecture
**Files Created/Modified:**
- `server/services/paymentService.js` - NEW: Payment gateway abstraction layer
- `server/models/paymentModel.js` - NEW: Payment database operations
- `server/controllers/bookingController.js` - Enhanced with payment methods
- `server/routes/api.js` - New payment endpoints

**Payment Service Features:**
- Multi-gateway support (Razorpay, Stripe)
- Payment order creation abstraction
- Payment verification with signature validation
- Refund processing
- Payment status tracking

**New API Endpoints:**
```
POST /api/payments/create-order
  - Creates payment order with gateway (Razorpay/Stripe)
  - Returns gateway-specific order/payment intent details
  - Request: { booking_id }
  - Response: { order, gateway, keyId, publishableKey }

POST /api/payments/verify
  - Verifies payment completion and gateway signature
  - Updates payment status in database
  - Request: { booking_id, payment_id, order_id, signature, gateway }
  - Response: { status: 'completed', paymentId }

POST /api/payments/refund (Admin only)
  - Processes refund for completed payments
  - Updates booking status to cancelled
  - Request: { booking_id, amount?, reason? }
  - Response: { refundId }

GET /api/payments/booking/:bookingId
  - Gets payment details for a booking
  - Authorization: User or Admin
```

**Frontend API Functions Updated:**
- `createPaymentOrder()` - Create payment order
- `verifyPayment()` - Verify payment completion
- `getPaymentDetails()` - Get payment status
- `processRefund()` - Request refund (admin)

### 2.2 Database Schema Enhancements

**New Tables Created:**

1. **payments** - Payment transaction tracking
   ```sql
   - id, booking_id, amount, currency, payment_method
   - gateway, transaction_id, status
   - customer_id, reference_id, error_message
   - metadata (JSON), created_at, updated_at
   - Indexes: booking_id, status, gateway
   ```

2. **locations** - Geo-location support
   ```sql
   - id, user_id, worker_id
   - latitude, longitude, address, service_radius_km
   - created_at, updated_at
   - Indexes: user_id, worker_id, location coordinates
   ```

3. **worker_documents** - Document verification
   ```sql
   - id, worker_id, document_type (id/license/insurance/certification)
   - document_url, verification_status
   - rejection_reason, verified_by, verified_at
   - Indexes: worker_id, verification_status
   ```

4. **audit_logs** - Admin audit trail
   ```sql
   - id, user_id, action, entity_type, entity_id
   - old_values, new_values (JSON)
   - ip_address, user_agent, created_at
   - Indexes: user_id, entity_type, created_at
   ```

5. **worker_availability_schedule** - Recurring availability
   ```sql
   - id, worker_id, day_of_week, start_time, end_time
   - is_available, created_at, updated_at
   - Unique: worker_id, day_of_week
   ```

**Modified Existing Tables:**

1. **bookings** - Added columns:
   - `cancellation_reason` - TEXT
   - `rescheduled_from` - TIMESTAMP
   - `emergency_level` - INT (0=normal, 1=urgent, 2=critical)
   - `service_location_lat/lng` - DECIMAL (10,8)/(11,8)
   - `special_instructions` - TEXT
   - Indexes: emergency_level, location_coordinates

2. **worker_profiles** - Added columns:
   - `bio` - TEXT
   - `languages` - VARCHAR
   - `certifications` - TEXT
   - `profile_image_url` - VARCHAR
   - `is_online` - BOOLEAN
   - `last_seen` - TIMESTAMP
   - `response_time_minutes` - INT
   - Indexes: online_status, last_seen

### 2.3 Payment Flow

**Razorpay Flow:**
```
1. User selects payment (card/wallet)
   ↓
2. Frontend: POST /api/payments/create-order
   ↓
3. PaymentService: Create Razorpay order
   ↓
4. Return: order_id, keyId (Razorpay key)
   ↓
5. Frontend: Initialize Razorpay checkout with order_id
   ↓
6. User completes payment on Razorpay
   ↓
7. Frontend: Verify payment signature
   ↓
8. Frontend: POST /api/payments/verify with signature
   ↓
9. Backend: Verify signature, create payment record
   ↓
10. Update booking payment_status to 'paid'
   ↓
11. Create notification for both parties
   ↓
12. Booking confirmed and worker can proceed
```

**Stripe Flow:**
```
1. Similar to Razorpay but uses:
   - payment_intent instead of order
   - client_secret for frontend
   - Webhooks for asynchronous confirmation
```

---

## Phase 3: Dashboard Integration ✅ IN PROGRESS

### 3.1 WorkerDashboard Improvements
**File: `src/components/dashboards/WorkerDashboard.tsx`**

**Changes Made:**
- ✅ Real API integration for worker profile
- ✅ Real API integration for worker bookings
- ✅ Real API integration for worker reviews
- ✅ Functional availability toggle with API call
- ✅ Booking status update with API call
- ✅ Enhanced TypeScript interfaces with complete data
- ✅ Error handling and toast notifications
- ✅ Loading state management

**Data Now Fetches From:**
- `GET /api/worker/profile` - Worker profile data
- `GET /api/worker/bookings` - Assigned bookings
- `GET /api/reviews/worker` - Worker reviews
- `PUT /api/worker/availability` - Update availability
- `PUT /api/bookings/:bookingId/status` - Update booking status

**UI Improvements:**
- Verification badge displays actual status
- Ratings display actual average from reviews
- Bookings show actual job list with status
- Emergency flag visible
- Payment status displayed
- User contact info visible
- Action buttons contextually enabled

**Features Now Working:**
- Toggle online/offline status
- Accept/reject job requests
- Mark jobs as in progress
- Complete jobs
- View customer details
- View earnings and ratings

---

## Phase 4: Implementation Roadmap (Next Steps)

### 4.1 Immediate Priorities (Week 1-2)

#### Admin Dashboard Enhancement
- [ ] Integrate admin stats API calls
- [ ] Add real data to worker verification UI
- [ ] Add booking analytics
- [ ] Add revenue charts
- [ ] Add worker performance metrics
- [ ] Implement worker search and pagination
- [ ] Add payment history view
- [ ] Add audit log viewer

#### User Dashboard Enhancement
- [ ] Add booking status filters
- [ ] Add booking detail modal
- [ ] Add reschedule capability
- [ ] Add cancel with reason modal
- [ ] Add payment history
- [ ] Show past reviews
- [ ] Add favorite workers list

#### Frontend Payment Integration
- [ ] Add Razorpay SDK integration
- [ ] Add Stripe Elements integration
- [ ] Implement payment order flow
- [ ] Handle payment verification
- [ ] Show payment status in bookings
- [ ] Add payment receipt/invoice
-[ ] Add refund request UI

### 4.2 Medium-term Improvements (Week 3-4)

#### Location Features
- [ ] Google Maps API integration
- [ ] Worker location display
- [ ] Service area mapping
- [ ] Distance-based worker filtering
- [ ] Address autocompletion
- [ ] Direction to worker location

#### Advanced Booking Features
- [ ] Date/time slot availability checking
- [ ] Prevent double-booking
- [ ] Advance booking notice validation (min 1 hour)
- [ ] Service buffer time calculation
- [ ] Recurring bookings support
- [ ] Booking packages support

#### Real-time Features
- [ ] Socket.IO integration for live notifications
- [ ] Worker location tracking (live GPS)
- [ ] Real-time booking updates
- [ ] Live chat between user and worker
- [ ] Notification badges/sounds

#### Worker Availability Management
- [ ] Weekly schedule calendar interface
- [ ] Time slot management
- [ ] Block dates feature
- [ ] Bulk availability updates
- [ ] Automatic offline-by-schedule

### 4.3 Long-term Features (Month 2-3)

#### Analytics & Reporting
- [ ] Admin dashboard charts (Chart.js/Recharts)
- [ ] Revenue trends
- [ ] Worker performance metrics
- [ ] Customer satisfaction reports
- [ ] Booking cancellation analysis
- [ ] Emergency booking statistics

#### Internationalization
- [ ] i18n structure setup (i18next)
- [ ] Key extraction for all UI text
- [ ] Translation files for regional languages
- [ ] RTL support for Arabic/Hindi
- [ ] Multi-currency support

#### Quality Assurance
- [ ] Review moderation system
- [ ] Fake review detection
- [ ] Worker suspension on low ratings
- [ ] Rating threshold enforcement
- [ ] Reward system for high-rated workers

#### Advanced Payment
- [ ] Split payment (user + platform + worker)
- [ ] Payment scheduling
- [ ] Subscription plans
- [ ] Promotional codes/discounts
- [ ] Payment disputes handling

#### Admin Features
- [ ] User account suspension/activation
- [ ] Worker removal/blacklist
- [ ] Booking dispute resolution
- [ ] Commission management
- [ ] SMS/Email notifications
- [ ] Bulk operations

### 4.4 Deployment Preparation

#### Database Migrations
- [ ] Generate down migrations for safety
- [ ] Test migrations on staging
- [ ] Plan execution without downtime
- [ ] Backup procedures

#### API Documentation
- [ ] Swagger/OpenAPI documentation
- [ ] API rate limiting documentation
- [ ] Error codes reference
- [ ] Authentication flow documentation

#### Frontend Build & Deployment
- [ ] Production build optimization
- [ ] Code splitting verification
- [ ] Bundle size analysis
- [ ] Performance monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Analytics setup (GA/Mixpanel)

#### Server Deployment
- [ ] PM2 configuration for production
- [ ] Nginx/Apache reverse proxy setup
- [ ] SSL certificate setup
- [ ] Database backups automation
- [ ] Log rotation & monitoring
- [ ] Performance monitoring (New Relic/DataDog)

---

## Phase 5: Current Code Status

### Security-Related Changes Complete ✅
- JWT authentication enhanced
- Authorization middleware implemented
- Role-based access control enforced
- Rate limiting enabled
- Security headers added
- Logout endpoint added

### Payment System Implementation In Progress ✅
- Payment service architecture ready
- Multiple gateway support
- Payment model for database ops
- API endpoints defined
- Frontend integration prepared

### Dashboard Integration In Progress ⏳
- WorkerDashboard API integration started
- AdminDashboard pending (next iteration)
- UserDashboard pending (next iteration)

### Missing Implementation Priority Order:
1. **HIGH**: AdminDashboard API integration
2. **HIGH**: Location features (Google Maps)
3. **HIGH**: Real-time notifications (Socket.IO)
4. **MEDIUM**: Analytics dashboard
5. **MEDIUM**: Emergency booking priority queue
6. **MEDIUM**: Worker availability scheduling
7. **LOW**: Multi-language support
8. **LOW**: Advanced search filters

---

## Database Migration Instructions

### To apply new tables to existing database:

```bash
# 1. Backup current database
mysqldump -u root -p service_website > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply new schema (run from server directory)
mysql -u root -p service_website < db/init.sql

# 3. If running incrementally, use ALTER statements
mysql -u root -p service_website < db/migrations/add_payment_tables.sql
mysql -u root -p service_website < db/migrations/add_location_columns.sql
```

---

## Testing Checklist

### Backend Testing
- [ ] Test all new API endpoints with Postman/Curl
- [ ] Test authorization middleware
- [ ] Test rate limiting
- [ ] Test payment order creation
- [ ] Test payment verification
- [ ] Test refund processing
- [ ] Test auth role-based access

### Frontend Testing
- [ ] Test WorkerDashboard data loading
- [ ] Test availability toggle
- [ ] Test booking status updates
- [ ] Test payment order creation
- [ ] Test payment verification flow
- [ ] Test error handling
- [ ] Test loading states

### Security Testing
- [ ] Test unauthorized access to admin endpoints
- [ ] Test JWT token expiry
- [ ] Test rate limiting
- [ ] Test SQL injection prevention
- [ ] Test CORS restrictions
- [ ] Test ownership verification

---

## Production Deployment Checklist

Before deploying to production:
- [ ] Update all .env variables
- [ ] Run database migrations
- [ ] Test all payment gateways
- [ ] Verify CORS settings
- [ ] Enable HTTPS/SSL
- [ ] Set rate limiting thresholds
- [ ] Configure email service
- [ ] Set up error tracking (Sentry)
- [ ] Configure backups
- [ ] Test rollback procedures
- [ ] Load testing on staging
- [ ] Security audit
- [ ] Performance profiling

---

## Support & Troubleshooting

### Common Issues & Solutions:

**Issue: "Invalid token" errors**
- Solution: Verify JWT_SECRET matches on backend
- Check token expiry: tokens expire after 7 days

**Issue: Payment gateway errors**
- Solution: Verify API keys in .env
- Test payment service in development first
- Check gateway status page

**Issue: Database migration fails**
- Solution: Check database charset is utf8mb4
- Verify user has ALTER TABLE permissions
- Check for foreign key conflicts

**Issue: Authorization denied errors**
- Solution: Verify user role in database
- Check middleware is properly applied to routes
- Verify token contains user_id and role

---

## Next Priority Task: AdminDashboard Integration

The AdminDashboard component needs the following updates:
1. Replace hardcoded zeros with real API calls to `/api/stats`
2. Fetch pending workers from `/api/worker/pending`
3. Fetch users from `/api/users`
4. Fetch bookings from `/api/bookings`
5. Implement worker verification with actual API calls
6. Add pagination for large datasets
7. Add date range filtering
8. Add analytics charts using Recharts

See `src/components/dashboards/AdminDashboard.tsx` for implementation details.