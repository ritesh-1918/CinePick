import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, MessageCircle, User, Calendar, Brain, Film, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIConversationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onMovieSelect: (movieId: number) => void;
}

type Step = 'intro' | 'mood' | 'audience' | 'context' | 'complexity' | 'results';

interface Question {
    id: string;
    question: string;
    type: 'option' | 'text';
    options?: string[];
    icon: React.ElementType;
}

const QUESTIONS: Question[] = [
    {
        id: 'mood',
        question: "How are you feeling right now?",
        type: 'option',
        options: ["Happy 😊", "Sad 😢", "Stressed 😰", "Bored 😑", "Excited 🤩"],
        icon: MessageCircle
    },
    {
        id: 'audience',
        question: "Are you watching alone or with someone?",
        type: 'option',
        options: ["Alone", "With partner", "With family", "With friends"],
        icon: User
    },
    {
        id: 'context',
        question: "What did you do today?",
        type: 'text',
        icon: Calendar
    },
    {
        id: 'complexity',
        question: "Do you want something that makes you think or something easy to watch?",
        type: 'option',
        options: ["Make me think", "Something easy", "Surprise me"],
        icon: Brain
    }
];

export default function AIConversationWizard({ isOpen, onClose, onMovieSelect }: AIConversationWizardProps) {
    const [step, setStep] = useState<Step>('intro');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [error, setError] = useState<string | null>(null);

    const handleStart = () => {
        setStep('mood');
        setCurrentQuestionIndex(0);
        setError(null);
    };

    const handleAnswer = async (answer: string) => {
        const currentQ = QUESTIONS[currentQuestionIndex];
        const newAnswers = { ...answers, [currentQ.id]: answer };
        setAnswers(newAnswers);

        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Finished
            await generateRecommendations(newAnswers);
        }
    };

    const generateRecommendations = async (finalAnswers: Record<string, string>) => {
        setLoading(true);
        setError(null);
        try {
            // Call backend API
            const response = await fetch('http://localhost:5000/api/ai/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(finalAnswers)
            });

            const data = await response.json();

            if (data.success) {
                setRecommendations(data.recommendations);
                setStep('results');
            } else {
                throw new Error(data.message || 'Failed to generate recommendations');
            }
        } catch (error) {
            console.error('AI Error:', error);
            setError('Something went wrong. Please try again.');
            toast.error('Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles size={20} />
                        <span className="font-bold">AI Movie Assistant</span>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center space-y-6 py-8"
                            >
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles size={40} className="text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold">Hi! I'm your movie picker assistant</h2>
                                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                    I'll ask you a few questions to find the perfect movie for you right now.
                                </p>
                                <button
                                    onClick={handleStart}
                                    className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors"
                                >
                                    Let's Start
                                </button>
                            </motion.div>
                        )}

                        {(step !== 'intro' && step !== 'results' && !loading && !error) && (
                            <motion.div
                                key="question"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="space-y-8"
                            >
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold">{QUESTIONS[currentQuestionIndex].question}</h3>
                                </div>

                                <div className="grid gap-3 max-w-md mx-auto">
                                    {QUESTIONS[currentQuestionIndex].type === 'option' ? (
                                        QUESTIONS[currentQuestionIndex].options?.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => handleAnswer(option)}
                                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all text-left flex items-center justify-between group"
                                            >
                                                <span>{option}</span>
                                                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="space-y-4">
                                            <textarea
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary/50 min-h-[100px]"
                                                placeholder="Type here..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleAnswer(e.currentTarget.value);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-center text-muted-foreground">Press Enter to continue</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-10 space-y-6"
                            >
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                                    <X size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-red-400">Oops! Something went wrong</h3>
                                <p className="text-muted-foreground">{error}</p>
                                <button
                                    onClick={() => generateRecommendations(answers)}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        )}

                        {(loading && !error) && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 space-y-6"
                            >
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                <h3 className="text-xl font-semibold">Analyzing your preferences...</h3>
                                <p className="text-muted-foreground">Finding the perfect matches for you</p>
                            </motion.div>
                        )}

                        {step === 'results' && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold text-center mb-8">Here are your perfect matches</h3>
                                <div className="grid gap-6">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 flex gap-4 hover:bg-white/10 transition-colors">
                                            <div className="w-24 h-36 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                                                {rec.poster_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                                                        alt={rec.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Film />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-xl font-bold">{rec.title}</h4>
                                                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
                                                        <Star size={12} fill="currentColor" /> {rec.vote_average?.toFixed(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-primary italic">
                                                    💡 {rec.reason}
                                                </p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {rec.overview}
                                                </p>
                                                <div className="pt-2 flex gap-2">
                                                    <button
                                                        onClick={() => onMovieSelect(rec.id)}
                                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center pt-4">
                                    <button
                                        onClick={handleStart}
                                        className="text-sm text-muted-foreground hover:text-white underline"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
