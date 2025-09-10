const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  employeeID: { 
    type: String, 
    required: false, 
    unique: true,
    sparse: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['Active', 'On Leave'], default: 'On Leave' },
  isOnline: { type: Boolean, default: false }, // Track online status
  lastHeartbeat: { type: Date }, // Track last activity for session management
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Plain text as requested
}, { timestamps: true });

module.exports = mongoose.model("EmployeeModel", EmployeeSchema);
