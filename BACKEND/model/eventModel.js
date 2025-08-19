const mongoose=require("mongoose");
const Schema=mongoose.Schema;


const eventSchema=new Schema({
    eventTitle:{
        type:String,
        required:true,
    },
    eventDate:{
        type:Date,
        required:true,
    },
    eventTime:{
        type:String,
        required:true,
    },
    eventVenue:{
        type:String,
        required:true,
    },
    eventDescription:{
        type:String,
    },
    maxAttendees:{
        type:Number,
        required:true,min:1
    },
    image:{
        type:String ,default:""
    },
    //pricing
    priceCustomer:{
        type:Number,
        requred:true,min:0
    },
    registrationFeeArtist:{
        type:Number,
        requred:true,min:0
    }

});

module.exports=mongoose.model(
    "eventModel",
    eventSchema
)