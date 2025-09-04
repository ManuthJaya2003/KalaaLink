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
      return res.status(404).json({ message: "No bookings found" });
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

    const totalAmount = artist.bookingPrice;
    if (!totalAmount || isNaN(totalAmount)) {
      console.error("Invalid booking price for artist:", artist._id, totalAmount);
      return res.status(400).json({ message: "Invalid booking price" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    console.log("Creating Stripe session:", {
      bookingId: booking._id,
      artistName: artist.name,
      totalAmount,
      customerEmail,
      frontendUrl,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${artist.name} - ${booking.eventType}`,
              description: `Event on ${new Date(booking.eventDate).toLocaleDateString()} at ${booking.eventVenue}`,
            },
            unit_amount: Math.round(totalAmount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/artists?booking=success&artist=${encodeURIComponent(artist.name)}&event=${encodeURIComponent(booking.eventType)}`,
      cancel_url: `${frontendUrl}/artists?booking=cancelled`,
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
      customer_email: customerEmail,
    });

    console.log("Stripe session created successfully:", session.id);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    res.status(500).json({ message: "Error creating checkout session", error: error.message });
  }
};


// Handle Stripe webhook
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      const bookingId = session.metadata.bookingId;
      await ArtistBooking.findByIdAndUpdate(bookingId, { paymentStatus: "paid" });
      console.log(`Artist booking ${bookingId} marked as paid`);
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  }

  res.status(200).json({ received: true });
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
};
