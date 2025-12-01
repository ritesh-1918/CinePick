const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Cache for API responses (5 minutes for trending, 1 hour for static)
const cache = new Map();
const CACHE_TTL = {
    trending: 5 * 60 * 1000, // 5 minutes
    static: 60 * 60 * 1000, // 1 hour
};

const https = require('https');

const agent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
    family: 4 // Force IPv4
});

const axiosConfig = {
    httpsAgent: agent,
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br'
    }
};

// Mock data for fallback
// Mock data for fallback
const MOCK_MOVIES = [
    { id: 550, title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", overview: "A ticking-time-bomb insomniac...", vote_average: 8.4, release_date: "1999-10-15", original_language: "en" },
    { id: 27205, title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", overview: "Cobb, a skilled thief who commits corporate espionage...", vote_average: 8.3, release_date: "2010-07-15", original_language: "en" },
    { id: 157336, title: "Interstellar", poster_path: "/gEU2QniL6C8zYEFeuDOblcKnfQJ.jpg", overview: "The adventures of a group of explorers...", vote_average: 8.6, release_date: "2014-11-05", original_language: "en" },
    { id: 299534, title: "Avengers: Endgame", poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", overview: "After the devastating events of Infinity War...", vote_average: 8.3, release_date: "2019-04-24", original_language: "en" },
    // Hindi
    { id: 20453, title: "3 Idiots", poster_path: "/66A9MqXOyVFCssoloscw79z8Tew.jpg", overview: "Two friends are searching for their long lost companion...", vote_average: 8.0, release_date: "2009-12-23", original_language: "hi" },
    { id: 26022, title: "My Name Is Khan", poster_path: "/5Y70e7n1f22c5e5e5e5e5e5e5.jpg", overview: "Rizwan Khan, a Muslim from the Borivali section of Mumbai...", vote_average: 7.8, release_date: "2010-02-12", original_language: "hi" },
    { id: 79464, title: "Dangal", poster_path: "/yJ2Jq2Jq2Jq2Jq2Jq2Jq2Jq2Jq.jpg", overview: "Mahavir Singh Phogat, a former wrestler...", vote_average: 8.1, release_date: "2016-12-21", original_language: "hi" },
    // Telugu
    { id: 256040, title: "Baahubali: The Beginning", poster_path: "/9BAjt8nSSms62uOVYn1t3C3dVto.jpg", overview: "The young Shivudu is left as a foundling in a small village...", vote_average: 7.7, release_date: "2015-07-10", original_language: "te" },
    { id: 350312, title: "Baahubali 2: The Conclusion", poster_path: "/2CAL2433ZeIihf62txlYvXiZ7xT.jpg", overview: "When Shiva, the son of Bahubali, learns about his heritage...", vote_average: 8.0, release_date: "2017-04-27", original_language: "te" },
    { id: 579974, title: "RRR", poster_path: "/nEufeZlyAOLq03x95h8lq24T2cf.jpg", overview: "A fictional history of two legendary revolutionaries...", vote_average: 7.8, release_date: "2022-03-24", original_language: "te" }
];

// Helper function to retry failed requests
const retryRequest = async (fn, retries = 0, delay = 1000) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries) throw error;
            console.log(`Retry ${i + 1}/${retries} after error:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Helper function to get cached data or fetch new
const getCached = async (key, fetchFn, ttl, customFallback = null) => {
    if (!TMDB_API_KEY) {
        console.error('TMDB_API_KEY is missing! Returning mock data.');
        return customFallback ? customFallback() : { results: MOCK_MOVIES };
    }
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }

    try {
        const data = await retryRequest(fetchFn);
        cache.set(key, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error(`FALLBACK TRIGGERED for ${key}. Error: ${error.message}`);
        return customFallback ? customFallback() : { results: MOCK_MOVIES };
    }
};

// @route   GET /api/tmdb/popular
// @desc    Get popular movies
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await getCached(
            `popular-${page}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.trending
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Popular Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch popular movies' });
    }
});

// @route   GET /api/tmdb/trending
// @desc    Get trending movies
// @access  Public
router.get('/trending', async (req, res) => {
    try {
        const timeWindow = req.query.time_window || 'week'; // day or week
        const data = await getCached(
            `trending-${timeWindow}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.trending
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Trending Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch trending movies' });
    }
});

// @route   GET /api/tmdb/top-rated
// @desc    Get top rated movies
// @access  Public
router.get('/top-rated', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await getCached(
            `top-rated-${page}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
                );
                return response.data;
            },
            CACHE_TTL.static
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Top Rated Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch top rated movies' });
    }
});

