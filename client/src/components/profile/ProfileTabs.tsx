import React from 'react';
import { LayoutDashboard, ListVideo, History, Star, Settings, Sliders } from 'lucide-react';

const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'watchlists', label: 'Watchlists', icon: ListVideo },
    { id: 'history', label: 'History', icon: History },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Settings },
];

interface ProfileTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
    return (
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 border-b border-white/10 no-scrollbar">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap cursor-pointer
                            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg'}
                        `}
                    >
                        <Icon size={16} />
                        {tab.label}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
