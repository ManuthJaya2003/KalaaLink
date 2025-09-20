const mongoose = require("mongoose");
const ArtistBooking = require("../model/ArtistBookingModel");
const Artist = require("../model/ArtistManagerModel");
const RegisteredArtist = require("../model/ArtistModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to populate artist dynamically
const populateArtist = async (booking) => {
  let artistData = null;

  try {
    if (booking.artistModel === "artistmanagermodels") {
      artistData = await Artist.findById(booking.artist);
    } else if (booking.artistModel === "artists") {
      artistData = await RegisteredArtist.findById(booking.artist);
    }

    if (!artistData) {
      console.warn(`Artist not found for booking ${booking._id}`);
    }

    return { ...booking._doc, artist: artistData, artistModel: booking.artistModel };
  } catch (err) {
    console.error("Error populating artist:", err);
    return { ...booking._doc, artist: null, artistModel: booking.artistModel };
  }
};

// Get all bookings (admin/manager)
const getAllArtistBookings = async (req, res) => {
  try {
    const artistBookings = await ArtistBooking.find();

    if (!artistBookings || artistBookings.length === 0) {
      return res.status(200).json({ artistBookings: [] });
    }

    const populatedBookings = await Promise.all(
      artistBookings.map((booking) => populateArtist(booking))
    );

    res.status(200).json({ artistBookings: populatedBookings });
  } catch (err) {
    console.error("Error in getAllArtistBookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get bookings by artist
const getBookingsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    const bookings = await ArtistBooking.find({ artist: artistId });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this artist" });
    }

    const populatedBookings = await Promise.all(
      bookings.map((booking) => populateArtist(booking))
    );

    res.status(200).json({ bookings: populatedBookings });
  } catch (err) {
    console.error("Error in getBookingsByArtist:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a booking (pending payment)
const createBooking = async (req, res) => {
  const {
    artistId,
    artistModel,
    customerName,
    customerEmail,
    customerPhoneNumber,
    eventType,
    eventDate,
    eventTime,
    eventVenue,
    eventLocation,
  } = req.body;

  try {
    const newBooking = new ArtistBooking({
      artist: artistId,
      artistModel,
      customerName,
      customerEmail,
      customerPhoneNumber,
      eventType,
      eventDate,
      eventTime,
      eventVenue,
      eventLocation,
      paymentStatus: "pending",
    });

    await newBooking.save();
    res.status(201).json({ booking: newBooking });
  } catch (err) {
    console.error("Error in createBooking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create Stripe checkout session for artist booking (Stripe Link)
const createStripeCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerEmail } = req.body;

    if (!customerEmail || !customerName) {
      console.error("Missing customer info:", { customerName, customerEmail });
      return res.status(400).json({ message: "Customer name and email are required" });
    }

    // Find the existing booking
    const booking = await ArtistBooking.findById(id);
    if (!booking) {
      console.error("Booking not found with ID:", id);
      return res.status(404).json({ message: "Booking not found" });
    }

    // Prevent duplicate payments
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    // Find the artist for pricing
    let artist = null;
    if (booking.artistModel === "artistmanagermodels") {
      artist = await Artist.findById(booking.artist);
    } else if (booking.artistModel === "artists") {
      artist = await RegisteredArtist.findById(booking.artist);
    }

    if (!artist) {
      console.error("Artist not found for booking:", booking._id);
      return res.status(404).json({ message: "Artist not found" });
    }

    const totalAmountLKR = artist.bookingPrice;
    if (!totalAmountLKR || isNaN(totalAmountLKR)) {
      console.error("Invalid booking price for artist:", artist._id, totalAmountLKR);
      return res.status(400).json({ message: "Invalid booking price" });
    }

    // Convert LKR to USD (approximate rate: 1 USD = 300 LKR)
    const LKR_TO_USD_RATE = 300;
    const totalAmountUSD = totalAmountLKR / LKR_TO_USD_RATE;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    console.log("Creating Stripe session:", {
      bookingId: booking._id,
      artistName: artist.artistName || artist.name,
      totalAmountLKR,
      totalAmountUSD,
      customerEmail,
      frontendUrl,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Stripe doesn't support LKR, using USD
            product_data: {
              name: `${artist.artistName || artist.name} - ${booking.eventType}`,
              description: `Event on ${new Date(booking.eventDate).toLocaleDateString()} at ${booking.eventVenue}`,
            },
            unit_amount: Math.round(totalAmountUSD * 100), // in cents (USD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/booking-success?bookingId=${id}&artist=${encodeURIComponent(artist.name)}&event=${encodeURIComponent(booking.eventType)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/booking-cancelled?bookingId=${id}`,
      metadata: {
        bookingId: id,
        artistId: booking.artist.toString(),
        artistModel: booking.artistModel,
        customerName,
        customerEmail,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        eventVenue: booking.eventVenue,
      },
      payment_intent_data: {
        metadata: {
          bookingId: id,
          artistId: booking.artist.toString(),
          artistModel: booking.artistModel,
        },
      },
      customer_email: customerEmail,
    });

    console.log("Stripe session created successfully:", session.id);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      decline_code: error.decline_code
    });
    res.status(500).json({ 
      message: "Error creating checkout session", 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};


// Handle Stripe webhook
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("🔔 Webhook received!");
  console.log("Headers:", req.headers);
  console.log("Signature:", sig);
  console.log("Body length:", req.body?.length);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(`✅ Webhook event received: ${event.type}`);
    console.log("Event data:", JSON.stringify(event.data.object, null, 2));
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    console.error("Expected signature:", sig);
    console.error("Endpoint secret exists:", !!endpointSecret);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle different payment events
    switch (event.type) {
      case "checkout.session.completed":
        console.log("🎉 Processing checkout.session.completed");
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case "payment_intent.succeeded":
        console.log("💰 Processing payment_intent.succeeded");
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case "payment_intent.payment_failed":
        console.log("❌ Processing payment_intent.payment_failed");
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case "checkout.session.expired":
        console.log("⏰ Processing checkout.session.expired");
        await handleCheckoutSessionExpired(event.data.object);
        break;
      
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    res.status(200).json({ received: true, eventType: event.type });
  } catch (error) {
    console.error("❌ Error processing webhook event:", error);
    res.status(500).json({ error: "Webhook processing failed", details: error.message });
  }
};

// Handle successful checkout session completion
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error("No bookingId found in session metadata");
      return;
    }

    console.log(`Processing checkout completion for booking: ${bookingId}`);
    
    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Update payment status to paid
    await ArtistBooking.findByIdAndUpdate(bookingId, { 
      paymentStatus: "paid",
      status: "upcoming" // Ensure booking status is set to upcoming for paid bookings
    });

    console.log(`✅ Artist booking ${bookingId} marked as paid`);
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
};

// Handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      console.error("No bookingId found in payment intent metadata");
      return;
    }

    console.log(`Processing payment success for booking: ${bookingId}`);
    
    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Update payment status to paid
    await ArtistBooking.findByIdAndUpdate(bookingId, { 
      paymentStatus: "paid",
      status: "upcoming"
    });

    console.log(`✅ Artist booking ${bookingId} payment confirmed via payment_intent.succeeded`);
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
    throw error;
  }
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      console.error("No bookingId found in payment intent metadata");
      return;
    }

    console.log(`Processing payment failure for booking: ${bookingId}`);
    
    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Update payment status to failed and booking status to cancelled
    await ArtistBooking.findByIdAndUpdate(bookingId, { 
      paymentStatus: "failed",
      status: "cancelled"
    });

    console.log(`❌ Artist booking ${bookingId} marked as failed and cancelled`);
  } catch (error) {
    console.error("Error handling payment intent failed:", error);
    throw error;
  }
};

