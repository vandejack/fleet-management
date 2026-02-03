import React from 'react';
import { User, Bell, Shield, Palette, Play, Pause, FastForward, Globe, LogOut } from 'lucide-react';
import { useFleet } from '@/context/FleetContext';
import { signOut } from 'next-auth/react';

export default function SettingsPanel() {
    const { settings, updateSettings } = useFleet();

    const handleToggleSimulation = () => {
        updateSettings({
            ...settings,
            simulation: {
                ...settings.simulation,
                autoPlay: !settings.simulation.autoPlay
            }
        });
    };

    const handleSpeedChange = (speed: number) => {
        updateSettings({
            ...settings,
            simulation: {
                ...settings.simulation,
                speed: speed
            }
        });
    };

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
            {/* Simulation Control Section */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Simulation System</h3>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] ${settings.simulation.autoPlay ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {settings.simulation.autoPlay ? 'Active' : 'Paused'}
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleToggleSimulation}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${settings.simulation.autoPlay
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                            }`}
                    >
                        {settings.simulation.autoPlay ? <Pause size={16} /> : <Play size={16} />}
                        <span className="text-sm font-medium">{settings.simulation.autoPlay ? 'Stop Simulation' : 'Start Simulation'}</span>
                    </button>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] text-gray-400 px-1">
                            <span>Playback Speed</span>
                            <span className="text-white font-mono">{settings.simulation.speed}x</span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 5, 10].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border transition-all ${settings.simulation.speed === speed
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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
                <button className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all group">
                    <Palette size={18} className="text-purple-400" />
                    <span className="text-sm">UI Theme Config</span>
                    <div className="ml-auto opacity-40 group-hover:translate-x-1 transition-transform">→</div>
                </button>
            </div>

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
