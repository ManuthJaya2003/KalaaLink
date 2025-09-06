const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const complaintsSchema = new Schema({
    Name:{
        type:String,//dataType
        required:true,//validate
    },
    Gmail:{
        type:String,//dataType
        required:true,//validate
    },
   Message:{
        type:String,//dataType
        required:true,//validate
    },
    Complaint_Category:{
        type:String,//dataType
        required:true,//validate
    },
    resolved:{
        type:Boolean,
        default:false
    },
    rejected:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model(
    "ComplaintsModel",//file name
    complaintsSchema //function name
)