import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function HowItWorks() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Starry Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                        How It Works
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Watch this quick video to see CinePick in action and learn how our AI-powered recommendations work
                    </p>
                </div>

                {/* Video Container */}
                <div className="max-w-5xl mx-auto">
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10">
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/1seR_ckLXz4"
                            title="How CinePick Works"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                        ></iframe>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Movie?</h2>
                    <p className="text-gray-400 mb-8">Join thousands of users who've discovered their new favorite films</p>
                    <Link
                        to="/signup"
                        className="inline-block px-8 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                    >
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
