import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Film, Star, TrendingUp } from 'lucide-react';

const COLORS = ['#E50914', '#FF9900', '#0066CC', '#00CC66', '#9933CC'];

export default function OverviewTab({ profileData }) {
    const genreData = profileData?.stats?.favoriteGenres?.map((genre, index) => ({
        name: genre,
        value: 1 // Simplified for now, ideally would be count based on history
    })) || [];

    // Fallback data if empty
    const data = genreData.length > 0 ? genreData : [
        { name: 'Action', value: 400 },
        { name: 'Drama', value: 300 },
        { name: 'Comedy', value: 300 },
        { name: 'Sci-Fi', value: 200 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats & Charts */}
            <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Film className="text-primary mb-2" size={24} />
                        <span className="text-2xl font-bold">{profileData?.stats?.totalWatched || 0}</span>
                        <span className="text-xs text-muted-foreground">Movies Watched</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Clock className="text-secondary mb-2" size={24} />
                        <span className="text-2xl font-bold">124h</span>
                        <span className="text-xs text-muted-foreground">Total Time</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Star className="text-accent mb-2" size={24} />
                        <span className="text-2xl font-bold">{profileData?.stats?.totalReviews || 0}</span>
                        <span className="text-xs text-muted-foreground">Reviews Given</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <TrendingUp className="text-green-500 mb-2" size={24} />
                        <span className="text-2xl font-bold">Top 10%</span>
                        <span className="text-xs text-muted-foreground">Explorer Rank</span>
                    </div>
                </div>

                {/* Genre Distribution Chart */}
                <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Genre Preferences</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
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
                        {data.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span>{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Recent Activity & Moods */}
            <div className="space-y-6">
                {/* Mood Badges */}
                <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Mood Profile</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Happy', 'Adventurous', 'Relaxed', 'Thrilling'].map((mood) => (
                            <span key={mood} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-sm border border-white/10 transition-colors cursor-default">
                                {mood}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="w-10 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                    {/* Placeholder for movie poster */}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Watched "Inception"</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                        <span>4.5</span>
                                        <span>•</span>
                                        <span>2 days ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
