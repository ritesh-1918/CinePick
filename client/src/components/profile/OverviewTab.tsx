import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Film, Star, List } from 'lucide-react';
import { getImageUrl, IMAGE_SIZES } from '@/services/tmdb';

const COLORS = ['#E50914', '#FF9900', '#0066CC', '#00CC66', '#9933CC'];

export default function OverviewTab({ profileData }) {
    // Real genre data from backend
    const genreData = profileData?.stats?.topGenres?.map((genre) => ({
        name: genre.name,
        value: genre.count
    })) || [];

    // Use real data or show empty state
    const hasData = genreData.length > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats & Charts */}
            <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats Grid - ADVANCED REAL DATA */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Film className="text-primary mb-2" size={24} />
                        <span className="text-2xl font-bold">{profileData?.stats?.totalWatched || 0}</span>
                        <span className="text-xs text-muted-foreground">Movies Watched</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Clock className="text-secondary mb-2" size={24} />
                        <span className="text-2xl font-bold">{profileData?.stats?.totalWatchTime || '0h'}</span>
                        <span className="text-xs text-muted-foreground">Total Time</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Star className="text-accent mb-2" size={24} />
                        <span className="text-2xl font-bold">{profileData?.stats?.avgMoviesPerWeek || '0'}</span>
                        <span className="text-xs text-muted-foreground">Avg/Week</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <List className="text-green-500 mb-2" size={24} />
                        <span className="text-2xl font-bold">{profileData?.stats?.totalWatchlistItems || 0}</span>
                        <span className="text-xs text-muted-foreground">In Watchlist</span>
                    </div>
                </div>

                {/* Time-Based Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Most Active Day</h4>
                        <p className="text-2xl font-bold">{profileData?.stats?.mostActiveDay || 'N/A'}</p>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Preferred Time</h4>
                        <p className="text-2xl font-bold capitalize">{profileData?.stats?.preferredWatchTime || 'N/A'}</p>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">This Month</h4>
                        <p className="text-2xl font-bold">{profileData?.stats?.monthlyWatchTime || '0h 0min'}</p>
                    </div>
                </div>

                {/* Genre Distribution Chart */}
                {hasData ? (
                    <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold mb-4">Genre Preferences</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genreData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {genreData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span>{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-card/50 p-12 rounded-xl border border-white/10 text-center">
                        <Film size={48} className="mx-auto mb-4 text-gray-600" />
                        <h3 className="text-lg font-semibold mb-2">No Movies Watched Yet</h3>
                        <p className="text-sm text-gray-400">Start watching movies to see your genre preferences!</p>
                    </div>
                )}
            </div>

            {/* Right Column - Recent Activity */}
            <div className="space-y-6">
                {/* Recent Activity - REAL DATA */}
                <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    {profileData?.recentActivity && profileData.recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {profileData.recentActivity.map((activity, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-10 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                        {activity.posterPath && (
                                            <img
                                                src={getImageUrl(activity.posterPath, IMAGE_SIZES.poster.small)}
                                                alt={activity.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            {activity.rating && (
                                                <>
                                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                    <span>{activity.rating}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>{new Date(activity.watchedAt).toLocaleDateString()}</span>
                                        </div>
                                        {activity.mood && (
                                            <span className="text-xs text-gray-400">{activity.mood}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Star size={32} className="mx-auto mb-2 text-gray-600" />
                            <p className="text-sm text-gray-400">No recent activity</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
