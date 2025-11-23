const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST /api/recommendations
// @desc    Get AI movie recommendations
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { prompt, mood, genre } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Construct the system prompt based on user preferences and input
        let systemPrompt = `You are CinePick AI, an expert movie recommender. 
        Your goal is to suggest 3-5 movies based on the user's request.
        
        User Preferences:
        - Favorite Genres: ${user.preferences?.favoriteGenres?.join(', ') || 'Not specified'}
        - Favorite Actors: ${user.preferences?.favoriteActors?.join(', ') || 'Not specified'}
        - Favorite Directors: ${user.preferences?.favoriteDirectors?.join(', ') || 'Not specified'}
        
        Current Request:
        - Mood: ${mood || 'Any'}
        - Specific Genre: ${genre || 'Any'}
        - User Query: ${prompt}
        
        Provide the response in valid JSON format with the following structure:
        {
            "recommendations": [
                {
                    "title": "Movie Title",
                    "year": "Year",
                    "director": "Director",
                    "reason": "Why this movie fits the request",
                    "poster_query": "Movie Title Year poster" 
                }
            ]
        }
        Do not include any markdown formatting or extra text, just the JSON object.`;

        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar',
            messages: [
                { role: 'system', content: 'You are a helpful movie recommendation assistant that outputs only JSON.' },
                { role: 'user', content: systemPrompt }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiContent = response.data.choices[0].message.content;

        // Parse the JSON response from AI
        let recommendations;
        try {
            // Clean up potential markdown code blocks if present
            const jsonString = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
            recommendations = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Fallback if AI doesn't return valid JSON
            return res.status(500).json({
                success: false,
                message: 'Failed to generate recommendations. Please try again.'
            });
        }

        res.json({
            success: true,
            data: recommendations
        });

    } catch (error) {
        console.error('AI Recommendation Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Server error during recommendation generation'
        });
    }
});

module.exports = router;
