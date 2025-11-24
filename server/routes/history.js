const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WatchHistory = require('../models/WatchHistory');
const { logActivity } = require('../services/activityLogger');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch movie details
const fetchMovieDetails = async (movieId) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching movie ${movieId}:`, error.message);
        return null;
    }
};

// @route   GET /api/history/:userId
// @desc    Get watch history with aggregated stats
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        let historyDoc = await WatchHistory.findOne({ userId: req.params.userId }).populate('history.reviewId');

        if (!historyDoc) {
            historyDoc = new WatchHistory({ userId: req.params.userId, history: [] });
            await historyDoc.save();
        }

        const historyItems = historyDoc.history;

        // Calculate Stats
        const stats = {
            totalMovies: historyItems.length,
            totalWatchTime: 0,
            genreDistribution: {},
            mostActiveDay: '',
            dayDistribution: {}
        };

        // Enrich history with movie details (limit to last 20 for detailed view, but process all for stats if possible)
        // For performance, we'll process the last 50 items for stats and display
        const recentItems = historyItems.slice(0, 50);
        const enrichedHistory = [];

        for (const item of recentItems) {
            const movieDetails = await fetchMovieDetails(item.movieId);
            if (movieDetails) {
                // Add to stats
                stats.totalWatchTime += movieDetails.runtime || 0;

                movieDetails.genres.forEach(g => {
                    stats.genreDistribution[g.name] = (stats.genreDistribution[g.name] || 0) + 1;
                });

                enrichedHistory.push({
                    ...item.toObject(),
                    movieDetails: {
                        title: movieDetails.title,
                        poster_path: movieDetails.poster_path,
                        genres: movieDetails.genres,
                        runtime: movieDetails.runtime,
                        vote_average: movieDetails.vote_average
                    }
                });
            }
        }

        // Calculate Day Distribution from DB data
        historyItems.forEach(item => {
            if (item.dayOfWeek) {
                stats.dayDistribution[item.dayOfWeek] = (stats.dayDistribution[item.dayOfWeek] || 0) + 1;
            }
        });

        // Find most active day
        let maxDay = 0;
        Object.entries(stats.dayDistribution).forEach(([day, count]) => {
            if (count > maxDay) {
                maxDay = count;
                stats.mostActiveDay = day;
            }
        });

        res.json({
            success: true,
            history: enrichedHistory,
            stats
        });
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

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const hour = now.getHours();
        let timeOfDay = 'night';
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';

        history.history.unshift({
            movieId,
            rating,
            mood,
            platform,
            watchedDate: now,
            dayOfWeek: days[now.getDay()],
            hourOfDay: hour,
            watchedTime: timeOfDay
        });

        await history.save();
        // Log activity for watching a movie
        await logActivity(req.userId, 'watched', { movieId }, { rating, mood, platform });

        res.json({ success: true, history });
    } catch (error) {
        console.error('Add History Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
