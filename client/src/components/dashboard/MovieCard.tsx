import React, { useState } from 'react';
import { Play, Plus, Info, Heart, LucideIcon } from 'lucide-react';
import { Movie, getImageUrl, IMAGE_SIZES } from '@/services/tmdb';

interface MovieCardProps {
    movie: Movie;
    onTrailerClick: (movieId: number) => void;
    onDetailsClick: (movieId: number) => void;
    onWatchlistClick: (movie: Movie) => void;
    actionIcon?: LucideIcon;
    actionLabel?: string;
    actionColor?: string;
}

export default function MovieCard({
    movie,
    onTrailerClick,
    onDetailsClick,
    onWatchlistClick,
    actionIcon: ActionIcon = Plus,
    actionLabel = "Add to Watchlist",
    actionColor = "text-white"
}: MovieCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const rating = movie.vote_average.toFixed(1);
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

    return (
        <div className="group relative w-[200px] flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105">
            {/* Poster Image */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                <img
                    src={getImageUrl(movie.poster_path, IMAGE_SIZES.poster.medium)}
                    alt={movie.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-100 transition-opacity"></div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white text-sm font-medium">{rating}</span>
                </div>

                {/* Quick Actions Overlay (Desktop Hover) */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTrailerClick(movie.id);
                        }}
                        className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                        title="Watch Trailer"
                    >
                        <Play size={20} className="text-white fill-white" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onWatchlistClick(movie);
                        }}
                        className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                        title={actionLabel}
                    >
                        <ActionIcon size={20} className={actionColor} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailsClick(movie.id);
                        }}
                        className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                        title="More Info"
                    >
                        <Info size={20} className="text-white" />
                    </button>
                </div>

                {/* Movie Info at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="text-sm font-bold line-clamp-2 mb-1">{movie.title}</h3>
                    <p className="text-xs text-gray-300">{year}</p>
                </div>
            </div>
        </div>
    );
}
