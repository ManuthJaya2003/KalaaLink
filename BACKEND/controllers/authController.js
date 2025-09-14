const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "kalaalink_secret_key_2024";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Sign Up (Register)
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        success: false 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists with this email",
        success: false 
      });
    }

    // Create new user with default role as 'customer'
    const user = new User({
      firstName,
      lastName,
      email,
      password, // storing plain password as requested
      role: 'customer', // default role
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      success: false 
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        success: false 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        success: false 
      });
    }

    // Compare plain text password (as requested)
    if (password !== user.password) {
      return res.status(401).json({ 
        message: "Invalid email or password",
        success: false 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      message: "Login successful",
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      success: false 
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate required fields
    if (!email || !newPassword) {
      return res.status(400).json({ 
        message: "Email and new password are required",
        success: false 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: "User not found with this email",
        success: false 
      });
    }

    // Update password (plain text as requested)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      message: "Server error during password reset",
      success: false 
    });
  }
};

// Logout (client-side token removal, but we can add server-side logic if needed)
const logout = async (req, res) => {
  try {
    // For JWT tokens, logout is typically handled client-side by removing the token
    // But we can add server-side token blacklisting here if needed
    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      message: "Server error during logout",
      success: false 
    });
  }
};

// Get user profile (protected route)
const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // This will be set by auth middleware

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        success: false 
      });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      message: "Server error retrieving profile",
      success: false 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        success: false 
      });
    }

    // Update fields if provided
    if (firstName && firstName.trim() !== '') user.firstName = firstName.trim();
    if (lastName && lastName.trim() !== '') user.lastName = lastName.trim();
    if (email && email.trim() !== '') user.email = email.trim();
    if (password && password.trim() !== '') user.password = password.trim();

    // Handle profile picture upload
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Return updated user data without password
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      message: "Server error updating profile",
      success: false 
    });
  }
};

// Delete user profile
const deleteProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        success: false 
      });
    }

    // Delete the user from database
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Profile deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ 
      message: "Server error deleting profile",
      success: false 
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
};
