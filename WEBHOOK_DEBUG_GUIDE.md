# Webhook & Payment Verification Debug Guide

## 🚨 **Current Issue**
Payment verification is failing because the Stripe webhook isn't working properly.

## 🔍 **Debugging Steps**

### **Step 1: Check Backend Console**
When you complete a Stripe payment, look for these logs in your backend console:
```
Webhook event received: checkout.session.completed
Event data: {...}
Processing payment completion for booking ID: [your-booking-id]
✅ Booking [id] successfully marked as paid
```

**If you don't see these logs → Webhook isn't working**

### **Step 2: Test Webhook Endpoint**
Test if the webhook endpoint is accessible:
```bash
curl -X POST http://localhost:5000/eventBookings/webhook-test
```

**Expected response:**
```json
{
  "message": "Webhook test successful",
  "timestamp": "...",
  "headers": {...},
  "body": {...}
}
```

### **Step 3: Check Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → Webhooks**
3. Check if your endpoint is listed: `http://localhost:5000/eventBookings/webhook`
4. Look for failed webhook attempts (red indicators)

### **Step 4: Test Manual Payment Verification**
Check a specific booking status:
```bash
GET http://localhost:5000/eventBookings/test-payment/[your-booking-id]
```

**Expected response:**
```json
{
  "bookingId": "[id]",
  "status": "pending",
  "message": "Current status: pending"
}
```

## 🛠️ **Common Issues & Solutions**

### **Issue 1: Webhook Not Receiving Events**
**Symptoms:**
- No webhook logs in backend console
- Stripe dashboard shows failed webhooks

**Causes:**
- Localhost not accessible from Stripe servers
- CORS issues
- Network/firewall blocking

**Solutions:**
1. **Use ngrok** to expose localhost:
   ```bash
   npx ngrok http 5000
   ```
   Then update Stripe webhook URL to: `https://[your-ngrok-url]/eventBookings/webhook`

2. **Check CORS settings** in `app.js`

### **Issue 2: Webhook Secret Mismatch**
**Symptoms:**
- Backend logs show "Webhook signature verification failed"

**Solution:**
1. Copy webhook signing secret from Stripe dashboard
2. Update your `.env` file:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### **Issue 3: Webhook Endpoint Not Found**
**Symptoms:**
- 404 errors when Stripe tries to reach webhook

**Solution:**
1. Ensure backend is running on port 5000
2. Verify route is properly mounted in `app.js`
3. Check if webhook middleware is set up correctly

## 🧪 **Testing the Fix**

### **Test 1: Manual Status Update**
If webhook still fails, manually update a booking:
```bash
curl -X PUT http://localhost:5000/eventBookings/[booking-id]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

### **Test 2: Complete Payment Flow**
1. **Book an event** → Status: "pending"
2. **Complete Stripe payment** → Check backend logs
3. **Check success page** → Should verify payment
4. **Check dashboard** → Status should be "paid"

## 📋 **Environment Variables Check**
Ensure these are set in your `.env` file:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

## 🔧 **Quick Fix Commands**

### **Restart Backend:**
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
# or
nodemon app.js
```

### **Check Routes:**
```bash
# Test if backend is running
curl http://localhost:5000/eventBookings

# Test webhook endpoint
curl -X POST http://localhost:5000/eventBookings/webhook-test
```

### **Check Database:**
```bash
# Test if MongoDB is accessible
curl http://localhost:5000/eventBookings/test-payment/[any-booking-id]
```

## 🎯 **Expected Result**
After fixing the webhook:
1. ✅ **Payment completion** triggers webhook
2. ✅ **Backend logs** show webhook processing
3. ✅ **Booking status** updates to "paid"
4. ✅ **Success page** shows confirmation
5. ✅ **Dashboard** reflects updated status

## 📞 **If Still Not Working**
1. **Check backend console** for any error messages
2. **Verify Stripe webhook** configuration
3. **Test with ngrok** to rule out localhost issues
4. **Share error logs** for further debugging

The webhook is the key to automatic payment verification. Once it's working, everything else will fall into place! 🚀
