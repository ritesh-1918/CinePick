import { useState, useEffect, useRef } from 'react';
import { Smile, Frown, Zap, Clock, Calendar, Users, Heart, User, Film, Sparkles, Moon, Sun, Coffee, Layers, Tv, Music, LayoutDashboard, Compass, Library as LibraryBig, UserCog, LogOut, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// import Navbar from '@/components/Navbar'; // Removed Navbar
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import DiscoveryHero from '@/components/dashboard/DiscoveryHero';
import CuratedSection from '@/components/dashboard/CuratedSection';
import InteractiveCategory from '@/components/dashboard/InteractiveCategory';
import DecisionFilter from '@/components/dashboard/DecisionFilter';
import AIConversationWizard from '@/components/features/AIConversationWizard';
import SwipeEliminator from '@/components/features/SwipeEliminator';
import WatchParty from '@/components/features/WatchParty';
import MoodPlaylistGenerator from '@/components/features/MoodPlaylistGenerator';
import MovieDetailModal from '@/components/modals/MovieDetailModal';
import LogoutModal from '@/components/modals/LogoutModal';
import Chatbot from '@/components/Chatbot';
import tmdbApi, { Movie } from '@/services/tmdb';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const categoriesRef = useRef<HTMLDivElement>(null);

    // Sidebar State
    const [open, setOpen] = useState(false);

    // State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isSwipeOpen, setIsSwipeOpen] = useState(false);
    const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Decision Fatigue State
    const [interactionCount, setInteractionCount] = useState(0);
    const [showFatiguePopup, setShowFatiguePopup] = useState(false);

    // Time-Aware State
    const [timeGreeting, setTimeGreeting] = useState('');
    const [timeIcon, setTimeIcon] = useState<any>(Sun);

    // Category Selection State
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

    // Movies Data State
    const [moodMovies, setMoodMovies] = useState<Movie[]>([]);
    const [timeMovies, setTimeMovies] = useState<Movie[]>([]);
    const [audienceMovies, setAudienceMovies] = useState<Movie[]>([]);
    const [languageMovies, setLanguageMovies] = useState<Movie[]>([]);

    // Modal State
    const [detailMovieId, setDetailMovieId] = useState<number | null>(null);

    // Logout Logic
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        await logout();
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
    };

    // Sidebar Links
    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Discovery",
            href: "/discovery",
            icon: (
                <Compass className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Library",
            href: "/library",
            icon: (
                <LibraryBig className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            href: "/profile",
            icon: (
                <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
    ];

    // Time-Aware Logic
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setTimeGreeting('Good Morning! ☀️ Start your day with these picks.');
            setTimeIcon(Coffee);
        } else if (hour < 18) {
            setTimeGreeting('Good Afternoon! 🌤️ Perfect time for a break.');
            setTimeIcon(Sun);
        } else {
            setTimeGreeting('Good Evening! 🌙 Relax with a great movie.');
            setTimeIcon(Moon);
        }
    }, []);

    // Decision Fatigue Logic
    useEffect(() => {
        if (interactionCount > 5 && !showFatiguePopup) {
            setShowFatiguePopup(true);
        }
    }, [interactionCount, showFatiguePopup]);

    const incrementInteraction = () => setInteractionCount(prev => prev + 1);

    // Scroll to categories handler
    const scrollToCategories = () => {
        categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
        incrementInteraction();
    };

    // Surprise Me Handler
    const handleSurpriseMe = async () => {
        incrementInteraction();
        const toastId = toast.loading('Finding a perfect pick...');
        try {
            const data = await tmdbApi.getTrending('week');
            if (data.results && data.results.length > 0) {
                const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
                toast.success(`How about: ${randomMovie.title}?`, { id: toastId });
                setDetailMovieId(randomMovie.id);
            } else {
                toast.error('Could not find a movie.', { id: toastId });
            }
        } catch (error) {
            console.error('Surprise Me Error:', error);
            toast.error('Failed to surprise you.', { id: toastId });
        }
    };

    // Fetch Movies for Categories
    const fetchMovies = async (type: 'mood' | 'time' | 'audience' | 'language', value: string) => {
        setLoading(true);
        try {
            let filters: any = { sort_by: 'popularity.desc', 'vote_count.gte': 100 };

            // Mood Logic
            if (type === 'mood') {
                if (value === 'happy') filters.with_genres = '35,10751';
                if (value === 'sad') filters.with_genres = '18';
                if (value === 'mindblown') filters.with_genres = '878,9648';
            }

            // Time Logic
            if (type === 'time') {
                if (value === 'quick') filters['with_runtime.lte'] = 90;
                if (value === 'standard') { filters['with_runtime.gte'] = 90; filters['with_runtime.lte'] = 120; }
                if (value === 'epic') filters['with_runtime.gte'] = 120;
            }

            // Audience Logic
            if (type === 'audience') {
                if (value === 'family') filters.with_genres = '10751,16';
                if (value === 'date') filters.with_genres = '10749';
                if (value === 'solo') filters.with_genres = '53,27';
            }

            // Language Logic
            if (type === 'language') {
                filters.with_original_language = value;
            }

            const data = await tmdbApi.discoverMovies(filters);

            if (type === 'mood') setMoodMovies(data.results || []);
            if (type === 'time') setTimeMovies(data.results || []);
            if (type === 'audience') setAudienceMovies(data.results || []);
            if (type === 'language') setLanguageMovies(data.results || []);

        } catch (error) {
            console.error(`Error fetching ${type} movies:`, error);
            toast.error('Failed to load recommendations.');
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch when selection changes
    useEffect(() => {
        if (selectedMood) { fetchMovies('mood', selectedMood); incrementInteraction(); }
    }, [selectedMood]);

    useEffect(() => {
        if (selectedTime) { fetchMovies('time', selectedTime); incrementInteraction(); }
    }, [selectedTime]);

    useEffect(() => {
        if (selectedAudience) { fetchMovies('audience', selectedAudience); incrementInteraction(); }
    }, [selectedAudience]);

    useEffect(() => {
        if (selectedLanguage) { fetchMovies('language', selectedLanguage); incrementInteraction(); }
    }, [selectedLanguage]);

    // Handlers for Movie Actions
    const handleMovieClick = (id: number) => {
        if (!id) return;
        setDetailMovieId(id);
        incrementInteraction();
    };
    const handleTrailerClick = (id: number) => {
        navigate(`/trailer/${id}`);
    };
    const handleWatchlistClick = async (movie: Movie) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) {
                toast.error('Please login to add to watchlist');
                return;
            }
            await fetch(`http://localhost:5000/api/watchlist/${user.id}/default/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ movieId: String(movie.id) })
            });
            toast.success('Added to watchlist');
        } catch (error) {
            console.error('Watchlist error:', error);
            toast.error('Failed to add to watchlist');
        }
    };

    // Smart Filter Handler
    const handleSmartFilter = async (filters: any) => {
        incrementInteraction();
        const toastId = toast.loading('Finding your perfect match...');
        try {
            let apiFilters: any = { sort_by: 'popularity.desc', 'vote_count.gte': 100 };

            // Map answers to API filters
            if (filters.mood === 'happy') apiFilters.with_genres = '35,10751';
            if (filters.mood === 'sad') apiFilters.with_genres = '18';
            if (filters.mood === 'excited') apiFilters.with_genres = '28,12';
            if (filters.mood === 'thoughtful') apiFilters.with_genres = '99,36';

            if (filters.audience === 'family') apiFilters.with_genres = (apiFilters.with_genres ? apiFilters.with_genres + ',' : '') + '10751,16';
            if (filters.audience === 'partner') apiFilters.with_genres = (apiFilters.with_genres ? apiFilters.with_genres + ',' : '') + '10749';

            if (filters.time === 'short') apiFilters['with_runtime.lte'] = 90;
            if (filters.time === 'medium') { apiFilters['with_runtime.gte'] = 90; apiFilters['with_runtime.lte'] = 120; }
            if (filters.time === 'long') apiFilters['with_runtime.gte'] = 120;

            const data = await tmdbApi.discoverMovies(apiFilters);

            if (data.results && data.results.length > 0) {
                const bestMatch = data.results[0];
                setDetailMovieId(bestMatch.id);
                toast.success('Found a match!', { id: toastId });
            } else {
                toast.error('No movies found matching your criteria.', { id: toastId });
            }
        } catch (error) {
            console.error('Smart Filter Error:', error);
            toast.error('Failed to filter movies.', { id: toastId });
        }
    };

    return (
        <div className={cn(
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
            "h-screen"
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                            <div
                                onClick={handleLogoutClick}
                                className="cursor-pointer"
                            >
                                <SidebarLink
                                    link={{
                                        label: "Logout",
                                        href: "#",
                                        icon: (
                                            <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                                        ),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: user?.name || "User",
                                href: "/profile",
                                icon: (
                                    <div className="h-7 w-7 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center text-xs font-bold">
                                        {user?.name?.charAt(0) || "U"}
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            <div className="flex flex-1 flex-col overflow-y-auto h-full bg-background relative">
                {/* Time-Aware Greeting */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 mb-8 w-full">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-full text-primary">
                                {timeIcon && (() => {
                                    const Icon = timeIcon;
                                    return <Icon size={24} />;
                                })()}
                            </div>
                            <p className="text-lg font-medium text-gray-200">{timeGreeting}</p>
                        </div>

                        <div className="flex gap-3">
                            {/* Playlist Generator Trigger */}
                            <button
                                onClick={() => setIsPlaylistOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
                            >
                                <Music size={18} />
                                <span>Playlist</span>
                            </button>

                            {/* Watch Party Trigger */}
                            <button
                                onClick={() => setIsWatchPartyOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-pink-500/20"
                            >
                                <Tv size={18} />
                                <span>Watch Party</span>
                            </button>

                            {/* Swipe Mode Trigger */}
                            <button
                                onClick={() => setIsSwipeOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
                            >
                                <Layers size={18} />
                                <span>Swipe Mode</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <DiscoveryHero
                    onOpenChat={() => setIsChatOpen(true)}
                    onScrollToCategories={scrollToCategories}
                    onSurpriseMe={handleSurpriseMe}
                />

                <DecisionFilter
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    onComplete={handleSmartFilter}
                />

                <AIConversationWizard
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    onMovieSelect={(id) => {
                        setDetailMovieId(id);
                        setIsWizardOpen(false);
                    }}
                />

                <SwipeEliminator
                    isOpen={isSwipeOpen}
                    onClose={() => setIsSwipeOpen(false)}
                    onMovieSelect={(id) => {
                        setDetailMovieId(id);
                        setIsSwipeOpen(false);
                    }}
                />

                <WatchParty
                    isOpen={isWatchPartyOpen}
                    onClose={() => setIsWatchPartyOpen(false)}
                />

                <MoodPlaylistGenerator
                    isOpen={isPlaylistOpen}
                    onClose={() => setIsPlaylistOpen(false)}
                    onMovieSelect={(id) => {
                        setDetailMovieId(id);
                        setIsPlaylistOpen(false);
                    }}
                />

                {/* Decision Fatigue Popup */}
                <AnimatePresence>
                    {showFatiguePopup && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-24 right-8 z-50 bg-card border border-primary/50 p-6 rounded-xl shadow-2xl max-w-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-full text-primary">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-2">Trouble deciding?</h4>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        You've been browsing for a while. Want me to just pick the perfect movie for you?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowFatiguePopup(false);
                                                // Trigger Pick For Me logic programmatically or just open Wizard
                                                setIsWizardOpen(true);
                                            }}
                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90"
                                        >
                                            Yes, help me!
                                        </button>
                                        <button
                                            onClick={() => setShowFatiguePopup(false)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                                        >
                                            I'm good
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFatiguePopup(false)}
                                    className="text-muted-foreground hover:text-white"
                                >
                                    <Sparkles size={16} className="rotate-45" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content - Categories */}
                <div ref={categoriesRef} className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 pb-20">

                    {/* 1. Mood Section */}
                    <InteractiveCategory
                        title="What's your mood?"
                        selectedOption={selectedMood}
                        onSelect={setSelectedMood}
                        options={[
                            { id: 'happy', label: 'Happy & Light', icon: Smile, color: 'from-yellow-400 to-orange-500', description: 'Comedies and feel-good stories' },
                            { id: 'sad', label: 'Emotional & Deep', icon: Frown, color: 'from-blue-400 to-indigo-500', description: 'Dramas that touch the heart' },
                            { id: 'mindblown', label: 'Mind-Blowing', icon: Zap, color: 'from-purple-400 to-pink-500', description: 'Sci-fi and twists' }
                        ]}
                    >
                        <CuratedSection
                            movies={moodMovies}
                            loading={loading}
                            onMovieClick={handleMovieClick}
                            onTrailerClick={handleTrailerClick}
                            onWatchlistClick={handleWatchlistClick}
                        />
                    </InteractiveCategory>

                    {/* 2. Time Section */}
                    <InteractiveCategory
                        title="How much time do you have?"
                        selectedOption={selectedTime}
                        onSelect={setSelectedTime}
                        options={[
                            { id: 'quick', label: 'Quick Watch', icon: Clock, color: 'from-green-400 to-emerald-500', description: 'Under 90 minutes' },
                            { id: 'standard', label: 'Movie Night', icon: Film, color: 'from-blue-400 to-cyan-500', description: '90 - 120 minutes' },
                            { id: 'epic', label: 'Epic Journey', icon: Calendar, color: 'from-red-400 to-rose-500', description: 'Over 2 hours' }
                        ]}
                    >
                        <CuratedSection
                            movies={timeMovies}
                            loading={loading}
                            onMovieClick={handleMovieClick}
                            onTrailerClick={handleTrailerClick}
                            onWatchlistClick={handleWatchlistClick}
                        />
                    </InteractiveCategory>

                    {/* 3. Audience Section */}
                    <InteractiveCategory
                        title="Who's watching?"
                        selectedOption={selectedAudience}
                        onSelect={setSelectedAudience}
                        options={[
                            { id: 'family', label: 'Family Fun', icon: Users, color: 'from-orange-400 to-red-500', description: 'Safe for all ages' },
                            { id: 'date', label: 'Date Night', icon: Heart, color: 'from-pink-400 to-rose-500', description: 'Romance and connection' },
                            { id: 'solo', label: 'Solo Adventure', icon: User, color: 'from-indigo-400 to-violet-500', description: 'Thrillers and intense films' }
                        ]}
                    >
                        <CuratedSection
                            movies={audienceMovies}
                            loading={loading}
                            onMovieClick={handleMovieClick}
                            onTrailerClick={handleTrailerClick}
                            onWatchlistClick={handleWatchlistClick}
                        />
                    </InteractiveCategory>

                    {/* 4. Language Section */}
                    <InteractiveCategory
                        title="Explore by Language"
                        selectedOption={selectedLanguage}
                        onSelect={setSelectedLanguage}
                        options={[
                            { id: 'te', label: 'Telugu', icon: Globe, color: 'from-orange-400 to-red-500', description: 'Tollywood Hits' },
                            { id: 'hi', label: 'Hindi', icon: Globe, color: 'from-green-400 to-emerald-500', description: 'Bollywood Blockbusters' },
                            { id: 'en', label: 'English', icon: Globe, color: 'from-blue-400 to-indigo-500', description: 'Hollywood Classics' },
                            { id: 'ta', label: 'Tamil', icon: Globe, color: 'from-yellow-400 to-orange-500', description: 'Kollywood Favorites' }
                        ]}
                    >
                        <CuratedSection
                            movies={languageMovies}
                            loading={loading}
                            onMovieClick={handleMovieClick}
                            onTrailerClick={handleTrailerClick}
                            onWatchlistClick={handleWatchlistClick}
                        />
                    </InteractiveCategory>

                </div>

                {/* Chatbot */}
                <Chatbot isOpen={isChatOpen} onToggle={setIsChatOpen} />

                {/* Modals */}
                {detailMovieId && (
                    <MovieDetailModal
                        movieId={detailMovieId}
                        onClose={() => setDetailMovieId(null)}
                        onTrailerClick={handleTrailerClick}
                        onWatchlistClick={handleWatchlistClick}
                    />
                )}

                <LogoutModal
                    isOpen={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleLogoutConfirm}
                />
            </div>
        </div>
    );
}
