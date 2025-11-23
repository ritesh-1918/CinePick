import React from 'react';
import { Github, Linkedin, Mail, Heart, Instagram } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative z-20 bg-black/80 backdrop-blur-xl border-t border-white/10 text-gray-400 py-16">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* About Us */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold">About CinePick</h3>
                        <p className="text-sm leading-relaxed">
                            CinePick is your intelligent movie companion. We leverage advanced AI to understand your unique taste and recommend films that resonate with your mood and preferences. Stop scrolling, start watching.
                        </p>
                    </div>

                    {/* About the Creator */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold">About the Creator</h3>
                        <p className="text-sm leading-relaxed">
                            Built with passion by <span className="text-white font-medium">Ritesh</span>.
                            A developer dedicated to crafting immersive web experiences that solve real-world problems with elegance and code.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            <span>Based in India</span>
                        </div>
                    </div>

                    {/* Legal & Links */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold">Legal & Info</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/terms.html" className="hover:text-primary transition-colors">Terms and Conditions</a>
                            </li>
                            <li>
                                <a href="/privacy.html" className="hover:text-primary transition-colors">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="/cookies.html" className="hover:text-primary transition-colors">Cookie Policy</a>
                            </li>
                            <li>
                                <a href="/faq.html" className="hover:text-primary transition-colors">FAQ</a>
                            </li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold">Connect</h3>
                        <div className="flex gap-4">
                            <a href="https://github.com/in/ritesh-1918" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all group">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com/in/ritesh_19180" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all group">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com/in/ritesh1908" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all group">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="mailto:bonthalamadhavi1@gmail.com" className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all group">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            © {new Date().getFullYear()} CinePick. All rights reserved.
                        </p>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 text-center text-xs text-gray-600">
                    <p>Designed with a focus on aesthetics and user experience.</p>
                </div>
            </div>
        </footer>
    );
}
