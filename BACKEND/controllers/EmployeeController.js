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
  const { firstName, lastName, email, password, role, username } = req.body;

  try {
    // Check if email or username already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { username }]
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        message: existingEmployee.email === email ? "Email already exists" : "Username already exists" 
      });
    }

    const employee = new Employee({
      firstName,
      lastName,
      email,
      password,   // plain text as requested
      role,
      username,
      status: 'On Leave' // Default status
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
  const { firstName, lastName, email, password, role, username, status } = req.body;

  try {
    // Check if email or username already exists for other employees
    const existingEmployee = await Employee.findOne({
      _id: { $ne: req.params.id },
      $or: [{ email }, { username }]
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        message: existingEmployee.email === email ? "Email already exists" : "Username already exists" 
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, password, role, username, status },
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

// Login employee (plain text password comparison)
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

    // Set online status on login (status remains manual)
    await Employee.findByIdAndUpdate(employee._id, { 
      isOnline: true 
    });

    res.status(200).json({
      message: "Login successful",
      employee: {
        id: employee._id,
        employeeID: employee.employeeID,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        username: employee.username
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update employee status to On Leave (logout)
const logoutEmployee = async (req, res) => {
  const { employeeId } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { 
        isOnline: false 
      },
      { new: true }
    );

    if (!employee) 
      return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({
      message: "Logout successful",
      employee: {
        id: employee._id,
        status: employee.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Heartbeat mechanism to keep employee status active during session
const heartbeatEmployee = async (req, res) => {
  const { employeeId } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { 
        isOnline: true,
        lastHeartbeat: new Date() // Track last activity
      },
      { new: true }
    );

    if (!employee) 
      return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({
      message: "Heartbeat successful",
      employee: {
        id: employee._id,
        isOnline: employee.isOnline,
        status: employee.status,
        lastHeartbeat: employee.lastHeartbeat
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Utility function to automatically set employees offline if inactive
const setInactiveEmployeesOffline = async () => {
  try {
    const inactiveThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    
    const result = await Employee.updateMany(
      {
        isOnline: true,
        $or: [
          { lastHeartbeat: { $lt: inactiveThreshold } },
          { lastHeartbeat: { $exists: false } }
        ]
      },
      {
        isOnline: false
      }
    );

    console.log(`Set ${result.modifiedCount} inactive employees offline`);
    return result.modifiedCount;
  } catch (err) {
    console.error('Error setting inactive employees offline:', err);
    return 0;
  }
};



// ✅ Export all controllers at once
module.exports = {
  getAllEmployees,
  addEmployees,
  getById,
  updateEmployee,
  deleteEmployee,
  loginEmployee,
  logoutEmployee,
  heartbeatEmployee,
  setInactiveEmployeesOffline
};
