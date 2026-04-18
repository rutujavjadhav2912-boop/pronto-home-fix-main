# Payment Integration Quick Reference Guide

## Payment System Architecture Overview

```
┌─────────────────────┐
│   User Initiates    │
│  Payment (Booking)  │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────┐
│ Frontend: Create Order   │
│ POST /api/payments/      │
│  create-order            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ PaymentService:          │
│ Initialize Gateway       │
│ (Razorpay/Stripe)        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Gateway Returns Order ID     │
│ + API Keys/Client Secret     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend: Show Checkout      │
│ (Razorpay/Stripe Modal)      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ User: Complete Payment       │
│ (Gateway handles)            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend: Verify Payment     │
│ POST /api/payments/verify    │
│ (with signature)             │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Backend: Validate Signature  │
│ Update Payment Record        │
│ Update Booking Status        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Create Notification          │
│ Return Success to User       │
└──────────────────────────────┘
```

## Files Modified/Created for Payment

### Backend Files

**1. `server/services/paymentService.js` (NEW)**
- `createPaymentOrder()` - Creates order with Razorpay/Stripe
- `verifyPayment()` - Verifies payment signature
- `processRefund()` - Handles refunds
- `getPaymentStatus()` - Gets payment status

**2. `server/models/paymentModel.js` (NEW)**
- `create()` - Insert payment record
- `getByBookingId()` - Get payment by booking
- `updateStatus()` - Update payment status
- `updateByBookingId()` - Update via booking
- `getStatistics()` - Get payment stats
- `processRefund()` - Handle refunds
- `getForAdmin()` - Get payments for admin

**3. `server/controllers/bookingController.js` (MODIFIED)**
```typescript
// NEW Methods:
createPaymentOrder()    // POST /api/payments/create-order
verifyPayment()        // POST /api/payments/verify
processRefund()        // POST /api/payments/refund
getPaymentDetails()    // GET /api/payments/booking/:id
```

**4. `server/routes/api.js` (MODIFIED)**
```typescript
// NEW Endpoints:
router.post('/payments/create-order', verifyToken, BookingController.createPaymentOrder);
router.post('/payments/verify', verifyToken, BookingController.verifyPayment);
router.post('/payments/refund', verifyToken, requireAdmin, BookingController.processRefund);
router.get('/payments/booking/:bookingId', verifyToken, BookingController.getPaymentDetails);
```

### Frontend Files

**1. `src/lib/api.ts` (MODIFIED)**
```typescript
// NEW Functions:
createPaymentOrder()    // Create payment order
verifyPayment()        // Verify payment
getPaymentDetails()    // Get payment info
processRefund()        // Request refund
```

### Database Files

**1. `server/db/init.sql` (MODIFIED)**
```sql
-- NEW Tables:
CREATE TABLE payments (...)
CREATE TABLE locations (...)
CREATE TABLE worker_documents (...)
CREATE TABLE audit_logs (...)
CREATE TABLE worker_availability_schedule (...)

-- Modified Tables:
ALTER TABLE bookings ADD COLUMN ...
ALTER TABLE worker_profiles ADD COLUMN ...
```

## Environment Variables Required

```bash
# Payment Gateway Configuration
DEFAULT_PAYMENT_GATEWAY=razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

## API Endpoints

### 1. Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "booking_id": 123
}

Response:
{
  "status": "ok",
  "order": {
    "id": "order_xxxxx",
    "amount": 50000,  // in paisa
    "currency": "INR",
    "status": "created"
  },
  "gateway": "razorpay",
  "keyId": "rzp_test_xxxxx"
}
```

### 2. Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "booking_id": 123,
  "payment_id": "pay_xxxxx",
  "order_id": "order_xxxxx",
  "signature": "xxxxx",
  "gateway": "razorpay"
}

Response:
{
  "status": "ok",
  "message": "Payment verified and completed successfully",
  "paymentId": "pay_xxxxx"
}
```

### 3. Get Payment Details
```http
GET /api/payments/booking/123
Authorization: Bearer {token}

Response:
{
  "status": "ok",
  "payment": {
    "id": 1,
    "booking_id": 123,
    "amount": 500.00,
    "currency": "INR",
    "status": "completed",
    "transaction_id": "txn_xxxxx",
    "created_at": "2026-04-14T10:00:00Z"
  }
}
```

### 4. Process Refund (Admin Only)
```http
POST /api/payments/refund
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "booking_id": 123,
  "amount": 500.00,
  "reason": "User requested cancellation"
}

Response:
{
  "status": "ok",
  "refundId": "ref_xxxxx",
  "message": "Refund processed successfully"
}
```

## Razorpay Integration Steps

### 1. Get API Keys
- Visit: https://dashboard.razorpay.com/app/keys
- Copy Key ID and Key Secret
- Add to `server/.env`

### 2. Frontend Implementation
```typescript
// Load Razorpay script
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Create payment order
const orderResponse = await createPaymentOrder(token, bookingId);

