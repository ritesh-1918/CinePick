import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, X, Play, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import tmdbApi, { Movie } from '@/services/tmdb';
import toast from 'react-hot-toast';
import axios from 'axios';

interface MoodPlaylistGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onMovieSelect: (movieId: number) => void;
}

interface PlaylistItem extends Movie {
    reason: string;
}

export default function MoodPlaylistGenerator({ isOpen, onClose, onMovieSelect }: MoodPlaylistGeneratorProps) {
    const { user } = useAuth();
    const [mood, setMood] = useState('');
    const [specificRequest, setSpecificRequest] = useState('');
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
    const [loading, setLoading] = useState(false);

    const generatePlaylist = async () => {
        if (!mood) return toast.error('Please enter a mood');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/ai/playlist', {
                mood,
                specificRequest
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setPlaylist(res.data.playlist);
            }
        } catch (error) {
            console.error('Playlist Error:', error);
            toast.error('Failed to generate playlist');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-4xl bg-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-pink-500/20 rounded-full text-pink-500">
                        <Music size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Mood Playlist</h2>
                        <p className="text-muted-foreground">AI-curated collections for your vibe.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 h-full overflow-hidden">
                    {/* Input Section */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                            <input
                                type="text"
                                value={mood}
                                onChange={(e) => setMood(e.target.value)}
                                placeholder="e.g., Nostalgic, Adventurous, Heartbroken"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Any specifics? (Optional)</label>
                            <textarea
                                value={specificRequest}
                                onChange={(e) => setSpecificRequest(e.target.value)}
                                placeholder="e.g., From the 90s, Animated only, Starring Tom Hanks"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <button
                            onClick={generatePlaylist}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Sparkles className="animate-spin" /> : <Sparkles />}
                            Generate Playlist
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="w-full md:w-2/3 overflow-y-auto pr-2 custom-scrollbar">
                        {playlist.length > 0 ? (
                            <div className="space-y-4">
                                {playlist.map((movie) => (
                                    <motion.div
                                        key={movie.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                                        onClick={() => onMovieSelect(movie.id)}
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-24 h-36 object-cover rounded-lg shadow-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1 group-hover:text-pink-400 transition-colors">{movie.title}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">{movie.release_date?.split('-')[0]} • {movie.vote_average.toFixed(1)} ★</p>
                                            <p className="text-sm text-gray-300 italic">"{movie.reason}"</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <Music size={64} className="mb-4" />
                                <p>Your playlist will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
