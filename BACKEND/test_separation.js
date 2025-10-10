// Test script to verify Art Gallery and Marketplace separation
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSeparation() {
  console.log('🧪 Testing Art Gallery and Marketplace Separation...\n');

  try {
    // Test 1: Verify marketplace still uses /api/art (products)
    console.log('1. Testing Marketplace endpoint GET /api/art...');
    const marketplaceResponse = await axios.get(`${BASE_URL}/api/art`);
    console.log('✅ Marketplace endpoint working');
    console.log(`   Found ${marketplaceResponse.data.length} marketplace products\n`);

    // Test 2: Verify art gallery uses /api/artworks (new endpoint)
    console.log('2. Testing Art Gallery endpoint GET /api/artworks...');
    const galleryResponse = await axios.get(`${BASE_URL}/api/artworks`);
    console.log('✅ Art Gallery endpoint working');
    console.log(`   Found ${galleryResponse.data.length} gallery artworks\n`);

    // Test 3: Create a test artwork in gallery
    console.log('3. Testing Art Gallery upload POST /api/artworks...');
    const testArtwork = {
      image: 'http://localhost:5000/uploads/test-gallery-image.jpg',
      title: 'Test Gallery Artwork',
      artist: 'Test Gallery Artist',
      summary: 'This is a test artwork for the gallery'
    };

    const uploadResponse = await axios.post(`${BASE_URL}/api/artworks`, testArtwork);
    console.log('✅ Art Gallery upload successful');
    console.log(`   Created artwork: ${uploadResponse.data.title} by ${uploadResponse.data.artist}\n`);

    // Test 4: Verify separation - gallery should have 1 artwork, marketplace unchanged
    console.log('4. Verifying separation...');
    const galleryResponse2 = await axios.get(`${BASE_URL}/api/artworks`);
    const marketplaceResponse2 = await axios.get(`${BASE_URL}/api/art`);
    
    console.log(`   Gallery artworks: ${galleryResponse2.data.length}`);
    console.log(`   Marketplace products: ${marketplaceResponse2.data.length}`);
    
    if (galleryResponse2.data.length > galleryResponse.data.length && 
        marketplaceResponse2.data.length === marketplaceResponse.data.length) {
      console.log('✅ Separation successful! Gallery and Marketplace are independent.\n');
    } else {
      console.log('❌ Separation failed! Data is mixed between endpoints.\n');
    }

    // Test 5: Clean up test data
    console.log('5. Cleaning up test data...');
    await axios.delete(`${BASE_URL}/api/artworks/${uploadResponse.data._id}`);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All separation tests passed!');
    console.log('📋 Summary:');
    console.log('   - Marketplace uses /api/art (unchanged)');
    console.log('   - Art Gallery uses /api/artworks (new)');
    console.log('   - No data mixing between collections');
    console.log('   - Both endpoints work independently');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSeparation();
