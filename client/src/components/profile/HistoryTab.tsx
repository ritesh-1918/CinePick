import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Star, Calendar } from 'lucide-react';

export default function HistoryTab({ userId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/history/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setHistory(data.history.history);
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

    return (
        <div className="space-y-8">
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
                {history.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-card/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-16 h-24 bg-gray-800 rounded-lg flex-shrink-0">
                            {/* Poster Placeholder */}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-lg">Movie ID: {item.movieId}</h4>
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

                            <div className="mt-3 flex gap-2">
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
