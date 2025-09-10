const express = require('express');
const router = express.Router();
const DonationPaymentController = require('../controllers/DonationPaymentController');

// ✅ Donation payment routes
router.post('/create-session', DonationPaymentController.createDonationPaymentSession);
router.post('/webhook', DonationPaymentController.handleDonationWebhook);
router.get('/verify/:sessionId', DonationPaymentController.verifyPaymentStatus);
router.get('/details/:donationId', DonationPaymentController.getDonationDetails);
router.put('/update-status/:sessionId', DonationPaymentController.updatePaymentStatus);

module.exports = router;
