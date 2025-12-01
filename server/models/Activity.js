const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['watched', 'added_watchlist', 'removed_watchlist', 'rated', 'reviewed', 'ai_recommendation'],
        required: true
    },
    movieId: {
        type: Number,
        required: false
    },
    movieTitle: String,
    moviePoster: String,
    metadata: {
        rating: Number,
        listName: String,
        reviewSnippet: String,
        recommendationType: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient querying
ActivitySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
