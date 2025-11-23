import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Chatbot from '@/components/Chatbot';
import { Sparkles, TrendingUp, Star, Calendar, Filter, Film, Bookmark } from 'lucide-react';

interface Movie {
    id: number;
    title: string;
    year: string;
    rating: string;
    poster: string | null;
    overview: string;
}

export default function Discovery() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedGenre, setSelectedGenre] = useState<string>('all');
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    const genres = [
        { id: 'all', name: 'All' },
        { id: '28', name: 'Action' },
        { id: '35', name: 'Comedy' },
        { id: '18', name: 'Drama' },
        { id: '27', name: 'Horror' },
        { id: '878', name: 'Sci-Fi' },
        { id: '10749', name: 'Romance' },
        { id: '53', name: 'Thriller' },
        { id: '16', name: 'Animation' },
        { id: '99', name: 'Documentary' }
    ];

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [trendingRes, popularRes, nowPlayingRes] = await Promise.all([
                fetch('http://localhost:5000/api/tmdb/trending', { headers }),
                fetch('http://localhost:5000/api/tmdb/popular', { headers }),
                fetch('http://localhost:5000/api/tmdb/now-playing', { headers })
            ]);

            const trendingData = await trendingRes.json();
            const popularData = await popularRes.json();
            const nowPlayingData = await nowPlayingRes.json();

            if (trendingData.success) setTrending(trendingData.data);
            if (popularData.success) setPopular(popularData.data);
            if (nowPlayingData.success) setNowPlaying(nowPlayingData.data);

        } catch (error) {
            console.error('Failed to fetch movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMovie = async (movie: Movie) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/movies/saved', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    movieId: movie.id.toString(),
                    title: movie.title,
                    year: movie.year,
                    poster: movie.poster
                })
            });
            alert('Movie saved to your library!');
        } catch (error) {
            console.error('Failed to save movie:', error);
        }
    };

    const MovieCard = ({ movie }: { movie: Movie }) => (
        <div className="group cursor-pointer">
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-3 relative overflow-hidden border border-white/10">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film className="text-gray-600" size={48} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-xs text-gray-300 line-clamp-3 mb-3">{movie.overview}</p>
                        <button
                            onClick={() => handleSaveMovie(movie)}
                            className="w-full py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Bookmark size={16} />
                            Save to Library
                        </button>
                    </div>
                </div>
            </div>
            <h3 className="font-medium text-white mb-1 line-clamp-1">{movie.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{movie.year}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span>{movie.rating}</span>
                </div>
            </div>
        </div>
    );

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
                        <Link to="/library" className="hover:text-white transition-colors">Library</Link>
                        <Link to="/discovery" className="text-primary">Browse</Link>
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
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Browse Movies</h1>
                    <p className="text-muted-foreground">Explore thousands of movies powered by TMDB</p>
                </div>

                {/* Trending Section */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold">Trending This Week</h2>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {trending.slice(0, 8).map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Popular Section */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <Star className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold">Most Popular</h2>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {popular.slice(0, 8).map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </section>

                {/* New Releases */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="text-primary" size={24} />
                        <h2 className="text-2xl font-bold">Now Playing</h2>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                            {nowPlaying.slice(0, 8).map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Chatbot />
        </div>
    );
}
