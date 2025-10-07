const Payroll = require("../model/Payroll");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/payroll/ -> fetch all payroll records
const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ createdAt: -1 });
    res.status(200).json(payrolls);
  } catch (err) {
    console.error("Error fetching payrolls:", err);
    res.status(500).json({ message: "Failed to fetch payrolls" });
  }
};

// POST /api/payroll/add -> add new payroll record
const addPayroll = async (req, res) => {
  try {
    const { employeeName, email, role, salary } = req.body;
    if (!employeeName || !email || !role || salary == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const doc = await Payroll.create({ employeeName, email, role, salary, status: "Pending" });
    res.status(201).json(doc);
  } catch (err) {
    console.error("Error adding payroll:", err);
    res.status(500).json({ message: "Failed to add payroll" });
  }
};

// PUT /api/payroll/update/:id -> update payroll record
const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Payroll.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating payroll:", err);
    res.status(500).json({ message: "Failed to update payroll" });
  }
};

// DELETE /api/payroll/delete/:id -> delete payroll record
const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Payroll.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json({ message: "Deleted", id });
  } catch (err) {
    console.error("Error deleting payroll:", err);
    res.status(500).json({ message: "Failed to delete payroll" });
  }
};

// POST /api/payroll/:id/create-checkout-session -> Stripe checkout for salary
const createPayrollCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    if (payroll.status === "Paid") return res.status(400).json({ message: "Already paid" });

    // Convert LKR to USD if needed. Assume salary provided is LKR like rest of app.
    const LKR_TO_USD_RATE = 300;
    const amountUSD = Math.max(0, Math.round((Number(payroll.salary) / LKR_TO_USD_RATE) * 100));

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Salary Payment - ${payroll.employeeName}`,
              description: `Role: ${payroll.role}`,
            },
            unit_amount: amountUSD,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/admindashboard/payroll?status=success&payrollId=${id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/admindashboard/payroll?status=cancelled&payrollId=${id}`,
      metadata: {
        type: "payroll_payment",
        payrollId: id,
        employeeName: payroll.employeeName,
        email: payroll.email,
        role: payroll.role,
        salary: String(payroll.salary),
      },
      customer_email: payroll.email,
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Error creating payroll checkout session:", err);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// Webhook: mark payroll as Paid on successful checkout
const handlePayrollWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]; 
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session?.metadata?.type === "payroll_payment") {
        const payrollId = session.metadata.payrollId;
        await Payroll.findByIdAndUpdate(payrollId, { status: "Paid" });
      }
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error processing payroll webhook:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

// GET /api/payroll/verify/:sessionId -> verify session and mark Paid
const verifyPayrollPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: 'Missing sessionId' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.payment_status === 'paid' && session.metadata?.type === 'payroll_payment') {
      const payrollId = session.metadata.payrollId;
      const updated = await Payroll.findByIdAndUpdate(payrollId, { status: 'Paid' }, { new: true });
      return res.status(200).json({ ok: true, payroll: updated });
    }
    return res.status(200).json({ ok: false, reason: 'Not paid yet' });
  } catch (err) {
    console.error('Error verifying payroll payment:', err);
    return res.status(500).json({ message: 'Verification failed' });
  }
};

module.exports = {
  getAllPayrolls,
  addPayroll,
  updatePayroll,
  deletePayroll,
  createPayrollCheckoutSession,
  handlePayrollWebhook,
  verifyPayrollPayment,
};


