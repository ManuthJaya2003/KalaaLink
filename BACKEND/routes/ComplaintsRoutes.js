const express = require("express");
const router = express.Router();
//Insert Model
// Complaints model will be loaded via controller
//Insert Complaints Controller
const ComplaintsController = require("../controllers/ComplaintsControllers");

router.get("/",ComplaintsController.getAllComplaints);
router.post("/",ComplaintsController.addComplaints);
router.get("/:id",ComplaintsController.getById);
router.put("/:id",ComplaintsController.updateComplaints);
router.delete("/:id",ComplaintsController.deleteComplaints);
router.post("/bulk-clear",ComplaintsController.bulkClearComplaints);


//export
module.exports = router;