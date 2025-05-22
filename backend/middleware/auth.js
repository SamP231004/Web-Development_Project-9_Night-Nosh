const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (role) => (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided', success: false });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (role && req.user.role !== role) {
            return res.status(403).json({ message: 'Unauthorized', success: false });
        }
        next();
    } 
    catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid or expired token', success: false });
        }
        console.error('Server error in auth middleware:', err);
        return res.status(500).json({ message: 'Server error in auth middleware', success: false });
    }
};

module.exports = authMiddleware;