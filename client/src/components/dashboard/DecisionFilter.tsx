import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, ArrowRight } from 'lucide-react';

interface DecisionFilterProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (filters: any) => void;
}

export default function DecisionFilter({ isOpen, onClose, onComplete }: DecisionFilterProps) {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<any>({});

    const questions = [
        {
            id: 'mood',
            question: "How are you feeling right now?",
            options: [
                { value: 'happy', label: '😊 Happy & Light' },
                { value: 'sad', label: '😢 Emotional' },
                { value: 'excited', label: '🤩 Excited' },
                { value: 'thoughtful', label: '🤔 Thoughtful' },
                { value: 'neutral', label: '😐 Neutral' }
            ]
        },
        {
            id: 'audience',
            question: "Who is watching?",
            options: [
                { value: 'solo', label: '👤 Just Me' },
                { value: 'partner', label: '👫 Date Night' },
                { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
                { value: 'friends', label: '🎉 Friends' }
            ]
        },
        {
            id: 'time',
            question: "How much time do you have?",
            options: [
                { value: 'short', label: '⚡ Quick (< 90m)' },
                { value: 'medium', label: '🎬 Standard (90-120m)' },
                { value: 'long', label: '🍿 Epic (> 2h)' }
            ]
        }
    ];

    const handleSelect = (key: string, value: string) => {
        setAnswers({ ...answers, [key]: value });
        if (step < questions.length) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            // Finished
            setTimeout(() => {
                onComplete({ ...answers, [key]: value });
                onClose();
                setStep(1); // Reset for next time
                setAnswers({});
            }, 300);
        }
    };

    const currentQuestion = questions[step - 1];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-white/10 z-50 p-6 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="text-primary" />
                                Smart Filter
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm font-medium text-primary">Step {step} of {questions.length}</span>
                                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(step / questions.length) * 100}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>

                                <motion.h3
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl font-bold mb-6"
                                >
                                    {currentQuestion.question}
                                </motion.h3>

                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => (
                                        <motion.button
                                            key={option.value}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleSelect(currentQuestion.id, option.value)}
                                            className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${answers[currentQuestion.id] === option.value
                                                    ? 'bg-primary/20 border-primary text-primary'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <span className="text-lg font-medium">{option.label}</span>
                                            {answers[currentQuestion.id] === option.value && (
                                                <Check size={20} />
                                            )}
                                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-gray-400" />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10 text-center text-sm text-gray-500">
                            Answer a few questions to get personalized picks
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
