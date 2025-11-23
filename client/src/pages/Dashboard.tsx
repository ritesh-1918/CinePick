import React, { useState, useEffect } from 'react';
import { Play, Search, Send, Sparkles, Loader2, Film, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Chatbot from '@/components/Chatbot';

interface MovieRecommendation {
    title: string;
    year: string;
    director: string;
    reason: string;
    poster_query: string;
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Fetch user profile image
    useEffect(() => {
        const fetchProfileImage = async () => {
            if (!user) return;
            try {
                const res = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success && data.user.profileImage) {
                    setProfileImage(data.user.profileImage);
                }
            } catch (error) {
                console.error('Failed to fetch profile image:', error);
            }
        };
        fetchProfileImage();
    }, [user]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setHasSearched(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            if (data.success) {
                setRecommendations(data.data.recommendations);
            }
        } catch (error) {
            console.error('Failed to get recommendations', error);
        } finally {
            setLoading(false);
        }
    };

    const quickPrompts = [
        "Hidden gems from the 90s",
        "Mind-bending sci-fi",
        "Feel-good comedy",
        "Dark psychological thrillers"
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 md:px-12 py-4 flex items-center justify-between sticky top-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <img src="/logo.png" alt="CinePick Logo" className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            CinePick
                        </h1>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                        <Link to="/dashboard" className="text-primary">Discover</Link>
                        <Link to="/library" className="hover:text-white transition-colors">Library</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center text-white font-medium text-sm">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                            <div className="py-1">
                                <div className="px-4 py-2 text-sm text-muted-foreground border-b border-white/10">
                                    <span className="text-white font-medium block">{user?.name || user?.email}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-start pt-12 md:pt-24 px-4 pb-12 max-w-7xl mx-auto w-full">

                {/* Search Section */}
                <div className={`w-full max-w-3xl text-center transition-all duration-500 ${hasSearched ? 'mb-12' : 'mb-0 flex-1 flex flex-col justify-center'}`}>
                    {!hasSearched && (
                        <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                                <Sparkles size={14} />
                                <span>AI-Powered Discovery</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tight">
                                Find your next favorite movie.
                            </h1>
                            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                                No more endless scrolling. Just tell us what you're in the mood for, and let our AI curate the perfect list.
                            </p>
                        </>
                    )}

                    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative flex items-center bg-card border border-white/10 rounded-2xl shadow-2xl">
                                <Search className="ml-6 text-muted-foreground" size={24} />
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the movie you want to watch..."
                                    className="w-full bg-transparent border-none px-4 py-6 text-lg text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !prompt.trim()}
                                    className="mr-2 p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                                </button>
                            </div>
                        </div>
                    </form>

                    {!hasSearched && (
                        <div className="flex flex-wrap justify-center gap-3">
                            {quickPrompts.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setPrompt(p);
                                        // Optional: auto-submit
                                    }}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 transition-colors"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {hasSearched && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="text-primary" size={20} />
                                Recommendations
                            </h2>
                            <button
                                onClick={() => {
                                    setHasSearched(false);
                                    setRecommendations([]);
                                    setPrompt('');
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Search
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {recommendations.map((movie, index) => (
                                    <div key={index} className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all group flex flex-col">
                                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                            {/* Placeholder for dynamic poster */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-600">
                                                <Film size={48} className="opacity-20" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button className="bg-white text-black px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white/90 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                                                    <Play size={16} /> Watch Trailer
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-white leading-tight">{movie.title}</h3>
                                                <span className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/10">{movie.year}</span>
                                            </div>
                                            <p className="text-sm text-primary mb-4 font-medium">{movie.director}</p>
                                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                                                {movie.reason}
                                            </p>
                                            <div className="flex gap-3 mt-auto">
                                                <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors">
                                                    Details
                                                </button>
                                                <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-primary transition-colors">
                                                    <List size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Chatbot */}
            <Chatbot />
        </div>
    );
}
