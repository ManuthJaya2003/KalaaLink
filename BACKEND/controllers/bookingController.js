const Booking = require("../model/Booking");
const Event = require("../model/eventModel");
const ArtistRegistration = require("../model/artistRegistration"); // updated path
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("event");
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Get a specific booking by ID
const getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id).populate("event");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching booking" });
  }
};

// Get bookings for a specific event
const getBookingsByEvent = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const bookings = await Booking.find({ event: eventId }).populate("event");
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this event" });
    }
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching event bookings" });
  }
};

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { eventId, customerName, customerEmail, ticketsBooked } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existingBookings = await Booking.aggregate([
      { $match: { event: eventId } },
      { $group: { _id: null, totalTickets: { $sum: "$ticketsBooked" } } },
    ]);
    const alreadyBooked = existingBookings[0]?.totalTickets || 0;

    if (alreadyBooked + ticketsBooked > event.maxCustomers) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const booking = new Booking({
      event: eventId,
      customerName,
      customerEmail,
      ticketsBooked,
      status: "pending"
    });

    const savedBooking = await booking.save();
    return res.status(201).json({ message: "Booking created, awaiting payment", booking: savedBooking });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating booking" });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  const id = req.params.id;
  try {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ message: "Unable to delete booking" });
    return res.status(200).json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting booking" });
  }
};

// Get comprehensive booking analytics for dashboard
const getBookingAnalytics = async (req, res) => {
  try {
    // Get all bookings with event details
    const bookings = await Booking.find().populate('event');
    
    // Get all events
    const events = await Event.find();
    
    // Calculate analytics
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalRefunds = 0;
    let totalRefundedTickets = 0;
    let activeEvents = 0;
    
    // Event-specific analytics
    const eventAnalytics = {};
    
    // Initialize event analytics
    events.forEach(event => {
      eventAnalytics[event._id.toString()] = {
        eventId: event._id,
        eventTitle: event.eventTitle,
        eventDate: event.eventDate,
        eventVenue: event.eventVenue,
        priceCustomer: event.priceCustomer,
        ticketsSold: 0,
        revenue: 0,
        refunds: 0,
        refundedTickets: 0
      };
    });
    
    // Process bookings
    bookings.forEach(booking => {
      if (booking.event) {
        const eventId = booking.event._id.toString();
        const event = eventAnalytics[eventId];
        
        if (event) {
          if (booking.status === 'paid') {
            event.ticketsSold += booking.ticketsBooked;
            event.revenue += (booking.ticketsBooked * event.priceCustomer);
            totalTicketsSold += booking.ticketsBooked;
            totalRevenue += (booking.ticketsBooked * event.priceCustomer);
          } else if (booking.status === 'cancelled') {
            event.refundedTickets += booking.ticketsBooked;
            event.refunds += (booking.ticketsBooked * event.priceCustomer);
            totalRefundedTickets += booking.ticketsBooked;
            totalRefunds += (booking.ticketsBooked * event.priceCustomer);
          }
        }
      }
    });
    
    // Count active events (events with future dates)
    const currentDate = new Date();
    activeEvents = events.filter(event => new Date(event.eventDate) >= currentDate).length;
    
    // Convert to arrays and sort
    const eventAnalyticsArray = Object.values(eventAnalytics)
      .filter(event => event.ticketsSold > 0 || event.refundedTickets > 0)
      .sort((a, b) => b.revenue - a.revenue);
    
    // Top performing events (by revenue)
    const topPerformingEvents = eventAnalyticsArray
      .slice(0, 5)
      .map(event => ({
        event: event.eventTitle,
        revenue: `LKR ${event.revenue.toLocaleString()}`,
        ticketsSold: event.ticketsSold.toString()
      }));
    
    // Refunds by event
    const refundsByEvent = eventAnalyticsArray
      .filter(event => event.refunds > 0)
      .map(event => ({
        event: event.eventTitle,
        refundAmount: `$${event.refunds.toLocaleString()}`,
        ticketsRefunded: event.refundedTickets.toString()
      }));
    
    // Chart data for ticket sales
    const chartData = eventAnalyticsArray
      .filter(event => event.ticketsSold > 0)
      .map(event => ({
        name: event.eventTitle,
        tickets: event.ticketsSold
      }));
    
    const analytics = {
      summary: {
        totalRevenue: `LKR ${totalRevenue.toLocaleString()}`,
        ticketsSold: `+${totalTicketsSold}`,
        activeEvents: activeEvents.toString(),
        totalRefunds: `LKR ${totalRefunds.toLocaleString()}`,
        refundedTickets: totalRefundedTickets.toString()
      },
      chartData: chartData,
      topPerformingEvents: topPerformingEvents,
      refundsByEvent: refundsByEvent
    };
    
    res.status(200).json(analytics);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching booking analytics", error: err.message });
  }
};

// Create Stripe checkout session for event booking
const createStripeCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerEmail, ticketsBooked } = req.body;

    // Find the existing booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if booking is already paid
    if (booking.status === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    // Find the event to get price
    const event = await Event.findById(booking.event);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Calculate total amount
    const totalAmount = event.priceCustomer * ticketsBooked;

    console.log(`Creating Stripe session for booking ${id}, amount: ${totalAmount}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `${event.eventTitle} - ${ticketsBooked} Ticket(s)`,
              description: `Event on ${new Date(event.eventDate).toLocaleDateString()} at ${event.eventVenue}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/success?bookingId=${id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/cancel?bookingId=${id}`,
      metadata: {
        bookingId: id,
        eventId: event._id.toString(),
        customerName,
        customerEmail,
        ticketsBooked: ticketsBooked.toString(),
      },
      customer_email: customerEmail,
    });

    console.log(`Stripe session created: ${session.id}`);

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Error creating checkout session", error: error.message });
  }
};

// Handle Stripe webhook for successful payments
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
      // Update booking status to paid
      const bookingId = session.metadata.bookingId;
      await Booking.findByIdAndUpdate(bookingId, { status: "paid" });
      
      console.log(`Booking ${bookingId} marked as paid`);
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  }

  res.status(200).json({ received: true });
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingsByEvent,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingAnalytics,
  createStripeCheckoutSession,
  handleStripeWebhook
};
