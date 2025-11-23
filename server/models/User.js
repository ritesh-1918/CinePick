const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [function () { return !this.googleId; }, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    name: {
        type: String,
        trim: true
    },
    hasCompletedSurvey: {
        type: Boolean,
        default: false
    },
    preferences: {
        favoriteGenres: [{
            type: String
        }],
        favoriteActors: [{
            type: String
        }],
        favoriteDirectors: [{
            type: String
        }]
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    displayName: {
        type: String,
        trim: true
    },
    memberSince: {
        type: Date,
        default: Date.now
    },
    preferences: {
        favoriteGenres: [String],
        favoriteActors: [String],
        favoriteDirectors: [String],
        moodGenreMapping: [{
            mood: String,
            preferredGenres: [String]
        }],
        languages: [String],
        contentRating: [String],
        movieLength: String,
        decades: [String],
        avoidList: [String],
        streamingPlatforms: [{
            name: String,
            subscribed: Boolean,
            priority: Number
        }],
        timeOfDayPrefs: {
            type: Map,
            of: String
        },
        seasonalPrefs: {
            type: Map,
            of: String
        }
    },
    stats: {
        totalWatched: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        watchlistCount: { type: Number, default: 0 },
        favoriteGenres: [String]
    },
    privacySettings: {
        profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
        showWatchHistory: { type: Boolean, default: true },
        showRatings: { type: Boolean, default: true },
        allowRecommendations: { type: Boolean, default: true }
    },
    notifications: {
        newReleases: { type: Boolean, default: true },
        watchlistAvailability: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
