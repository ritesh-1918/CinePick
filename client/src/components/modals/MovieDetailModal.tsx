import { useState, useEffect } from 'react';
import { X, Play, Plus, Heart, Share2, Star, Calendar, Clock } from 'lucide-react';
import { MovieDetails, getImageUrl, IMAGE_SIZES } from '@/services/tmdb';
import tmdbApi from '@/services/tmdb';
import toast from 'react-hot-toast';

interface MovieDetailModalProps {
    movieId: number | null;
    onClose: () => void;
    onTrailerClick: (movieId: number) => void;
    onWatchlistClick: (movie: any) => void;
}

export default function MovieDetailModal({
    movieId,
    onClose,
    onTrailerClick,
    onWatchlistClick
}: MovieDetailModalProps) {
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'similar'>('overview');
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (!movieId) {
            setMovie(null);
            return;
        }

        const fetchMovieDetails = async () => {
            setLoading(true);
            try {
                const data = await tmdbApi.getMovieDetails(movieId);
                setMovie(data);
                checkIfFavorite(movieId);
                addToHistory(data);
            } catch (error) {
                console.error('Failed to fetch movie details:', error);
                toast.error('Failed to load movie details');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [movieId, onClose]);

    const checkIfFavorite = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/movies/favorites', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const isFav = data.data.some((m: any) => m.movieId === id.toString());
                setIsFavorite(isFav);
            }
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const addToHistory = async (movieData: MovieDetails) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/movies/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    movieId: movieData.id.toString(),
                    title: movieData.title,
                    year: movieData.release_date?.split('-')[0],
                    poster: movieData.poster_path
                })
            });
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!movie) return;

        try {
            const token = localStorage.getItem('token');
            if (isFavorite) {
                await fetch(`http://localhost:5000/api/movies/favorites/${movie.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsFavorite(false);
                toast.success('Removed from Favorites');
            } else {
                await fetch('http://localhost:5000/api/movies/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        movieId: movie.id.toString(),
                        title: movie.title,
                        year: movie.release_date?.split('-')[0],
                        poster: movie.poster_path,
                        overview: movie.overview,
                        rating: movie.vote_average,
                        releaseDate: movie.release_date,
                        genres: movie.genres?.map(g => g.name)
                    })
                });
                setIsFavorite(true);
                toast.success('Added to Favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorites');
        }
    };

    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!movieId || !movie) return null;

    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="min-h-screen px-4 py-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                >
                    <X size={24} className="text-white" />
                </button>

                {loading ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="relative max-w-6xl mx-auto bg-card rounded-2xl overflow-hidden border border-white/10">
                        {/* Hero Section */}
                        <div className="relative h-[400px] md:h-[500px]">
                            {/* Backdrop */}
                            <img
                                src={getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.large)}
                                alt={movie.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-card/90 via-transparent to-transparent"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex gap-6">
                                {/* Poster */}
                                <img
                                    src={getImageUrl(movie.poster_path, IMAGE_SIZES.poster.medium)}
                                    alt={movie.title}
                                    className="hidden md:block w-48 rounded-lg shadow-2xl flex-shrink-0"
                                />

                                {/* Info */}
                                <div className="flex-1 text-white">
                                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
                                    {movie.tagline && (
                                        <p className="text-lg text-gray-300 italic mb-4">{movie.tagline}</p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                            <span className="font-medium">{rating}/10</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>{releaseYear}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            <span>{runtime}</span>
                                        </div>
                                        {movie.genres && movie.genres.length > 0 && (
                                            <div className="flex gap-2">
                                                {movie.genres.slice(0, 3).map((genre) => (
                                                    <span
                                                        key={genre.id}
                                                        className="px-3 py-1 bg-white/10 rounded-full text-xs"
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                onTrailerClick(movie.id);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors"
                                        >
                                            <Play size={18} className="fill-white" />
                                            Watch Trailer
                                        </button>
                                        <button
                                            onClick={() => onWatchlistClick(movie)}
                                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                                        >
                                            <Plus size={18} />
                                            Watchlist
                                        </button>
                                        <button
                                            onClick={toggleFavorite}
                                            className={`p-3 rounded-lg transition-colors ${isFavorite ? 'bg-pink-500/20 text-pink-500 hover:bg-pink-500/30' : 'bg-white/10 hover:bg-white/20'}`}
                                        >
                                            <Heart size={18} className={isFavorite ? 'fill-pink-500' : ''} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/movie/${movie.id}`;
                                                navigator.clipboard.writeText(url);
                                                toast.success(
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold">Link Copied!</span>
                                                        <span className="text-xs">Share this movie with friends.</span>
                                                    </div>
                                                );
                                            }}
                                            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                            title="Share Movie"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-white/10">
                            <div className="flex gap-6 px-6 md:px-8">
                                {(['overview', 'cast', 'similar'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-2 text-sm font-medium transition-colors relative ${activeTab === tab
                                            ? 'text-primary'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 md:p-8 text-white">
                            {activeTab === 'overview' && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Synopsis</h3>
                                    <p className="text-gray-300 leading-relaxed mb-6">
                                        {movie.overview || 'No synopsis available.'}
                                    </p>

                                    {movie.credits?.crew && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold mb-3">Director</h4>
                                            {movie.credits.crew
                                                .filter((person: any) => person.job === 'Director')
                                                .slice(0, 3)
                                                .map((director: any, index: number) => (
                                                    <p key={index} className="text-gray-300">
                                                        {director.name}
                                                    </p>
                                                ))}
                                        </div>
                                    )}

                                    {movie.genres && movie.genres.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3">Genres</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.genres.map((genre) => (
                                                    <span
                                                        key={genre.id}
                                                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'cast' && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Cast</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {movie.credits?.cast?.slice(0, 10).map((actor: any) => (
                                            <div key={actor.id} className="text-center">
                                                <div className="aspect-[2/3] mb-2 rounded-lg overflow-hidden bg-gray-800">
                                                    {actor.profile_path ? (
                                                        <img
                                                            src={getImageUrl(actor.profile_path, 'w185')}
                                                            alt={actor.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            No Photo
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-medium text-sm">{actor.name}</p>
                                                <p className="text-xs text-gray-400">{actor.character}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'similar' && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Similar Movies</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {movie.similar?.results?.slice(0, 10).map((similar: any) => (
                                            <div
                                                key={similar.id}
                                                className="cursor-pointer group"
                                                onClick={() => {
                                                    // This will reload modal with new movie
                                                    onClose();
                                                    setTimeout(() => {
                                                        // Trigger open with new ID (parent component handles this)
                                                    }, 100);
                                                }}
                                            >
                                                <div className="aspect-[2/3] mb-2 rounded-lg overflow-hidden bg-gray-800 group-hover:ring-2 group-hover:ring-primary transition-all">
                                                    <img
                                                        src={getImageUrl(similar.poster_path, 'w185')}
                                                        alt={similar.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <p className="font-medium text-sm line-clamp-2">
                                                    {similar.title}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    ⭐ {similar.vote_average.toFixed(1)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
