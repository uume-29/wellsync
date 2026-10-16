const User = require('../models/User');
const sendTokenResponse = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists in Mongoose collection
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user (password automatically hashed by pre-save bcrypt hook)
    const user = await User.create({
      name,
      email: cleanEmail,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('[Register Detailed Error Stack]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during user registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user (explicitly select password for verification)
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[Login Detailed Error Stack]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logoutUser = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
    });
  } catch (error) {
    console.error('[Logout Detailed Error Stack]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.',
    });
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const preferences = user.preferences ? (user.preferences.toObject ? user.preferences.toObject() : { ...user.preferences }) : {};
    if (preferences.weeklyBudget && preferences.weeklyBudget <= 150) {
      preferences.weeklyBudget = 2500;
      user.preferences.weeklyBudget = 2500;
      await user.save();
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[GetMe Detailed Error Stack]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user details.',
    });
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, preferences, weeklyBudget, calorieTarget, dietaryRestrictions, allergies, wellnessGoals } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name.trim();

    // Support both nested req.body.preferences and top-level fields
    const incomingPrefs = { ...(preferences || {}) };
    if (weeklyBudget !== undefined) incomingPrefs.weeklyBudget = Number(weeklyBudget);
    if (calorieTarget !== undefined) incomingPrefs.calorieTarget = Number(calorieTarget);
    if (dietaryRestrictions !== undefined) incomingPrefs.dietaryRestrictions = dietaryRestrictions;
    if (allergies !== undefined) incomingPrefs.allergies = allergies;
    if (wellnessGoals !== undefined) incomingPrefs.wellnessGoals = wellnessGoals;

    if (Object.keys(incomingPrefs).length > 0) {
      user.preferences = {
        ...(user.preferences?.toObject ? user.preferences.toObject() : user.preferences),
        ...incomingPrefs,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.',
    });
  }
};

