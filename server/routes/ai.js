const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const auth = require('../middleware/auth');
const User = require('../models/User');
const WatchHistory = require('../models/WatchHistory');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper to search TMDB
const searchMovie = async (title) => {
    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
        );
        return response.data.results[0]; // Return first match
    } catch (error) {
        console.error(`Error searching movie ${title}:`, error.message);
        return null;
    }
};

// Helper to extract JSON
const extractJSON = (text) => {
    try {
        const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return null;
    }
};

// @route   POST /api/ai/recommend
// @desc    Get AI recommendations based on conversation
// @access  Private
router.post('/recommend', auth, async (req, res) => {
    try {
        const { mood, audience, context, complexity } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert movie recommendation assistant.
        
        User Context:
        - Mood: ${mood}
        - Watching with: ${audience}
        - Their day: ${context}
        - Complexity preference: ${complexity}
        
        Task: Recommend EXACTLY 3 movies that perfectly match this user's current state.
        For each movie, provide:
        1. Title
        2. A personalized reason (1-2 sentences) explaining WHY this specific movie fits their current situation.
        
        Format as a JSON array of objects with keys: "title", "reason".
        Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const recommendations = extractJSON(text);
        if (!recommendations) throw new Error('Failed to parse AI response');

        const enrichedRecs = [];
        for (const rec of recommendations) {
            const tmdbMovie = await searchMovie(rec.title);
            if (tmdbMovie) {
                enrichedRecs.push({
                    id: tmdbMovie.id,
                    title: tmdbMovie.title,
                    overview: tmdbMovie.overview,
                    poster_path: tmdbMovie.poster_path,
                    vote_average: tmdbMovie.vote_average,
                    release_date: tmdbMovie.release_date,
                    reason: rec.reason
                });
            }
        }

        res.json({ success: true, recommendations: enrichedRecs });

    } catch (error) {
        console.error('AI Recommend Error:', error);
        res.status(500).json({ success: false, message: 'AI generation failed' });
    }
});

// @route   POST /api/ai/pick-one
// @desc    Absolute decision maker
// @access  Private
router.post('/pick-one', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const historyDoc = await WatchHistory.findOne({ userId: req.userId });
        const history = historyDoc ? historyDoc.history : [];
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const recentMovies = history.slice(0, 5).map(h => h.movieId).join(', ');
        const favoriteGenres = user.preferences?.genres?.join(', ') || "Any";

        const prompt = `
        You are a confident movie expert making a SINGLE recommendation for a user who is overwhelmed with choice.
        
        User profile:
        Favorite genres: ${favoriteGenres}
        Recently watched IDs: ${recentMovies}
        
        Task: Pick ONE movie. Just one. The absolute best choice for this user RIGHT NOW.
        Be confident. Don't give options. Make the decision for them.
        
        Explain in 2-3 sentences why THIS IS THE ONE using confident language like:
        "This is exactly what you need right now"
        "You'll love this because..."
        
        Format as JSON object: { "title": "Movie Title", "reason": "Confident reason" }
        Do not include markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const aiResult = extractJSON(text);
        if (!aiResult) throw new Error('Failed to parse AI response');

        const tmdbMovie = await searchMovie(aiResult.title);

        if (tmdbMovie) {
            res.json({
                success: true,
                movie: {
                    id: tmdbMovie.id,
                    title: tmdbMovie.title,
                    poster_path: tmdbMovie.poster_path,
                    reason: aiResult.reason
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Movie not found' });
        }

    } catch (error) {
        console.error('AI Pick One Error:', error);
        res.status(500).json({ success: false, message: 'AI generation failed' });
    }
});

// Generate a Mood Playlist
router.post('/playlist', auth, async (req, res) => {
    try {
        const { mood, specificRequest } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Create a curated movie playlist of 5 movies for a user who is feeling "${mood}". 
        ${specificRequest ? `Specific request: ${specificRequest}` : ''}
        For each movie, provide:
        - Title
        - Release Year
        - A short reason why it fits this mood
        
        Return the response as a JSON array of objects with keys: title, year, reason.
        Do not include markdown formatting or backticks. Just the raw JSON string.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const playlist = JSON.parse(text);

        // Enrich with TMDB data
        const enrichedPlaylist = await Promise.all(playlist.map(async (item) => {
            try {
                const searchRes = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        query: item.title,
                        year: item.year
                    }
                });
                const movie = searchRes.data.results[0];
                return movie ? { ...movie, reason: item.reason } : null;
            } catch (e) {
                return null;
            }
        }));

        res.json({ success: true, playlist: enrichedPlaylist.filter(m => m !== null) });
    } catch (error) {
        console.error('AI Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate playlist' });
    }
});

module.exports = router;
