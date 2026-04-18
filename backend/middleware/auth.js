const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Protect routes - verify JWT token for both users and admins
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin token or user token
    if (decoded.isAdmin) {
      // Get admin from token
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Admin not found.'
        });
      }
      req.admin = admin;
      req.user = null; // Clear user field for admins
    } else {
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }
      req.user = user;
      req.admin = null; // Clear admin field for users
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Admin middleware - check if authenticated user is admin
const admin = (req, res, next) => {
  if (req.admin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.isAdmin) {
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin) {
          req.admin = admin;
        }
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

module.exports = { protect, admin, optionalAuth };
