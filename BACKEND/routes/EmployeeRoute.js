const express = require('express');
const router = express.Router();

// Import Employee model
const Employee = require("../model/EmployeeModel");

// Import Employee controller
const EmployeeController = require("../controllers/EmployeeController");

// Routes
router.get("/", EmployeeController.getAllEmployees);       // Get all employees
router.post("/", EmployeeController.addEmployees);        // Add new employee
router.get("/:id", EmployeeController.getById);           // Get employee by ID
router.put("/:id", EmployeeController.updateEmployee);    // Update employee
router.delete("/:id", EmployeeController.deleteEmployee); // Delete employee

// Export router
module.exports = router;
