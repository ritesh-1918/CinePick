import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/services/tmdb';
import MovieCard from './MovieCard';
import { Sparkles } from 'lucide-react';

interface CuratedSectionProps {
    title?: string;
    movies: Movie[];
    onMovieClick: (movieId: number) => void;
    onTrailerClick: (movieId: number) => void;
    onWatchlistClick: (movie: Movie) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export default function CuratedSection({
    title,
    movies,
    onMovieClick,
    onTrailerClick,
    onWatchlistClick,
    loading = false,
    emptyMessage = "No movies found for this category."
}: CuratedSectionProps) {

    // Limit to 5 movies as per requirements
    const displayMovies = movies.slice(0, 5);

    return (
        <div className="w-full py-6">
            {title && (
                <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold mb-6 flex items-center gap-2"
                >
                    {title}
                </motion.h3>
            )}

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : displayMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <AnimatePresence mode="popLayout">
                        {displayMovies.map((movie, index) => (
                            <motion.div
                                key={movie.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                layout
                            >
                                <div className="relative group">
                                    <MovieCard
                                        movie={movie}
                                        onDetailsClick={onMovieClick}
                                        onTrailerClick={onTrailerClick}
                                        onWatchlistClick={onWatchlistClick}
                                    />

                                    {/* "Why This?" Tooltip Placeholder - To be connected to AI later */}
                                    <div className="absolute -bottom-12 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                                        <div className="bg-black/90 text-xs p-2 rounded-lg border border-white/10 shadow-xl text-center">
                                            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                                                <Sparkles size={10} />
                                                <span className="font-bold">Why this?</span>
                                            </div>
                                            <p className="text-gray-300 line-clamp-2">Perfect match for your taste!</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-gray-400">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
}
