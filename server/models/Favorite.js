const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
    posterUrl: {
        type: String
    },
    overview: {
        type: String
    },
    releaseDate: {
        type: String
    },
    genres: [{
        type: String
    }],
    rating: {
        type: Number
    },
    favoritedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
