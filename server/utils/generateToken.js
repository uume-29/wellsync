const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  // Convert _id to string for JWT payload
  const userId = user._id ? user._id.toString() : user.id;

  const token = jwt.sign(
    { id: userId, email: user.email },
    process.env.JWT_SECRET || 'wellsync_super_secret_jwt_key_2026_production',
    { expiresIn: '30d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // Prevents XSS access to token
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  return res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
};

module.exports = sendTokenResponse;
