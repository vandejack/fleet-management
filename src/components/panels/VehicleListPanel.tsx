'use client';

import React from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';

export default function VehicleListPanel() {
    const { vehicles, settings } = useFleet();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'moving': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
            case 'idle': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
            case 'stopped': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
            default: return 'bg-gray-500';
        }
    };

    // Modern Compact Theme
    if (settings.themeMode === 'modern') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet Overview</p>
                    <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-slate-300">{vehicles.length}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                    {vehicles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm italic">
                            No vehicles found
                        </div>
                    ) : (
                        vehicles.map((v) => (
                            <div key={v.id} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-2.5 hover:bg-slate-700/40 transition-all cursor-pointer group flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(v.status)}`} />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-slate-200 text-[13px] font-semibold truncate tracking-tight">{v.plate}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-slate-400 bg-black/20 px-1.5 rounded">{Math.round(v.speed)} km/h</span>
                                            <span className={`text-[10px] ${v.fuelLevel < 20 ? 'text-red-400' : 'text-slate-500'}`}>{Math.round(v.fuelLevel)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-slate-500 text-[11px] truncate flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            {v.name}
                                        </p>
                                        <p className="text-[10px] text-slate-600 truncate max-w-[80px]">
                                            {v.driver?.name || 'No Driver'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Link
                    href="/vehicles"
                    className="block w-full py-2 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 hover:from-cyan-600/20 hover:to-blue-600/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg text-center text-xs text-cyan-400 font-medium transition-all"
                >
                    Full Fleet Management
                </Link>
            </div>
        );
    }

    // Classic Theme
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-400">Total: {vehicles.length} Vehicles</p>
                <div className="flex gap-2">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">By Status</button>
                    <button className="text-xs text-gray-400 hover:text-white transition-colors">By Name</button>
                </div>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                {vehicles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm italic">
                        No vehicles found
                    </div>
                ) : (
                    vehicles.map((v) => (
                        <div key={v.id} className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer group flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(v.status)}`} />
                            <div className="flex-1">
                                <p className="text-white text-[13px] font-medium truncate">{v.plate} - {v.name}</p>
                                <p className="text-gray-500 text-[11px] truncate">
                                    {v.driver?.name || 'No Driver Assigned'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white text-[12px] font-mono">{Math.round(v.speed)} km/h</p>
                                <p className="text-[10px] text-gray-500">{Math.round(v.fuelLevel)}% Fuel</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Link
                href="/vehicles"
                className="block w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-xs text-white font-medium transition-all"
            >
                Open Fleet Management
            </Link>
        </div>
    );
}
