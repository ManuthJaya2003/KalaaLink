const Event = require("../model/eventModel");
const CrewRequest = require("../model/crewrequest");

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("crewRequest");
    if (!events) return res.status(404).json({ message: "No events found" });
    return res.status(200).json({ events });
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

module.exports = {
  createEvent,
  getAllEvents,
  getByEventId,
  updateEvent,
  deleteEvent,
  requestCrew,
};
