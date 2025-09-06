// Employee Logout Utility
// This utility handles proper employee logout including heartbeat cleanup

import employeeHeartbeat from './employeeHeartbeat';

export const logoutEmployee = async (navigate, redirectPath = '/') => {
  try {
    // Get employee info from localStorage
    const employeeData = localStorage.getItem('employee');
    
    if (employeeData) {
      const employee = JSON.parse(employeeData);
      
      // Call logout API to update server status
      await fetch('http://localhost:5000/api/employees/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee.id
        })
      });
    }
  } catch (error) {
    console.error('Error during logout API call:', error);
    // Continue with logout even if API call fails
  }

  // Stop heartbeat mechanism
  employeeHeartbeat.stop();

  // Clear all stored user data
  localStorage.removeItem('employee');
  localStorage.removeItem('user');
  localStorage.removeItem('artist');

  // Navigate to specified path
  if (navigate) {
    navigate(redirectPath);
  }
};

export default logoutEmployee;