// Initialize Razorpay
const options = {
  key: orderResponse.keyId,
  amount: orderResponse.order.amount,
  currency: orderResponse.order.currency,
  order_id: orderResponse.order.id,
  handler: async (response) => {
    // Verify payment
    await verifyPayment(token, {
      booking_id: bookingId,
      payment_id: response.razorpay_payment_id,
      order_id: response.razorpay_order_id,
      signature: response.razorpay_signature,
      gateway: 'razorpay'
    });
  }
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

## Stripe Integration Steps

### 1. Get API Keys
- Visit: https://dashboard.stripe.com/apikeys
- Copy Secret Key and Publishable Key
- Add to `server/.env`

### 2. Frontend Implementation
```typescript
// Load Stripe.js
<script src="https://js.stripe.com/v3/"></script>

// Create payment intent
const piResponse = await createPaymentOrder(token, bookingId);

// Initialize Stripe Elements
const stripe = window.Stripe(piResponse.publishableKey);
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// Handle payment
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { paymentIntent, error } = await stripe.confirmCardPayment(
    piResponse.paymentIntent.client_secret,
    { payment_method: { card: cardElement } }
  );

  if (!error) {
    await verifyPayment(token, {
      booking_id: bookingId,
      payment_id: paymentIntent.id,
      gateway: 'stripe'
    });
  }
});
```

## Payment Flow Diagrams

### Razorpay Flow
```
┌─────────┐
│  Razorpay Checkout (Modal)
│  ├─ Email
│  ├─ Phone
│  ├─ Card/Wallet/UPI
│  └─ Confirm
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Payment Processed    │
│ Return to App        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Verify Signature     │
│ Update Booking       │
│ Create Notification  │
└──────────────────────┘
```

### Stripe Flow
```
┌─────────────────────┐
│ Stripe Elements     │
│ ├─ Card Number      │
│ ├─ Expiry           │
│ ├─ CVC              │
│ └─ Name             │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ Confirm Payment      │
│ (3D Secure if needed)│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Verify with Backend  │
│ Update Booking       │
│ Create Notification  │
└──────────────────────┘
```

## Error Handling

### Common Error Responses

```json
{
  "status": "error",
  "message": "Payment verification failed",
  "code": "VERIFICATION_FAILED"
}
```

### Error Codes
- `VERIFICATION_FAILED` - Signature mismatch
- `PAYMENT_NOT_FOUND` - Payment record missing
- `BOOKING_NOT_FOUND` - Booking doesn't exist
- `ACCESS_DENIED` - User doesn't own booking
- `ALREADY_PAID` - Booking already paid
- `REFUND_FAILED` - Refund processing error

## Testing Payment Gateway (Development)

### Using Razorpay Test Keys
- Key ID: `rzp_test_1DP5gbNptcWd65`
- Key Secret: `EnLs1ZeeffFFEzDKqZV1dVAm`

Test Cards:
```
Visa:     4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Any expiry (future) and any CVC
```

### Using Stripe Test Keys
- Publishable: `pk_test_51HZ...`
- Secret: `sk_test_51HZ...`

Test Cards:
```
Visa:           4242 4242 4242 4242
Mastercard:     5555 5555 5555 4444
Amex:           3782 822463 10005
Any expiry (future) and any CVC
```

## Payment Status Workflow

```
Order Created (pending)
    ↓
User Initiates Gateway Payment
    ↓
Payment Processed by Gateway
    ↓
Signature Generated
    ↓
Frontend: Send Verification Request
    ↓
Backend: Verify Signature
    │
    ├─ Valid   → Status: completed
    │           Booking: paid
    │           Notification: sent
    │
    └─ Invalid → Status: failed
                Error: recorded
                Notification: error sent
```

## Webhook Integration (Recommended for Production)

For asynchronous payment confirmations:

```javascript
// In production, implement webhooks:
// Razorpay: webhooks.razorpay.com
// Stripe: stripe.com/docs/webhooks

app.post('/webhooks/razorpay', (req, res) => {
  const { event, payload } = req.body;
  
  if (event === 'payment.authorized') {
    // Update payment in database
    // Confirm booking
  }
  
  res.json({ ok: true });
});
```

## Security Considerations

✅ Implemented:
- Server-side signature verification
- User authentication required
- Authorization checks
- Payment record isolation
- Secure token handling

⚠️ Recommended:
- HTTPS/SSL in production
- PCI compliance validation
- Regular security audits
- Encryption of sensitive data
- Webhook signature verification
- Rate limiting on payment endpoints
- Audit logging of all transactions

## Production Checklist

- [ ] Update .env with production API keys
- [ ] Enable HTTPS/SSL
- [ ] Verify CORS settings
- [ ] Test payment gateway integration
- [ ] Configure webhook URLs
- [ ] Set up error tracking (Sentry)
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Load test payment endpoints
- [ ] Security audit
- [ ] Monitor transaction success rate
- [ ] Set up alerting for payment failures

## Troubleshooting

### Issue: "Invalid signature"
**Solution**: 
- Verify Razorpay/Stripe API keys in .env
- Check gateway credentials haven't changed
- Verify order amount matches in both systems

### Issue: "Payment not found"
**Solution**:
- Check booking ID is valid
- Verify payment record was created
- Check database connectivity

### Issue: "Access denied"
**Solution**:
- Verify user ID matches booking user_id
- Check authentication token is valid
- Verify token hasn't expired

### Issue: Payment gateway timeout
**Solution**:
- Check network connectivity
- Verify gateway API endpoint is accessible
- Check firewall rules
- Review rate limiting

---

**For complete implementation examples, refer to:**
- `IMPLEMENTATION_GUIDE.md` - Full implementation roadmap
- `server/services/paymentService.js` - Payment service code
- `server/controllers/bookingController.js` - Payment controller
- `src/lib/api.ts` - Frontend API functions