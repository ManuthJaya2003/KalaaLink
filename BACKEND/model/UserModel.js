const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: { // fixed spelling from catergory
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: Number,
        required: true,
    },
    role:{
        type:String,
        enum: ['artist', 'artistManager', 'customer', 'admin','donationManager','eventManager','inventoryManager'],
        required:true,
    }
});

module.exports = mongoose.model(
    "UserModel", //file name
    userSchema
);
