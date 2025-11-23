const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');

// @route   GET /api/reviews/:userId
// @desc    Get user reviews
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { movieId, rating, content, mood, isPublic } = req.body;

        const review = new Review({
            userId: req.userId,
            movieId,
            rating,
            content,
            mood,
            isPublic
        });

        await review.save();
        res.json({ success: true, review });
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
