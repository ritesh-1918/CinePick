import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '@/services/tmdb';

interface MovieSectionProps {
    title: string;
    movies: Movie[];
    badge?: string;
    onTrailerClick: (movieId: number) => void;
    onDetailsClick: (movieId: number) => void;
    onWatchlistClick: (movie: Movie) => void;
}

export default function MovieSection({
    title,
    movies,
    badge,
    onTrailerClick,
    onDetailsClick,
    onWatchlistClick
}: MovieSectionProps) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;

        const scrollAmount = 800;
        const newPosition = direction === 'left'
            ? scrollPosition - scrollAmount
            : scrollPosition + scrollAmount;

        scrollContainerRef.current.scrollTo({
            left: newPosition,
            behavior: 'smooth'
        });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        setScrollPosition(target.scrollLeft);
        setShowLeftArrow(target.scrollLeft > 0);
        setShowRightArrow(
            target.scrollLeft < target.scrollWidth - target.clientWidth - 10
        );
    };

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="mb-12 group/section">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4 px-4 md:px-8">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {badge && (
                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30">
                        {badge}
                    </span>
                )}
            </div>

            {/* Scrollable Movie List */}
            <div className="relative px-4 md:px-8">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 backdrop-blur-sm p-2 rounded-full transition-all opacity-0 group-hover/section:opacity-100"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                )}

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 backdrop-blur-sm p-2 rounded-full transition-all opacity-0 group-hover/section:opacity-100"
                    >
                        <ChevronRight size={24} className="text-white" />
                    </button>
                )}

                {/* Movies Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onTrailerClick={onTrailerClick}
                            onDetailsClick={onDetailsClick}
                            onWatchlistClick={onWatchlistClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
