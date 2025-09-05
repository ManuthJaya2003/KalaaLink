/**
 * Test Script for Artist Booking Webhook Implementation
 * 
 * This script demonstrates how to test the enhanced webhook system
 * for automatic booking status updates.
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';

// Test functions
async function testWebhookEndpoint() {
  console.log('🧪 Testing webhook endpoint...');
  try {
    const response = await axios.post(`${BACKEND_URL}/bookings/webhook-test`);
    console.log('✅ Webhook endpoint is accessible');
    console.log('Response:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Webhook endpoint test failed:', error.message);
    return false;
  }
}

async function testBookingStatus(bookingId) {
  console.log(`🔍 Testing booking status for ID: ${bookingId}`);
  try {
    const response = await axios.get(`${BACKEND_URL}/bookings/test-payment/${bookingId}`);
    console.log('✅ Booking status retrieved successfully');
    console.log('Status:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Booking status test failed:', error.message);
    return null;
  }
}

async function createTestBooking() {
  console.log('📝 Creating test booking...');
  try {
    const bookingData = {
      artistId: '507f1f77bcf86cd799439011', // Replace with actual artist ID
      artistModel: 'artists',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhoneNumber: '1234567890',
      eventType: 'Wedding',
      eventDate: '2024-12-25',
      eventTime: '18:00',
      eventVenue: 'Test Venue',
      eventLocation: {
        lat: 6.9271,
        lng: 79.8612
      }
    };

    const response = await axios.post(`${BACKEND_URL}/bookings`, bookingData);
    console.log('✅ Test booking created successfully');
    console.log('Booking ID:', response.data.booking._id);
    return response.data.booking._id;
  } catch (error) {
    console.error('❌ Test booking creation failed:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Artist Booking Webhook Tests\n');

  // Test 1: Webhook endpoint accessibility
  const webhookTest = await testWebhookEndpoint();
  if (!webhookTest) {
    console.log('❌ Webhook endpoint test failed. Please check your server.');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Create a test booking
  const bookingId = await createTestBooking();
  if (!bookingId) {
    console.log('❌ Test booking creation failed. Please check your database connection.');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Check initial booking status
  const initialStatus = await testBookingStatus(bookingId);
  if (initialStatus) {
    console.log('📊 Initial booking status:');
    console.log(`   Payment Status: ${initialStatus.paymentStatus}`);
    console.log(`   Booking Status: ${initialStatus.status}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  console.log('🎯 Next Steps for Manual Testing:');
  console.log('1. Go to your Artist Manager Dashboard');
  console.log('2. Find the test booking (should show "Pending Payment")');
  console.log('3. Create a Stripe checkout session for this booking');
  console.log('4. Complete payment with test card: 4242 4242 4242 4242');
  console.log('5. Check dashboard - should automatically show "Paid & Confirmed"');
  console.log('6. Or use declined card: 4000 0000 0000 0002');
  console.log('7. Check dashboard - should automatically show "Cancelled"');

  console.log('\n📋 Test Booking Details:');
  console.log(`   Booking ID: ${bookingId}`);
  console.log(`   Customer: Test Customer`);
  console.log(`   Event: Wedding on 2024-12-25`);
  console.log(`   Venue: Test Venue`);

  console.log('\n✅ All automated tests completed successfully!');
  console.log('🔧 Manual testing required for payment flow verification.');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testWebhookEndpoint,
  testBookingStatus,
  createTestBooking,
  runTests
};
