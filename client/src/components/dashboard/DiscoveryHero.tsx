import { motion } from 'framer-motion';
import { Sparkles, LayoutGrid, Shuffle, ArrowRight } from 'lucide-react';


interface DiscoveryHeroProps {
    onOpenChat: () => void;
    onScrollToCategories: () => void;
    onSurpriseMe: () => void;
}

export default function DiscoveryHero({ onOpenChat, onScrollToCategories, onSurpriseMe }: DiscoveryHeroProps) {


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
                        // onMouseEnter={() => setIsHovered(card.id)}
                        // onMouseLeave={() => setIsHovered(null)}
                        onClick={card.action}
                        className="relative group cursor-pointer h-[400px]"
                    >
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                            <img
                                src={
                                    card.id === 1 ? "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=800" : // Mood/Books/Cozy
                                        card.id === 2 ? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800" : // Cinema/Grid
                                            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800" // Popcorn/Fun
                                }
                                alt={card.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        <div className="relative z-20 h-full p-8 flex flex-col justify-end items-start text-left">
                            <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} className="text-white" />
                            </div>

                            <h3 className="text-3xl font-bold mb-2 text-white">{card.title}</h3>
                            <p className="text-gray-200 mb-6 font-medium">{card.description}</p>

                            <button className={`flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold transition-all hover:bg-gray-200 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300`}>
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
