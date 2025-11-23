import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollGlobe from '@/components/ui/landing-page';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
    const navigate = useNavigate();

    const sections = [
        {
            id: "hero",
            title: "Stop scrolling, start watching.",
            description: "CinePick finds the perfect movie for your mood in seconds.",
            align: "left" as const,
            actions: [
                { label: "Find a Movie", variant: "primary" as const, onClick: () => navigate('/signup') },
                { label: "How it Works", variant: "secondary" as const, onClick: () => navigate('/how-it-works') },
            ]
        },
        {
            id: "features",
            title: "Smart",
            subtitle: "Recommendations",
            description: "Our intelligent algorithms analyze your taste profile to suggest hidden gems and blockbusters you'll actually love.",
            align: "center" as const,
            features: [
                { title: "Mood-Based Matching", description: "Tell us how you feel, we'll tell you what to watch." },
                { title: "Hidden Gems", description: "Discover movies you missed but will love." },
                { title: "Instant Results", description: "No more endless scrolling through catalogs." }
            ]
        },
        {
            id: "discovery",
            title: "Discover Your",
            subtitle: "Perfect Match",
            description: "Swipe, rate, and build your unique taste profile. The more you use CinePick, the better it gets at predicting your next favorite film.",
            align: "left" as const,
        },
        {
            id: "cta",
            title: "Ready to Find",
            subtitle: "Your Next Favorite?",
            description: "Join thousands of movie lovers who have stopped scrolling and started watching. It's free to get started.",
            align: "center" as const,
            actions: [
                { label: "Sign Up Now", variant: "primary" as const, onClick: () => navigate('/signup') },
                { label: "Read FAQ", variant: "secondary" as const, onClick: () => navigate('/faq') }
            ]
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <ScrollGlobe sections={sections} />
            <Footer />
        </div>
    );
}
