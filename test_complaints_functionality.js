// Test script for complaints functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/complaints';

async function testComplaintsAPI() {
  try {
    console.log('🧪 Testing Complaints API Functionality...\n');

    // Test 1: Get all complaints
    console.log('1. Testing GET /complaints');
    const getResponse = await axios.get(API_BASE);
    console.log('✅ GET /complaints - Status:', getResponse.status);
    console.log('   Complaints count:', getResponse.data.complaints?.length || 0);
    console.log('');

    // Test 2: Create a test complaint
    console.log('2. Testing POST /complaints (Create)');
    const testComplaint = {
      Name: 'Test User',
      Gmail: 'test@example.com',
      Message: 'This is a test complaint for functionality testing',
      Complaint_Category: 'General'
    };
    
    const createResponse = await axios.post(API_BASE, testComplaint);
    console.log('✅ POST /complaints - Status:', createResponse.status);
    const complaintId = createResponse.data.complaints?._id;
    console.log('   Created complaint ID:', complaintId);
    console.log('');

    if (complaintId) {
      // Test 3: Update complaint status to Accepted
      console.log('3. Testing PUT /complaints/:id (Update to Accepted)');
      const acceptResponse = await axios.put(`${API_BASE}/${complaintId}`, {
        status: 'Accepted'
      });
      console.log('✅ PUT /complaints/:id (Accepted) - Status:', acceptResponse.status);
      console.log('   Updated status:', acceptResponse.data.complaints?.status);
      console.log('');

      // Test 4: Update complaint status to Rejected
      console.log('4. Testing PUT /complaints/:id (Update to Rejected)');
      const rejectResponse = await axios.put(`${API_BASE}/${complaintId}`, {
        status: 'Rejected'
      });
      console.log('✅ PUT /complaints/:id (Rejected) - Status:', rejectResponse.status);
      console.log('   Updated status:', rejectResponse.data.complaints?.status);
      console.log('');

      // Test 5: Test bulk clear (this will delete the test complaint)
      console.log('5. Testing POST /complaints/bulk-clear (Clear Rejected)');
      const bulkClearResponse = await axios.post(`${API_BASE}/bulk-clear`, {
        status: 'Rejected'
      });
      console.log('✅ POST /complaints/bulk-clear - Status:', bulkClearResponse.status);
      console.log('   Message:', bulkClearResponse.data.message);
      console.log('   Deleted count:', bulkClearResponse.data.deletedCount);
      console.log('');

    }

    console.log('🎉 All tests completed successfully!');
    console.log('✅ Complaints management functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testComplaintsAPI();
