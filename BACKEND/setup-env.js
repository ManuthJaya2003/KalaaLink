// Environment Setup Script
// Run this script to check your environment configuration

const fs = require('fs');
const path = require('path');

console.log('🔧 Checking Environment Configuration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 .env file exists:', envExists ? '✅ Yes' : '❌ No');

if (envExists) {
  // Load environment variables
  require('dotenv').config();
  
  console.log('\n🔑 Environment Variables:');
  console.log('  STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.log('  STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
  console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
  console.log('  PORT:', process.env.PORT || '5000 (default)');
  console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000 (default)');
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('\n🔐 Webhook Secret Length:', process.env.STRIPE_WEBHOOK_SECRET.length);
    console.log('🔐 Webhook Secret Format:', process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_') ? '✅ Correct' : '❌ Incorrect');
  }
} else {
  console.log('\n📝 Creating sample .env file...');
  
  const sampleEnv = `# Database Configuration
MONGO_URI=mongodb+srv://Manuth:Manuth2003@kalaalinkcluster.imipnwu.mongodb.net/

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Stripe Configuration (REQUIRED FOR WEBHOOKS)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Instructions:
# 1. Replace 'sk_test_your_stripe_secret_key_here' with your actual Stripe secret key
# 2. Replace 'whsec_your_webhook_secret_here' with your webhook secret from Stripe dashboard
# 3. Save this file and restart your server
`;

  try {
    fs.writeFileSync(envPath, sampleEnv);
    console.log('✅ Sample .env file created!');
    console.log('📝 Please edit the .env file with your actual Stripe credentials');
  } catch (error) {
    console.log('❌ Error creating .env file:', error.message);
  }
}

console.log('\n🌐 Webhook Endpoint URL: http://localhost:5000/api/orders/webhook');
console.log('🧪 Test Endpoint URL: http://localhost:5000/api/orders/webhook/test');

console.log('\n📋 Next Steps:');
if (!envExists) {
  console.log('1. Edit the .env file with your Stripe credentials');
  console.log('2. Create webhook endpoint in Stripe dashboard');
  console.log('3. Restart your server');
} else if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.log('1. Add STRIPE_WEBHOOK_SECRET to your .env file');
  console.log('2. Create webhook endpoint in Stripe dashboard');
  console.log('3. Restart your server');
} else {
  console.log('1. Test webhook endpoint: GET /api/orders/webhook/test');
  console.log('2. Create a test order to verify automatic updates');
  console.log('3. Check backend logs for webhook events');
}

console.log('\n✨ Setup complete!');
