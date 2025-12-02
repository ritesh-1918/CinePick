import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy",
    "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
];

const moods = [
    "Happy", "Sad", "Excited", "Relaxed", "Bored", "Romantic"
];

export default function Survey() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

    const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const [submitting, setSubmitting] = useState(false);

    const handleNext = async () => {
        if (step === 1 && selectedGenres.length > 0) {
            setStep(2);
        } else if (step === 2 && selectedMoods.length > 0) {
            // Complete survey
            setSubmitting(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${apiUrl}/api/auth/survey`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        favoriteGenres: selectedGenres,
                        // We are mapping moods to "favoriteActors" field for now to store them, 
                        // or we could add a 'moods' field to the schema later. 
                        // For now, let's just save genres.
                        // actually, let's just send what we have.
                        favoriteActors: selectedMoods // Temporary mapping to store mood data
                    })
                });

                const data = await res.json();
                if (data.success) {
                    navigate('/dashboard');
                } else {
                    console.error('Survey failed:', data.message);
                    // Force navigate anyway so user isn't stuck
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Survey error:', error);
                navigate('/dashboard');
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={cn("w-3 h-3 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("w-12 h-1 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("w-3 h-3 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        {step === 1 ? "What do you like to watch?" : "How are you feeling?"}
                    </h1>
                    <p className="text-muted-foreground">
                        {step === 1 ? "Select at least 3 genres to help us recommend better movies." : "Tell us your mood so we can match the vibe."}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                    {step === 1 ? genres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                            className={cn(
                                "p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2",
                                selectedGenres.includes(genre)
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80"
                            )}
                        >
                            <span className="font-medium">{genre}</span>
                            {selectedGenres.includes(genre) && <Check size={16} />}
                        </button>
                    )) : moods.map(mood => (
                        <button
                            key={mood}
                            onClick={() => toggleSelection(mood, selectedMoods, setSelectedMoods)}
                            className={cn(
                                "p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2",
                                selectedMoods.includes(mood)
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80"
                            )}
                        >
                            <span className="font-medium">{mood}</span>
                            {selectedMoods.includes(mood) && <Check size={16} />}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={step === 1 ? selectedGenres.length === 0 : selectedMoods.length === 0}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 1 ? "Next Step" : "Finish"}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
