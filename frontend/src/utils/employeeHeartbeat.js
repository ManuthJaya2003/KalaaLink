// Employee Heartbeat Utility
// This utility helps maintain employee online status during active sessions

class EmployeeHeartbeat {
  constructor() {
    this.intervalId = null;
    this.employeeId = null;
    this.isActive = false;
    this.heartbeatInterval = 2 * 60 * 1000; // 2 minutes
  }

  // Start heartbeat for an employee
  start(employeeId) {
    if (this.isActive && this.employeeId === employeeId) {
      return; // Already running for this employee
    }

    this.stop(); // Stop any existing heartbeat
    this.employeeId = employeeId;
    this.isActive = true;

    // Send initial heartbeat
    this.sendHeartbeat();

    // Set up interval for regular heartbeats
    this.intervalId = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);

    console.log(`Heartbeat started for employee ${employeeId}`);
  }

  // Stop heartbeat
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    this.employeeId = null;
    console.log('Heartbeat stopped');
  }

  // Send heartbeat to server
  async sendHeartbeat() {
    if (!this.employeeId || !this.isActive) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/employees/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: this.employeeId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Heartbeat sent successfully:', data.message);
      } else {
        console.warn('Heartbeat failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }

  // Check if heartbeat is active
  isHeartbeatActive() {
    return this.isActive;
  }

  // Get current employee ID
  getCurrentEmployeeId() {
    return this.employeeId;
  }
}

// Create a singleton instance
const employeeHeartbeat = new EmployeeHeartbeat();

export default employeeHeartbeat;
