const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  }
  catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed: ' + err.message });
  }
};