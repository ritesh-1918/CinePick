import React, { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SurpriseMeButtonProps {
    onMovieSelect: (movieId: number) => void;
}

export default function SurpriseMeButton({ onMovieSelect }: SurpriseMeButtonProps) {
    const [isShuffling, setIsShuffling] = useState(false);

    const handleSurpriseMe = async () => {
        setIsShuffling(true);

        try {
            // Fetch popular movies and pick a random one
            const response = await fetch('/api/tmdb/trending?time_window=week');
            const data = await response.json();

            if (data.success && data.data.results && data.data.results.length > 0) {
                // Random index
                const randomIndex = Math.floor(Math.random() * data.data.results.length);
                const randomMovie = data.data.results[randomIndex];

                // Small delay for effect
                setTimeout(() => {
                    setIsShuffling(false);
                    toast.success(`🎲 Picked: ${randomMovie.title}!`);
                    onMovieSelect(randomMovie.id);
                }, 800);
            } else {
                setIsShuffling(false);
                toast.error('Failed to find a movie');
            }
        } catch (error) {
            console.error('Surprise Me error:', error);
            setIsShuffling(false);
            toast.error('Failed to surprise you');
        }
    };

    return (
        <motion.button
            onClick={handleSurpriseMe}
            disabled={isShuffling}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
        >
            <motion.div
                animate={isShuffling ? { rotate: 360 } : {}}
                transition={{ duration: 0.6, repeat: isShuffling ? Infinity : 0, ease: 'linear' }}
            >
                <Shuffle size={20} />
            </motion.div>
            <span>{isShuffling ? 'Shuffling...' : 'Surprise Me!'}</span>
        </motion.button>
    );
}
