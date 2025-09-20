import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './UserManagementTab.css';

const UserManagementTab = () => {
  const [signupStats, setSignupStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, allUsersResponse] = await Promise.all([
        fetch('http://localhost:5000/users/stats/signups'),
        fetch('http://localhost:5000/users/recent?limit=10'),
        fetch('http://localhost:5000/users')
      ]);

      if (!statsResponse.ok || !usersResponse.ok || !allUsersResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const statsData = await statsResponse.json();
      const usersData = await usersResponse.json();
      const allUsersData = await allUsersResponse.json();

      setSignupStats(statsData.monthlyStats || []);
      setRecentUsers(usersData.users || []);
      
      // Debug: Log the user data
      console.log('Recent users data:', usersData.users);
      console.log('All users data:', allUsersData.users);
      
      // Separate active and inactive users
      const allUsers = allUsersData.users || [];
      const active = allUsers.filter(user => user.isActive !== false);
      const inactive = allUsers.filter(user => user.isActive === false);
      
      setActiveUsers(active);
      setInactiveUsers(inactive);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    const confirmed = window.confirm(`Are you sure you want to deactivate ${userName}?`);
    
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      // Update the user in the local state
      setRecentUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isActive: false }
            : user
        )
      );

      // Update active/inactive user counts
      const userToDeactivate = activeUsers.find(user => user._id === userId);
      if (userToDeactivate) {
        setActiveUsers(prev => prev.filter(user => user._id !== userId));
        setInactiveUsers(prev => [...prev, { ...userToDeactivate, isActive: false }]);
      }

      alert('User deactivated successfully');
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert('Failed to deactivate user');
    }
  };

  const handleClearUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete ${userName}'s record from the database.\n\nThis action cannot be undone. Are you sure you want to continue?`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/users/${userId}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear user');
      }

      // Remove the user from the local state
      setRecentUsers(prevUsers => 
        prevUsers.filter(user => user._id !== userId)
      );

      // Update inactive users list
      setInactiveUsers(prev => prev.filter(user => user._id !== userId));

      // Refresh the chart data to reflect the change
      fetchUserData();

      alert('User record cleared successfully from database');
    } catch (err) {
      console.error('Error clearing user:', err);
      alert(`Failed to clear user: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Report Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('User Management Statistics Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${currentDate}`, 20, 40);
    doc.text(`Report Period: ${new Date().getFullYear()}`, 20, 50);

    // Summary Statistics
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 20, 70);

    const totalUsers = activeUsers.length + inactiveUsers.length;
    const activeCount = activeUsers.length;
    const inactiveCount = inactiveUsers.length;
    const totalSignups = signupStats.reduce((total, month) => total + month.signups, 0);
    const currentMonthSignups = signupStats[new Date().getMonth()]?.signups || 0;

    doc.setFontSize(12);
    doc.text(`Total Users: ${totalUsers}`, 20, 85);
    doc.text(`Active Users: ${activeCount}`, 20, 95);
    doc.text(`Inactive Users: ${inactiveCount}`, 20, 105);
    doc.text(`Total Signups This Year: ${totalSignups}`, 20, 115);
    doc.text(`Current Month Signups: ${currentMonthSignups}`, 20, 125);

    // Monthly Signup Statistics Table
    doc.setFontSize(16);
    doc.text('Monthly Signup Statistics', 20, 145);

    const monthlyData = signupStats.map(month => [
      month.monthName,
      month.signups.toString()
    ]);

    autoTable(doc, {
      startY: 155,
      head: [['Month', 'Signups']],
      body: monthlyData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 255]
      }
    });

    // Recent Users Table
    const tableStartY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Recent User Registrations', 20, tableStartY);

    const recentUsersData = recentUsers.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      formatDate(user.createdAt),
      user.isActive === false ? 'Inactive' : 'Active'
    ]);

    autoTable(doc, {
      startY: tableStartY + 10,
      head: [['Name', 'Email', 'Signup Date', 'Status']],
      body: recentUsersData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 255]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('KalaaLink Admin Dashboard - User Management Report', 
        doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, 
        { align: 'right' });
    }

    // Download the PDF
    doc.save(`User_Management_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="section-header">
          <h1>User Management</h1>
          <p className="section-subtitle">Manage user accounts and view signup statistics</p>
        </div>
        <div className="loading-container">
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchUserData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="section-header">
        <h1>User Management</h1>
        <p className="section-subtitle">Manage user accounts and view signup statistics</p>
      </div>

      {/* User Status Charts */}
      <div className="charts-section">
        <h3>User Status Overview</h3>
        
        {/* Active Users Chart */}
        <div className="chart-section">
          <h4>Active Users ({activeUsers.length})</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={signupStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="monthName" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Active Signups']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="signups" 
                  fill="#28a745" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inactive Users Chart */}
        <div className="chart-section">
          <h4>Inactive Users ({inactiveUsers.length})</h4>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={signupStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="monthName" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [value, 'Inactive Signups']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="signups" 
                  fill="#dc3545" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="table-section">
        <h3>Recent User Registrations</h3>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Signup Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No users found
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user._id} className={user.isActive === false ? 'inactive-user' : ''}>
                    <td>
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${user.isActive === false ? 'inactive' : 'active'}`}>
                        {user.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.isActive !== false ? (
                          <button
                            onClick={() => handleDeactivateUser(user._id, `${user.firstName} ${user.lastName}`)}
                            className="deactivate-btn"
                            title="Deactivate user"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleClearUser(user._id, `${user.firstName} ${user.lastName}`)}
                            className="clear-btn"
                            title="Permanently delete user record from database"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="report-section">
        <button 
          onClick={generateReport}
          className="generate-report-btn"
          title="Generate and download User Management Statistics Report"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default UserManagementTab;
