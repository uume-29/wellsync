const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token && req.cookies.token !== 'none') {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production'
    );

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      // Fallback check
      const { memoryUsers } = require('../controllers/authController');
      user = memoryUsers.find((u) => u._id.toString() === decoded.id.toString());
      if (user) {
        const { password, ...safeUser } = user;
        user = safeUser;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(`[Auth Middleware Error]: ${err.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

module.exports = { protect };
