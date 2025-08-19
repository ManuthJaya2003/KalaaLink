const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const ArtistManagerController = require("../controllers/ArtistManagerController");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Applications (must come BEFORE dynamic :artist_id routes)
router.get("/applications", ArtistManagerController.getAllApplications);
router.put("/applications/approve/:id", ArtistManagerController.approveArtist);
router.put("/applications/reject/:id", ArtistManagerController.rejectArtist);


// CRUD routes
router.get("/", ArtistManagerController.getAllArtists);
router.post("/", upload.single("image"), ArtistManagerController.addArtists);
router.get("/:artist_id", ArtistManagerController.getArtistByID);
router.put("/:artist_id", upload.single("image"), ArtistManagerController.updateArtist);
router.delete("/:artist_id", ArtistManagerController.deleteArtist);

module.exports = router;
