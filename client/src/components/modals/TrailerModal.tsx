import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

interface TrailerModalProps {
    movieId: number | null;
    onClose: () => void;
}

export default function TrailerModal({ movieId, onClose }: TrailerModalProps) {
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!movieId) {
            setTrailerKey(null);
            return;
        }

        const fetchTrailer = async () => {
            setLoading(true);
            setError(false);

            try {
                const response = await fetch(`http://localhost:5000/api/tmdb/movie/${movieId}/videos`);
                const data = await response.json();

                if (data.success && data.data.results) {
                    // Find official trailer
                    const trailer = data.data.results.find(
                        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
                    );

                    if (trailer) {
                        setTrailerKey(trailer.key);
                    } else {
                        setError(true);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch trailer:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchTrailer();
    }, [movieId]);

    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!movieId) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="relative w-full max-w-6xl mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={24} className="text-white" />
                </button>

                {/* Video Container */}
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                            <Play size={48} className="text-gray-500" />
                            <p className="text-lg">Trailer not available for this movie</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {trailerKey && !loading && !error && (
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                            title="Movie Trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
    );
}
