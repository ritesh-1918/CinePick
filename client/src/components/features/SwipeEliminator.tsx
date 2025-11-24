import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart, Trophy, RotateCcw, Film } from 'lucide-react';
import tmdbApi, { Movie } from '@/services/tmdb';
import toast from 'react-hot-toast';

interface SwipeEliminatorProps {
    isOpen: boolean;
    onClose: () => void;
    onMovieSelect: (movieId: number) => void;
}

export default function SwipeEliminator({ isOpen, onClose, onMovieSelect }: SwipeEliminatorProps) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWinner, setShowWinner] = useState(false);

    // Motion values for swipe
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const background = useTransform(
        x,
        [-200, 0, 200],
        ["rgba(239, 68, 68, 0.2)", "rgba(0,0,0,0)", "rgba(34, 197, 94, 0.2)"]
    );

    useEffect(() => {
        if (isOpen && movies.length === 0) {
            fetchMovies();
        }
    }, [isOpen]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            // Fetch popular movies or a specific mix
            const data = await tmdbApi.getTrending('week');
            if (data.results) {
                // Shuffle array
                const shuffled = data.results.sort(() => 0.5 - Math.random());
                setMovies(shuffled.slice(0, 10)); // Take top 10 for the session
                setCurrentIndex(0);
                setLikedMovies([]);
                setShowWinner(false);
            }
        } catch (error) {
            console.error('Swipe Error:', error);
            toast.error('Failed to load movies');
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            setLikedMovies(prev => [...prev, movies[currentIndex]]);
        }

        if (currentIndex >= movies.length - 1) {
            setShowWinner(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
        x.set(0);
    };

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) {
            handleSwipe('right');
        } else if (info.offset.x < -100) {
            handleSwipe('left');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md h-[70vh] flex flex-col items-center">

                {/* Header */}
                <div className="absolute -top-16 w-full flex justify-between items-center text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Film className="text-primary" />
                        Movie Match
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : showWinner ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card w-full h-full rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <Trophy size={64} className="text-yellow-500" />
                        <h3 className="text-2xl font-bold">Session Complete!</h3>
                        <p className="text-muted-foreground">You liked {likedMovies.length} movies.</p>

                        <div className="w-full flex-1 overflow-y-auto space-y-3 pr-2">
                            {likedMovies.map(movie => (
                                <div key={movie.id}
                                    onClick={() => onMovieSelect(movie.id)}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors text-left"
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                        alt={movie.title}
                                        className="w-12 h-16 object-cover rounded"
                                    />
                                    <span className="font-medium line-clamp-2">{movie.title}</span>
                                </div>
                            ))}
                            {likedMovies.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">Tough crowd! No movies liked.</p>
                            )}
                        </div>

                        <button
                            onClick={fetchMovies}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <RotateCcw size={20} />
                            Start Over
                        </button>
                    </motion.div>
                ) : (
                    <div className="relative w-full h-full">
                        <AnimatePresence>
                            {movies[currentIndex] && (
                                <motion.div
                                    key={movies[currentIndex].id}
                                    style={{ x, rotate, opacity, background }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDragEnd={handleDragEnd}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    exit={{ scale: 1.1, opacity: 0 }}
                                    className="absolute inset-0 bg-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
                                >
                                    {/* Movie Image */}
                                    <div className="h-3/4 relative">
                                        {movies[currentIndex].poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w780${movies[currentIndex].poster_path}`}
                                                alt={movies[currentIndex].title}
                                                className="w-full h-full object-cover pointer-events-none"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <Film size={64} className="text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                        {/* Overlay Labels */}
                                        <motion.div
                                            style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
                                            className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-[-15deg]"
                                        >
                                            LIKE
                                        </motion.div>
                                        <motion.div
                                            style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
                                            className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-[15deg]"
                                        >
                                            NOPE
                                        </motion.div>
                                    </div>

                                    {/* Movie Info */}
                                    <div className="h-1/4 p-6 flex flex-col justify-center pointer-events-none">
                                        <h3 className="text-2xl font-bold line-clamp-1">{movies[currentIndex].title}</h3>
                                        <div className="flex items-center gap-2 text-yellow-500 my-2">
                                            <span className="font-bold">★ {movies[currentIndex].vote_average.toFixed(1)}</span>
                                            <span className="text-muted-foreground text-sm">• {movies[currentIndex].release_date?.split('-')[0]}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {movies[currentIndex].overview}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="absolute -bottom-24 w-full flex justify-center gap-8">
                            <button
                                onClick={() => handleSwipe('left')}
                                className="w-16 h-16 bg-card border border-red-500/50 text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                            >
                                <X size={32} />
                            </button>
                            <button
                                onClick={() => handleSwipe('right')}
                                className="w-16 h-16 bg-card border border-green-500/50 text-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 hover:text-white transition-all transform hover:scale-110"
                            >
                                <Heart size={32} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
