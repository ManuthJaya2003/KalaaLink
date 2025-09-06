import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';

const API_BASE = 'http://localhost:5000/api/employees';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    username: '',
    password: '',
    status: 'On Leave'
  });

  // Load employees on component mount and set up auto-refresh
  useEffect(() => {
    loadEmployees();
    
    // Auto-refresh employee status every 30 seconds
    const interval = setInterval(loadEmployees, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_BASE);
      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const cleanupInactiveEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API_BASE}/cleanup-inactive`);
      await loadEmployees(); // Refresh the list
    } catch (err) {
      console.error('Error cleaning up inactive employees:', err);
      setError('Failed to cleanup inactive employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      username: '',
      password: '',
      status: 'On Leave'
    });
    setEditingEmployee(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
      username: employee.username,
      password: employee.password,
      status: employee.status
    });
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      if (editingEmployee) {
        // Update existing employee
        await axios.put(`${API_BASE}/${editingEmployee._id}`, formData);
      } else {
        // Add new employee
        await axios.post(API_BASE, formData);
      }

      await loadEmployees();
      closeModal();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await axios.delete(`${API_BASE}/${employeeId}`);
      await loadEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-management">
      <div className="employee-header">
        <h1>Employee Management</h1>
        <div className="header-actions">
          <button className="btn-refresh" onClick={loadEmployees} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn-cleanup" onClick={cleanupInactiveEmployees} disabled={loading}>
            🧹 Cleanup Inactive
          </button>
          <button className="btn-add" onClick={openAddModal}>
            Add Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Loading...
        </div>
      )}

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status <span style={{fontSize: '0.8em', color: '#666'}}>(Manual)</span></th>
              <th>Online <span style={{fontSize: '0.8em', color: '#666'}}>(Auto)</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeID}</td>
                <td>{employee.firstName} {employee.lastName}</td>
                <td>{employee.email}</td>
                <td>{employee.role}</td>
                <td>
                  <span className={`status ${employee.status.toLowerCase().replace(' ', '-')}`}>
                    {employee.status}
                  </span>
                </td>
                <td>
                  <span className={`online-indicator ${employee.isOnline ? 'online' : 'offline'}`}>
                    {employee.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-edit" 
                    onClick={() => openEditModal(employee)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(employee._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Employee */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role/Position *</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="On Leave">On Leave</option>
                  <option value="Active">Active</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : (editingEmployee ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;
