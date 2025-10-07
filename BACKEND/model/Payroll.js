const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payroll", PayrollSchema);


