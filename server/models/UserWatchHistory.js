const mongoose = require('mongoose');

const userWatchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    movieId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    year: {
        type: String
    },
    poster: {
        type: String
    },
    watchedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for fast retrieval by user and sorting by date
userWatchHistorySchema.index({ userId: 1, watchedAt: -1 });

module.exports = mongoose.model('UserWatchHistory', userWatchHistorySchema);
