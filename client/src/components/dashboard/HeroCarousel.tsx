import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Play, Info, Plus } from 'lucide-react';
import { Movie, getImageUrl, IMAGE_SIZES } from '@/services/tmdb';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroCarouselProps {
    movies: Movie[];
    onTrailerClick: (movieId: number) => void;
    onDetailsClick: (movieId: number) => void;
    onWatchlistClick: (movie: Movie) => void;
}

export default function HeroCarousel({
    movies,
    onTrailerClick,
    onDetailsClick,
    onWatchlistClick
}: HeroCarouselProps) {
    if (!movies || movies.length === 0) {
        return null;
    }

    // Show only first 5 movies for hero carousel
    const featuredMovies = movies.slice(0, 5);

    return (
        <div className="relative w-full mb-12">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet !bg-white/50',
                    bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary'
                }}
                navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom'
                }}
                loop={true}
                className="hero-swiper"
            >
                {featuredMovies.map((movie) => {
                    const rating = movie.vote_average.toFixed(1);
                    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
                    const synopsis = movie.overview.length > 200
                        ? movie.overview.slice(0, 200) + '...'
                        : movie.overview;

                    return (
                        <SwiperSlide key={movie.id}>
                            <div className="relative w-full h-[500px] md:h-[600px]">
                                {/* Backdrop Image */}
                                <img
                                    src={getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.large)}
                                    alt={movie.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                                {/* Content */}
                                <div className="relative h-full flex items-center px-4 md:px-12 max-w-7xl mx-auto">
                                    <div className="max-w-2xl text-white">
                                        {/* Title */}
                                        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                                            {movie.title}
                                        </h1>

                                        {/* Rating & Year */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">⭐</span>
                                                <span className="text-xl font-medium">{rating}</span>
                                                <span className="text-gray-300">/10</span>
                                            </div>
                                            {year && (
                                                <>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-lg">{year}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Synopsis */}
                                        <p className="text-lg text-gray-200 mb-8 max-w-xl line-clamp-3">
                                            {synopsis}
                                        </p>

                                        {/* CTA Buttons */}
                                        <div className="flex flex-wrap gap-4">
                                            <button
                                                onClick={() => onTrailerClick(movie.id)}
                                                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors"
                                            >
                                                <Play size={20} className="fill-white" />
                                                Watch Trailer
                                            </button>
                                            <button
                                                onClick={() => onDetailsClick(movie.id)}
                                                className="flex items-center gap-2 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-colors"
                                            >
                                                <Info size={20} />
                                                More Info
                                            </button>
                                            <button
                                                onClick={() => onWatchlistClick(movie)}
                                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg font-medium transition-colors"
                                            >
                                                <Plus size={20} />
                                                Watchlist
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}

                {/* Custom Navigation Arrows */}
                <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </Swiper>

            <style>{`
                .hero-swiper .swiper-pagination {
                    bottom: 20px !important;
                }
                .hero-swiper .swiper-pagination-bullet {
                    width: 12px !important;
                    height: 12px !important;
                    margin: 0 6px !important;
                }
                .hero-swiper:hover .swiper-button-prev-custom,
                .hero-swiper:hover .swiper-button-next-custom {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
