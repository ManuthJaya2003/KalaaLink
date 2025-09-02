const express = require("express");
const router = express.Router();
//Insert Model
const Complaints = require("../model/ComplaintsModel");
//Insert Complaints Controller
const ComplaintsController = require("../controllers/ComplaintsControllers");

router.get("/",ComplaintsController.getAllComplaints);
router.post("/",ComplaintsController.addComplaints);
router.get("/:id",ComplaintsController.getById);
router.put("/:id",ComplaintsController.updateComplaints);
router.delete("/:id",ComplaintsController.deleteComplaints);


//export
module.exports = router;