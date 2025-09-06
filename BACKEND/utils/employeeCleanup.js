// Employee Cleanup Utility
// This utility runs periodic cleanup to set inactive employees offline

const Employee = require('../model/EmployeeModel');

// Function to set inactive employees offline
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

    if (result.modifiedCount > 0) {
      console.log(`[${new Date().toISOString()}] Cleanup: Set ${result.modifiedCount} inactive employees offline`);
    }
    
    return result.modifiedCount;
  } catch (err) {
    console.error('Error setting inactive employees offline:', err);
    return 0;
  }
};

// Start periodic cleanup (every 2 minutes)
const startCleanupScheduler = () => {
  console.log('Starting employee cleanup scheduler...');
  
  // Run cleanup every 2 minutes
  setInterval(async () => {
    await setInactiveEmployeesOffline();
  }, 2 * 60 * 1000);
  
  // Also run cleanup on startup
  setInactiveEmployeesOffline();
};

module.exports = {
  setInactiveEmployeesOffline,
  startCleanupScheduler
};
