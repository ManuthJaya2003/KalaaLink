const express = require("express");
const router = express.Router();
const {
  getAllPayrolls,
  addPayroll,
  updatePayroll,
  deletePayroll,
  createPayrollCheckoutSession,
  handlePayrollWebhook,
  verifyPayrollPayment,
} = require("../controllers/PayrollController");

// JSON for normal routes
router.get("/", getAllPayrolls);
router.post("/add", addPayroll);
router.put("/update/:id", updatePayroll);
router.delete("/delete/:id", deletePayroll);

// Stripe checkout for payroll
router.post("/:id/create-checkout-session", createPayrollCheckoutSession);

// Raw body required for Stripe webhook verification
router.post("/webhook", express.raw({ type: "application/json" }), handlePayrollWebhook);

// Verify after redirect fallback
router.get('/verify/:sessionId', verifyPayrollPayment);

// Bulk clear by status
router.delete('/clear', async (req, res) => {
  try {
    const status = (req.query.status || '').toLowerCase();
    if (!['paid', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const Payroll = require('../model/Payroll');
    const result = await Payroll.deleteMany({ status: status === 'paid' ? 'Paid' : 'Pending' });
    return res.status(200).json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error clearing payrolls:', err);
    return res.status(500).json({ message: 'Failed to clear payrolls' });
  }
});

module.exports = router;


