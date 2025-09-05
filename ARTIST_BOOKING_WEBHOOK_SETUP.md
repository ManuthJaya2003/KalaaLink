# Artist Booking Webhook Setup Guide

## 🎯 **Overview**
This guide covers the enhanced webhook system for automatic artist booking status updates based on Stripe payment events.

## 🔧 **What's New**

### **Enhanced Webhook Events**
The system now handles multiple Stripe events:
- `checkout.session.completed` - Payment successful via checkout
- `payment_intent.succeeded` - Payment successful via payment intent
- `payment_intent.payment_failed` - Payment failed
- `checkout.session.expired` - Checkout session expired

### **Automatic Status Updates**
- **Payment Success**: `paymentStatus: "paid"`, `status: "upcoming"`
- **Payment Failure**: `paymentStatus: "failed"`, `status: "cancelled"`
- **Session Expired**: `paymentStatus: "failed"`, `status: "cancelled"`

## 🚀 **Setup Instructions**

### **1. Environment Variables**
Ensure these are set in your `.env` file:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:3000
```

### **2. Stripe Dashboard Configuration**

#### **Webhook Endpoint Setup**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → Webhooks**
3. Add endpoint: `http://localhost:5000/bookings/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.expired`
5. Copy the webhook signing secret

#### **For Production**
- Use ngrok for local testing: `npx ngrok http 5000`
- Update webhook URL to: `https://your-ngrok-url.ngrok.io/bookings/webhook`

### **3. Testing the Implementation**

#### **Test Webhook Endpoint**
```bash
curl -X POST http://localhost:5000/bookings/webhook-test
```

#### **Check Booking Status**
```bash
GET http://localhost:5000/bookings/test-payment/[booking-id]
```

## 📋 **Complete Workflow**

### **1. User Creates Booking**
- Booking created with `paymentStatus: "pending"`, `status: "upcoming"`
- User redirected to Stripe checkout

### **2. Payment Success**
- Stripe sends `checkout.session.completed` or `payment_intent.succeeded`
- Webhook automatically updates: `paymentStatus: "paid"`, `status: "upcoming"`
- Artist Manager Dashboard shows "Paid & Confirmed"

### **3. Payment Failure**
- Stripe sends `payment_intent.payment_failed`
- Webhook automatically updates: `paymentStatus: "failed"`, `status: "cancelled"`
- Artist Manager Dashboard shows "Cancelled"

### **4. Session Expired**
- Stripe sends `checkout.session.expired`
- Webhook automatically updates: `paymentStatus: "failed"`, `status: "cancelled"`
- Only updates if booking is still pending

## 🔍 **Debugging**

### **Check Webhook Logs**
Look for these logs in your backend console:
```
Webhook event received: checkout.session.completed
Processing checkout completion for booking: [booking-id]
✅ Artist booking [booking-id] marked as paid
```

### **Common Issues**

#### **Webhook Not Receiving Events**
- Check if webhook endpoint is accessible
- Verify webhook secret is correct
- Use ngrok for local testing

#### **Payment Status Not Updating**
- Check webhook logs for errors
- Verify bookingId is in metadata
- Test with manual status update endpoint

#### **Multiple Status Updates**
- System is designed to handle duplicate events safely
- Only updates if current status allows it

## 🧪 **Testing Scenarios**

### **Test 1: Successful Payment**
1. Create a booking
2. Complete payment with test card: `4242 4242 4242 4242`
3. Check Artist Manager Dashboard - should show "Paid & Confirmed"

### **Test 2: Failed Payment**
1. Create a booking
2. Use declined card: `4000 0000 0000 0002`
3. Check Artist Manager Dashboard - should show "Cancelled"

### **Test 3: Expired Session**
1. Create a booking
2. Don't complete payment within 24 hours
3. Check Artist Manager Dashboard - should show "Cancelled"

## 📊 **Status Mapping**

| Payment Event | paymentStatus | status | Dashboard Display |
|---------------|---------------|--------|-------------------|
| Success | `paid` | `upcoming` | "Paid & Confirmed" |
| Failed | `failed` | `cancelled` | "Cancelled" |
| Expired | `failed` | `cancelled` | "Cancelled" |
| Pending | `pending` | `upcoming` | "Pending Payment" |

## 🛡️ **Safety Features**

### **Idempotency**
- Webhook handlers are idempotent
- Duplicate events won't cause issues
- Status updates are safe to retry

### **Error Handling**
- Comprehensive error logging
- Graceful failure handling
- Webhook returns proper HTTP status codes

### **Data Integrity**
- Validates bookingId exists before updating
- Checks current status before making changes
- Preserves existing functionality

## 🔄 **Backward Compatibility**

### **Existing Features Preserved**
- ✅ Manager-added artists
- ✅ Self-registered artists
- ✅ Revenue calculations
- ✅ Dashboard statistics
- ✅ Image handling
- ✅ Manual status updates

### **New Features Added**
- ✅ Automatic payment status updates
- ✅ Real-time webhook processing
- ✅ Enhanced error handling
- ✅ Comprehensive logging

## 📞 **Support**

### **Debug Endpoints**
- `POST /bookings/webhook-test` - Test webhook connectivity
- `GET /bookings/test-payment/:bookingId` - Check booking status

### **Logs to Monitor**
- Webhook event reception
- Payment processing status
- Error messages and stack traces

---

## ✅ **Implementation Complete**

The enhanced webhook system is now ready for testing. All existing functionalities remain intact while adding automatic payment status updates based on Stripe events.
