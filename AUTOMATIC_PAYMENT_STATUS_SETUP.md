# Automatic Payment Status Updates - Setup Guide

## 🎯 **Goal**
Ensure that newly coming orders automatically have their payment status updated to "Paid" when payments are successful through Stripe webhooks.

## ✅ **What's Already Implemented**

### **1. Enhanced Webhook Handler**
- ✅ **Multiple Event Support**: Handles `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.expired`
- ✅ **Comprehensive Logging**: Detailed logs for debugging webhook issues
- ✅ **Error Handling**: Graceful handling of webhook failures
- ✅ **Automatic Status Updates**: Updates payment status to "paid" when payment succeeds

### **2. Backend Configuration**
- ✅ **Webhook Middleware**: Added raw body parsing for `/api/orders/webhook`
- ✅ **Test Endpoint**: Available at `/api/orders/webhook/test` for debugging
- ✅ **Multiple Event Types**: Handles all relevant Stripe payment events

### **3. Database Integration**
- ✅ **Order Model**: Properly stores `stripePaymentIntentId` and `stripeSessionId`
- ✅ **Status Updates**: Automatically updates `paymentStatus`, `paidAt`, and `status` fields
- ✅ **Metadata Storage**: Stores Stripe session metadata for order tracking

## 🚀 **Setup Instructions**

### **Step 1: Environment Variables**
Create a `.env` file in the `BACKEND` directory with:

```bash
# Database Configuration
MONGO_URI=mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 2: Stripe Webhook Configuration**

#### **2.1 Create Webhook Endpoint**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set **Endpoint URL**: `http://localhost:5000/api/orders/webhook`
4. Select **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.expired`

#### **2.2 Get Webhook Secret**
1. After creating the webhook, click on it
2. Go to **"Signing secret"** section
3. Click **"Reveal"** and copy the secret
4. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### **Step 3: Test Webhook Configuration**

#### **3.1 Test Webhook Endpoint**
```bash
# Test if webhook endpoint is accessible
curl -X GET http://localhost:5000/api/orders/webhook/test
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook endpoint is working",
  "timestamp": "2024-01-XX...",
  "hasWebhookSecret": true,
  "webhookSecretLength": 32
}
```

#### **3.2 Test with Stripe CLI (Optional)**
```bash
# Install Stripe CLI
# Forward events to local webhook
stripe listen --forward-to localhost:5000/api/orders/webhook
```

### **Step 4: Verify Automatic Updates**

#### **4.1 Create Test Order**
1. Go to marketplace
2. Add items to cart
3. Complete checkout process
4. Make a test payment

#### **4.2 Check Webhook Logs**
Look for these logs in your backend console:
```
🔔 Webhook received: { timestamp, headers, bodyLength }
✅ Webhook signature verified successfully
💳 Checkout session completed: { sessionId, paymentStatus, metadata }
✅ Marketplace order updated successfully: { orderId, newPaymentStatus }
```

#### **4.3 Verify Order Status**
1. Go to Marketplace Manager Dashboard
2. Check Orders tab
3. Verify payment status is "Paid" (green badge)

## 🔧 **Webhook Event Handling**

### **Events Handled:**

#### **1. `checkout.session.completed`**
- **Trigger**: When customer completes payment
- **Action**: Updates order status to "paid"
- **Fields Updated**: `paymentStatus`, `paidAt`, `status`, `stripePaymentIntentId`

#### **2. `payment_intent.succeeded`**
- **Trigger**: When payment is successfully processed
- **Action**: Backup method to ensure order is marked as paid
- **Fields Updated**: `paymentStatus`, `paidAt`, `status`

#### **3. `payment_intent.payment_failed`**
- **Trigger**: When payment fails
- **Action**: Updates order status to "failed"
- **Fields Updated**: `paymentStatus`, `status`

#### **4. `checkout.session.expired`**
- **Trigger**: When checkout session expires
- **Action**: Updates order status to "cancelled"
- **Fields Updated**: `paymentStatus`, `status`

## 📊 **Monitoring & Debugging**

### **Webhook Logs to Watch For:**

#### **Success Logs:**
```
✅ Webhook signature verified successfully
💳 Checkout session completed: { sessionId, paymentStatus, metadata }
✅ Marketplace order updated successfully: { orderId, newPaymentStatus }
```

#### **Error Logs:**
```
❌ Webhook signature verification failed: { error, signature, hasBody }
❌ No orderId found in session metadata: { metadata }
❌ Order not found: { orderId }
❌ Error updating marketplace order status: { error, stack, orderId }
```

### **Test Webhook Endpoint:**
- **URL**: `GET /api/orders/webhook/test`
- **Purpose**: Verify webhook endpoint is accessible
- **Response**: Configuration status and environment variables

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Webhook Not Receiving Events**
- ✅ Check webhook URL in Stripe dashboard
- ✅ Verify server is running on correct port
- ✅ Check firewall/network settings
- ✅ Use Stripe CLI for local testing

#### **2. Signature Verification Failed**
- ✅ Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- ✅ Check webhook secret in Stripe dashboard
- ✅ Ensure raw body parsing is enabled

#### **3. Orders Not Updating**
- ✅ Check webhook logs for errors
- ✅ Verify order ID in session metadata
- ✅ Check database connection
- ✅ Use manual update as fallback

#### **4. Environment Variables Not Loading**
- ✅ Restart server after adding `.env` file
- ✅ Check `.env` file location (should be in BACKEND directory)
- ✅ Verify variable names match exactly

## 🎉 **Expected Result**

After proper setup:

1. **Customer completes payment** → Stripe sends webhook
2. **Webhook received** → Signature verified
3. **Order found** → Status updated to "paid"
4. **Database updated** → `paymentStatus: "paid"`, `paidAt: timestamp`
5. **Admin sees updated status** → Green "Paid" badge in Orders tab

## 🔄 **Fallback Options**

If webhook fails:
1. **Manual Update**: Use "Update Status" button in Orders tab
2. **Stripe Dashboard**: Check payment status in Stripe
3. **Database Query**: Direct database update if needed

## 📞 **Support**

If you encounter issues:
1. Check webhook logs in backend console
2. Test webhook endpoint: `GET /api/orders/webhook/test`
3. Verify Stripe webhook configuration
4. Use manual update feature as temporary solution

The automatic payment status update system is now fully configured and ready to handle all new orders!
