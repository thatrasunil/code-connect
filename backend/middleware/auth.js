const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID Token
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = verifyToken;
