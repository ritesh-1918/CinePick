import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Library, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch profile image
    useEffect(() => {
        const fetchProfileImage = async () => {
            if (!user) return;
            try {
                const res = await fetch(`/api/profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success && data.user.profileImage) {
                    setProfileImage(data.user.profileImage);
                }
            } catch (error) {
                console.error('Failed to fetch profile image:', error);
            }
        };
        fetchProfileImage();
    }, [user]);

    const navLinks = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/library', label: 'My Library', icon: Library },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <img src="/logo.png" alt="CinePick Logo" className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            CinePick
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.path) ? 'text-primary' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        ))}

                        {/* User Menu */}
                        <div className="flex items-center gap-4 pl-8 border-l border-white/10">
                            <Link to="/profile" className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-primary transition-colors">
                                    {profileImage ? (
                                        <img src={profileImage} alt={user?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 text-lg font-medium ${isActive(link.path) ? 'text-primary' : 'text-gray-400'
                                        }`}
                                >
                                    <link.icon size={24} />
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="border-white/10" />
                            <button
                                onClick={logout}
                                className="flex items-center gap-4 text-lg font-medium text-red-500"
                            >
                                <LogOut size={24} />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
