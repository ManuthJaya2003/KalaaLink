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

// Create Stripe payment intent for event registration
const createRegistrationPayment = async (req, res) => {
  try {
    const { eventId, artistId, amount } = req.body;

    if (!eventId || !artistId || !amount) {
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      metadata: {
        eventId: eventId,
        artistId: artistId,
        type: "event_registration"
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error("Error creating registration payment:", err);
    res.status(500).json({ message: "Failed to create payment intent", error: err.message });
  }
};

// Register artist for event after successful payment
const registerArtistForEvent = async (req, res) => {
  try {
    const { eventId, artistId, paymentIntentId } = req.body;

    if (!eventId || !artistId || !paymentIntentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
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
      return res.status(400).json({ message: "Artist already registered for this event" });
    }

    // Add artist to registered list
    event.registeredArtists.push(artistId);
    await event.save();

    res.status(200).json({
      message: "Artist registered successfully for event",
      event: event
    });
  } catch (err) {
    console.error("Error registering artist for event:", err);
    res.status(500).json({ message: "Failed to register artist", error: err.message });
  }
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

module.exports = {
  createEvent,
  getAllEvents,
  getByEventId,
  updateEvent,
  deleteEvent,
  requestCrew,
  createRegistrationPayment,
  registerArtistForEvent,
  getArtistRegistrations,
};
