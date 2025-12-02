import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Play, Check, RotateCcw, Film } from 'lucide-react';
import toast from 'react-hot-toast';

interface PickForMeButtonProps {
    onPick: (movieId: number) => void;
}

export default function PickForMeButton({ onPick }: PickForMeButtonProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handlePick = async () => {
        setLoading(true);
        setIsOpen(true);
        setResult(null);

        try {
            const response = await fetch('/api/ai/pick-one', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                // Add a small delay for the "spinning" effect
                setTimeout(() => {
                    setResult(data.movie);
                    setLoading(false);
                }, 2000);
            } else {
                toast.error('AI could not decide. Try again!');
                setIsOpen(false);
                setLoading(false);
            }
        } catch (error) {
            console.error('Pick For Me Error:', error);
            toast.error('Failed to pick a movie.');
            setIsOpen(false);
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setResult(null);
    };

    return (
        <>
            <motion.button
                onClick={handlePick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 left-8 z-40 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all"
            >
                <Sparkles size={24} className="animate-pulse" />
                <span className="font-bold text-lg">Pick For Me</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative"
                        >
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-white z-10"
                            >
                                <X size={24} />
                            </button>

                            <div className="p-8 text-center space-y-6">
                                {loading ? (
                                    <div className="py-12 space-y-6">
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold animate-pulse">Consulting the Oracle...</h3>
                                        <p className="text-muted-foreground">Analyzing your taste profile...</p>
                                    </div>
                                ) : result ? (
                                    <div className="space-y-6">
                                        <div className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold mb-2">
                                            🎯 The Chosen One
                                        </div>

                                        <div className="relative w-48 h-72 mx-auto rounded-xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => onPick(result.id)}>
                                            {result.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                                                    alt={result.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                    <Film size={40} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play size={48} className="text-white" />
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-3xl font-bold mb-2">{result.title}</h2>
                                            <p className="text-lg text-primary italic">
                                                "{result.reason}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <button
                                                onClick={() => {
                                                    onPick(result.id);
                                                    handleClose();
                                                }}
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                            >
                                                <Check size={20} />
                                                I'll Watch This
                                            </button>
                                            <button
                                                onClick={handlePick}
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors"
                                            >
                                                <RotateCcw size={20} />
                                                Spin Again
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
