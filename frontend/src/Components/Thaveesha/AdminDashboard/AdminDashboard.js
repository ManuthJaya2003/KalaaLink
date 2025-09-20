import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmployeeManagement from '../EmployeeManagement/EmployeeManagement';
import SystemOverview from './SystemOverview';
import CrewRequestsTab from './CrewRequestsTab';
import UserManagementTab from './UserManagementTab';
import AdminHomeTab from './AdminHomeTab';
import ComplaintsTab from './ComplaintsTab';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const employee = JSON.parse(localStorage.getItem('employee'));
      if (employee) {
        await fetch('http://localhost:5000/api/employees/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: employee.id })
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('employee');
      window.location.href = '/professional_login';
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Fixed Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboard</h2>
          <div className="sidebar-logo">
            <img src="/logo.png" alt="KalaaLink Logo" className="logo-icon" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'employee-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('employee-management')}
          >
            Employee Management
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'crew-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('crew-requests')}
          >
            Crew Requests
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'user-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-management')}
          >
            User Management
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            Complaints
          </button>
          <button 
            className="sidebar-btn signout-btn"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Content Area */}
        <div className="admin-content">
          {activeTab === 'home' && <AdminHomeTab />}
          {activeTab === 'analytics' && <SystemOverview />}
          {activeTab === 'employee-management' && <EmployeeManagement />}
          {activeTab === 'crew-requests' && <CrewRequestsTab />}
          {activeTab === 'user-management' && <UserManagementTab />}
          {activeTab === 'complaints' && <ComplaintsTab />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
