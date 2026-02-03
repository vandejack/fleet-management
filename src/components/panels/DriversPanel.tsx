'use client';

import React from 'react';
import { useFleet } from '@/context/FleetContext';
import { User, Phone, Star, ShieldCheck, MapPin } from 'lucide-react';

export default function DriversPanel() {
    const { drivers, vehicles } = useFleet();

    const getDriverVehicle = (driverId: string) => {
        return vehicles.find(v => v.driver?.id === driverId);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-400">Total: {drivers.length} Drivers</p>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">By Performance</button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                {drivers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm italic">
                        No drivers found
                    </div>
                ) : (
                    drivers.map((d) => {
                        const assignedVehicle = getDriverVehicle(d.id);
                        return (
                            <div key={d.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                                        {d.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-white text-sm font-bold">{d.name}</h4>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-xs font-bold">{d.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-[11px] mt-0.5">
                                            <Phone size={10} />
                                            <span>{d.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-2">
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${assignedVehicle ? 'bg-green-500' : 'bg-gray-500'}`} />
                                            <span className="text-white text-[11px] font-medium">{assignedVehicle ? 'On Duty' : 'Available'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Assigned To</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-blue-400 text-[11px] font-mono truncate">{assignedVehicle?.plate || 'None'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <button className="flex-1 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold hover:bg-blue-600/30 transition-all">
                                        CALL DRIVER
                                    </button>
                                    <button className="flex-1 py-1.5 bg-white/5 text-gray-400 border border-white/10 rounded-lg text-[10px] font-bold hover:bg-white/10 transition-all">
                                        TRACK TRIP
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-xs text-white font-medium transition-all">
                Manage Driver Directory
            </button>
        </div>
    );
}
