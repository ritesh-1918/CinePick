import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Chatbot from '@/components/Chatbot';
import { TrendingUp, Star, Calendar, Film, Bookmark, LayoutDashboard, Compass, Library as LibraryBig, UserCog, LogOut } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import tmdbApi from '@/services/tmdb';

interface Movie {
    id: number;
    title: string;
    year: string;
    rating: string;
    poster: string | null;
    overview: string;
}

export default function Discovery() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const [trendingData, popularData, nowPlayingData] = await Promise.all([
                tmdbApi.getTrending(),
                tmdbApi.getPopular(),
                tmdbApi.getNowPlaying()
            ]);

            if (trendingData && trendingData.results) setTrending(trendingData.results);
            if (popularData && popularData.results) setPopular(popularData.results);
            if (nowPlayingData && nowPlayingData.results) setNowPlaying(nowPlayingData.results);

        } catch (error) {
            console.error('Failed to fetch movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMovie = async (movie: Movie) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/movies/saved', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    movieId: movie.id.toString(),
                    title: movie.title,
                    year: movie.year,
                    poster: movie.poster
                })
            });
            alert('Movie saved to your library!');
        } catch (error) {
            console.error('Failed to save movie:', error);
        }
    };

    const MovieCard = ({ movie }: { movie: Movie }) => (
        <div className="group cursor-pointer">
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-3 relative overflow-hidden border border-white/10">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film className="text-gray-600" size={48} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-xs text-gray-300 line-clamp-3 mb-3">{movie.overview}</p>
                        <button
                            onClick={() => handleSaveMovie(movie)}
                            className="w-full py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Bookmark size={16} />
                            Save to Library
                        </button>
                    </div>
                </div>
            </div>
            <h3 className="font-medium text-white mb-1 line-clamp-1">{movie.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{movie.year}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span>{movie.rating}</span>
                </div>
            </div>
        </div>
    );

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
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-2">Browse Movies</h1>
                        <p className="text-muted-foreground">Explore thousands of movies powered by TMDB</p>
                    </div>

                    {/* Trending Section */}
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="text-primary" size={24} />
                            <h2 className="text-2xl font-bold">Trending This Week</h2>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                {trending.slice(0, 8).map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Popular Section */}
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Star className="text-primary" size={24} />
                            <h2 className="text-2xl font-bold">Most Popular</h2>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                {popular.slice(0, 8).map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* New Releases */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="text-primary" size={24} />
                            <h2 className="text-2xl font-bold">Now Playing</h2>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                {nowPlaying.slice(0, 8).map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                <Chatbot />
            </div>
        </div>
    );
}
