const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

// Test DB Connection
router.get('/db', async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        // Try a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();

        res.json({
            status: 'success',
            message: 'Database connection is working',
            state: states[state],
            collectionCount: collections.length,
            collections: collections.map(c => c.name)
        });
    } catch (error) {
        console.error('Debug DB Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Test Email Sending
router.post('/email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        await sendEmail({
            email,
            subject: 'CinePick Debug Email',
            message: 'This is a test email to verify your email configuration.',
            type: 'OTHER'
        });

        res.json({
            status: 'success',
            message: `Test email sent to ${email}`
        });
    } catch (error) {
        console.error('Debug Email Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Email sending failed',
            error: error.message
        });
    }
});

// Dump Env Vars (Safe subset)
router.get('/env', (req, res) => {
    res.json({
        NODE_ENV: process.env.NODE_ENV,
        HAS_MONGO_URI: !!process.env.MONGO_URI,
        HAS_JWT_SECRET: !!process.env.JWT_SECRET,
        HAS_EMAIL_USER: !!process.env.EMAIL_USER,
        HAS_EMAIL_PASS: !!process.env.EMAIL_PASS,
        HAS_GOOGLE_CREDS: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        FRONTEND_URL: process.env.FRONTEND_URL,
        VITE_API_URL: process.env.VITE_API_URL // This might be undefined on server, but good to check
    });
});

module.exports = router;
