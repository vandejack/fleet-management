import React, { useState } from 'react';
import { Calendar, History, Clock, Truck, Play, Pause, AlertCircle } from 'lucide-react';
import { useFleet } from '@/context/FleetContext';
import { getVehicleHistory } from '@/lib/actions';

export default function HistoryPanel() {
    const { vehicles, startReplay, stopReplay, replayState } = useFleet();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    // Default to today 00:00 and now
    const [startTime, setStartTime] = useState<string>(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    });
    const [endTime, setEndTime] = useState<string>(() => {
        const now = new Date();
        return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetchHistory = async () => {
        if (!selectedVehicleId) return;

        setLoading(true);
        setError(null);
        try {
            // Pass start and end times - Convert local input time to UTC for server
            const result = await getVehicleHistory(
                selectedVehicleId,
                new Date(startTime).toISOString(),
                new Date(endTime).toISOString()
            );
            if (result.success) {
                setResults(result.route || []);
            } else {
                setError(result.error || 'Failed to fetch history');
            }
        } catch (err) {
            setError('An error occurred while fetching history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                        <Truck size={16} className="text-blue-400" />
                        Select Vehicle
                    </h3>
                    <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                    >
                        <option value="">Choose a vehicle...</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.plate} - {v.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-cyan-400" />
                        Time Range
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleFetchHistory}
                disabled={!selectedVehicleId || loading}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!selectedVehicleId || loading
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]'
                    }`}
            >
                {loading ? 'Fetching History...' : 'Fetch Location Data'}
            </button>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <div className="space-y-3 pt-2">
                <h3 className="text-white font-medium flex items-center justify-between px-1 text-sm">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-blue-400" />
                        Trip Summary
                    </div>
                    {results && <span className="text-[10px] text-gray-500 font-mono">{results.length} Points</span>}
                </h3>

                {results ? (
                    results.length === 0 ? (
                        <div className="text-center py-6 bg-white/5 border border-dashed border-white/10 rounded-xl text-gray-500 text-xs italic">
                            No history found for this period
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Duration</p>
                                    <p className="text-white font-bold text-sm">
                                        {results.length > 0
                                            ? `${Math.round((new Date(results[results.length - 1].timestamp).getTime() - new Date(results[0].timestamp).getTime()) / 60000)} mins`
                                            : '0 mins'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (replayState.isActive && replayState.isPlaying) {
                                            stopReplay();
                                        } else {
                                            startReplay(results, selectedVehicleId);
                                        }
                                    }}
                                    className={`p-2 rounded-lg text-white shadow-md transition-colors ${replayState.isActive && replayState.isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                                >
                                    {replayState.isActive && replayState.isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                                </button>
                            </div>

                            <div className="mb-4 space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-slate-900" />
                                    <p className="text-white text-xs font-semibold">Start Point</p>
                                    <p className="text-gray-500 text-[10px]">{new Date(results[0].timestamp).toLocaleTimeString()}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-900" />
                                    <p className="text-white text-xs font-semibold">End Point</p>
                                    <p className="text-gray-500 text-[10px]">{new Date(results[results.length - 1].timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-3">
                                <h4 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-mono">Detailed Log</h4>
                                <div className="h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {results.map((point, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-xs transition-colors border border-transparent hover:border-white/5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500 w-4 text-[10px] font-mono">{results.length - idx}</span>
                                                <div>
                                                    <p className="text-gray-200 font-mono">{new Date(point.timestamp).toLocaleTimeString()}</p>
                                                    <p className="text-[10px] text-gray-600">{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${point.speed > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {point.speed.toFixed(1)} <span className="text-[9px] font-normal">km/h</span>
                                                </p>
                                                <p className="text-[9px] text-gray-600">
                                                    {point.ignition ? 'IGN: ON' : 'IGN: OFF'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-center py-10 text-gray-500 text-xs italic border border-dashed border-white/5 rounded-xl">
                        Select a vehicle and click fetch to see trips
                    </div>
                )}
            </div>
        </div>
    );
}
