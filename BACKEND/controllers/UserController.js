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

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
};
