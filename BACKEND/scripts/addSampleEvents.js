// Script to add sample events with venue coordinates for testing
// Run this script to populate the database with test events

const mongoose = require('mongoose');
const Event = require('../model/eventModel');

// Sample events with coordinates for Sri Lankan venues
const sampleEvents = [
  {
    eventTitle: "Colombo Jazz Festival 2024",
    eventDate: new Date('2024-12-15'),
    eventTime: "19:00",
    eventVenue: "Galle Face Green, Colombo",
    venueCoordinates: {
      latitude: 6.9271,
      longitude: 79.8612
    },
    eventDescription: "A spectacular evening of jazz music under the stars at Colombo's iconic Galle Face Green. Featuring local and international jazz artists.",
    maxArtists: 8,
    maxCustomers: 200,
    priceCustomer: 2500,
    registrationFeeArtist: 5000
  },
  {
    eventTitle: "Kandy Cultural Dance Show",
    eventDate: new Date('2024-11-20'),
    eventTime: "18:30",
    eventVenue: "Kandy Lake Club, Kandy",
    venueCoordinates: {
      latitude: 7.2906,
      longitude: 80.6337
    },
    eventDescription: "Experience traditional Sri Lankan dance performances in the heart of Kandy. Traditional costumes and authentic music.",
    maxArtists: 12,
    maxCustomers: 150,
    priceCustomer: 1800,
    registrationFeeArtist: 3500
  },
  {
    eventTitle: "Galle Fort Music Night",
    eventDate: new Date('2024-12-08'),
    eventTime: "20:00",
    eventVenue: "Galle Fort Amphitheater, Galle",
    venueCoordinates: {
      latitude: 6.0535,
      longitude: 80.2210
    },
    eventDescription: "An intimate acoustic music evening within the historic Galle Fort. Perfect blend of history and contemporary music.",
    maxArtists: 6,
    maxCustomers: 100,
    priceCustomer: 3000,
    registrationFeeArtist: 6000
  },
  {
    eventTitle: "Jaffna Folk Music Festival",
    eventDate: new Date('2024-11-25'),
    eventTime: "17:00",
    eventVenue: "Jaffna Public Library Grounds, Jaffna",
    venueCoordinates: {
      latitude: 9.6615,
      longitude: 80.0255
    },
    eventDescription: "Celebrate the rich cultural heritage of Jaffna through traditional folk music and dance performances.",
    maxArtists: 15,
    maxCustomers: 300,
    priceCustomer: 1200,
    registrationFeeArtist: 2500
  },
  {
    eventTitle: "Anuradhapura Sacred Music Concert",
    eventDate: new Date('2024-12-01'),
    eventTime: "19:30",
    eventVenue: "Isurumuniya Temple Grounds, Anuradhapura",
    venueCoordinates: {
      latitude: 8.3114,
      longitude: 80.4037
    },
    eventDescription: "A spiritual evening of sacred music in the ancient city of Anuradhapura. Traditional Buddhist and classical music.",
    maxArtists: 10,
    maxCustomers: 180,
    priceCustomer: 2200,
    registrationFeeArtist: 4500
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/kalaalink', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add sample events to database
const addSampleEvents = async () => {
  try {
    // Clear existing events (optional - comment out if you want to keep existing events)
    // await Event.deleteMany({});
    // console.log('🗑️ Cleared existing events');
    
    // Add new sample events
    const addedEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ Successfully added ${addedEvents.length} sample events`);
    
    // Display added events
    addedEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.eventTitle}`);
      console.log(`   Venue: ${event.eventVenue}`);
      console.log(`   Coordinates: ${event.venueCoordinates.latitude}, ${event.venueCoordinates.longitude}`);
      console.log(`   Date: ${event.eventDate.toLocaleDateString()}`);
      console.log(`   Price: Rs. ${event.priceCustomer}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample events:', error);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Starting sample events population...\n');
  
  await connectDB();
  await addSampleEvents();
  
  console.log('\n✨ Sample events population completed!');
  console.log('You can now test the venue map functionality in the success page.');
  
  // Close database connection
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Run the script
main().catch(console.error);
