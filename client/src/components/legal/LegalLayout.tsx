import React from 'react';
import { Footer } from '@/components/ui/footer';

export function LegalLayout({ children, title }: { children: React.ReactNode; title: string }) {
    return (
        <div className="dark bg-black min-h-screen flex flex-col text-white">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <a href="/" className="text-xl font-bold tracking-tight">CinePick</a>
                    <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Back to Home</a>
                </div>
            </header>

            <main className="relative z-10 flex-grow container mx-auto px-6 py-12 md:py-20 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">{title}</h1>
                <div className="prose prose-invert prose-lg max-w-none">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}
