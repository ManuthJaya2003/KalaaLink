// Test script for employee management system
// This script tests concurrent user scenarios and idempotency

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/employees';

// Test data
const testEmployee = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  role: 'test',
  username: 'testuser'
};

async function testConcurrentLogins() {
  console.log('🧪 Testing concurrent login scenarios...');
  
  try {
    // Create a test employee first
    console.log('Creating test employee...');
    const createResponse = await axios.post(BASE_URL, testEmployee);
    const employeeId = createResponse.data.employee._id;
    console.log('✅ Test employee created:', employeeId);

    // Test concurrent logins (simulate multiple login attempts)
    console.log('Testing concurrent login attempts...');
    const loginPromises = [];
    
    for (let i = 0; i < 5; i++) {
      loginPromises.push(
        axios.post(`${BASE_URL}/login`, {
          email: testEmployee.email,
          password: testEmployee.password,
          role: testEmployee.role
        }).catch(err => ({ error: err.message }))
      );
    }

    const results = await Promise.all(loginPromises);
    console.log('Login results:', results.map(r => r.data || r.error));

    // Test concurrent heartbeats
    console.log('Testing concurrent heartbeat attempts...');
    const heartbeatPromises = [];
    
    for (let i = 0; i < 3; i++) {
      heartbeatPromises.push(
        axios.post(`${BASE_URL}/heartbeat`, {
          employeeId: employeeId
        }).catch(err => ({ error: err.message }))
      );
    }

    const heartbeatResults = await Promise.all(heartbeatPromises);
    console.log('Heartbeat results:', heartbeatResults.map(r => r.data || r.error));

    // Test concurrent logouts
    console.log('Testing concurrent logout attempts...');
    const logoutPromises = [];
    
    for (let i = 0; i < 3; i++) {
      logoutPromises.push(
        axios.post(`${BASE_URL}/logout`, {
          employeeId: employeeId
        }).catch(err => ({ error: err.message }))
      );
    }

    const logoutResults = await Promise.all(logoutPromises);
    console.log('Logout results:', logoutResults.map(r => r.data || r.error));

    // Clean up - delete test employee
    console.log('Cleaning up test employee...');
    await axios.delete(`${BASE_URL}/${employeeId}`);
    console.log('✅ Test employee deleted');

    console.log('🎉 All concurrent tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testIdempotency() {
  console.log('🧪 Testing idempotency...');
  
  try {
    // Create test employee
    const createResponse = await axios.post(BASE_URL, testEmployee);
    const employeeId = createResponse.data.employee._id;

    // Test multiple status updates
    console.log('Testing multiple status updates...');
    const updatePromises = [];
    
    for (let i = 0; i < 5; i++) {
      updatePromises.push(
        axios.put(`${BASE_URL}/${employeeId}`, {
          ...testEmployee,
          status: 'Active'
        })
      );
    }

    const updateResults = await Promise.all(updatePromises);
    console.log('Update results:', updateResults.map(r => r.data.employee.status));

    // Clean up
    await axios.delete(`${BASE_URL}/${employeeId}`);
    console.log('✅ Idempotency tests completed!');
    
  } catch (error) {
    console.error('❌ Idempotency test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Employee Management System Tests...\n');
  
  await testConcurrentLogins();
  console.log('\n' + '='.repeat(50) + '\n');
  await testIdempotency();
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testConcurrentLogins, testIdempotency };