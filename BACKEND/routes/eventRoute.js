const express=require("express");
const router=express.Router();

const Event=require("../model/eventModel");

const eventController=require("../controllers/eventController");
const upload = require("../middleware/upload"); // Multer middleware

router.get("/",eventController.getAllEvents);
router.post("/",eventController.createEvent);
router.get("/:id",eventController.getByEventId);
router.put("/:id",eventController.updateEvent);
router.delete("/:id",eventController.deleteEvent);

router.post("/create", upload.single("image"), eventController.createEvent);

module.exports=router;

