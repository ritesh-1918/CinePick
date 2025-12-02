require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
// We use a middleware to ensure connection on every request (Serverless pattern)
// connectDB().catch(err => console.error('Failed to connect to MongoDB during startup:', err));

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || true, // Allow specific origin in production, or all in dev
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection Middleware
app.use(async (req, res, next) => {
    // Skip DB connection for health check to ensure it always returns 200
    if (req.path === '/api/health') return next();

    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB Connection Middleware Error:', error);
        // We continue even if DB fails, so that debug routes might still work if they don't depend on DB
        // But for normal routes, they will likely fail later.
        next();
    }
});

// Ensure uploads directory exists
const isDev = process.env.NODE_ENV === 'development';
const uploadsDir = isDev ? path.join(__dirname, 'uploads') : path.join('/tmp', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/tmdb', require('./routes/tmdb'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/history', require('./routes/history'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/session', require('./routes/session'));
app.use('/api/debug', require('./routes/debug'));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Cache Store
let newsCache = {
    data: null,
    lastFetch: 0
};

// Cache Duration: 12 Hours (to save credits)
const CACHE_DURATION = 12 * 60 * 60 * 1000;

app.get('/api/news', async (req, res) => {
    const now = Date.now();

    // Check Cache
    if (newsCache.data && (now - newsCache.lastFetch < CACHE_DURATION)) {
        console.log('Serving news from cache');
        return res.json(newsCache.data);
    }

    console.log('Fetching fresh news from Perplexity API...');

    try {
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful movie news assistant. 
                    Return a JSON array of exactly 4 objects representing the latest movie news.
                    Each object must have these keys: "title", "date", "category", "excerpt", "image".
                    For "image", use a relevant Unsplash URL (e.g., "https://images.unsplash.com/photo-..." or similar placeholder if real one not found).
                    Ensure the JSON is valid and strictly follows this format.`
                },
                {
                    role: 'user',
                    content: 'What are the latest movie news and updates for this month?'
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Parse the content from the API response
        // The API returns a string in content, we need to parse it to JSON
        let content = response.data.choices[0].message.content;

        // Clean up markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const newsData = JSON.parse(content);

        // Update Cache
        newsCache = {
            data: newsData,
            lastFetch: now
        };

        res.json(newsData);

    } catch (error) {
        console.error('Error fetching news:', error.response ? error.response.data : error.message);

        // Fallback to cache if available, even if expired
        if (newsCache.data) {
            console.log('API failed, serving stale cache');
            return res.json(newsCache.data);
        }

        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.get('/', (req, res) => {
    res.send('CinePick API is running');
});

const http = require('http');
const server = http.createServer(app);

let io;
// Socket.io requires a persistent server, which Vercel Serverless functions don't provide.
// We only initialize it in development, on Render, or if a specific flag is set.
if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.ENABLE_SOCKETS === 'true') {
    try {
        const { initializeSocket } = require('./socketHandler');
        io = initializeSocket(server);
        app.set('io', io);
        console.log('Socket.io initialized');
    } catch (error) {
        console.error('Failed to initialize Socket.io:', error);
    }
} else {
    console.log('Socket.io skipped in production (Serverless environment)');
}

if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// For Vercel, we must export the Express app
module.exports = app;
