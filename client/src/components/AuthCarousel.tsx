import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const images = [
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop", // Movie theater
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop", // Cinema projector
    "https://images.unsplash.com/photo-1517604931442-71053e3e2dc7?q=80&w=1000&auto=format&fit=crop", // Popcorn
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop"  // Movie clapper
];

export function AuthCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 2000); // 2 seconds interval

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-2xl">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentIndex ? "opacity-100" : "opacity-0"
                    )}
                >
                    <img
                        src={img}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Discover More</h3>
                        <p className="text-white/80">Find your next favorite movie with <span className="font-bold text-primary">CinePick's</span> AI recommendations.</p>
                    </div>
                </div>
            ))}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            index === currentIndex ? "bg-white w-6" : "bg-white/40"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