// Handle expired checkout session
const handleCheckoutSessionExpired = async (session) => {
  try {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error("No bookingId found in session metadata");
      return;
    }

    console.log(`Processing checkout expiration for booking: ${bookingId}`);
    
    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Only update if still pending (user might have paid via another method)
    if (booking.paymentStatus === "pending") {
      await ArtistBooking.findByIdAndUpdate(bookingId, { 
        paymentStatus: "failed",
        status: "cancelled"
      });

      console.log(`⏰ Artist booking ${bookingId} expired and marked as cancelled`);
    }
  } catch (error) {
    console.error("Error handling checkout session expired:", error);
    throw error;
  }
};

// Confirm booking after payment
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    await booking.save();

    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Error in confirmBooking:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await ArtistBooking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking status updated successfully", booking });
  } catch (err) {
    console.error("Error in updateBookingStatus:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single artist by ID
const getArtistById = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    let artistData = await RegisteredArtist.findById(artistId);
    let artistType = "artists";

    if (!artistData) {
      artistData = await Artist.findById(artistId);
      artistType = "artistmanagermodels";
    }

    if (!artistData) return res.status(404).json({ message: "Artist not found" });

    res.status(200).json({
      success: true,
      artist: {
        id: artistData._id,
        name: artistData.artistName || artistData.name,
        genre: artistData.genre,
        category: artistData.category,
        bookingPrice: artistData.bookingPrice,
        summary: artistData.summary,
        bio: artistData.bio,
        image: artistData.image,
        artistType,
      },
    });
  } catch (err) {
    console.error("Error in getArtistById:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Manual payment status update
const manuallyUpdatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });

    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const updatedBooking = await ArtistBooking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: "paid" },
      { new: true }
    );

    res.status(200).json({ message: "Payment status manually updated to paid", booking: updatedBooking });
  } catch (err) {
    console.error("Error in manual update:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Clear completed and cancelled bookings for an artist
const clearCompletedAndCancelledBookings = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { status } = req.body; // 'completed', 'cancelled', or 'both'

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }

    // Build query based on status parameter
    let statusQuery = {};
    if (status === 'completed') {
      statusQuery = { status: 'completed' };
    } else if (status === 'cancelled') {
      statusQuery = { status: 'cancelled' };
    } else if (status === 'both') {
      statusQuery = { status: { $in: ['completed', 'cancelled'] } };
    } else {
      return res.status(400).json({ message: "Invalid status. Must be 'completed', 'cancelled', or 'both'" });
    }

    // Find bookings to delete (for counting)
    const bookingsToDelete = await ArtistBooking.find({
      artist: artistId,
      ...statusQuery
    });

    if (bookingsToDelete.length === 0) {
      return res.status(404).json({ 
        message: `No ${status} bookings found for this artist`,
        deletedCount: 0
      });
    }

    // Delete the bookings
    const deleteResult = await ArtistBooking.deleteMany({
      artist: artistId,
      ...statusQuery
    });

    console.log(`Cleared ${deleteResult.deletedCount} ${status} bookings for artist ${artistId}`);

    res.status(200).json({
      message: `Successfully cleared ${deleteResult.deletedCount} ${status} booking(s)`,
      deletedCount: deleteResult.deletedCount,
      status: status
    });

  } catch (err) {
    console.error("Error in clearCompletedAndCancelledBookings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Test webhook endpoint for debugging
const testWebhookEndpoint = async (req, res) => {
  try {
    console.log("Webhook test endpoint called");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    
    res.status(200).json({
      message: "Webhook test successful",
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    });
  } catch (error) {
    console.error("Webhook test error:", error);
    res.status(500).json({ error: "Webhook test failed" });
  }
};

// Get booking status for testing
const getBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      bookingId: booking._id,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      customerName: booking.customerName,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      message: `Current status: ${booking.paymentStatus}`
    });
  } catch (error) {
    console.error("Error getting booking status:", error);
    res.status(500).json({ error: "Failed to get booking status" });
  }
};

