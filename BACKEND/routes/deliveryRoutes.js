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

// Clear completed deliveries (must be before /:id route)
router.delete('/clear-completed', deliveryController.clearCompletedDeliveries);

// Get delivery statistics
router.get('/stats/overview', deliveryController.getDeliveryStats);

// Delete delivery by ID
router.delete('/:id', deliveryController.deleteDelivery);

// Dispatch delivery
router.post('/:id/dispatch', deliveryController.dispatchDelivery);

// Update delivery status
router.put('/:id/status', deliveryController.updateDeliveryStatus);

module.exports = router;