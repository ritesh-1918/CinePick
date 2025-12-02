import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, LayoutDashboard, Compass, Library, User, LogOut, Save, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';

interface ProfileData {
    _id: string;
    displayName: string;
    profileImage: string;
    memberSince: string;
    preferences: {
        favoriteGenres: string[];
    };
}

const GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
    "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
    "Science Fiction", "TV Movie", "Thriller", "War", "Western"
];

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(true);

    // Form State
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Discovery",
            href: "/discovery",
            icon: <Compass className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Library",
            href: "/library",
            icon: <Library className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Profile",
            href: "/profile",
            icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${apiUrl}/api/profile/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    const userData = data.data.user;
                    setProfileData(userData);
                    setDisplayName(userData.displayName || userData.name);
                    setSelectedGenres(data.data.preferences?.favoriteGenres || []);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    const handleGenreToggle = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/profile/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    displayName,
                    preferences: { favoriteGenres: selectedGenres }
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

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
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "Logout",
                                href: "#",
                                icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                            }}
                            onClick={handleLogout}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            <div className="flex-1 flex flex-col overflow-y-auto bg-background text-white p-4 md:p-8">
                <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Identity */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
                                <ProfilePictureUpload
                                    currentImage={
                                        (profileData?.profileImage && !profileData.profileImage.includes('localhost'))
                                            ? profileData.profileImage
                                            : `https://ui-avatars.com/api/?name=${user?.name}&background=random`
                                    }
                                    onImageUpdate={(newUrl) => setProfileData(prev => prev ? { ...prev, profileImage: newUrl } : null)}
                                />
                                <h2 className="text-xl font-bold mt-4">{displayName}</h2>
                                <p className="text-muted-foreground text-sm">@{user?.name.replace(/\s+/g, '').toLowerCase()}</p>

                                <div className="mt-6 space-y-3 text-left">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {new Date(profileData?.memberSince || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Edit Form */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Enter your display name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-muted-foreground">Favorite Genres</label>
                                            <button
                                                onClick={() => navigate('/survey')}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Retake Survey
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRES.map(genre => (
                                                <button
                                                    key={genre}
                                                    onClick={() => handleGenreToggle(genre)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-sm border transition-all",
                                                        selectedGenres.includes(genre)
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30"
                                                    )}
                                                >
                                                    {genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
