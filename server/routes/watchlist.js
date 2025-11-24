const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');
const { logActivity } = require('../services/activityLogger');

// @route   GET /api/watchlist/:userId
// @desc    Get all watchlists for a user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        let watchlist = await Watchlist.findOne({ userId: req.params.userId });
        if (!watchlist) {
            // Create default watchlist if none exists
            watchlist = new Watchlist({
                userId: req.params.userId,
                lists: [{
                    listId: 'default',
                    listName: 'Watch Later',
                    movies: []
                }]
            });
            await watchlist.save();
        }
        res.json({ success: true, watchlist });
    } catch (error) {
        console.error('Get Watchlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/watchlist/:userId
// @desc    Create a new custom watchlist
// @access  Private
router.post('/:userId', auth, async (req, res) => {
    try {
        const { listName } = req.body;
        const listId = listName.toLowerCase().replace(/\s+/g, '-');
        let watchlist = await Watchlist.findOne({ userId: req.userId });
        if (!watchlist) {
            watchlist = new Watchlist({ userId: req.userId, lists: [] });
        }
        watchlist.lists.push({ listId, listName, movies: [] });
        await watchlist.save();
        // Log activity for creating a new watchlist
        await logActivity(req.userId, 'added_watchlist', { listId, listName }, {});
        res.json({ success: true, watchlist });
    } catch (error) {
        console.error('Create Watchlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/watchlist/:userId/:listId/add
// @desc    Add movie to a specific watchlist
// @access  Private
router.post('/:userId/:listId/add', auth, async (req, res) => {
    try {
        const { movieId, moodTag, notes } = req.body;
        const watchlist = await Watchlist.findOne({ userId: req.userId });
        if (!watchlist) {
            return res.status(404).json({ success: false, message: 'Watchlist not found' });
        }
        const listIndex = watchlist.lists.findIndex(l => l.listId === req.params.listId);
        if (listIndex === -1) {
            return res.status(404).json({ success: false, message: 'List not found' });
        }
        // Prevent duplicate entries
        if (watchlist.lists[listIndex].movies.some(m => m.movieId === movieId)) {
            return res.status(400).json({ success: false, message: 'Movie already in watchlist' });
        }
        watchlist.lists[listIndex].movies.push({
            movieId,
            moodTag,
            notes,
            order: watchlist.lists[listIndex].movies.length
        });
        await watchlist.save();
        // Log activity for adding a movie to watchlist
        await logActivity(req.userId, 'added_watchlist', { movieId }, { listId: req.params.listId });
        res.json({ success: true, watchlist });
    } catch (error) {
        console.error('Add to Watchlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/watchlist/:userId/:listId/reorder
// @desc    Reorder movies in a watchlist
// @access  Private
router.put('/:userId/:listId/reorder', auth, async (req, res) => {
    try {
        const { movies } = req.body; // Expecting array of movie objects with new order
        const watchlist = await Watchlist.findOne({ userId: req.userId });
        if (!watchlist) return res.status(404).json({ success: false, message: 'Watchlist not found' });
        const listIndex = watchlist.lists.findIndex(l => l.listId === req.params.listId);
        if (listIndex === -1) return res.status(404).json({ success: false, message: 'List not found' });
        watchlist.lists[listIndex].movies = movies;
        await watchlist.save();
        res.json({ success: true, watchlist });
    } catch (error) {
        console.error('Reorder Watchlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
