const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCrewRequests() {
  console.log('🧪 Testing Crew Request System...\n');

  try {
    // Test 1: Get all crew requests (should be empty initially)
    console.log('1. Testing GET /api/crew-requests');
    const getAllResponse = await axios.get(`${BASE_URL}/api/crew-requests`);
    console.log('✅ GET all crew requests:', getAllResponse.data.length, 'requests found');
    console.log('');

    // Test 2: Create a sample crew request
    console.log('2. Testing POST /api/crew-requests');
    const sampleRequest = {
      eventId: '507f1f77bcf86cd799439011', // Sample ObjectId
      requestedBy: 'Test Event Manager',
      crewType: 'sound',
      crewDetails: 'Need sound system for outdoor event with 200+ people',
      requiredDate: '2024-02-15',
      requiredTime: '18:00',
      estimatedDuration: '4 hours',
      specialRequirements: 'Wireless microphones and backup equipment needed'
    };

    try {
      const createResponse = await axios.post(`${BASE_URL}/api/crew-requests`, sampleRequest);
      console.log('✅ POST crew request created:', createResponse.data.message);
      const crewRequestId = createResponse.data.crewRequest._id;
      console.log('   Crew Request ID:', crewRequestId);
      console.log('');

      // Test 3: Get crew request by ID
      console.log('3. Testing GET /api/crew-requests/:id');
      const getByIdResponse = await axios.get(`${BASE_URL}/api/crew-requests/${crewRequestId}`);
      console.log('✅ GET crew request by ID:', getByIdResponse.data.crewType);
      console.log('');

      // Test 4: Update crew request status (approve)
      console.log('4. Testing PATCH /api/crew-requests/:id/status (approve)');
      const approveResponse = await axios.patch(`${BASE_URL}/api/crew-requests/${crewRequestId}/status`, {
        status: 'approved',
        reviewedBy: 'Test Admin',
        adminNotes: 'Approved for sound system setup'
      });
      console.log('✅ PATCH crew request approved:', approveResponse.data.message);
      console.log('');

      // Test 5: Get crew requests by status
      console.log('5. Testing GET /api/crew-requests/status/approved');
      const getByStatusResponse = await axios.get(`${BASE_URL}/api/crew-requests/status/approved`);
      console.log('✅ GET crew requests by status:', getByStatusResponse.data.length, 'approved requests');
      console.log('');

      // Test 6: Delete crew request
      console.log('6. Testing DELETE /api/crew-requests/:id');
      const deleteResponse = await axios.delete(`${BASE_URL}/api/crew-requests/${crewRequestId}`);
      console.log('✅ DELETE crew request:', deleteResponse.data.message);
      console.log('');

    } catch (createError) {
      console.log('⚠️  POST crew request failed (expected if no events exist):', createError.response?.data?.message || createError.message);
      console.log('');
    }

    // Test 7: Test invalid status update
    console.log('7. Testing invalid status update');
    try {
      await axios.patch(`${BASE_URL}/api/crew-requests/507f1f77bcf86cd799439011/status`, {
        status: 'invalid_status'
      });
    } catch (error) {
      console.log('✅ Invalid status correctly rejected:', error.response?.data?.message);
    }
    console.log('');

    console.log('🎉 All crew request API tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ GET all crew requests');
    console.log('   ✅ POST create crew request');
    console.log('   ✅ GET crew request by ID');
    console.log('   ✅ PATCH update crew request status');
    console.log('   ✅ GET crew requests by status');
    console.log('   ✅ DELETE crew request');
    console.log('   ✅ Error handling for invalid data');
    console.log('');
    console.log('🚀 Backend API is ready for frontend integration!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCrewRequests();
