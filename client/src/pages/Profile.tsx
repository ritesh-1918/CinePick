import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileTabs from '@/components/profile/ProfileTabs';
import OverviewTab from '@/components/profile/OverviewTab';
import WatchlistTab from '@/components/profile/WatchlistTab';
import HistoryTab from '@/components/profile/HistoryTab';
import ReviewsTab from '@/components/profile/ReviewsTab';
import PreferencesTab from '@/components/profile/PreferencesTab';
import SettingsTab from '@/components/profile/SettingsTab';
import { Loader2, LayoutDashboard, Compass, Library, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

interface ProfileData {
    _id: string;
    displayName: string;
    profileImage: string;
    memberSince: string;
    stats: {
        totalWatched: number;
        totalReviews: number;
        watchlistCount: number;
    };
    preferences: any;
    privacySettings: any;
    notifications: any;
}

export default function Profile() {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [open, setOpen] = useState(false);

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
                const res = await fetch(`/api/profile/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    setProfileData(data.data.user);
                    // Update auth context if profile image changed
                    if (data.data.user.profileImage && data.data.user.profileImage !== user.profileImage) {
                        updateUser({ profileImage: data.data.user.profileImage });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, updateUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

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
                <div className="max-w-5xl mx-auto w-full">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20">
                                <img
                                    src={profileData?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                <span className="text-xs font-medium">Change</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Validate file size (max 5MB)
                                        if (file.size > 5 * 1024 * 1024) {
                                            toast.error('Image must be less than 5MB');
                                            return;
                                        }

                                        const formData = new FormData();
                                        formData.append('avatar', file);

                                        const toastId = toast.loading('Uploading profile picture...');

                                        try {
                                            const res = await fetch('/api/profile/avatar', {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                },
                                                body: formData
                                            });
                                            const data = await res.json();

                                            if (data.success && profileData) {
                                                const newImageUrl = data.fileUrl;
                                                // Update local profile data
                                                setProfileData({ ...profileData, profileImage: newImageUrl });
                                                // Update auth context - THIS IS KEY!
                                                updateUser({ profileImage: newImageUrl });
                                                toast.success('Profile picture updated!', { id: toastId });
                                            } else {
                                                toast.error(data.message || 'Failed to upload image', { id: toastId });
                                            }
                                        } catch (error: any) {
                                            console.error('Upload failed:', error);
                                            toast.error('Upload failed. Please try again.', { id: toastId });
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-1">{profileData?.displayName || user?.name}</h1>
                            <p className="text-muted-foreground text-sm mb-4">Member since {new Date(profileData?.memberSince || Date.now()).getFullYear()}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                                <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                    <span className="font-bold text-primary">{profileData?.stats?.totalWatched || 0}</span> Movies Watched
                                </div>
                                <div className="px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                                    <span className="font-bold text-secondary">{profileData?.stats?.watchlistCount || 0}</span> in Watchlist
                                </div>
                                <div className="px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                                    <span className="font-bold text-accent">{profileData?.stats?.totalReviews || 0}</span> Reviews
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Content Area */}
                    <div className="mt-6 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && <OverviewTab profileData={profileData} />}
                                {activeTab === 'watchlists' && user && <WatchlistTab userId={user.id} />}
                                {activeTab === 'history' && user && <HistoryTab userId={user.id} />}
                                {activeTab === 'reviews' && user && <ReviewsTab userId={user.id} />}
                                {activeTab === 'preferences' && <PreferencesTab profileData={profileData} />}
                                {activeTab === 'settings' && <SettingsTab profileData={profileData} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
