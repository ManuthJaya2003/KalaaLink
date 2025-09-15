const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPartnershipAPI() {
  console.log('🧪 Testing Partnership API...\n');

  try {
    // Test 1: Submit a partnership request
    console.log('1. Testing partnership request submission...');
    const testRequest = {
      organizationName: 'Test Organization',
      contactName: 'John Doe',
      contactEmail: 'john@testorg.com',
      message: 'We would like to partner with KalaaLink to support your mission.',
      logo: null
    };

    const submitResponse = await axios.post(`${BASE_URL}/api/partnerships`, testRequest);
    console.log('✅ Partnership request submitted successfully');
    console.log('Response:', submitResponse.data);
    console.log('');

    // Test 2: Get all partnership requests (admin view)
    console.log('2. Testing get all partnership requests...');
    const allRequestsResponse = await axios.get(`${BASE_URL}/api/partnerships`);
    console.log('✅ Retrieved all partnership requests');
    console.log('Count:', allRequestsResponse.data.partnershipRequests.length);
    console.log('');

    // Test 3: Get approved partnership requests (public view)
    console.log('3. Testing get approved partnership requests...');
    const approvedResponse = await axios.get(`${BASE_URL}/api/partnerships/approved`);
    console.log('✅ Retrieved approved partnership requests');
    console.log('Count:', approvedResponse.data.partnershipRequests.length);
    console.log('');

    // Test 4: Get partnership statistics
    console.log('4. Testing partnership statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/partnerships/stats`);
    console.log('✅ Retrieved partnership statistics');
    console.log('Stats:', statsResponse.data.stats);
    console.log('');

    console.log('🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPartnershipAPI();
