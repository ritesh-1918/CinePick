const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    users: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        joinedAt: { type: Date, default: Date.now }
    }],
    movies: [{
        id: Number,
        title: String,
        poster_path: String,
        overview: String,
        vote_average: Number
    }],
    votes: {
        type: Map,
        of: [String] // Map of movieId -> array of userIds who liked it
    },
    status: {
        type: String,
        enum: ['waiting', 'voting', 'completed'],
        default: 'waiting'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Expire after 24 hours
    }
});

module.exports = mongoose.model('Session', SessionSchema);