// Manual payment verification using Stripe session ID
const verifyPaymentManually = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    console.log(`🔍 Manually verifying payment for session: ${sessionId}`);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session details:", JSON.stringify(session, null, 2));

    if (session.payment_status === 'paid') {
      const bookingId = session.metadata?.bookingId;
      
      if (!bookingId) {
        return res.status(400).json({ message: "No booking ID found in session metadata" });
      }

      // Update the booking status
      const booking = await ArtistBooking.findByIdAndUpdate(
        bookingId,
        { 
          paymentStatus: "paid",
          status: "upcoming"
        },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      console.log(`✅ Manual verification successful: Booking ${bookingId} marked as paid`);
      
      res.status(200).json({
        success: true,
        message: "Payment verified and booking updated",
        booking: {
          id: booking._id,
          paymentStatus: booking.paymentStatus,
          status: booking.status,
          customerName: booking.customerName
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${session.payment_status}`,
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.error("Error in manual payment verification:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to verify payment", 
      details: error.message 
    });
  }
};

// Auto-verify all pending bookings (for testing)
const autoVerifyAllPendingBookings = async (req, res) => {
  try {
    console.log("🔄 Auto-verifying all pending bookings...");
    
    const pendingBookings = await ArtistBooking.find({ paymentStatus: "pending" });
    console.log(`Found ${pendingBookings.length} pending bookings`);

    const results = [];

    for (const booking of pendingBookings) {
      try {
        // Try to find a recent Stripe session for this booking
        // This is a simplified approach - in production you'd want to store session IDs
        console.log(`Checking booking ${booking._id}...`);
        
        // For now, we'll just mark them as paid for testing
        // In a real scenario, you'd check against Stripe sessions
        await ArtistBooking.findByIdAndUpdate(booking._id, {
          paymentStatus: "paid",
          status: "upcoming"
        });

        results.push({
          bookingId: booking._id,
          customerName: booking.customerName,
          status: "marked_as_paid"
        });

        console.log(`✅ Booking ${booking._id} marked as paid`);
      } catch (error) {
        console.error(`❌ Error processing booking ${booking._id}:`, error);
        results.push({
          bookingId: booking._id,
          customerName: booking.customerName,
          status: "error",
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${pendingBookings.length} pending bookings`,
      results: results
    });
  } catch (error) {
    console.error("Error in auto-verification:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to auto-verify bookings", 
      details: error.message 
    });
  }
};

