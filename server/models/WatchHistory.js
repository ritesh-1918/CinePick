const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    history: [{
        movieId: {
            type: String,
            required: true
        },
        watchedDate: {
            type: Date,
            default: Date.now
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        mood: String,
        platform: String,
        reviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('WatchHistory', watchHistorySchema);
