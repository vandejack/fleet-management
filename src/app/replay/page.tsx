'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import Map from '@/components/Map';
import { MOCK_ROUTE, Vehicle } from '@/utils/mockData';
import { useFleet } from '@/context/FleetContext';
import { Play, Pause, RotateCcw, Calendar, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ReplayPage() {
  const { vehicles } = useFleet();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Initialize selected vehicle
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Set default dates
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    setEndDate(end.toISOString().slice(0, 16));
    setStartDate(start.toISOString().slice(0, 16));
  }, []);

  // Mock vehicle for replay
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicleId);
  
  const replayVehicle: Vehicle = {
    id: selectedVehicleId || 'replay-v1',
    name: selectedVehicleData?.name || 'Replay Vehicle',
    plate: selectedVehicleData?.plate || 'RE-PLAY-01',
    status: isPlaying ? 'moving' : 'idle',
    currentLocation: MOCK_ROUTE[currentIndex],
    fuelLevel: selectedVehicleData?.fuelLevel || 80,
    speed: 60,
    driver: selectedVehicleData?.driver,
    lastMaintenance: selectedVehicleData?.lastMaintenance || '2024-01-01',
    model: selectedVehicleData?.model,
    year: selectedVehicleData?.year
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= MOCK_ROUTE.length - 1) {
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
  }, [isPlaying, speed]);

  // Calculate current replay time based on filter range
  const currentReplayTime = (() => {
    if (!startDate || !endDate) return new Date(MOCK_ROUTE[currentIndex].timestamp);
    
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const duration = end - start;
    const progress = currentIndex / (MOCK_ROUTE.length - 1);
    
    return new Date(start + (duration * progress));
  })();

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <DashboardLayout>
      <div className="h-full w-full">
        <Map 
          vehicles={[replayVehicle]} 
          route={MOCK_ROUTE}
          center={[MOCK_ROUTE[currentIndex].lat, MOCK_ROUTE[currentIndex].lng]} 
        />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 pointer-events-none">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg pointer-events-auto border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Route Replay</h2>
              <select 
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  reset();
                }}
                className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-transparent border-none p-0 cursor-pointer focus:ring-0 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plate} - {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <input 
                  type="datetime-local" 
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    reset();
                  }}
                  className="text-xs p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="datetime-local" 
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    reset();
                  }}
                  className="text-xs p-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={reset}
              className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <RotateCcw size={20} />
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400">Speed:</span>
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      speed === s ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
            <input
              type="range"
              min={0}
              max={MOCK_ROUTE.length - 1}
              value={currentIndex}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{startDate ? new Date(startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Start'}</span>
              <span>{endDate ? new Date(endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'End'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
