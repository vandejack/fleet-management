'use client';

import React from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';

export default function VehicleListPanel() {
    const { vehicles } = useFleet();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'moving': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
            case 'idle': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
            case 'stopped': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
            default: return 'bg-gray-500';
        }
    };

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
