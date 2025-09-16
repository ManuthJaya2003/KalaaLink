import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmployeeManagement from '../EmployeeManagement/EmployeeManagement';
import SystemOverview from './SystemOverview';
import CrewRequestsTab from './CrewRequestsTab';
import UserManagementTab from './UserManagementTab';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('system-overview');
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
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-navigation">
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'system-overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('system-overview')}
          >
            System Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'employee-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('employee-management')}
          >
            Employee Management
          </button>
          <button 
            className={`nav-item ${activeTab === 'crew-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('crew-requests')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Crew Requests</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'user-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-management')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <path d="M20 8v6"/>
              <path d="M23 11h-6"/>
            </svg>
            <span>User Management</span>
          </button>
          <button 
            className="nav-item complaints-nav-btn"
            onClick={() => navigate('/complaints', { state: { fromAdmin: true } })}
            title="View and manage customer complaints"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M13 8H7"/>
              <path d="M17 12H7"/>
            </svg>
            <span>Complaints</span>
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'system-overview' && <SystemOverview />}
        {activeTab === 'employee-management' && <EmployeeManagement />}
        {activeTab === 'crew-requests' && <CrewRequestsTab />}
        {activeTab === 'user-management' && <UserManagementTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
