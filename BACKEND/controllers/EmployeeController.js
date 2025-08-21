const Employee = require('../model/EmployeeModel');

// Get all employees
const getAllEmployees = async (req, res, next) => {
    let employees;
    try {
        employees = await Employee.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }

    if (!employees || employees.length === 0) {
        return res.status(404).json({ message: "Employees Not Found" });
    }

    return res.status(200).json({ employees });
};// Add new employee
const addEmployees = async (req, res, next) => {
    const { employee_id, name, email, role, status } = req.body;
    let employee;

    try {
        employee = new Employee({
            employee_id,
            name,
            email,
            role,
            status
        });

        await employee.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to Add Employee" });
    }

    return res.status(201).json({ employee });
};
// Get employee by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let employee;

    try {
        employee = await Employee.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server Error" });
    }

    if (!employee) {
        return res.status(404).json({ message: "Employee Not Found" });
    }

    return res.status(200).json({ employee });
};// Update employee
const updateEmployee = async (req, res, next) => {
    const id = req.params.id;
    const { employee_id, name, email, role, status } = req.body;
    let employee;

    try {
        employee = await Employee.findByIdAndUpdate(
            id,
            { employee_id, name, email, role, status },
            { new: true } // return updated document
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to Update Employee" });
    }

    if (!employee) {
        return res.status(404).json({ message: "Employee Not Found" });
    }

    return res.status(200).json({ employee });
};// Delete employee
const deleteEmployee = async (req, res, next) => {
    const id = req.params.id;
    let employee;

    try {
        employee = await Employee.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to Delete Employee" });
    }

    if (!employee) {
        return res.status(404).json({ message: "Employee Not Found" });
    }

    return res.status(200).json({ message: "Employee Deleted Successfully" });
};// Export controllers
exports.getAllEmployees = getAllEmployees;
exports.addEmployees = addEmployees;
exports.getById = getById;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;