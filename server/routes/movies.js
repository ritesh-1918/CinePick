const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SavedMovie = require('../models/SavedMovie');
const WatchHistory = require('../models/UserWatchHistory');
const Favorite = require('../models/Favorite');

// @route   GET /api/movies/saved
// @desc    Get user's saved movies
// @access  Private
router.get('/saved', auth, async (req, res) => {
    try {
        const savedMovies = await SavedMovie.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: savedMovies
        });
    } catch (error) {
        console.error('Error fetching saved movies:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/movies/saved
// @desc    Save a movie to user's list
// @access  Private
router.post('/saved', auth, async (req, res) => {
    try {
        const { movieId, title, year, poster } = req.body;

        // Check if already saved
        const existing = await SavedMovie.findOne({ userId: req.userId, movieId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Movie already saved'
            });
        }

        const savedMovie = new SavedMovie({
            userId: req.userId,
            movieId,
            title,
            year,
            poster
        });

        await savedMovie.save();

        res.json({
            success: true,
            message: 'Movie saved successfully',
            data: savedMovie
        });
    } catch (error) {
        console.error('Error saving movie:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/movies/saved/:id
// @desc    Remove a movie from saved list
// @access  Private
router.delete('/saved/:id', auth, async (req, res) => {
    try {
        await SavedMovie.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Movie removed from saved list'
        });
    } catch (error) {
        console.error('Error removing saved movie:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/movies/history
// @desc    Get user's watch history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const history = await WatchHistory.find({ userId: req.userId }).sort({ watchedAt: -1 });
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/movies/history
// @desc    Add a movie to watch history
// @access  Private
router.post('/history', auth, async (req, res) => {
    try {
        const { movieId, title, year, poster } = req.body;

        const historyEntry = new WatchHistory({
            userId: req.userId,
            movieId,
            title,
            year,
            poster
        });

        await historyEntry.save();

        res.json({
            success: true,
            message: 'Added to watch history',
            data: historyEntry
        });
    } catch (error) {
        console.error('Error adding to history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/movies/history/:id
// @desc    Remove a movie from watch history
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
    try {
        await WatchHistory.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Movie removed from history'
        });
    } catch (error) {
        console.error('Error removing from history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/movies/favorites
// @desc    Get user's favorite movies
// @access  Private
router.get('/favorites', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.userId }).sort({ favoritedAt: -1 });
        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/movies/favorites
// @desc    Add a movie to favorites
// @access  Private
router.post('/favorites', auth, async (req, res) => {
    try {
        const { movieId, title, year, poster, overview, genres, rating, releaseDate } = req.body;

        // Check if already favorited
        const existing = await Favorite.findOne({ userId: req.userId, movieId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Movie already in favorites'
            });
        }

        const favorite = new Favorite({
            userId: req.userId,
            movieId,
            title,
            year,
            posterUrl: poster,
            overview,
            genres,
            rating,
            releaseDate
        });

        await favorite.save();

        res.json({
            success: true,
            message: 'Added to favorites',
            data: favorite
        });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/movies/favorites/:movieId
// @desc    Remove a movie from favorites by Movie ID
// @access  Private
router.delete('/favorites/:movieId', auth, async (req, res) => {
    try {
        await Favorite.findOneAndDelete({ userId: req.userId, movieId: req.params.movieId });
        res.json({
            success: true,
            message: 'Movie removed from favorites'
        });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/movies
// @desc    Get all movies or search movies
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // This is a placeholder for future movie API integration
        // You can integrate with TMDB, OMDB, or other movie APIs here
        res.json({
            success: true,
            message: 'Movies endpoint - Coming soon',
            movies: []
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/movies/:id
// @desc    Get single movie by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Single movie endpoint - Coming soon',
            movie: null
        });
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
