const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const galleryImageSchema = new Schema({
  imageUrl: { 
    type: String, 
    required: true 
  },
  altText: { 
    type: String, 
    required: true 
  },
  associatedEventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "eventModel", 
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("GalleryImage", galleryImageSchema);
