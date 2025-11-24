const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
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

// @route   GET /api/reviews/:userId
// @desc    Get user reviews with movie details
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 });

        const enrichedReviews = [];
        for (const review of reviews) {
            const movieDetails = await fetchMovieDetails(review.movieId);
            if (movieDetails) {
                enrichedReviews.push({
                    ...review.toObject(),
                    movieDetails: {
                        title: movieDetails.title,
                        poster_path: movieDetails.poster_path,
                        release_date: movieDetails.release_date
                    }
                });
            } else {
                // Keep review even if movie fetch fails, but with fallback
                enrichedReviews.push({
                    ...review.toObject(),
                    movieDetails: {
                        title: 'Unknown Movie',
                        poster_path: null
                    }
                });
            }
        }

        res.json({ success: true, reviews: enrichedReviews });
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
