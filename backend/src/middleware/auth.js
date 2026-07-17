const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * protect: verifies the JWT access token sent in the Authorization header
 * ("Bearer <token>") and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authenticated — access token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('User belonging to this token no longer exists');
    }
    if (user.isBlocked) {
      res.status(403);
      throw new Error('This account has been blocked. Contact support.');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      throw new Error('Access token expired — refresh and try again');
    }
    throw new Error('Not authenticated — invalid token');
  }
});

/**
 * authorize(...roles): role-based guard, used after protect().
 * Example: router.delete('/:id', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role "${req.user ? req.user.role : 'guest'}" is not permitted to perform this action`);
  }
  next();
};

/**
 * optionalAuth: attaches req.user if a valid token is present, but does not
 * block the request otherwise. Useful for endpoints like listing detail,
 * where a logged-in user sees a "swap" button but guests can still browse.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      // silently ignore — treat as guest
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
