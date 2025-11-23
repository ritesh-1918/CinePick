const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/chatbot
// @desc    Handle chatbot queries
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a message'
            });
        }

        // Initialize the model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `You are the CinePick Assistant, a helpful AI for the CinePick movie discovery website. 
            
            Your role is to:
            1. Help users navigate the website (Home, Discovery, Library, Profile, etc.).
            2. Explain features like the "Mood-based Picker" and "AI Recommendations".
            3. Assist with account issues (Login, Signup, Forgot Password).
            
            IMPORTANT: You must ONLY answer questions related to the CinePick website and movies. 
            If a user asks about general topics (e.g., math, coding, history) unrelated to movies or the app, politely refuse and steer them back to CinePick.
            
            Website Structure:
            - Home: Landing page with "Find a Movie" button.
            - Discovery: Browse movies by genre, popularity, etc.
            - Library: User's saved movies and watch history.
            - Profile: User settings and preferences.
            - Login/Signup: Authentication pages.
            `
        });

        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            message: text
        });

    } catch (error) {
        console.error('Chatbot Error Details:', {
            message: error.message,
            code: error.code,
            status: error.status
        });

        res.status(500).json({
            success: false,
            message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
        });
    }
});

module.exports = router;
