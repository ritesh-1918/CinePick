import React from 'react';

export default function MovieCardSkeleton() {
    return (
        <div className="w-[200px] flex-shrink-0 animate-pulse">
            {/* Poster Skeleton */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent shimmer"></div>

                {/* Rating Badge Skeleton */}
                <div className="absolute top-2 right-2 bg-gray-700 px-2 py-1 rounded-md w-12 h-6"></div>

                {/* Info at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="h-3 bg-gray-700 rounded mb-2 w-3/4"></div>
                    <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
