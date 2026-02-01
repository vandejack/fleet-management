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

  return (
    <DashboardLayout>
      <div className="h-full w-full">
        <Map
          vehicles={[replayVehicle]}
          route={currentRoute}
          center={[currentPoint.lat, currentPoint.lng]}
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
              onClick={() => {
                if (currentIndex >= currentRoute.length - 1) {
                  setCurrentIndex(0);
                }
                setIsPlaying(!isPlaying);
              }}
              disabled={currentRoute.length < 2}
              className={`p-2 text-white rounded-full transition-colors ${currentRoute.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={reset}
              className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <RotateCcw size={20} />
            </button>

            <span className="text-xs text-slate-500">
              {currentRoute.length} points
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400">Speed:</span>
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${speed === s ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
              max={Math.max(0, currentRoute.length - 1)}
              value={currentIndex}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{startDate ? new Date(startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Start'}</span>
              <span>{endDate ? new Date(endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'End'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
