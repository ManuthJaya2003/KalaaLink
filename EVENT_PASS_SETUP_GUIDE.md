# Event Registration PDF Generation - Setup Guide

## 🚨 **Issue Identified**
The PDF was not automatically generated because the **Stripe webhook is not properly configured**. The webhook requires environment variables that are missing.

## ✅ **Solution Steps**

### **Step 1: Create Environment Variables File**

Create a `.env` file in the `BACKEND` directory with the following content:

```bash
# Database Configuration
MONGO_URI=mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (REQUIRED FOR WEBHOOKS)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# JWT Secret
JWT_SECRET=kalaalink_secret_key_2024
```

### **Step 2: Get Your Stripe Credentials**

#### **2.1 Get Stripe Secret Key**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
3. Replace `sk_test_your_stripe_secret_key_here` in the `.env` file

#### **2.2 Get Stripe Webhook Secret**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"** (or edit existing one)
3. Set **Endpoint URL**: `http://localhost:5000/events/webhook`
4. Select **Events to send**:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. After creating, click on the webhook
6. Go to **"Signing secret"** section
7. Click **"Reveal"** and copy the secret (starts with `whsec_`)
8. Replace `whsec_your_webhook_secret_here` in the `.env` file

### **Step 3: Restart Backend Server**

After creating the `.env` file:
```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd BACKEND
npm start
```

### **Step 4: Test the Implementation**

#### **4.1 Test Webhook Endpoint**
```bash
# Test if webhook endpoint is accessible
curl -X GET http://localhost:5000/events/webhook
```

#### **4.2 Test Event Registration**
1. Go to your frontend
2. Navigate to Artist Dashboard → Events
3. Register for an event
4. Complete the Stripe payment
5. Check the backend console for webhook logs
6. Check if PDF is generated in `BACKEND/passes/` directory

### **Step 5: Verify PDF Generation**

After successful registration, you should see:
- ✅ Console logs showing webhook processing
- ✅ PDF file created in `BACKEND/passes/` directory
- ✅ Database record updated with `passGenerated: true`

## 🔍 **Debugging Steps**

### **Check Webhook Logs**
Look for these console messages:
```
🔔 Event registration webhook received
✅ Webhook signature verified successfully
📋 Event type: checkout.session.completed
Processing event registration webhook: {...}
✅ ArtistRegistration record created for [Artist Name]
✅ Event pass PDF generated for [Artist Name]: [file path]
```

### **Check Database**
Verify the `ArtistRegistration` collection has:
- `passGenerated: true`
- `passFilePath: "path/to/generated/pdf"`

### **Check File System**
Verify PDF files are created in:
- `BACKEND/passes/event-pass-REG-*-timestamp.pdf`

## 🚀 **For Production Deployment**

### **Using ngrok for Local Testing**
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
npx ngrok http 5000

# Update Stripe webhook URL to:
# https://your-ngrok-url.ngrok.io/events/webhook
```

### **Production Webhook URL**
Update Stripe webhook endpoint to:
```
https://your-domain.com/events/webhook
```

## 📋 **Complete Workflow**

1. **Artist registers** for event via frontend
2. **Stripe checkout** session created with metadata
3. **Payment processed** successfully
4. **Stripe webhook** calls `/events/webhook`
5. **Webhook verifies** signature using `STRIPE_WEBHOOK_SECRET`
6. **Artist added** to event's registered artists
7. **ArtistRegistration record** created with unique ID
8. **PDF pass generated** automatically with QR code
9. **Database updated** with pass generation status

## ⚠️ **Important Notes**

- **Environment variables are required** for webhook to work
- **Webhook secret must match** Stripe dashboard configuration
- **PDF generation is asynchronous** - check console logs for status
- **File cleanup** is available via `cleanupOldPasses()` utility
- **Error handling** ensures registration succeeds even if PDF fails

## 🎯 **Expected Results**

After proper setup:
- ✅ Automatic PDF generation on successful payments
- ✅ Professional event passes with QR codes
- ✅ Downloadable passes via API endpoint
- ✅ Complete registration tracking in database
