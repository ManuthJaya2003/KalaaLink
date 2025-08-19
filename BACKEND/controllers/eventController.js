const Event = require("../model/eventModel");

//Display
const getAllEvents = async(req,res,next)=>{
    let Events;
    try{
        events = await Event.find();
    }catch(err){
        console.log(err);
    }
    //not found 
    if(!events){
        return res.status(404).json({message:"User not found"});
    }
    //Display all users
    return res.status(200).json({events});
};

//data insert
const createEvent = async (req, res, next) => {
  try {
    const { eventTitle, eventDate, eventTime, eventVenue, eventDescription, maxAttendees, priceCustomer, registrationFeeArtist } = req.body;

    
    const event = new Event({
      eventTitle,
      eventDate,
      eventTime,
      eventVenue,
      eventDescription,
      maxAttendees,
      priceCustomer,
      registrationFeeArtist,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedEvent = await event.save();

    return res.status(201).json({
      message: "Event created successfully",
      event: savedEvent,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};


//get by ID

const getByEventId=async(req,res,next)=>{
    const id=req.params.id;
    let event;

    try{
        event=await Event.findById(id)
    }catch(err){
        console.log(err);
    }if(!Event){
        return res.status(404).send({message:"No event found"});
    }return res.status(200).json({event});

}

//update 

const updateEvent = async(req,res,next)=>{
   const id=req.params.id;
   const { eventTitle, eventDate, eventTime, eventVenue, eventDescription, maxAttendees, priceCustomer, registrationFeeArtist } = req.body;
   let events;
   try{
    events=await Event.findByIdAndUpdate(id,
      { eventTitle:eventTitle, eventDate:eventDate, eventTime:eventTime,
         eventVenue:eventVenue, eventDescription:eventDescription,
          maxAttendees:maxAttendees, priceCustomer:priceCustomer, registrationFeeArtist:registrationFeeArtist})
          events=await events.save();
   }catch(err){
    console.log(err);
   }

   if(!events){
        return res.status(404).send({message:"coudnt update"});
    }return res.status(200).json({events});
};

//Delete
const deleteEvent= async(req,res,next)=>{
  const id=req.params.id;

  let event;

  try{
    event=await Event.findByIdAndDelete(id)
  }catch(err){
    console.log(err);
  }
  if(!event){
        return res.status(404).send({message:"unable to delete"});
    }return res.status(200).json({event});

};


exports.createEvent = createEvent;
exports.getAllEvents=getAllEvents;
exports.getByEventId=getByEventId;
exports.updateEvent=updateEvent;
exports.deleteEvent=deleteEvent;