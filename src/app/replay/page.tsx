'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import Map from '@/components/Map';
import { Vehicle } from '@/utils/mockData';
import { useFleet } from '@/context/FleetContext';
import { Play, Pause, RotateCcw, Calendar, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVehicleHistory } from '@/lib/actions';

export default function ReplayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ReplayContent />
    </Suspense>
  );
}

function ReplayContent() {
  const params = useSearchParams();
  const vehicleIdParam = params.get('vehicleId');
  const { vehicles } = useFleet();

  const [route, setRoute] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicleIdParam || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Initialize selected vehicle if not set by param
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Set default dates
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const toLocalISO = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };
    setEndDate(toLocalISO(end));
    setStartDate(toLocalISO(start));
  }, []);

  // Fetch History
  useEffect(() => {
    if (selectedVehicleId && startDate && endDate) {
      setIsPlaying(false);
      setCurrentIndex(0);

      getVehicleHistory(selectedVehicleId, startDate, endDate).then(res => {
        if (res.success && res.route && res.route.length > 0) {
          setRoute(res.route);
        } else {
          setRoute([]);
        }
      });
    }
  }, [selectedVehicleId, startDate, endDate]);

  const currentRoute = route.length > 0 ? route : [];
  const currentPoint = currentRoute[currentIndex] || { lat: -6.2, lng: 106.8, timestamp: new Date().toISOString() };

  // Replay vehicle wrapper
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicleId);

  const replayVehicle: Vehicle = {
    id: selectedVehicleId || 'replay-v1',
    name: selectedVehicleData?.name || 'Replay Vehicle',
    plate: selectedVehicleData?.plate || 'RE-PLAY-01',
    status: isPlaying ? 'moving' : 'idle',
    currentLocation: { lat: currentPoint.lat, lng: currentPoint.lng, timestamp: currentPoint.timestamp },
    fuelLevel: selectedVehicleData?.fuelLevel || 80,
    speed: currentPoint.speed || 0,
    driver: selectedVehicleData?.driver,
    lastMaintenance: selectedVehicleData?.lastMaintenance,
    model: selectedVehicleData?.model,
    year: selectedVehicleData?.year
  };

  useEffect(() => {
    if (isPlaying && currentRoute.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= currentRoute.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, currentRoute.length]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="h-full w-full">
        <Map
          vehicles={[replayVehicle]}
          route={currentRoute}
          center={[currentPoint.lat, currentPoint.lng]}
        />
      </div>

      <div className="absolute bottom-0 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 z-[1000] w-full md:max-w-2xl md:px-4 pointer-events-none">
        <div className="bg-white dark:bg-slate-900 md:dark:bg-slate-800 p-4 rounded-t-2xl md:rounded-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-lg pointer-events-auto border-t md:border border-slate-200 dark:border-slate-700">

          {/* Header & Toggle for Mobile */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"
              >
                {isConfigOpen ? <ChevronDown size={18} /> : <Filter size={18} />}
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Route Replay</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">Select vehicle and date range</p>
              </div>
            </div>

            {/* Desktop: Inline Inputs */}
            <div className="hidden md:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                {/* ... existing desktop inputs code if needed, but we can reuse the mobile one responsively ... */}
              </div>
            </div>

            {/* Mobile: Current Vehicle Display */}
            <div className="md:hidden text-right">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedVehicleData?.plate || 'Select Vehicle'}</p>
              <p className="text-[10px] text-slate-500">{currentRoute.length} points</p>
            </div>
          </div>

          {/* Collapsible Configuration Section */}
          <div className={`${isConfigOpen ? 'block' : 'hidden'} md:block mb-4 space-y-3`}>

            {/* Vehicle Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  reset();
                }}
                className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); reset(); }}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); reset(); }}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                if (currentIndex >= currentRoute.length - 1) setCurrentIndex(0);
                setIsPlaying(!isPlaying);
              }}
              disabled={currentRoute.length < 2}
              className={`p-3 md:p-2 text-white rounded-full transition-colors flex-shrink-0 ${currentRoute.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={reset}
              className="p-3 md:p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
            >
              <RotateCcw size={20} />
            </button>

            {/* Playback Stats */}
            <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800 flex-1 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-400 block max-w-[60px] md:max-w-none truncate">Speed</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{speed}x</span>
              </div>
              <div className="flex bg-gray-200 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
                {[1, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${speed === s ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="w-full">
            <input
              type="range"
              min={0}
              max={Math.max(0, currentRoute.length - 1)}
              value={currentIndex}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
              <span>{currentPoint.timestamp ? new Date(currentPoint.timestamp).toLocaleTimeString() : '--:--'}</span>
              <span>{Math.round((currentIndex / Math.max(1, currentRoute.length - 1)) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
