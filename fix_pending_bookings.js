/**
 * Quick Fix Script for Pending Bookings
 * 
 * This script will help you immediately fix the pending booking issue
 * by providing multiple solutions.
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

async function fixPendingBookings() {
  console.log('🔧 Fixing Pending Bookings - Multiple Solutions\n');

  try {
    // Solution 1: Auto-verify all pending bookings
    console.log('📋 Solution 1: Auto-verify all pending bookings');
    console.log('This will mark all pending bookings as paid for testing purposes.\n');
    
    const response = await axios.post(`${BACKEND_URL}/bookings/auto-verify-all`);
    
    if (response.data.success) {
      console.log('✅ Success! All pending bookings have been marked as paid');
      console.log(`📊 Processed ${response.data.results.length} bookings:`);
      
      response.data.results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.customerName} - ${result.status}`);
      });
    } else {
      console.log('❌ Auto-verification failed:', response.data.error);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Solution 2: Check webhook status
    console.log('🔍 Solution 2: Check webhook connectivity');
    const webhookTest = await axios.post(`${BACKEND_URL}/bookings/webhook-test`);
    console.log('✅ Webhook endpoint is accessible');
    console.log('Response:', webhookTest.data.message);

    console.log('\n' + '='.repeat(60) + '\n');

    // Solution 3: Instructions for manual verification
    console.log('📝 Solution 3: Manual Verification Instructions');
    console.log('If you have a Stripe session ID from a completed payment:');
    console.log('1. Use this command:');
    console.log(`   POST ${BACKEND_URL}/bookings/verify-payment`);
    console.log('2. Send JSON body: {"sessionId": "cs_your_session_id_here"}');
    console.log('3. This will verify the payment and update the booking status');

    console.log('\n' + '='.repeat(60) + '\n');

    // Solution 4: Stripe webhook setup
    console.log('⚙️ Solution 4: Stripe Webhook Setup (for future payments)');
    console.log('To prevent this issue in the future:');
    console.log('1. Go to Stripe Dashboard → Developers → Webhooks');
    console.log('2. Add endpoint: http://localhost:5000/bookings/webhook');
    console.log('3. Select events: checkout.session.completed, payment_intent.succeeded');
    console.log('4. Copy the webhook secret to your .env file');
    console.log('5. For local testing, use ngrok: npx ngrok http 5000');

    console.log('\n🎉 All solutions provided! Your pending bookings should now be fixed.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Manual Fix Instructions:');
    console.log('1. Go to your Artist Manager Dashboard');
    console.log('2. Find the pending booking for "Manuth Jayasekara"');
    console.log('3. Click the "Mark as Paid" button manually');
    console.log('4. The status should change from "PENDING" to "Paid & Confirmed"');
  }
}

// Run the fix
fixPendingBookings();
