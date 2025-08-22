const Employee = require('../model/EmployeeModel');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    if (!employees.length) return res.status(404).json({ message: "No Employees Found" });
    res.status(200).json({ employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new employee
const addEmployees = async (req, res) => {
  const { employee_id, name, email, password, role, status } = req.body;

  try {
    const employee = new Employee({
      employee_id,
      name,
      email,
      password,   // plain text
      role,
      status
    });
    await employee.save();
    res.status(201).json({ employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employee by ID
const getById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee Not Found" });
    res.status(200).json({ employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  const { employee_id, name, email, password, role, status } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { employee_id, name, email, password, role, status },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee Not Found" });
    res.status(200).json({ employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee Not Found" });
    res.status(200).json({ message: "Employee Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Login employee (no bcrypt)
const loginEmployee = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const employee = await Employee.findOne({ 
      email: new RegExp(`^${email.trim()}$`, 'i'),
      role: new RegExp(`^${role.trim()}$`, 'i')
    });

    if (!employee) 
      return res.status(404).json({ message: "Employee not found with given role" });

    if (employee.password !== password) 
      return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ Export all controllers at once
module.exports = {
  getAllEmployees,
  addEmployees,
  getById,
  updateEmployee,
  deleteEmployee,
  loginEmployee
};
