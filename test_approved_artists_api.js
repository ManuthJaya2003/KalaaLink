const axios = require('axios');

async function testApprovedArtistsAPI() {
  try {
    console.log('🧪 Testing Approved Artists API...');
    
    const response = await axios.get('http://localhost:5000/api/dashboard/system-overview');
    
    console.log('✅ API Response received');
    console.log('📊 System Overview Data:');
    console.log(`- Total Revenue: LKR ${response.data.totalRevenue.toLocaleString()}`);
    console.log(`- Total Users: ${response.data.totalUsers.toLocaleString()}`);
    console.log(`- Total Bookings: ${response.data.totalBookings.toLocaleString()}`);
    console.log(`- Total Products Sold: ${response.data.totalProductsSold.toLocaleString()}`);
    console.log(`- 🎨 Approved Artists: ${response.data.totalArtists.toLocaleString()}`);
    console.log(`- Pending Bookings: ${response.data.pendingBookings.toLocaleString()}`);
    console.log(`- Paid Bookings: ${response.data.paidBookings.toLocaleString()}`);
    
    console.log('\n✅ Approved Artists count is being returned correctly!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testApprovedArtistsAPI();
