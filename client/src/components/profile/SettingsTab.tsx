import React, { useState } from 'react';
import { Save, Shield, Bell, UserX, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SettingsTabProps {
    profileData: any; // Ideally replace with proper ProfileData type
}

export default function SettingsTab({ profileData }: SettingsTabProps) {
    const [displayName, setDisplayName] = useState(profileData?.displayName || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(profileData?.profileImage || '');
    const [privacy, setPrivacy] = useState(profileData?.privacySettings || {});
    const [notifications, setNotifications] = useState(profileData?.notifications || {});
    const [saving, setSaving] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upload avatar if changed
            if (avatarFile) {
                const form = new FormData();
                form.append('avatar', avatarFile);
                await fetch(`http://localhost:5000/api/profile/avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: form,
                });
            }
            // Update other profile fields
            const res = await fetch(`http://localhost:5000/api/profile/${profileData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    displayName,
                    privacySettings: privacy,
                    notifications: notifications,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Settings updated successfully');
            } else {
                toast.error(data.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Settings update error:', error);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Avatar Upload */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10 mb-6 flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={80} className="text-primary mx-auto my-2" />
                    )}
                </div>
                <label className="flex flex-col">
                    <span className="text-sm font-medium mb-1">Change Avatar</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                </label>
            </div>
            {/* Personal Info */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    Personal Details
                </h3>
                <div className="flex flex-col gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm font-medium mb-1">Display Name</span>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-black/20 border border-white/10 rounded-md px-3 py-1 text-sm text-white" />
                    </label>
                </div>
            </div>
            {/* Privacy Settings */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Shield className="text-primary" size={20} />
                    Privacy Settings
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <h4 className="font-medium">Profile Visibility</h4>
                            <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                        </div>
                        <select className="bg-black/20 border border-white/10 rounded-md px-3 py-1 text-sm" value={privacy.profileVisibility || 'public'} onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}>
                            <option value="public">Public</option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <h4 className="font-medium">Show Watch History</h4>
                            <p className="text-sm text-muted-foreground">Allow others to see what you've watched</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={privacy.showWatchHistory ?? true} onChange={(e) => setPrivacy({ ...privacy, showWatchHistory: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                    </div>
                </div>
            </div>
            {/* Notification Settings */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Bell className="text-secondary" size={20} />
                    Notifications
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <h4 className="font-medium">New Releases</h4>
                            <p className="text-sm text-muted-foreground">Get notified about new movies in your favorite genres</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notifications.newReleases ?? true} onChange={(e) => setNotifications({ ...notifications, newReleases: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <h4 className="font-medium">Weekly Digest</h4>
                            <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notifications.weeklyDigest ?? false} onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                    </div>
                </div>
            </div>
            {/* Danger Zone */}
            <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/20">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-red-500">
                    <UserX size={20} />
                    Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-red-200">Delete Account</h4>
                        <p className="text-sm text-red-200/60">Permanently delete your account and all data</p>
                    </div>
                    <button onClick={async () => {
                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            try {
                                const res = await fetch(`http://localhost:5000/api/profile/${profileData._id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                });
                                const data = await res.json();
                                if (data.success) {
                                    localStorage.removeItem('token');
                                    window.location.href = '/';
                                } else {
                                    toast.error(data.message || 'Failed to delete account');
                                }
                            } catch (error) {
                                console.error('Delete error:', error);
                                toast.error('Failed to delete account');
                            }
                        }
                    }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Delete Account
                    </button>
                </div>
            </div>
            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50">
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
