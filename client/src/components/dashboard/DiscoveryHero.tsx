import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LayoutGrid, Shuffle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface DiscoveryHeroProps {
    onOpenChat: () => void;
    onScrollToCategories: () => void;
    onSurpriseMe: () => void;
}

export default function DiscoveryHero({ onOpenChat, onScrollToCategories, onSurpriseMe }: DiscoveryHeroProps) {
    const [isHovered, setIsHovered] = useState<number | null>(null);

    const cards = [
        {
            id: 1,
            title: "I'm feeling...",
            description: "Tell AI your mood and get a perfect match",
            icon: Sparkles,
            action: onOpenChat,
            color: "from-purple-600 to-blue-600",
            buttonText: "Start AI Chat"
        },
        {
            id: 2,
            title: "I know what I want",
            description: "Browse curated categories and filters",
            icon: LayoutGrid,
            action: onScrollToCategories,
            color: "from-emerald-600 to-teal-600",
            buttonText: "Explore Categories"
        },
        {
            id: 3,
            title: "Surprise me!",
            description: "Let fate decide your next movie",
            icon: Shuffle,
            action: onSurpriseMe,
            color: "from-orange-500 to-pink-600",
            buttonText: "Spin the Wheel"
        }
    ];

    return (
        <div className="w-full py-12 px-4 md:px-8">
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                >
                    Can't decide what to watch?
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-400"
                >
                    Let us help you find the perfect movie. 🎬
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                        onMouseEnter={() => setIsHovered(card.id)}
                        onMouseLeave={() => setIsHovered(null)}
                        onClick={card.action}
                        className="relative group cursor-pointer"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl blur-xl`} />

                        <div className="relative h-full bg-card/50 border border-white/10 hover:border-white/20 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center backdrop-blur-sm">
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon size={32} className="text-white" />
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                            <p className="text-gray-400 mb-8 flex-grow">{card.description}</p>

                            <button className={`flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group-hover:bg-gradient-to-r ${card.color} group-hover:border-transparent`}>
                                <span className="font-medium">{card.buttonText}</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
