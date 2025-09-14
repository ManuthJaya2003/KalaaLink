const jwt = require("jsonwebtoken");

// JWT Secret (should match the one in authController)
const JWT_SECRET = process.env.JWT_SECRET || "kalaalink_secret_key_2024";

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: "Access token required",
      success: false 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        message: "Invalid or expired token",
        success: false 
      });
    }

    // Add userId to request object for use in controllers
    req.userId = decoded.userId;
    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userId = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.userId = null;
    } else {
      req.userId = decoded.userId;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
