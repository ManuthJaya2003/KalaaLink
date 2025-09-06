const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  employeeID: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => {
      // Generate EMP001, EMP002, etc.
      const count = Math.floor(Math.random() * 1000) + 1;
      return `EMP${count.toString().padStart(3, '0')}`;
    }
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
