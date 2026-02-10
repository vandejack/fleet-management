import React from 'react';
import { User, Bell, Shield, Palette, Globe, LogOut } from 'lucide-react';
import { useFleet } from '@/context/FleetContext';
import { signOut } from 'next-auth/react';
import ThemeSwitcher from '../ThemeSwitcher';

export default function SettingsPanel() {
    const { settings, updateSettings } = useFleet();

    const handleUnitChange = (units: 'metric' | 'imperial') => {
        updateSettings({
            ...settings,
            display: {
                ...settings.display,
                units
            }
        });
    };

    return (
        <div className="space-y-6">

            {/* Display Preferences */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Display Units</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleUnitChange('metric')}
                        className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${settings.display.units === 'metric'
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                    >
                        <Globe size={18} />
                        <span className="text-xs font-medium">Metric (km)</span>
                    </button>
                    <button
                        onClick={() => handleUnitChange('imperial')}
                        className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${settings.display.units === 'imperial'
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                    >
                        <Globe size={18} />
                        <span className="text-xs font-medium">Imperial (mi)</span>
                    </button>
                </div>
            </div>

            {/* Action Section */}
            <div className="space-y-2 pt-2">
                <button className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all group">
                    <User size={18} className="text-blue-400" />
                    <span className="text-sm">Account Settings</span>
                    <div className="ml-auto opacity-40 group-hover:translate-x-1 transition-transform">→</div>
                </button>
                <div onClick={() => console.log('Theme Config clicked')} className="cursor-pointer">
                    {/* Placeholder for future or direct integration if needed */}
                </div>
            </div>

            {/* Theme Switcher for Admins */}
            <ThemeSwitcher />

            <div className="pt-4 mt-2">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-500 font-bold text-sm transition-all"
                >
                    <LogOut size={18} />
                    Log Out Assistant
                </button>
            </div>
        </div>
    );
}
