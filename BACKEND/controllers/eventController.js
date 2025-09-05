const Event = require("../model/eventModel");
const CrewRequest = require("../model/crewrequest");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("crewRequest");
    // Return empty array if no events found (not an error)
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching events", error: err.message });
  }
};

// Get event by ID
const getByEventId = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("crewRequest");
    if (!event) return res.status(404).json({ message: "No event found" });
    return res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching event", error: err.message });
  }
};

// Create event with optional crew request
const createEvent = async (req, res) => {
  try {
    const {
      eventTitle,
      eventDate,
      eventTime,
      eventVenue,
      eventDescription,
      maxArtists,
      maxCustomers,
      priceCustomer,
      registrationFeeArtist,
      requestCrew,
      requestedBy,
    } = req.body;

    // Create the event first
    const event = new Event({
      eventTitle,
      eventDate,
      eventTime,
      eventVenue,
      venueCoordinates: req.body.venueCoordinates || null,
      eventDescription,
      maxArtists,
      maxCustomers,
      priceCustomer,
      registrationFeeArtist,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedEvent = await event.save();

    // Create crew request if needed
    if (requestCrew) {
      const crewRequestDoc = new CrewRequest({
        eventId: savedEvent._id,
        requestedBy,
        status: "pending",
      });
      const savedCrewRequest = await crewRequestDoc.save();

      savedEvent.crewRequest = savedCrewRequest._id;
      await savedEvent.save();
    }

    const populatedEvent = await Event.findById(savedEvent._id).populate("crewRequest");

    return res.status(201).json({
      message: "Event created successfully",
      event: populatedEvent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// Request crew manually after event creation
const requestCrew = async (req, res) => {
  try {
    const { eventId, requestedBy } = req.body;

    const existingRequest = await CrewRequest.findOne({ eventId });
    if (existingRequest)
      return res.status(400).json({ message: "Crew request already exists for this event" });

    const crewRequest = new CrewRequest({
      eventId,
      requestedBy,
      status: "pending",
    });

    const savedRequest = await crewRequest.save();

    await Event.findByIdAndUpdate(eventId, { crewRequest: savedRequest._id });

    return res.status(201).json({ message: "Crew request sent successfully", crewRequest: savedRequest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to request crew", error: err.message });
  }
};

// Update event with optional crew request
const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      eventTitle,
      eventDate,
      eventTime,
      eventVenue,
      eventDescription,
      maxArtists,
      maxCustomers,
      priceCustomer,
      registrationFeeArtist,
      requestCrew,
      requestedBy,
    } = req.body;

    const updateData = {
      eventTitle,
      eventDate,
      eventTime,
      eventVenue,
      venueCoordinates: req.body.venueCoordinates || null,
      eventDescription,
      maxArtists,
      maxCustomers,
      priceCustomer,
      registrationFeeArtist,
    };

    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    let event = await Event.findByIdAndUpdate(id, updateData, { new: true }).populate("crewRequest");

    if (!event) return res.status(404).json({ message: "Couldn't update event" });

    // Handle crew request
    if (requestCrew && !event.crewRequest) {
      const crewRequestDoc = new CrewRequest({
        eventId: event._id,
        requestedBy,
        status: "pending",
      });
      const savedCrewRequest = await crewRequestDoc.save();
      event.crewRequest = savedCrewRequest._id;
      await event.save();
      event = await Event.findById(event._id).populate("crewRequest");
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Unable to delete" });
    return res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

// Create Stripe checkout session for event registration (Stripe Link)
const createRegistrationCheckoutSession = async (req, res) => {
  try {
    const { eventId, artistId, artistName, artistEmail } = req.body;

    if (!eventId || !artistId || !artistName || !artistEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is full
    if (event.registeredArtists && event.registeredArtists.length >= event.maxArtists) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Check if artist is already registered
    if (event.registeredArtists && event.registeredArtists.includes(artistId)) {
      return res.status(400).json({ message: "Artist already registered for this event" });
    }

    const totalAmount = event.registrationFeeArtist;
    if (!totalAmount || isNaN(totalAmount)) {
      return res.status(400).json({ message: "Invalid registration fee" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    console.log("Creating Stripe checkout session for event registration:", {
      eventId,
      artistId,
      artistName,
      totalAmount,
      artistEmail,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Event Registration - ${event.eventTitle}`,
              description: `Registration for ${event.eventTitle} on ${new Date(event.eventDate).toLocaleDateString()} at ${event.eventVenue}`,
            },
            unit_amount: Math.round(totalAmount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/artist/events?registration=success&event=${encodeURIComponent(event.eventTitle)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/artist/events?registration=cancelled`,
      metadata: {
        eventId: eventId,
        artistId: artistId,
        artistName: artistName,
        artistEmail: artistEmail,
        type: "event_registration"
      },
      customer_email: artistEmail,
    });

    console.log("Stripe checkout session created successfully:", session.id);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Error creating registration checkout session:", err);
    res.status(500).json({ message: "Failed to create checkout session", error: err.message });
  }
};

// Register artist for event after successful payment (fallback method)
const registerArtistForEvent = async (req, res) => {
  try {
    const { eventId, artistId, sessionId } = req.body;

    if (!eventId || !artistId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // If sessionId is provided, verify payment was successful
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          return res.status(400).json({ message: "Payment not completed" });
        }
        console.log("Payment verified for session:", sessionId);
      } catch (stripeErr) {
        console.error("Error verifying payment:", stripeErr);
        // Continue with registration even if Stripe verification fails
        // This provides a fallback for cases where webhook didn't work
      }
    }

    // Update event with new artist registration
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Initialize arrays if they don't exist
    if (!event.registeredArtists) {
      event.registeredArtists = [];
    }

    // Check if artist is already registered
    if (event.registeredArtists.includes(artistId)) {
      console.log(`Artist ${artistId} already registered for event ${eventId}`);
      return res.status(200).json({
        message: "Artist already registered for this event",
        event: event
      });
    }

    // Add artist to registered list
    event.registeredArtists.push(artistId);
    await event.save();

    console.log(`✅ Artist ${artistId} registered for event ${eventId}. Total artists: ${event.registeredArtists.length}`);

    res.status(200).json({
      message: "Artist registered successfully for event",
      event: event
    });
  } catch (err) {
    console.error("Error registering artist for event:", err);
    res.status(500).json({ message: "Failed to register artist", error: err.message });
  }
};

// Handle Stripe webhook for event registrations
const handleEventRegistrationWebhook = async (req, res) => {
  console.log("Event registration webhook received");
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Webhook event type:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Check if this is an event registration payment
    if (session.metadata && session.metadata.type === "event_registration") {
      console.log("Processing event registration webhook:", session.metadata);
      try {
        const { eventId, artistId } = session.metadata;

        // Update event with new artist registration
        const event = await Event.findById(eventId);
        if (event) {
          console.log("Found event:", event.eventTitle);
          // Initialize arrays if they don't exist
          if (!event.registeredArtists) {
            event.registeredArtists = [];
          }

          // Check if artist is already registered
          if (!event.registeredArtists.includes(artistId)) {
            // Add artist to registered list
            event.registeredArtists.push(artistId);
            await event.save();
            console.log(`✅ Artist ${artistId} registered for event ${eventId} via webhook. Total artists: ${event.registeredArtists.length}`);
          } else {
            console.log(`Artist ${artistId} already registered for event ${eventId}`);
          }
        } else {
          console.log("Event not found:", eventId);
        }
      } catch (err) {
        console.error("Error processing event registration webhook:", err);
      }
    } else {
      console.log("Not an event registration payment:", session.metadata);
    }
  }

  res.json({ received: true });
};

// Get artist's event registrations
const getArtistRegistrations = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID required" });
    }

    // Find all events where the artist is registered
    const events = await Event.find({
      registeredArtists: { $in: [artistId] }
    }).select("_id eventTitle eventDate eventTime eventVenue");

    res.status(200).json({
      registrations: events.map(event => ({
        eventId: event._id,
        eventTitle: event.eventTitle,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        eventVenue: event.eventVenue
      }))
    });
  } catch (err) {
    console.error("Error fetching artist registrations:", err);
    res.status(500).json({ message: "Failed to fetch registrations", error: err.message });
  }
};

// Get Stripe session details
const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.status(200).json(session);
  } catch (err) {
    console.error("Error fetching session details:", err);
    res.status(500).json({ message: "Failed to fetch session details", error: err.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getByEventId,
  updateEvent,
  deleteEvent,
  requestCrew,
  createRegistrationCheckoutSession,
  registerArtistForEvent,
  getArtistRegistrations,
  handleEventRegistrationWebhook,
  getSessionDetails,
};
