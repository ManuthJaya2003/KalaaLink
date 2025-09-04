const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Create a new delivery
router.post('/', deliveryController.createDelivery);

// Get all deliveries
router.get('/', deliveryController.getAllDeliveries);

// Get delivery by ID
router.get('/:id', deliveryController.getDeliveryById);

// Update delivery by ID
router.put('/:id', deliveryController.updateDelivery);

// Delete delivery by ID
router.delete('/:id', deliveryController.deleteDelivery);

module.exports = router;