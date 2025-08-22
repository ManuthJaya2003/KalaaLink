const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const EmployeeSchema = new Schema({
  employee_id: { 
  type: String, 
  required: true, 
  unique: true,
  default: () => "EMP-" + Math.floor(Math.random() * 100000)
},
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:        { type: String, required: true },
  role:        { type: String, required: true },
  status:      { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model("EmployeeModel", EmployeeSchema);
