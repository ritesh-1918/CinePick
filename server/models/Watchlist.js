const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lists: [{
        listId: {
            type: String,
            required: true
        },
        listName: {
            type: String,
            required: true
        },
        createdDate: {
            type: Date,
            default: Date.now
        },
        movies: [{
            movieId: {
                type: String,
                required: true
            },
            addedDate: {
                type: Date,
                default: Date.now
            },
            order: {
                type: Number,
                default: 0
            },
            moodTag: String,
            notes: String
        }]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
