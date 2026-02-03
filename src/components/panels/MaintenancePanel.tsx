'use client';

import React from 'react';
import { useFleet } from '@/context/FleetContext';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function MaintenancePanel() {
    const { maintenance, vehicles } = useFleet();

    const getVehicleName = (id: string) => {
        return vehicles.find(v => v.id === id)?.name || 'Unknown Vehicle';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-400">Total: {maintenance.length} Records</p>
                <div className="flex gap-2">
                    <button className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Pending</button>
                    <button className="text-xs text-gray-400 hover:text-white transition-colors">History</button>
                </div>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                {maintenance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm italic">
                        No maintenance records found
                    </div>
                ) : (
                    maintenance.map((m) => (
                        <div key={m.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${m.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                        m.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        <Wrench size={14} />
                                    </div>
                                    <h4 className="text-white text-sm font-bold">{m.type}</h4>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${m.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {m.status}
                                </span>
                            </div>

                            <p className="text-blue-400 text-xs font-medium mb-3">{getVehicleName(m.vehicleId)}</p>

                            <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 bg-black/20 p-2 rounded-lg mb-3">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span>{new Date(m.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white font-mono">
                                    <span>Rp {m.cost.toLocaleString()}</span>
                                </div>
                            </div>

                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                                {m.description}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-center text-xs text-blue-400 font-medium transition-all">
                Add Maintenance Record
            </button>
        </div>
    );
}
