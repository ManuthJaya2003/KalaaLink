const ArtistRegistration = require("../model/artistRegistration");
const Event = require("../model/eventModel");

/**
 * Validate QR code data and return artist registration information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ 
        success: false, 
        message: "QR code data is required" 
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid QR code format" 
      });
    }

    // Validate required fields
    const { registrationId, artistId, eventId, artistEmail, eventTitle } = parsedData;
    
    if (!registrationId || !artistId || !eventId || !artistEmail || !eventTitle) {
      return res.status(400).json({ 
        success: false, 
        message: "QR code missing required information" 
      });
    }

    // Find the artist registration record
    const registration = await ArtistRegistration.findOne({ 
      registrationId: registrationId,
      artistEmail: artistEmail 
    });

    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: "Registration not found" 
      });
    }

    // Find the event to verify it exists and get current details
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }

    // Verify the artist is still registered for this event
    const isArtistRegistered = event.registeredArtists && 
                              event.registeredArtists.includes(artistId);

    if (!isArtistRegistered) {
      return res.status(404).json({ 
        success: false, 
        message: "Artist is not registered for this event" 
      });
    }

    // Check if the event has already passed
    const eventDate = new Date(event.eventDate);
    const currentDate = new Date();
    const isEventPassed = eventDate < currentDate;

    // Return successful validation with artist and event information
    res.status(200).json({
      success: true,
      message: "QR Code Verified",
      data: {
        artist: {
          name: registration.artistName,
          email: registration.artistEmail,
          id: artistId
        },
        event: {
          title: event.eventTitle,
          date: event.eventDate,
          venue: event.eventVenue,
          id: eventId
        },
        registration: {
          id: registrationId,
          date: registration.registrationDate,
          fee: registration.registrationFee,
          passGenerated: registration.passGenerated
        },
        status: {
          registered: true,
          confirmed: true,
          eventPassed: isEventPassed,
          message: isEventPassed ? "Event has passed" : "Registered & Confirmed"
        }
      }
    });

  } catch (error) {
    console.error("Error validating QR code:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

module.exports = {
  validateQRCode
};
