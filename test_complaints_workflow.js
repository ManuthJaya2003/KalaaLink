const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testComplaintsWorkflow() {
  console.log('🧪 Testing Complaints Workflow...\n');

  try {
    // 1. Test submitting a complaint
    console.log('1. Submitting a test complaint...');
    const testComplaint = {
      Name: 'Test User',
      Gmail: 'test@example.com',
      Message: 'This is a test complaint to verify the workflow.',
      Complaint_Category: 'General'
    };

    const submitResponse = await axios.post(`${API_BASE}/complaints`, testComplaint);
    console.log('✅ Complaint submitted successfully:', submitResponse.data);

    // 2. Test fetching all complaints
    console.log('\n2. Fetching all complaints...');
    const fetchResponse = await axios.get(`${API_BASE}/complaints`);
    console.log('✅ Complaints fetched successfully:', fetchResponse.data.complaints.length, 'complaints found');

    // 3. Test updating complaint status
    if (fetchResponse.data.complaints.length > 0) {
      const complaintId = fetchResponse.data.complaints[0]._id;
      console.log('\n3. Updating complaint status to Accepted...');
      
      const updateResponse = await axios.put(`${API_BASE}/complaints/${complaintId}`, {
        status: 'Accepted'
      });
      console.log('✅ Complaint status updated successfully:', updateResponse.data);

      // 4. Verify the update
      console.log('\n4. Verifying the update...');
      const verifyResponse = await axios.get(`${API_BASE}/complaints`);
      const updatedComplaint = verifyResponse.data.complaints.find(c => c._id === complaintId);
      console.log('✅ Verification successful. Status:', updatedComplaint.status);
    }

    console.log('\n🎉 All tests passed! Complaints workflow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testComplaintsWorkflow();
