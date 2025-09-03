# Stripe Integration Setup Guide

## Environment Variables Required

### Frontend (.env file)
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### Backend (.env file)
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=http://localhost:3000
```

## Stripe Dashboard Setup

1. **Get API Keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to Developers → API keys
   - Copy your publishable key and secret key

2. **Set up Webhook Endpoint**:
   - Go to Developers → Webhooks
   - Add endpoint: `http://localhost:5000/eventBookings/webhook`
   - Select events: `checkout.session.completed`
   - Copy the webhook signing secret

3. **Test Mode**:
   - Ensure you're in test mode (toggle in dashboard)
   - Use test card numbers for testing:
     - Success: `4242 4242 4242 4242`
     - Decline: `4000 0000 0000 0002`

## Troubleshooting

### "Cannot find module './en'" Error
- This usually happens when Stripe can't load localization
- Solution: Ensure proper Stripe key format and network access

### Payment Status Not Updating
- Check webhook endpoint is accessible
- Verify webhook secret is correct
- Check backend logs for webhook events
- Use manual verification as fallback

### Testing the Integration
1. Create a test event
2. Book the event (status: pending)
3. Click "Pay Now" 
4. Complete test payment
5. Check Event Manager Dashboard for status update

## Common Issues

1. **CORS Issues**: Ensure backend allows frontend origin
2. **Webhook Failures**: Check webhook endpoint accessibility
3. **Payment Verification**: Use manual verification if webhook fails
4. **Environment Variables**: Double-check all keys are set correctly
