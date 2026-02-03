'use client';

import React from 'react';
import { useFleet } from '@/context/FleetContext';
import { Calendar as CalendarIcon, Clock, Bell, Plus, ShieldCheck } from 'lucide-react';

export default function SchedulePanel() {
    const { maintenance, vehicles } = useFleet();

    const getVehicleName = (id: string) => {
        return vehicles.find(v => v.id === id)?.name || 'General';
    };

    // Filter for scheduled maintenance as a proxy for "scheduled"
    const scheduledTasks = maintenance.filter(m => m.status === 'scheduled');

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <h3 className="text-white font-bold text-sm">Today's Schedule</h3>
                    <p className="text-gray-400 text-[11px]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                    <CalendarIcon size={20} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Upcoming Tasks</h3>
                    <button className="text-[10px] text-blue-400 flex items-center gap-1 hover:underline">
                        <Plus size={10} />
                        CREATE NEW
                    </button>
                </div>

                <div className="space-y-3">
                    {scheduledTasks.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-white/5 rounded-xl bg-white/2">
                            <Clock className="mx-auto mb-2 text-gray-600" size={24} />
                            <p className="text-gray-500 text-xs italic">No tasks scheduled for today.</p>
                        </div>
                    ) : (
                        scheduledTasks.map((task) => (
                            <div key={task.id} className="bg-white/5 border border-white/5 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white text-[13px] font-bold">{task.type}</h4>
                                    <span className="text-[10px] text-yellow-500 flex items-center gap-1 font-mono uppercase">
                                        <Bell size={10} />
                                        Reminder Set
                                    </span>
                                </div>
                                <p className="text-blue-400 text-[11px] mb-3 font-medium">{getVehicleName(task.vehicleId)}</p>

                                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} />
                                        <span>09:00 AM</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck size={12} />
                                        <span>Inspection Dept</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-1">Service Alerts</h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        <Bell size={16} />
                    </div>
                    <div>
                        <p className="text-white text-[11px] font-bold">2 Vehicles Overdue</p>
                        <p className="text-red-400/80 text-[10px]">Routine service for B 1234 XY is 3 days late.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
