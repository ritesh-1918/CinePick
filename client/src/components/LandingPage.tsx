import React, { useEffect } from 'react';
import Globe from './ui/globe';
import { Footer } from './ui/footer';

export default function LandingPage() {
    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            window.location.href = '/app.html';
        }
    }, []);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
            {/* Navigation Header */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="CinePick Logo" className="h-8 w-8" />
                    <span className="text-xl font-bold text-blue-400">CinePick</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm">
                    <a href="/how-it-works.html" className="hover:text-blue-400 transition-colors">How it Works</a>
                    <a href="/faq.html" className="hover:text-blue-400 transition-colors">FAQ</a>
                    <a href="/login.html" className="px-6 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-500/10 transition-all">Sign In</a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 min-h-[calc(100vh-100px)] flex items-center justify-between px-8 md:px-16 lg:px-24">
                <div className="max-w-2xl space-y-8">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                        Stop Scrolling.<br />
                        <span className="text-gray-400">Start Watching.</span>
                    </h1>

                    <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                        Tired of endless browsing? Let our AI find the perfect movie for your mood in seconds. No more indecision, just great entertainment.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <a
                            href="/signup.html"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-all hover:scale-105 text-center"
                        >
                            Find a Movie
                        </a>
                        <a
                            href="/how-it-works.html"
                            className="px-8 py-4 bg-transparent border-2 border-gray-600 hover:border-gray-400 text-white font-semibold rounded-lg transition-all text-center"
                        >
                            How it Works
                        </a>
                    </div>
                </div>

                {/* Globe on the right */}
                <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2">
                    <Globe />
                </div>
            </section>

            {/* Navigation Dots (right side) */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            </div>

            {/* Features Section */}
            <section className="relative z-10 py-32 px-8 md:px-16 lg:px-24">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        Why Choose CinePick?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all">
                            <div className="text-5xl mb-6">🎯</div>
                            <h3 className="text-2xl font-bold mb-4">AI-Powered</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Our advanced AI learns your preferences and suggests movies that perfectly match your taste and current mood.
                            </p>
                        </div>

                        <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all">
                            <div className="text-5xl mb-6">⚡</div>
                            <h3 className="text-2xl font-bold mb-4">Instant Results</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Stop scrolling for hours. Get instant, personalized recommendations and start watching what you'll love.
                            </p>
                        </div>

                        <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all">
                            <div className="text-5xl mb-6">🌍</div>
                            <h3 className="text-2xl font-bold mb-4">Global Library</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Access movies from every genre, era, and country. From classics to the latest releases.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
