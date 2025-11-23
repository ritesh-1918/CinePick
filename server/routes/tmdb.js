const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// @route   GET /api/tmdb/search
// @desc    Search movies by query
// @access  Private
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;

        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
                include_adult: false,
                language: 'en-US',
                page: 1
            }
        });

        const movies = response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average?.toFixed(1) || 'N/A',
            poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
            overview: movie.overview
        }));

        res.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('TMDB Search Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to search movies'
        });
    }
});

// @route   GET /api/tmdb/trending
// @desc    Get trending movies
// @access  Private
router.get('/trending', auth, async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US'
            }
        });

        const movies = response.data.results.slice(0, 12).map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average?.toFixed(1) || 'N/A',
            poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
            overview: movie.overview
        }));

        res.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('TMDB Trending Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trending movies'
        });
    }
});

// @route   GET /api/tmdb/popular
// @desc    Get popular movies
// @access  Private
router.get('/popular', auth, async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1
            }
        });

        const movies = response.data.results.slice(0, 12).map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average?.toFixed(1) || 'N/A',
            poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
            overview: movie.overview
        }));

        res.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('TMDB Popular Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular movies'
        });
    }
});

// @route   GET /api/tmdb/now-playing
// @desc    Get now playing / new releases
// @access  Private
router.get('/now-playing', auth, async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: 1
            }
        });

        const movies = response.data.results.slice(0, 12).map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average?.toFixed(1) || 'N/A',
            poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
            overview: movie.overview
        }));

        res.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('TMDB Now Playing Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch new releases'
        });
    }
});

// @route   GET /api/tmdb/movie/:id
// @desc    Get movie details by ID
// @access  Private
router.get('/movie/:id', auth, async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${req.params.id}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                append_to_response: 'videos,credits,similar'
            }
        });

        const movie = response.data;

        const movieData = {
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average?.toFixed(1) || 'N/A',
            runtime: movie.runtime,
            genres: movie.genres?.map(g => g.name) || [],
            poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
            overview: movie.overview,
            tagline: movie.tagline,
            director: movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A',
            cast: movie.credits?.cast?.slice(0, 10).map(c => ({
                name: c.name,
                character: c.character,
                profile: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null
            })) || [],
            trailerKey: movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
            similar: movie.similar?.results?.slice(0, 6).map(m => ({
                id: m.id,
                title: m.title,
                poster: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : null
            })) || []
        };

        res.json({
            success: true,
            data: movieData
        });
    } catch (error) {
        console.error('TMDB Movie Details Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch movie details'
        });
    }
});

// @route   GET /api/tmdb/genres
// @desc    Get movie genres
// @access  Private
router.get('/genres', auth, async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US'
            }
        });

        res.json({
            success: true,
            data: response.data.genres
        });
    } catch (error) {
        console.error('TMDB Genres Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch genres'
        });
    }
});

// @route   GET /api/tmdb/discover
// @desc    Discover movies by genre
// @access  Private
router.get('/discover', auth, async (req, res) => {
    try {
        const { genre } = req.query;

        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                sort_by: 'popularity.desc',
                with_genres: genre,
                page: 1
            }
        });

        const movies = response.data.results.slice(0, 12).map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average?.toFixed(1) || 'N/A',
            poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
            overview: movie.overview
        }));

        res.json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('TMDB Discover Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to discover movies'
        });
    }
});

module.exports = router;
