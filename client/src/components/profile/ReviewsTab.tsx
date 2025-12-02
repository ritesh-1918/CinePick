import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MoreHorizontal, Film } from 'lucide-react';

interface MovieDetails {
    title: string;
    poster_path: string | null;
    release_date?: string;
}

interface Review {
    _id: string;
    movieId: string;
    rating: number;
    content: string;
    mood?: string;
    isPublic: boolean;
    createdAt: string;
    likes?: string[];
    movieDetails?: MovieDetails;
}

export default function ReviewsTab({ userId }: { userId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [userId]);

    if (loading) return <div className="text-center py-10">Loading reviews...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
                <div key={review._id} className="bg-card/50 p-6 rounded-xl border border-white/10 flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="w-16 h-24 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                            {review.movieDetails?.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${review.movieDetails.poster_path}`}
                                    alt={review.movieDetails.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                    <Film size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-lg line-clamp-1">{review.movieDetails?.title || `Movie ID: ${review.movieId}`}</h4>
                                <button className="text-muted-foreground hover:text-white">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 my-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                        className={i < review.rating ? "" : "text-gray-600"}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                "{review.content}"
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                        <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                <ThumbsUp size={14} />
                                <span>{review.likes?.length || 0} Helpful</span>
                            </button>
                            <span className={`text-xs px-2 py-1 rounded-full border ${review.isPublic
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                {review.isPublic ? 'Public' : 'Private'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {reviews.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                    <p>You haven't written any reviews yet.</p>
                </div>
            )}
        </div>
    );
}
