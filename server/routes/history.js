const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WatchHistory = require('../models/WatchHistory');

// @route   GET /api/history/:userId
// @desc    Get watch history
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        let history = await WatchHistory.findOne({ userId: req.params.userId }).populate('history.reviewId');

        if (!history) {
            history = new WatchHistory({ userId: req.params.userId, history: [] });
            await history.save();
        }

        res.json({ success: true, history });
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/history/:userId
// @desc    Add movie to history
// @access  Private
router.post('/:userId', auth, async (req, res) => {
    try {
        const { movieId, rating, mood, platform } = req.body;

        let history = await WatchHistory.findOne({ userId: req.userId });
        if (!history) {
            history = new WatchHistory({ userId: req.userId, history: [] });
        }

        history.history.unshift({
            movieId,
            rating,
            mood,
            platform,
            watchedDate: new Date()
        });

        await history.save();
        res.json({ success: true, history });
    } catch (error) {
        console.error('Add History Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
