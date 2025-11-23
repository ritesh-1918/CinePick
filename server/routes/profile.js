const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const WatchHistory = require('../models/WatchHistory');
const Review = require('../models/Review');

// @route   GET /api/profile/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch stats
        const watchlist = await Watchlist.findOne({ userId: req.params.userId });
        const history = await WatchHistory.findOne({ userId: req.params.userId });
        const reviews = await Review.countDocuments({ userId: req.params.userId });

        const stats = {
            totalWatched: history ? history.history.length : 0,
            totalReviews: reviews,
            watchlistCount: watchlist ? watchlist.lists.reduce((acc, list) => acc + list.movies.length, 0) : 0,
            favoriteGenres: user.preferences.favoriteGenres
        };

        res.json({
            success: true,
            user: {
                ...user.toJSON(),
                stats
            }
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/profile/:userId
// @desc    Update user profile
// @access  Private
router.put('/:userId', auth, async (req, res) => {
    try {
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const {
            displayName,
            profileImage,
            preferences,
            privacySettings,
            notifications
        } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (displayName) user.displayName = displayName;
        if (profileImage) user.profileImage = profileImage;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };
        if (notifications) user.notifications = { ...user.notifications, ...notifications };

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar-' + req.userId + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});

// @route   POST /api/profile/avatar
// @desc    Upload profile picture
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Construct the file URL (assuming server runs on localhost:5000)
        // In production, this should be an absolute URL or handled via a CDN/S3
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        user.profileImage = fileUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture updated',
            fileUrl
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

// @route   DELETE /api/profile/:userId
// @desc    Delete user account and all data
// @access  Private
router.delete('/:userId', auth, async (req, res) => {
    try {
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete all related data
        await Watchlist.deleteMany({ userId: req.userId });
        await WatchHistory.deleteMany({ userId: req.userId });
        await Review.deleteMany({ userId: req.userId });

        // Delete the user
        await User.findByIdAndDelete(req.userId);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
