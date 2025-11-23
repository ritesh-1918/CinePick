import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Footer } from '@/components/Footer';

const faqs = [
    {
        question: "How does the AI recommendation work?",
        answer: "Our AI analyzes thousands of data points including your viewing history, ratings, and mood preferences to find connections between movies that traditional filters miss. It learns from your interactions to get better over time."
    },
    {
        question: "Is CinePick free to use?",
        answer: "Yes! CinePick is completely free for all users. We believe everyone deserves to find great movies without barriers."
    },
    {
        question: "Can I sync with my streaming services?",
        answer: "Currently, we provide links to where you can watch movies. Direct integration with streaming service watchlists is on our roadmap for the next major update."
    },
    {
        question: "How do I reset my recommendations?",
        answer: "You can reset your preferences in your profile settings. This will clear your history and allow you to start fresh with new mood inputs."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Frequently Asked Questions</h1>
                <p className="text-muted-foreground mb-12 text-lg">Everything you need to know about CinePick.</p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-border/50 rounded-xl bg-card/30 overflow-hidden transition-all duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="font-medium text-lg">{faq.question}</span>
                                {openIndex === index ? (
                                    <Minus className="text-primary" size={20} />
                                ) : (
                                    <Plus className="text-muted-foreground" size={20} />
                                )}
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
