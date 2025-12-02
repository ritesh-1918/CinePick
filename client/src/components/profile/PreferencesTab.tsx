import React, { useState } from 'react';
import Select from 'react-select';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GENRES = [
    { value: 'Action', label: 'Action' },
    { value: 'Comedy', label: 'Comedy' },
    { value: 'Drama', label: 'Drama' },
    { value: 'Sci-Fi', label: 'Sci-Fi' },
    { value: 'Horror', label: 'Horror' },
    { value: 'Romance', label: 'Romance' },
    { value: 'Thriller', label: 'Thriller' },
];

const MOODS = ['Happy', 'Sad', 'Excited', 'Relaxed', 'Adventurous', 'Romantic', 'Thrilling', 'Nostalgic'];

const customStyles = {
    control: (base: any) => ({
        ...base,
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
    }),
    menu: (base: any) => ({
        ...base,
        background: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    }),
    option: (base: any, state: any) => ({
        ...base,
        background: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        color: 'white',
    }),
    multiValue: (base: any) => ({
        ...base,
        background: 'rgba(229, 9, 20, 0.2)',
        border: '1px solid rgba(229, 9, 20, 0.3)',
    }),
    multiValueLabel: (base: any) => ({
        ...base,
        color: 'white',
    }),
    multiValueRemove: (base: any) => ({
        ...base,
        color: 'white',
        ':hover': {
            background: 'rgba(229, 9, 20, 0.5)',
            color: 'white',
        },
    }),
};

interface PreferencesTabProps {
    profileData: any;
}

export default function PreferencesTab({ profileData }: PreferencesTabProps) {
    const [preferences, setPreferences] = useState(profileData?.preferences || {});
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/profile/${profileData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ preferences })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Preferences saved successfully');
            } else {
                toast.error(data.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Mood Matrix */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-6">Mood & Genre Mapping</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Tell us what you like to watch when you're in a specific mood.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOODS.map(mood => (
                        <div key={mood} className="space-y-2">
                            <label className="text-sm font-medium">{mood}</label>
                            <Select
                                isMulti
                                options={GENRES}
                                styles={customStyles}
                                placeholder={`Select genres for ${mood} mood...`}
                                onChange={(selected) => {
                                    const newMapping = preferences.moodGenreMapping || [];
                                    const moodIndex = newMapping.findIndex((m: any) => m.mood === mood);
                                    const genres = selected.map(opt => opt.value);

                                    if (moodIndex >= 0) {
                                        newMapping[moodIndex].preferredGenres = genres;
                                    } else {
                                        newMapping.push({ mood, preferredGenres: genres });
                                    }

                                    setPreferences({ ...preferences, moodGenreMapping: newMapping });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Preferences */}
            <div className="bg-card/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold mb-6">Content Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preferred Languages</label>
                        <Select
                            isMulti
                            options={[
                                { value: 'English', label: 'English' },
                                { value: 'Spanish', label: 'Spanish' },
                                { value: 'French', label: 'French' },
                                { value: 'Korean', label: 'Korean' },
                                { value: 'Japanese', label: 'Japanese' },
                            ]}
                            styles={customStyles}
                            onChange={(selected) => setPreferences({ ...preferences, languages: selected.map(opt => opt.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content Rating</label>
                        <Select
                            isMulti
                            options={[
                                { value: 'G', label: 'G - General Audiences' },
                                { value: 'PG', label: 'PG - Parental Guidance' },
                                { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
                                { value: 'R', label: 'R - Restricted' },
                            ]}
                            styles={customStyles}
                            onChange={(selected) => setPreferences({ ...preferences, contentRating: selected.map(opt => opt.value) })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preferred Movie Length</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary"
                            value={preferences.movieLength || ''}
                            onChange={(e) => setPreferences({ ...preferences, movieLength: e.target.value })}
                        >
                            <option value="">Any Length</option>
                            <option value="short">Short (&lt; 90 mins)</option>
                            <option value="medium">Medium (90 - 120 mins)</option>
                            <option value="long">Long (&gt; 120 mins)</option>
                        </select>
                    </div>
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
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}
