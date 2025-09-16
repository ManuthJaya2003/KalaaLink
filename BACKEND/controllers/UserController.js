const User = require("../model/UserModel");

// Get all users
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  return res.status(200).json({ users });
};

// Register (Sign Up)
const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Create new user (store plain password — not secure)
  const user = new User({
    firstName,
    lastName,
    email,
    password, // storing plain password
    role,
  });

  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to register user" });
  }

  return res.status(201).json({ user });
};

// Login
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Compare plain text password
  if (password !== existingUser.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json({ message: "Login successful", user: existingUser });
};

// Deactivate user
const deactivateUser = async (req, res, next) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add isActive field if it doesn't exist, or update it
    user.isActive = false;
    await user.save();

    return res.status(200).json({ 
      message: "User deactivated successfully", 
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user signup statistics for the current year
const getUserSignupStats = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get signup counts by month
    const signupStats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Create array with all 12 months, filling in 0 for months with no signups
    const monthlyStats = Array.from({ length: 12 }, (_, index) => {
      const monthData = signupStats.find(stat => stat._id === index + 1);
      return {
        month: index + 1,
        monthName: new Date(currentYear, index).toLocaleString('default', { month: 'short' }),
        signups: monthData ? monthData.count : 0
      };
    });

    return res.status(200).json({ monthlyStats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get recent user registrations
const getRecentUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find()
      .select('firstName lastName email createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Clear (permanently delete) user record
const clearUser = async (req, res, next) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow clearing deactivated users
    if (user.isActive !== false) {
      return res.status(400).json({ 
        message: "Only deactivated users can be cleared from the database" 
      });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ 
      message: "User record cleared successfully from database"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  deactivateUser,
  getUserSignupStats,
  getRecentUsers,
  clearUser,
};
