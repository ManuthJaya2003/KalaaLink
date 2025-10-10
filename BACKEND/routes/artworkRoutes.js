const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
  createArtwork, 
  getAllArtworks, 
  getArtworkById, 
  updateArtwork, 
  deleteArtwork 
} = require('../controllers/artworkController');

const router = express.Router();

// Ensure Uploads exists
const uploadsDir = path.join(process.cwd(), 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow common image formats
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype.toLowerCase()) || 
        allowedExtensions.includes(fileExtension)) {
      return cb(null, true);
    }
    
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Construct image URL
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
const setImageUrl = (req, res, next) => {
  if (req.file) {
    req.body.image = `${baseUrl}/Uploads/${req.file.filename}`;
  }
  next();
};

// Routes
router.post('/', upload.single('image'), handleMulterError, setImageUrl, createArtwork);
router.get('/', getAllArtworks);
router.get('/:id', getArtworkById);
router.put('/:id', upload.single('image'), handleMulterError, setImageUrl, updateArtwork);
router.delete('/:id', deleteArtwork);

module.exports = router;
