import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, Heart, Film, Trash2, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Chatbot from '@/components/Chatbot';

interface Movie {
    _id: string;
    movieId: string;
    title: string;
    year?: string;
    poster?: string;
    addedAt: string;
}

export default function Library() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'favorites'>('saved');
    const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
    const [watchHistory, setWatchHistory] = useState<Movie[]>([]);
    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLibraryData();
    }, []);

    const fetchLibraryData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch saved movies
            const savedRes = await fetch('http://localhost:5000/api/movies/saved', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const savedData = await savedRes.json();
            if (savedData.success) setSavedMovies(savedData.data);

            // Fetch watch history
            const historyRes = await fetch('http://localhost:5000/api/movies/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const historyData = await historyRes.json();
            if (historyData.success) setWatchHistory(historyData.data);

            // For now, favorites are same as saved (can be enhanced later)
            setFavorites(savedData.data?.filter((m: Movie) => m.poster) || []);

        } catch (error) {
            console.error('Failed to fetch library data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (movieId: string, type: string) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:5000/api/movies/${type}/${movieId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchLibraryData(); // Refresh data
        } catch (error) {
            console.error('Failed to remove movie:', error);
        }
    };

    const currentMovies = activeTab === 'saved' ? savedMovies : activeTab === 'history' ? watchHistory : favorites;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 md:px-12 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <img src="/logo.png" alt="CinePick Logo" className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">CinePick</h1>
                    </Link>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                        <Link to="/dashboard" className="hover:text-white transition-colors">Discover</Link>
                        <Link to="/library" className="text-primary">Library</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <button className="flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center text-white font-medium text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                            <div className="py-1">
                                <div className="px-4 py-2 text-sm text-muted-foreground border-b border-white/10">
                                    <span className="text-white font-medium block">{user?.name || user?.email}</span>
                                </div>
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white">Profile</Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 px-4 md:px-12 pb-20 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">My Library</h1>
                <p className="text-muted-foreground mb-8">Your personal collection of movies</p>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'saved' ? 'text-primary' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Bookmark size={18} />
                            <span>My List</span>
                        </div>
                        {activeTab === 'saved' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'history' ? 'text-primary' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            <span>Watch History</span>
                        </div>
                        {activeTab === 'history' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'favorites' ? 'text-primary' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Heart size={18} />
                            <span>Favorites</span>
                        </div>
                        {activeTab === 'favorites' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                        )}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : currentMovies.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex p-6 bg-white/5 rounded-full mb-4">
                            <Film size={48} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No movies yet</h3>
                        <p className="text-gray-400 mb-6">Start adding movies to your library!</p>
                        <Link to="/dashboard" className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-medium transition-colors">
                            Discover Movies
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {currentMovies.map((movie) => (
                            <div key={movie._id} className="group relative">
                                <div className="aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden relative">
                                    {movie.poster ? (
                                        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <Film size={48} className="text-gray-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                        <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                                            <Play size={24} className="text-white" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(movie._id, activeTab)}
                                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <Trash2 size={18} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="mt-2 font-medium text-sm text-white line-clamp-2">{movie.title}</h3>
                                {movie.year && <p className="text-xs text-gray-400">{movie.year}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Chatbot />
        </div>
    );
}
