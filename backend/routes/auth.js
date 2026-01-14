const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

module.exports = (db) => {

    /**
     * GET /api/auth/me
     * Get current user profile
     */
    router.get('/me', verifyToken, async (req, res) => {
        try {
            const userId = req.user.uid;

            // Try to get user from 'users' collection first
            let userDoc = await db.collection('users').doc(userId).get();

            if (!userDoc.exists) {
                // If not found, return basic info from token
                return res.json({
                    uid: userId,
                    email: req.user.email,
                    username: req.user.name || req.user.email.split('@')[0],
                    avatar: req.user.picture || null
                });
            }

            res.json({ id: userId, ...userDoc.data() });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * PATCH /api/auth/me
     * Update user profile
     */
    router.patch('/me', verifyToken, async (req, res) => {
        try {
            const userId = req.user.uid;
            const { username, email, avatar } = req.body;

            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (avatar) updateData.avatar = avatar;
            updateData.updatedAt = new Date().toISOString();

            const userRef = db.collection('users').doc(userId);

            // Use set with merge: true to create if not exists
            await userRef.set(updateData, { merge: true });

            const updatedDoc = await userRef.get();
            res.json({ id: userId, ...updatedDoc.data() });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};
