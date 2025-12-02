import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Star, Calendar, Clock, Activity, Film } from 'lucide-react';

interface MovieDetails {
    title: string;
    poster_path: string;
    genres: { id: number; name: string }[];
    runtime: number;
    vote_average: number;
}

interface HistoryItem {
    movieId: string;
    watchedDate: string;
    rating?: number;
    mood?: string;
    platform?: string;
    movieDetails?: MovieDetails;
}

interface Stats {
    totalWatchTime: number;
    mostActiveDay: string;
    genreDistribution: Record<string, number>;
}

export default function HistoryTab({ userId }: { userId: string }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalWatchTime: 0,
        mostActiveDay: 'N/A',
        genreDistribution: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/history/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setHistory(data.history);
                    if (data.stats) {
                        setStats(data.stats);
                    }
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    // Transform history for heatmap
    const heatmapData = history.map(item => ({
        date: new Date(item.watchedDate).toISOString().split('T')[0],
        count: 1
    }));

    // Get top genre
    const topGenre = Object.entries(stats.genreDistribution || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Format watch time
    const hours = Math.floor(stats.totalWatchTime / 60);
    const minutes = stats.totalWatchTime % 60;
    const watchTimeString = `${hours}h ${minutes}m`;

    if (loading) return <div className="text-center py-10">Loading history...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Watch Time</p>
                        <h4 className="text-xl font-bold">{watchTimeString}</h4>
                    </div>
                </div>
                <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Most Active Day</p>
                        <h4 className="text-xl font-bold">{stats.mostActiveDay || 'N/A'}</h4>
                    </div>
                </div>
                <div className="bg-card/50 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                        <Film size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Top Genre</p>
                        <h4 className="text-xl font-bold">{topGenre}</h4>
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="text-primary" size={20} />
                    Watch Activity
                </h3>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[600px]">
                        <CalendarHeatmap
                            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                            endDate={new Date()}
                            values={heatmapData}
                            classForValue={(value) => {
                                if (!value) {
                                    return 'fill-white/5';
                                }
                                return `fill-primary opacity-${Math.min(value.count * 20 + 40, 100)}`;
                            }}
                            showWeekdayLabels={true}
                        />
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recently Watched</h3>
                {history.length === 0 ? (
                    <p className="text-muted-foreground">No watch history yet.</p>
                ) : (
                    history.map((item, index) => (
                        <div key={index} className="flex gap-4 bg-card/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="w-16 h-24 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                                {item.movieDetails?.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${item.movieDetails.poster_path}`}
                                        alt={item.movieDetails.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        <Film size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">{item.movieDetails?.title || `Movie ID: ${item.movieId}`}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Watched on {new Date(item.watchedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {item.rating && (
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg text-yellow-500">
                                            <Star size={14} fill="currentColor" />
                                            <span className="font-bold">{item.rating}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {item.mood && (
                                        <span className="text-xs px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                            Mood: {item.mood}
                                        </span>
                                    )}
                                    {item.platform && (
                                        <span className="text-xs px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                            On: {item.platform}
                                        </span>
                                    )}
                                    {item.movieDetails?.genres?.slice(0, 2).map(g => (
                                        <span key={g.id} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
