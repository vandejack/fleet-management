import React from 'react';
import Link from 'next/link';
import { useFleet } from '@/context/FleetContext';
import { Truck, Activity, Battery, Fuel } from 'lucide-react';

export default function AnalyticsPanel() {
    const { vehicles } = useFleet();

    if (vehicles.length === 0) {
        return <div className="text-gray-500 text-sm italic p-4">Loading analytics...</div>;
    }

    const activeVehicles = vehicles.filter(v => v.status === 'moving').length;
    const idleVehicles = vehicles.filter(v => v.status === 'idle').length;
    const avgFuel = Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / vehicles.length);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1 text-blue-400">
                        <Truck size={14} />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Total</span>
                    </div>
                    <p className="text-xl font-bold text-white">{vehicles.length}</p>
                    <p className="text-[10px] text-gray-500">Fleet Assets</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1 text-green-400">
                        <Activity size={14} />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Active</span>
                    </div>
                    <p className="text-xl font-bold text-white">{activeVehicles}</p>
                    <p className="text-[10px] text-gray-500">Moving Now</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1 text-yellow-500">
                        <Fuel size={14} />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Fuel Avg</span>
                    </div>
                    <p className="text-xl font-bold text-white">{avgFuel}%</p>
                    <p className="text-[10px] text-gray-500">Fleet Level</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1 text-orange-400">
                        <Activity size={14} />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Idle</span>
                    </div>
                    <p className="text-xl font-bold text-white">{idleVehicles}</p>
                    <p className="text-[10px] text-gray-500">Waiting/Idle</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Health Overview</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">Optimal</span>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">Operational Efficiency</span>
                            <span className="text-white">84%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '84%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">Maintenance Score</span>
                            <span className="text-white">92%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <Link
                href="/analytics"
                className="block w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-center text-xs text-blue-400 font-medium transition-all"
            >
                View Full Analytics Report
            </Link>
        </div>
    );
}