// @route   GET /api/tmdb/now-playing
// @desc    Get now playing movies
// @access  Public
router.get('/now-playing', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await getCached(
            `now-playing-${page}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`
                );
                return response.data;
            },
            CACHE_TTL.trending
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Now Playing Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch now playing movies' });
    }
});

// @route   GET /api/tmdb/search
// @desc    Search movies
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        const page = req.query.page || 1;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Query parameter required' });
        }

        const response = await retryRequest(() =>
            axios.get(
                `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
                axiosConfig
            )
        );
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('TMDB Search Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to search movies' });
    }
});

// @route   GET /api/tmdb/movie/:id
// @desc    Get movie details
// @access  Public
router.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const data = await getCached(
            `movie-${movieId}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,reviews,similar`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.static
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Movie Details Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch movie details' });
    }
});

// @route   GET /api/tmdb/movie/:id/videos
// @desc    Get movie videos/trailers
// @access  Public
router.get('/movie/:id/videos', async (req, res) => {
    try {
        const movieId = req.params.id;
        const data = await getCached(
            `videos-${movieId}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.static
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Videos Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch movie videos' });
    }
});

// @route   GET /api/tmdb/movie/:id/recommendations
// @desc    Get movie recommendations
// @access  Public
router.get('/movie/:id/recommendations', async (req, res) => {
    try {
        const movieId = req.params.id;
        const page = req.query.page || 1;
        const data = await getCached(
            `recommendations-${movieId}-${page}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.static
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Recommendations Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
});

// @route   GET /api/tmdb/movie/:id/similar
// @desc    Get similar movies
// @access  Public
router.get('/movie/:id/similar', async (req, res) => {
    try {
        const movieId = req.params.id;
        const page = req.query.page || 1;
        const data = await getCached(
            `similar-${movieId}-${page}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&page=${page}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.static
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Similar Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch similar movies' });
    }
});

// @route   GET /api/tmdb/discover
// @desc    Discover movies with filters
// @access  Public
router.get('/discover', async (req, res) => {
    try {
        const {
            with_genres,
            year,
            'vote_average.gte': ratingMin,
            'vote_average.lte': ratingMax,
            'with_runtime.gte': runtimeMin,
            'with_runtime.lte': runtimeMax,
            with_original_language,
            sort_by,
            page = 1
        } = req.query;

        // Build query params
        const params = new URLSearchParams({
            api_key: TMDB_API_KEY,
            page: page.toString()
        });

        if (with_genres) params.append('with_genres', with_genres);
        if (year) params.append('year', year);
        if (ratingMin) params.append('vote_average.gte', ratingMin);
        if (ratingMax) params.append('vote_average.lte', ratingMax);
        if (runtimeMin) params.append('with_runtime.gte', runtimeMin);
        if (runtimeMax) params.append('with_runtime.lte', runtimeMax);
        if (with_original_language) params.append('with_original_language', with_original_language);
        if (sort_by) params.append('sort_by', sort_by);

        const data = await getCached(
            `discover-${params.toString()}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/discover/movie?${params.toString()}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.trending,
            () => {
                let results = MOCK_MOVIES;
                if (with_original_language) {
                    results = results.filter(m => m.original_language === with_original_language);
                }
                return { results };
            }
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Discover Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to discover movies' });
    }
});

// @route   GET /api/tmdb/genres
// @desc    Get list of movie genres
// @access  Public
router.get('/genres', async (req, res) => {
    try {
        const data = await getCached(
            'genres',
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.static
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Genres Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch genres' });
    }
});

// @route   GET /api/tmdb/upcoming
// @desc    Get upcoming movies
// @access  Public
router.get('/upcoming', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await getCached(
            `upcoming-${page}`,
            async () => {
                const response = await axios.get(
                    `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`,
                    axiosConfig
                );
                return response.data;
            },
            CACHE_TTL.trending
        );
        res.json({ success: true, data });
    } catch (error) {
        console.error('TMDB Upcoming Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming movies' });
    }
});

module.exports = router;
