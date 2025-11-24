const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const tmdbApi = require('./tmdb'); // Assuming we can use the tmdb helper or axios directly

// Helper to generate a short code
const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new session
router.post('/create', auth, async (req, res) => {
    try {
        const code = generateCode();
        // Fetch initial batch of movies (e.g., trending)
        // For simplicity, we'll let the client trigger the fetch or do it here
        // Let's do it here to ensure all users see the same movies
        // We need to import axios or use the tmdb helper if available
        // Assuming we can just store empty movies first and let host populate, 
        // OR we fetch trending here. Let's fetch trending.

        // Note: We need to handle the TMDB fetch. 
        // If tmdb.js exports a helper, use it. If not, we might need to duplicate logic or refactor.
        // For now, let's initialize with empty and let the client pass movies or fetch later.
        // BETTER: The host client fetches movies and sends them in create, OR we fetch here.
        // Let's keep it simple: Host sends initial movies or we fetch trending.

        const session = new Session({
            code,
            hostId: req.user.id,
            users: [{ userId: req.user.id, name: req.user.name }],
            movies: req.body.movies || [], // Expect client to send movies or we default
            votes: {},
            status: 'waiting'
        });

        await session.save();
        res.json({ success: true, session });
    } catch (error) {
        console.error('Create Session Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Join a session
router.post('/join', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const session = await Session.findOne({ code });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        if (session.status !== 'waiting') {
            return res.status(400).json({ success: false, message: 'Session already started' });
        }

        // Check if user already joined
        const existingUser = session.users.find(u => u.userId.toString() === req.user.id);
        if (!existingUser) {
            session.users.push({ userId: req.user.id, name: req.user.name });
            await session.save();
        }

        res.json({ success: true, session });
    } catch (error) {
        console.error('Join Session Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start session (Host only)
router.post('/start', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const session = await Session.findOne({ code });

        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.hostId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only host can start' });
        }

        session.status = 'voting';
        await session.save();
        res.json({ success: true, session });
    } catch (error) {
        console.error('Start Session Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Submit votes
router.post('/vote', auth, async (req, res) => {
    try {
        const { code, likedMovieIds } = req.body; // Array of movie IDs liked by user
        const session = await Session.findOne({ code });

        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        // Update votes
        // votes is a Map: movieId -> [userIds]
        likedMovieIds.forEach(movieId => {
            const movieIdStr = movieId.toString();
            if (!session.votes.has(movieIdStr)) {
                session.votes.set(movieIdStr, []);
            }
            const voters = session.votes.get(movieIdStr);
            if (!voters.includes(req.user.id)) {
                voters.push(req.user.id);
                session.votes.set(movieIdStr, voters);
            }
        });

        await session.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Vote Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get session status (Polling)
router.get('/:code', auth, async (req, res) => {
    try {
        const session = await Session.findOne({ code: req.params.code });
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        res.json({ success: true, session });
    } catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
