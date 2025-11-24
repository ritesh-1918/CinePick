const Activity = require('../models/Activity');

/**
 * Log user activity for analytics and real-time tracking
 */
const logActivity = async (userId, type, movie, metadata = {}) => {
    try {
        await Activity.create({
            userId,
            type,
            movieId: movie.id,
            movieTitle: movie.title,
            moviePoster: movie.poster_path,
            metadata,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Activity logging error:', error.message);
        // Don't throw - logging failure shouldn't break main flow
    }
};

/**
 * Get recent activities for a user (last 30 days)
 */
const getRecentActivities = async (userId, limit = 10) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return await Activity.find({
        userId,
        timestamp: { $gte: thirtyDaysAgo }
    })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

module.exports = {
    logActivity,
    getRecentActivities
};
