const express = require('express');
const {
  createCustomization,
  getAllCustomizations,
  getCustomizationById,
  updateCustomization,
  deleteCustomization,
  generateCustomizationReport
} = require('../controllers/customizationController');

const router = express.Router();

// CRUD Routes
router.post('/', createCustomization);
router.get('/', getAllCustomizations);
router.get('/:id', getCustomizationById);
router.put('/:id', updateCustomization);
router.delete('/:id', deleteCustomization);

// PDF Report Routes
router.get('/report/download', generateCustomizationReport);
router.get('/:id/report', generateCustomizationReport); // New: per-customization report

module.exports = router;