import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface CategoryOption {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    description?: string;
}

interface InteractiveCategoryProps {
    title: string;
    options: CategoryOption[];
    selectedOption: string | null;
    onSelect: (id: string) => void;
    children: React.ReactNode;
}

export default function InteractiveCategory({
    title,
    options,
    selectedOption,
    onSelect,
    children
}: InteractiveCategoryProps) {
    return (
        <div className="w-full py-8">
            <h3 className="text-2xl font-bold mb-6 px-4 md:px-0">{title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 px-4 md:px-0">
                {options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <motion.button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-6 rounded-xl border transition-all duration-300 text-left overflow-hidden group ${isSelected
                                    ? 'bg-white/10 border-primary shadow-lg shadow-primary/20'
                                    : 'bg-card/50 border-white/10 hover:border-white/20 hover:bg-white/5'
                                }`}
                        >
                            {/* Background Gradient on Hover/Select */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 ${isSelected ? 'opacity-10' : 'group-hover:opacity-5'} transition-opacity duration-500`} />

                            <div className="relative flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-gradient-to-br ${option.color} shadow-lg`}>
                                    <option.icon size={24} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{option.label}</h4>
                                    {option.description && (
                                        <p className="text-sm text-gray-400">{option.description}</p>
                                    )}
                                </div>
                                {isSelected && (
                                    <motion.div
                                        layoutId={`chevron-${title}`}
                                        className="ml-auto"
                                    >
                                        <ChevronDown className="text-primary" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {selectedOption && (
                    <motion.div
                        key={selectedOption}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
