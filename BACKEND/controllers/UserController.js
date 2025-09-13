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

// Forgot Password
const forgotPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

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

  // Update password directly (plain text)
  try {
    existingUser.password = newPassword;
    await existingUser.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to update password" });
  }

  return res.status(200).json({ message: "Password updated successfully" });
};

// Logout (basic implementation)
const logoutUser = async (req, res, next) => {
  // Since we're using plain text passwords without sessions/tokens,
  // logout is handled on the frontend by clearing stored user data
  return res.status(200).json({ message: "Logout successful" });
};

// Delete User Profile
const deleteUserProfile = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let existingUser;
  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to delete profile" });
  }
};

// Update User Profile
const updateUserProfile = async (req, res, next) => {
  const { userId, firstName, lastName, email, profilePicture } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let existingUser;
  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if email is being changed and if it's already taken by another user
  if (email && email !== existingUser.email) {
    try {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Update user fields
  try {
    if (firstName) existingUser.firstName = firstName;
    if (lastName) existingUser.lastName = lastName;
    if (email) existingUser.email = email;
    if (profilePicture !== undefined) existingUser.profilePicture = profilePicture;

    await existingUser.save();
    return res.status(200).json({ 
      message: "Profile updated successfully", 
      user: existingUser 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to update profile" });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  forgotPassword,
  logoutUser,
  deleteUserProfile,
  updateUserProfile,
};
