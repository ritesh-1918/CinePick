import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-background border-t border-border/40 py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <img src="/logo.png" alt="CinePick Logo" className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                            CinePick
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Discover your next favorite movie with AI-powered recommendations.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                        <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Connect</h4>
                    <div className="flex gap-4">
                        <a href="https://instagram.com/ritesh_19180" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="https://github.com/ritesh-1918" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="https://linkedin.com/in/ritesh1908" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} CinePick. All rights reserved.</p>
            </div>
        </footer >
    );
}
