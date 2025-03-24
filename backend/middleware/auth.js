const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'No token provided',
                success: false
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided',
                success: false
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ 
                message: 'Invalid or expired token',
                success: false
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'Server error in auth middleware',
            success: false
        });
    }
};

module.exports = authMiddleware;