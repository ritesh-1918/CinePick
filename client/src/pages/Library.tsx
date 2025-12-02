import { useState, useEffect } from 'react';
import { Bookmark, Clock, Heart, Film, Trash2, Search, SortAsc, Loader2, LayoutDashboard, Compass, Library as LibraryBig, UserCog, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Chatbot from '@/components/Chatbot';
import MovieCard from '@/components/dashboard/MovieCard';
import { Movie } from '@/services/tmdb';
import toast from 'react-hot-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

interface LibraryMovie {
    _id: string;
    movieId: string;
    title: string;
    year?: string;
    poster?: string;
    addedAt: string;
}

export default function Library() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'favorites'>('saved');
    const [movies, setMovies] = useState<LibraryMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [open, setOpen] = useState(true);

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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Fetch Data
    useEffect(() => {
        fetchLibraryData();
    }, [activeTab]);

    const fetchLibraryData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let endpoint = '';

            if (activeTab === 'saved') endpoint = '/api/movies/saved';
            if (activeTab === 'history') endpoint = '/api/movies/history';
            if (activeTab === 'favorites') endpoint = '/api/movies/favorites';

            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setMovies(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch library data:', error);
            toast.error('Failed to load library');
        } finally {
            setLoading(false);
        }
    };

    // Remove Handler
    const handleRemove = async (movieId: string) => {
        const token = localStorage.getItem('token');
        try {
            let endpoint = '';
            if (activeTab === 'history') endpoint = `/api/movies/history/${movieId}`;
            else if (activeTab === 'favorites') endpoint = `/api/movies/favorites/${movieId}`; // Note: movieId here is the _id or tmdbId depending on how we store it. 
            // Actually, for favorites we might want to delete by movieId (TMDB ID) if that's how we track it, or _id.
            // Let's check the API. The API expects /favorites/:movieId (TMDB ID) or /favorites/:id (_id).
            // The previous implementation used _id for saved/history.
            // Let's assume _id for consistency if we can, but my route used movieId.
            // Let's check the route I added: router.delete('/favorites/:movieId', ... userId, movieId: req.params.movieId ...
            // So it expects the TMDB ID.
            // But wait, the LibraryMovie interface has _id and movieId.
            // If activeTab is favorites, we should pass the movieId (TMDB ID).
            else endpoint = `/api/movies/saved/${movieId}`;

            // Wait, if I use movieId (TMDB ID) for favorites, I need to pass that.
            // The handleRemove is called with movie._id usually.
            // I need to check what I'm passing to handleRemove in the render loop.

            await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Movie removed');
            fetchLibraryData(); // Refresh
        } catch (error) {
            console.error('Failed to remove movie:', error);
            toast.error('Failed to remove movie');
        }
    };

    // Filter & Sort Logic
    const filteredMovies = movies
        .filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return 0;
        });

    // Map to MovieCard format
    const mapToMovie = (libMovie: LibraryMovie): Movie => ({
        id: parseInt(libMovie.movieId),
        title: libMovie.title,
        original_title: libMovie.title,
        overview: '',
        poster_path: libMovie.poster || null,
        backdrop_path: null,
        release_date: libMovie.year ? `${libMovie.year}-01-01` : '',
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        genre_ids: [],
        adult: false,
        original_language: 'en',
        video: false
    });

    return (
        <div className={cn(
            "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 overflow-hidden",
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
                                onClick={handleLogout}
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

            <div className="flex flex-1 flex-col overflow-y-auto h-full bg-background">
                <main className="px-4 md:px-12 py-8 w-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Library</h1>
                            <p className="text-muted-foreground">
                                {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your collection
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search library..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary w-full md:w-64"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                <SortAsc size={18} className="text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                                    className="bg-transparent border-none focus:outline-none text-sm"
                                >
                                    <option value="date">Date Added</option>
                                    <option value="title">Title</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mb-8 border-b border-white/10 overflow-x-auto">
                        {[
                            { id: 'saved', label: 'My List', icon: Bookmark },
                            { id: 'history', label: 'Watch History', icon: Clock },
                            { id: 'favorites', label: 'Favorites', icon: Heart }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : filteredMovies.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                            <div className="inline-flex p-6 bg-white/5 rounded-full mb-4">
                                <Film size={48} className="text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery ? 'Try a different search term' : 'Start adding movies to your library!'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl font-medium transition-colors"
                                >
                                    Discover Movies
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {filteredMovies.map((movie) => (
                                <div key={movie._id} className="relative group">
                                    <MovieCard
                                        movie={mapToMovie(movie)}
                                        onTrailerClick={(id) => navigate(`/trailer/${id}`)}
                                        onDetailsClick={(id) => {
                                            // Ideally open modal, but for now navigate to trailer or do nothing
                                            // We can reuse MovieDetailModal if we lift state up or add it here
                                            // For simplicity in Library, let's just go to trailer or show toast
                                            navigate(`/trailer/${id}`);
                                        }}
                                        onWatchlistClick={() => {
                                            if (activeTab === 'favorites') {
                                                handleRemove(movie.movieId); // Pass TMDB ID for favorites
                                            } else {
                                                handleRemove(movie._id); // Pass DB ID for others
                                            }
                                        }}
                                        actionIcon={Trash2}
                                        actionLabel="Remove from Library"
                                        actionColor="text-red-500"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <Chatbot isOpen={isChatOpen} onToggle={setIsChatOpen} />
            </div>
        </div>
    );
}
