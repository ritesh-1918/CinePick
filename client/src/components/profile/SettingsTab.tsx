import React, { useState } from 'react';
import { Save, Shield, Bell, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SettingsTabProps {
    profileData: any; // Using any for now to match usage, ideally should use the ProfileData interface
}

export default function SettingsTab({ profileData }: SettingsTabProps) {
    const [privacy, setPrivacy] = useState(profileData?.privacySettings || {});
    const [notifications, setNotifications] = useState(profileData?.notifications || {});
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5000/api/profile/${profileData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    privacySettings: privacy,
                    notifications: notifications
                })
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
                        <select
                            className="bg-black/20 border border-white/10 rounded-md px-3 py-1 text-sm"
                            value={privacy.profileVisibility || 'public'}
                            onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                        >
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
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={privacy.showWatchHistory ?? true}
                                onChange={(e) => setPrivacy({ ...privacy, showWatchHistory: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notifications.newReleases ?? true}
                                onChange={(e) => setNotifications({ ...notifications, newReleases: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                            <h4 className="font-medium">Weekly Digest</h4>
                            <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notifications.weeklyDigest ?? false}
                                onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                try {
                                    const res = await fetch(`http://localhost:5000/api/profile/${profileData._id}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        }
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
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
