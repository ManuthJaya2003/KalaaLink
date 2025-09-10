const express = require('express');
const router = express.Router();

// Import Employee model
// Employee model will be loaded via controller

// Import Employee controller
const EmployeeController = require("../controllers/EmployeeController");

// Authentication routes
router.post("/login", EmployeeController.loginEmployee);    // Login employee
router.post("/logout", EmployeeController.logoutEmployee);  // Logout employee
router.post("/heartbeat", EmployeeController.heartbeatEmployee); // Heartbeat for session management
router.post("/cleanup-inactive", async (req, res) => {     // Manual cleanup of inactive employees
  try {
    const count = await EmployeeController.setInactiveEmployeesOffline();
    res.status(200).json({ message: `Set ${count} inactive employees offline` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CRUD routes
router.get("/", EmployeeController.getAllEmployees);       // Get all employees
router.post("/", EmployeeController.addEmployees);        // Add new employee
router.get("/:id", EmployeeController.getById);           // Get employee by ID
router.put("/:id", EmployeeController.updateEmployee);    // Update employee
router.delete("/:id", EmployeeController.deleteEmployee); // Delete employee



// Export router
module.exports = router;
