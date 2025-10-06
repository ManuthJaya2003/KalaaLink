const CrewRequest = require("../model/crewrequest");
const Event = require("../model/eventModel");

// Get all crew requests
const getAllCrewRequests = async (req, res) => {
  try {
    const crewRequests = await CrewRequest.find()
      .populate('eventId', 'eventTitle eventDate eventTime eventVenue')
      .sort({ requestedAt: -1 });
    
    return res.status(200).json(crewRequests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching crew requests", error: err.message });
  }
};

// Get crew request by ID
const getCrewRequestById = async (req, res) => {
  try {
    const crewRequest = await CrewRequest.findById(req.params.id)
      .populate('eventId', 'eventTitle eventDate eventTime eventVenue');
    
    if (!crewRequest) {
      return res.status(404).json({ message: "Crew request not found" });
    }
    
    return res.status(200).json(crewRequest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching crew request", error: err.message });
  }
};

// Get crew requests by event ID
const getCrewRequestsByEventId = async (req, res) => {
  try {
    const crewRequests = await CrewRequest.find({ eventId: req.params.eventId })
      .populate('eventId', 'eventTitle eventDate eventTime eventVenue')
      .sort({ requestedAt: -1 });
    
    return res.status(200).json(crewRequests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching crew requests for event", error: err.message });
  }
};

// Create new crew request
const createCrewRequest = async (req, res) => {
  try {
    const {
      eventId,
      requestedBy,
      crewType,
      crewDetails,
      requiredDate,
      requiredTime,
      estimatedDuration,
      specialRequirements
    } = req.body;

    // Validate required fields
    if (!eventId || !requestedBy || !crewType || !crewDetails || !requiredDate || !requiredTime || !estimatedDuration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if crew request already exists for this event
    const existingRequest = await CrewRequest.findOne({ eventId });
    if (existingRequest) {
      return res.status(400).json({ message: "Crew request already exists for this event" });
    }

    const crewRequest = new CrewRequest({
      eventId,
      requestedBy,
      crewType,
      crewDetails,
      requiredDate,
      requiredTime,
      estimatedDuration,
      specialRequirements: specialRequirements || ""
    });

    const savedCrewRequest = await crewRequest.save();

    // Update event with crew request reference
    event.crewRequest = savedCrewRequest._id;
    await event.save();

    const populatedRequest = await CrewRequest.findById(savedCrewRequest._id)
      .populate('eventId', 'eventTitle eventDate eventTime eventVenue');

    return res.status(201).json({
      message: "Crew request created successfully",
      crewRequest: populatedRequest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create crew request", error: err.message });
  }
};

// Update crew request status (approve/reject)
const updateCrewRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, adminNotes } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'pending', 'approved', or 'rejected'" });
    }

    const updateData = {
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy || null,
      adminNotes: adminNotes || ""
    };

    const crewRequest = await CrewRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('eventId', 'eventTitle eventDate eventTime eventVenue');

    if (!crewRequest) {
      return res.status(404).json({ message: "Crew request not found" });
    }

    return res.status(200).json({
      message: `Crew request ${status} successfully`,
      crewRequest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update crew request status", error: err.message });
  }
};

// Update crew request details
const updateCrewRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If status is being updated to pending, reset review fields
    if (updateData.status === "pending") {
      updateData.reviewedAt = null;
      updateData.reviewedBy = null;
      updateData.adminNotes = "";
    }

    const crewRequest = await CrewRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('eventId', 'eventTitle eventDate eventTime eventVenue');

    if (!crewRequest) {
      return res.status(404).json({ message: "Crew request not found" });
    }

    return res.status(200).json({
      message: "Crew request updated successfully",
      crewRequest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update crew request", error: err.message });
  }
};

// Delete crew request
const deleteCrewRequest = async (req, res) => {
  try {
    const crewRequest = await CrewRequest.findByIdAndDelete(req.params.id);
    
    if (!crewRequest) {
      return res.status(404).json({ message: "Crew request not found" });
    }

    // Remove crew request reference from event
    await Event.findByIdAndUpdate(crewRequest.eventId, { crewRequest: null });

    return res.status(200).json({ message: "Crew request deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete crew request", error: err.message });
  }
};

// Get crew requests by status
const getCrewRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const crewRequests = await CrewRequest.find({ status })
      .populate('eventId', 'eventTitle eventDate eventTime eventVenue')
      .sort({ requestedAt: -1 });

    return res.status(200).json(crewRequests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching crew requests by status", error: err.message });
  }
};

// Get crew requests by manager
const getCrewRequestsByManager = async (req, res) => {
  try {
    const { managerId } = req.query;
    
    if (!managerId) {
      return res.status(400).json({ message: "Manager ID is required" });
    }

    const crewRequests = await CrewRequest.find({ requestedBy: managerId })
      .populate('eventId', 'eventTitle eventDate eventTime eventVenue')
      .sort({ requestedAt: -1 });

    // Format the response to match the required structure
    const formattedRequests = crewRequests.map(request => ({
      _id: request._id,
      eventName: request.eventId?.eventTitle || 'Event not found',
      requestDetails: request.crewDetails,
      status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
      adminNotes: request.adminNotes || '',
      crewType: request.crewType,
      requiredDate: request.requiredDate,
      requiredTime: request.requiredTime,
      estimatedDuration: request.estimatedDuration,
      specialRequirements: request.specialRequirements,
      requestedAt: request.requestedAt,
      reviewedAt: request.reviewedAt,
      reviewedBy: request.reviewedBy
    }));

    // Return empty array if no requests found instead of error
    return res.status(200).json(formattedRequests);
  } catch (err) {
    console.error("Error in getCrewRequestsByManager:", err);
    // Return empty array instead of error for better UX
    return res.status(200).json([]);
  }
};

module.exports = {
  getAllCrewRequests,
  getCrewRequestById,
  getCrewRequestsByEventId,
  createCrewRequest,
  updateCrewRequestStatus,
  updateCrewRequest,
  deleteCrewRequest,
  getCrewRequestsByStatus,
  getCrewRequestsByManager
};
