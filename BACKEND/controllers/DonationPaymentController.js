const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');

// Get models safely
const getDonorModel = () => {
  if (mongoose.models.Donor) {
    return mongoose.models.Donor;
  }
  return require('../model/DonorModel');
};

const getPackageModel = () => {
  if (mongoose.models.Package) {
    return mongoose.models.Package;
  }
  return require('../model/PackageModel');
};

// ✅ Create Stripe payment session for donation
const createDonationPaymentSession = async (req, res) => {
  try {
    // ✅ Debug Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
      return res.status(500).json({ error: 'Payment system configuration error' });
    }
    
    // ✅ Validate Stripe secret key format
    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('❌ STRIPE_SECRET_KEY format is invalid (should start with sk_)');
      return res.status(500).json({ error: 'Payment system configuration error' });
    }
    
    console.log('✅ Stripe secret key is configured:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
    
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      address, 
      amount, 
      donorNote, 
      packageId, 
      packageName 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !address || !amount) {
      return res.status(400).json({ 
        message: 'First name, last name, email, phone number, address, and amount are required' 
      });
    }

    if (amount < 10) {
      return res.status(400).json({ 
        message: 'Minimum donation amount is LKR 10' 
      });
    }

    // Check if amount meets Stripe's minimum requirement ($0.50 USD)
    const usdAmount = amount * 0.003;
    if (usdAmount < 0.50) {
      return res.status(400).json({ 
        message: `Minimum donation amount is LKR ${Math.ceil(0.50 / 0.003)} to meet payment processor requirements` 
      });
    }

    // Create donation record with pending status
    const Donor = getDonorModel();
    const donation = new Donor({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phoneNumber,
      Address: address,
      Amount: amount,
      DonorNote: donorNote,
      packageId: packageId,
      packageName: packageName,
      paymentStatus: 'pending'
    });

    await donation.save();

    // Create Stripe checkout session
    console.log('🔄 Creating Stripe session for amount:', amount, 'USD');
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd', // ✅ Use USD as Stripe doesn't support LKR
              product_data: {
                name: packageName ? `${packageName} Donation` : 'Custom Donation',
                description: donorNote || 'Thank you for your generous donation',
              },
              unit_amount: Math.round(amount * 0.003 * 100), // ✅ Convert LKR to USD (1 LKR ≈ 0.003 USD)
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/donation-cancel`,
        customer_email: email,
        metadata: {
          donationId: donation._id.toString(),
          donorName: `${firstName} ${lastName}`,
          packageName: packageName || 'Custom'
        }
      });
      console.log('✅ Stripe session created successfully:', session.id);
    } catch (stripeError) {
      console.error('❌ Stripe session creation failed:', stripeError);
      console.error('❌ Stripe error type:', stripeError.type);
      console.error('❌ Stripe error code:', stripeError.code);
      console.error('❌ Stripe error message:', stripeError.message);
      return res.status(500).json({ 
        error: 'Failed to create payment session', 
        details: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
    }

    // Update donation with session ID
    donation.stripeSessionId = session.id;
    await donation.save();

    res.json({ 
      sessionId: session.id,
      donationId: donation._id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating donation payment session:', error);
    res.status(500).json({ 
      message: 'Failed to create payment session', 
      error: error.message 
    });
  }
};

// ✅ Handle Stripe webhook for donation payments
const handleDonationWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Find the donation by session ID
      const Donor = getDonorModel();
      const donation = await Donor.findOne({ stripeSessionId: session.id });
      
      if (!donation) {
        console.error('Donation not found for session:', session.id);
        return res.status(404).json({ message: 'Donation not found' });
      }

      // Update donation status to paid
      donation.paymentStatus = 'paid';
      donation.paymentDate = new Date();
      donation.stripePaymentIntentId = session.payment_intent;
      donation.updatedAt = new Date();
      
      await donation.save();

      console.log(`✅ Donation ${donation._id} successfully marked as paid`);
      
      res.json({ 
        message: 'Payment processed successfully',
        donationId: donation._id 
      });

    } catch (error) {
      console.error('Error processing donation payment:', error);
      res.status(500).json({ 
        message: 'Error processing payment', 
        error: error.message 
      });
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
    res.json({ message: 'Event received but not processed' });
  }
};

// ✅ Verify payment status
const verifyPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const Donor = getDonorModel();
    const donation = await Donor.findOne({ stripeSessionId: sessionId });
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({
      donationId: donation._id,
      paymentStatus: donation.paymentStatus,
      amount: donation.Amount,
      donorName: `${donation.FirstName} ${donation.LastName}`,
      packageName: donation.packageName
    });

  } catch (error) {
    console.error('Error verifying payment status:', error);
    res.status(500).json({ 
      message: 'Error verifying payment', 
      error: error.message 
    });
  }
};

// ✅ Get donation details for success page
const getDonationDetails = async (req, res) => {
  try {
    const { donationId } = req.params;
    
    const Donor = getDonorModel();
    const donation = await Donor.findById(donationId);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({
      donation: {
        id: donation._id,
        donorName: `${donation.FirstName} ${donation.LastName}`,
        email: donation.Email,
        amount: donation.Amount,
        packageName: donation.packageName,
        donorNote: donation.DonorNote,
        paymentStatus: donation.paymentStatus,
        paymentDate: donation.paymentDate,
        createdAt: donation.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching donation details:', error);
    res.status(500).json({ 
      message: 'Error fetching donation details', 
      error: error.message 
    });
  }
};

// ✅ Manually update payment status (for real-time updates)
const updatePaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    if (!sessionId || !status) {
      return res.status(400).json({ message: 'Session ID and status are required' });
    }
    
    const Donor = getDonorModel();
    const donation = await Donor.findOne({ stripeSessionId: sessionId });
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    // Update payment status
    donation.paymentStatus = status;
    if (status === 'paid') {
      donation.paymentDate = new Date();
    }
    donation.updatedAt = new Date();
    
    await donation.save();
    
    console.log(`✅ Donation ${donation._id} status updated to ${status}`);
    
    res.json({
      message: 'Payment status updated successfully',
      donationId: donation._id,
      paymentStatus: donation.paymentStatus,
      amount: donation.Amount,
      donorName: `${donation.FirstName} ${donation.LastName}`,
      packageName: donation.packageName
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      message: 'Error updating payment status', 
      error: error.message 
    });
  }
};

module.exports = {
  createDonationPaymentSession,
  handleDonationWebhook,
  verifyPaymentStatus,
  getDonationDetails,
  updatePaymentStatus
};
