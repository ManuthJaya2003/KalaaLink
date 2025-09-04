# 🔧 Webhook Setup Guide - Fix Automatic Payment Status Updates

## 🚨 **Problem Identified**

The webhook endpoint is working, but **`STRIPE_WEBHOOK_SECRET` is not set**, which means:
- ❌ Webhook can't verify Stripe's signature
- ❌ Payment status won't update automatically
- ❌ Orders remain "pending" even after successful payments

## ✅ **Solution Steps**

### **Step 1: Create Environment Variables File**

Create a `.env` file in the `BACKEND` directory with your Stripe credentials:

```bash
# Database Configuration
MONGO_URI=mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (REQUIRED FOR WEBHOOKS)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 2: Get Your Stripe Webhook Secret**

#### **2.1 Go to Stripe Dashboard**
1. Visit [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"** (or edit existing one)

#### **2.2 Configure Webhook Endpoint**
- **Endpoint URL**: `http://localhost:5000/api/orders/webhook`
- **Events to send**:
  - ✅ `checkout.session.completed`
  - ✅ `payment_intent.succeeded`
  - ✅ `payment_intent.payment_failed`
  - ✅ `checkout.session.expired`

#### **2.3 Get Webhook Secret**
1. After creating the webhook, click on it
2. Go to **"Signing secret"** section
3. Click **"Reveal"** and copy the secret (starts with `whsec_`)
4. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### **Step 3: Restart Backend Server**

After adding the `.env` file:
```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd BACKEND
npm start
```

### **Step 4: Verify Webhook Configuration**

Test the webhook endpoint again:
```bash
# Test webhook endpoint
curl -X GET http://localhost:5000/api/orders/webhook/test
```

**Expected response after setup:**
```json
{
  "success": true,
  "message": "Webhook endpoint is working",
  "timestamp": "2025-09-04T19:04:54.785Z",
  "hasWebhookSecret": true,
  "webhookSecretLength": 32
}
```

**Key change**: `hasWebhookSecret` should be `true` and `webhookSecretLength` should be `32`.

## 🧪 **Testing the Fix**

### **Test 1: Create a Test Order**
1. Go to your marketplace
2. Add items to cart
3. Complete checkout process
4. Make a test payment

### **Test 2: Check Webhook Logs**
Look for these logs in your backend console:
```
🔔 Webhook received: { timestamp, headers, bodyLength }
✅ Webhook signature verified successfully
💳 Checkout session completed: { sessionId, paymentStatus, metadata }
✅ Marketplace order updated successfully: { orderId, newPaymentStatus }
```

### **Test 3: Verify Order Status**
1. Go to Marketplace Manager Dashboard
2. Check Orders tab
3. Payment status should automatically show "Paid" (green badge)

## 🔍 **Troubleshooting**

### **If webhook still doesn't work:**

#### **1. Check Environment Variables**
```bash
# In your backend console, you should see:
console.log('Environment check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
});
```

#### **2. Check Webhook URL in Stripe**
- Make sure the URL is exactly: `http://localhost:5000/api/orders/webhook`
- No trailing slash, correct port (5000)

#### **3. Check Server Logs**
Look for webhook-related logs:
- `🔔 Webhook received` - Webhook is being called
- `✅ Webhook signature verified` - Secret is working
- `❌ Webhook signature verification failed` - Secret is wrong

#### **4. Use Stripe CLI for Testing (Optional)**
```bash
# Install Stripe CLI
# Forward events to local webhook
stripe listen --forward-to localhost:5000/api/orders/webhook
```

## 🚀 **Alternative: Use Manual Update (Temporary Fix)**

If you need to fix existing orders immediately:

1. **Go to Orders tab** in Marketplace Manager Dashboard
2. **Click "Update Status"** on pending orders
3. **Select "paid"** from the status options
4. **Confirm the update**

This will immediately change the status to "Paid" while you set up the webhook.

## 📋 **Quick Checklist**

- [ ] Created `.env` file in BACKEND directory
- [ ] Added `STRIPE_WEBHOOK_SECRET` to `.env`
- [ ] Created webhook endpoint in Stripe dashboard
- [ ] Set webhook URL to `http://localhost:5000/api/orders/webhook`
- [ ] Selected correct events (`checkout.session.completed`, etc.)
- [ ] Restarted backend server
- [ ] Tested webhook endpoint (should show `hasWebhookSecret: true`)
- [ ] Created test order and verified automatic status update

## 🎉 **Expected Result**

After proper setup:
1. **Customer completes payment** → Stripe sends webhook
2. **Webhook received** → Signature verified with secret
3. **Order found** → Status updated to "paid"
4. **Admin sees update** → Green "Paid" badge appears automatically

The automatic payment status update will work for all new orders!
