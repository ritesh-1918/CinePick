const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const WatchHistory = require('../models/WatchHistory');
const Review = require('../models/Review');
const Activity = require('../models/Activity'); // new model for logging
const axios = require('axios');
const multer = require('multer');
const path = require('path');

/** Helper to determine time of day */
function getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

/** GET profile with real-time analytics */
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const [watchHistory, watchlists, reviews] = await Promise.all([
            WatchHistory.find({ userId: req.params.userId }).sort({ watchedDate: -1 }),
            Watchlist.find({ userId: req.params.userId }),
            Review.find({ userId: req.params.userId })
        ]);

        const totalWatched = watchHistory.length;
        let totalMinutes = 0;
        const genreCounts = {};
        const dayCounts = {};
        const timeOfDayCounts = {};
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        let monthMinutes = 0;
        let yearMinutes = 0;

        for (const entry of watchHistory) {
            try {
                const movieRes = await axios.get(
                    `${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/movie/${entry.movieId}?api_key=${process.env.TMDB_API_KEY}`
                );
                const movie = movieRes.data;
                if (movie.runtime) {
                    totalMinutes += movie.runtime;
                    if (entry.watchedDate >= monthStart) monthMinutes += movie.runtime;
                    if (entry.watchedDate >= yearStart) yearMinutes += movie.runtime;
                }
                if (Array.isArray(movie.genres)) {
                    movie.genres.forEach(g => {
                        genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
                    });
                }
            } catch (_) { }

            if (entry.watchedDate) {
                if (entry.watchedDate) {
                    const day = entry.watchedDate.toLocaleDateString('en-US', { weekday: 'long' });
                    dayCounts[day] = (dayCounts[day] || 0) + 1;
                    const tod = getTimeOfDay(entry.watchedDate);
                    timeOfDayCounts[tod] = (timeOfDayCounts[tod] || 0) + 1;
                }
            }
        }

        const totalMovies = totalWatched || 1;
        const topGenres = Object.entries(genreCounts)
            .map(([name, count]) => ({ name, count, percentage: ((count / totalMovies) * 100).toFixed(1) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const preferredWatchTime = Object.entries(timeOfDayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const weeksSinceJoin = Math.max(1, Math.floor((now - user.createdAt) / (7 * 24 * 60 * 60 * 1000)));
        const avgMoviesPerWeek = (totalWatched / weeksSinceJoin).toFixed(1);
        const monthlyWatchTime = `${Math.floor(monthMinutes / 60)}h ${monthMinutes % 60}m`;
        const yearlyWatchTime = `${Math.floor(yearMinutes / 60)}h ${yearMinutes % 60}m`;

        const recentActivity = [];
        for (const entry of watchHistory.slice(0, 5)) {
            try {
                const movieRes = await axios.get(
                    `${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/movie/${entry.movieId}?api_key=${process.env.TMDB_API_KEY}`
                );
                const movie = movieRes.data;
                recentActivity.push({
                    movieId: entry.movieId,
                    title: movie.title,
                    posterPath: movie.poster_path,
                    rating: entry.rating,
                    watchedAt: entry.watchedDate,
                    mood: entry.mood
                });
            } catch (_) { }
        }

        const totalWatchlistItems = Array.isArray(watchlists)
            ? watchlists.reduce((sum, list) => sum + (Array.isArray(list.movies) ? list.movies.length : 0), 0)
            : 0;

        const profileData = {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                displayName: user.displayName || user.name,
                memberSince: user.createdAt
            },
            stats: {
                totalWatched,
                totalWatchTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
                totalReviews: reviews.length,
                totalWatchlistItems,
                topGenres,
                favoriteGenres: topGenres.map(g => g.name),
                mostActiveDay,
                preferredWatchTime,
                avgMoviesPerWeek,
                monthlyWatchTime,
                yearlyWatchTime
            },
            recentActivity,
            preferences: user.preferences,
            privacySettings: user.privacySettings,
            notificationPreferences: user.notificationPreferences
        };

        res.json({ success: true, data: profileData });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/** Update profile */
router.put('/:userId', auth, async (req, res) => {
    try {
        if (req.userId !== req.params.userId) return res.status(403).json({ success: false, message: 'Not authorized' });
        const { displayName, profileImage, preferences, privacySettings, notifications } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (displayName) user.displayName = displayName;
        if (profileImage) user.profileImage = profileImage;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };
        if (notifications) user.notifications = { ...user.notifications, ...notifications };
        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/** Multer avatar upload */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => cb(null, 'avatar-' + req.userId + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images are allowed!'));
    }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const fileUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
        user.profileImage = fileUrl;
        await user.save();
        res.json({ success: true, message: 'Profile picture updated', fileUrl });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

/** Delete account and related data */
router.delete('/:userId', auth, async (req, res) => {
    try {
        if (req.userId !== req.params.userId) return res.status(403).json({ success: false, message: 'Not authorized' });
        await Watchlist.deleteMany({ userId: req.userId });
        await WatchHistory.deleteMany({ userId: req.userId });
        await Review.deleteMany({ userId: req.userId });
        await Activity.deleteMany({ userId: req.userId });
        await User.findByIdAndDelete(req.userId);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
