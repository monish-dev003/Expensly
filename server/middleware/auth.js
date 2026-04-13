const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = { protect };

/**
 * assertOwner(doc, req)
 * Throws a 403 if the document doesn't belong to the logged-in user.
 * Usage: assertOwner(wallet, req);
 */
module.exports.assertOwner = (doc, req) => {
  if (!doc) {
    const err = new Error('Resource not found.');
    err.statusCode = 404;
    throw err;
  }
  const docUserId = String(doc.userId?._id || doc.userId);
  const reqUserId = String(req.user._id);
  if (docUserId !== reqUserId) {
    const err = new Error('You do not have permission to access this resource.');
    err.statusCode = 403;
    throw err;
  }
};