// Generate invoice for booking
const generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    console.log(`📄 Generating invoice for booking: ${bookingId}`);

    // Find the booking
    const booking = await ArtistBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Get artist details
    let artist = null;
    if (booking.artistModel === "artistmanagermodels") {
      artist = await Artist.findById(booking.artist);
    } else if (booking.artistModel === "artists") {
      artist = await RegisteredArtist.findById(booking.artist);
    }

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // Generate PDF invoice
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bookingId}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Invoice header
    doc.fontSize(24).text('KalaaLink', { align: 'center' });
    doc.fontSize(16).text('Artist Booking Invoice', { align: 'center' });
    doc.moveDown(2);

    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${bookingId}`, { align: 'left' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
    doc.moveDown();

    // Customer details
    doc.fontSize(14).text('Customer Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${booking.customerName}`);
    doc.text(`Email: ${booking.customerEmail}`);
    doc.text(`Phone: ${booking.customerPhoneNumber}`);
    doc.moveDown();

    // Artist details
    doc.fontSize(14).text('Artist Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Artist: ${artist.name || artist.stageName || `${artist.firstName} ${artist.lastName}`}`);
    doc.text(`Genre: ${artist.genre || 'N/A'}`);
    doc.moveDown();

    // Event details
    doc.fontSize(14).text('Event Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Event Type: ${booking.eventType}`);
    doc.text(`Date: ${new Date(booking.eventDate).toLocaleDateString()}`);
    doc.text(`Time: ${booking.eventTime}`);
    doc.text(`Venue: ${booking.eventVenue}`);
    doc.moveDown();

    // Payment details
    doc.fontSize(14).text('Payment Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Amount: $${artist.bookingPrice || 0}`);
    doc.text(`Status: PAID`);
    doc.text(`Booking Status: ${booking.status.toUpperCase()}`);
    doc.moveDown();

    // Footer
    doc.fontSize(10).text('Thank you for choosing KalaaLink!', { align: 'center' });
    doc.text('For support, contact us at support@kalaalink.com', { align: 'center' });

    // Finalize PDF
    doc.end();

    console.log(`✅ Invoice generated successfully for booking ${bookingId}`);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate invoice", 
      details: error.message 
    });
  }
};

module.exports = {
  getAllArtistBookings,
  getBookingsByArtist,
  createBooking,
  createStripeCheckoutSession,
  handleStripeWebhook,
  confirmBooking,
  updateBookingStatus,
  getArtistById,
  manuallyUpdatePaymentStatus,
  clearCompletedAndCancelledBookings,
  testWebhookEndpoint,
  getBookingStatus,
  verifyPaymentManually,
  autoVerifyAllPendingBookings,
  generateInvoice,
};
