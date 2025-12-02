import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';

export default function TrailerPage() {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [movieTitle, setMovieTitle] = useState('');

    useEffect(() => {
        if (!movieId) return;

        const fetchTrailer = async () => {
            setLoading(true);
            setError(false);

            try {
                // Fetch movie details for title
                const movieRes = await fetch(`/api/tmdb/movie/${movieId}`);
                const movieData = await movieRes.json();
                if (movieData.success) {
                    setMovieTitle(movieData.data.title);
                }

                // Fetch trailer
                const response = await fetch(`/api/tmdb/movie/${movieId}/videos`);
                const data = await response.json();

                if (data.success && data.data.results) {
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

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4">
                <div className="flex items-center gap-4 max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                    {movieTitle && (
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">{movieTitle}</h1>
                            <p className="text-sm text-gray-400">Official Trailer</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content - Centered Video */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-5xl">
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400">Loading trailer...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                            <div className="p-4 bg-white/5 rounded-full">
                                <Play size={48} className="text-gray-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Trailer Not Available</h2>
                            <p className="text-gray-400">Sorry, we couldn't find a trailer for this movie.</p>
                            <button
                                onClick={() => navigate(-1)}
                                className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    )}

                    {trailerKey && !loading && !error && (
                        <div className="space-y-4">
                            {/* Video Container */}
                            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                                        <button
                                            onClick={() => setIsPlaying(true)}
                                            className="group flex flex-col items-center gap-4"
                                        >
                                            <div className="p-6 bg-primary hover:bg-primary/90 rounded-full transition-all group-hover:scale-110 shadow-lg shadow-primary/50">
                                                <Play size={48} className="text-white fill-white" />
                                            </div>
                                            <span className="text-lg font-medium">Click to Play Trailer</span>
                                        </button>
                                    </div>
                                )}

                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${trailerKey}?${isPlaying ? 'autoplay=1&' : ''}rel=0&modestbranding=1`}
                                    title="Movie Trailer"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                ></iframe>
                            </div>

                            {/* Info Below Video */}
                            <div className="text-center text-gray-400 text-sm">
                                <p>Video hosted on YouTube • Use fullscreen for best experience</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
