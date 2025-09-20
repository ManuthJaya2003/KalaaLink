const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders
router.get('/', orderController.getAllOrders);

// Get orders by customer email
router.get('/customer/:email', orderController.getOrdersByCustomer);

// Get order by ID
router.get('/:orderId', orderController.getOrderById);

// Create order (legacy support)
router.post('/', orderController.createOrder);

// Create marketplace order with Stripe checkout
router.post('/marketplace', orderController.createMarketplaceOrder);

// Update order status
router.put('/:orderId/status', orderController.updateOrderStatus);

// Confirm order payment (similar to event booking system)
router.post('/confirm-payment', orderController.confirmOrderPayment);

// Manual payment status update (for testing and emergency use)
router.put('/:orderId/payment-status', orderController.manualUpdatePaymentStatus);

// Delete order
router.delete('/:orderId', orderController.deleteOrder);

// Stripe webhook for marketplace orders
router.post('/webhook', express.raw({ type: 'application/json' }), orderController.handleStripeWebhook);

// Test payment confirmation endpoint (for debugging)
router.get('/confirm-payment/test', orderController.testPaymentConfirmation);

// Test webhook endpoint (for debugging)
router.get('/webhook/test', orderController.testWebhook);

module.exports = router;