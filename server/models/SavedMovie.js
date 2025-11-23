const mongoose = require('mongoose');

const savedMovieSchema = new mongoose.Schema({
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
    watched: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate saves
savedMovieSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('SavedMovie', savedMovieSchema);
