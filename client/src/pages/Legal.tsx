import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function Legal() {
    const location = useLocation();
    const type = location.pathname.substring(1); // privacy, terms, or cookies

    const titles: Record<string, string> = {
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        cookies: "Cookie Policy"
    };

    const content = {
        privacy: (
            <div className="space-y-6">
                <p>At CinePick, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
                <h3 className="text-xl font-semibold text-white mt-8">Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, rate movies, or contact us for support.</p>
                <h3 className="text-xl font-semibold text-white mt-8">How We Use Your Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, including personalized movie recommendations.</p>
            </div>
        ),
        terms: (
            <div className="space-y-6">
                <p>Welcome to CinePick. By using our website and services, you agree to these Terms of Service.</p>
                <h3 className="text-xl font-semibold text-white mt-8">Use of Service</h3>
                <p>You must be at least 13 years old to use CinePick. You are responsible for maintaining the security of your account.</p>
                <h3 className="text-xl font-semibold text-white mt-8">User Content</h3>
                <p>You retain ownership of any content you submit, post, or display on or through our services.</p>
            </div>
        ),
        cookies: (
            <div className="space-y-6">
                <p>CinePick uses cookies to improve your experience on our website.</p>
                <h3 className="text-xl font-semibold text-white mt-8">What are Cookies?</h3>
                <p>Cookies are small text files that are stored on your device when you visit a website.</p>
                <h3 className="text-xl font-semibold text-white mt-8">How We Use Cookies</h3>
                <p>We use cookies to remember your preferences, analyze our traffic, and personalize content.</p>
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent capitalize">
                    {titles[type] || "Legal"}
                </h1>

                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                    {content[type as keyof typeof content] || <p>Content not found.</p>}
                </div>
            </div>
            <Footer />
        </div>
    );
}
