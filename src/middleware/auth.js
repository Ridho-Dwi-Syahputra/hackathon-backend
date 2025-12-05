//middleware/auth.js

const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token exists in database and is valid
        const [users] = await db.query('SELECT users_id, email, full_name, status FROM users WHERE users_id = ? AND token = ? AND status = "active"', [decoded.userId, token]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau user tidak aktif',
            });
        }

        // Attach user to request
        req.user = {
            id: users[0].users_id, // Map users_id ke id untuk consistency
            users_id: users[0].users_id,
            email: users[0].email,
            full_name: users[0].full_name,
            status: users[0].status,
        };
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token telah kadaluarsa',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat verifikasi token',
        });
    }
};

module.exports = authMiddleware;
