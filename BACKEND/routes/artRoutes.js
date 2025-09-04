const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { createArt, getAllArts, getArtById, updateArt, deleteArt } = require('../controllers/artController');
const router = express.Router();

// Ensure Uploads exists
const uploadsDir = path.join(process.cwd(), 'Uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
  if (err) return res.status(400).json({ message: err.message });
  next();
};

// Construct image URL
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
const setImageUrl = (req, res, next) => {
  if (req.file) req.body.imageUrl = `${baseUrl}/Uploads/${req.file.filename}`;
  next();
};

// Routes
router.post('/', upload.single('image'), handleMulterError, setImageUrl, createArt);
router.get('/', getAllArts);
router.get('/:id', getArtById);
router.put('/:id', upload.single('image'), handleMulterError, setImageUrl, updateArt);
router.delete('/:id', deleteArt);

module.exports = router;
