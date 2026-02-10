'use client';
import { Vehicle } from '@/utils/mockData';
import { X, User, Phone, Truck, Calendar, Wrench, Battery, Signal, Gauge, Clock, Thermometer, Power, AlertCircle, Eye, EyeOff, Cigarette, PhoneCall, UserMinus, Coffee } from 'lucide-react';
import { getVehicleBehaviorEvents } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { BehaviorEvent } from '@/utils/mockData';
import { useFleet } from '@/context/FleetContext'; // Added useFleet

interface VehicleDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleDetailPanel = ({ vehicle, onClose }: VehicleDetailPanelProps) => {
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BehaviorEvent | null>(null);

  useEffect(() => {
    if (vehicle) {
      const fetchEvents = async () => {
        setLoading(true);
        const result = await getVehicleBehaviorEvents(vehicle.id);
        if (result.success && result.events) {
          setBehaviorEvents(result.events);
        }
        setLoading(false);
      };
      fetchEvents();

      // Refresh events every 10 seconds while panel is open
      const interval = setInterval(fetchEvents, 10000);
      return () => clearInterval(interval);
    } else {
      setBehaviorEvents([]);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'DROWSINESS': return <EyeOff className="text-red-500" size={16} />;
      case 'DISTRACTION': return <Eye className="text-orange-500" size={16} />;
      case 'YAWNING': return <Coffee className="text-yellow-500" size={16} />;
      case 'PHONE_USAGE': return <PhoneCall className="text-red-500" size={16} />;
      case 'SMOKING': return <Cigarette className="text-orange-500" size={16} />;
      case 'DRIVER_ABSENCE': return <UserMinus className="text-red-600" size={16} />;
      default: return <AlertCircle className="text-blue-500" size={16} />;
    }
  };

  const getEventLabel = (type: string) => {
    return type.replace('_', ' ');
  };

  const { settings } = useFleet(); // Get settings for theme

  // Modern Theme (Bottom Sheet on Mobile, Slide from right on Desktop)
  if (settings.themeMode === 'modern') {
    return (
      <>
        {/* Backdrop for mobile */}
        {vehicle && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[4999] md:hidden"
            onClick={onClose}
          />
        )}

        <div className={`fixed inset-x-0 bottom-0 md:inset-x-auto md:right-4 md:top-4 md:bottom-auto md:h-[calc(100vh-32px)] md:w-96 
            transition-transform duration-300 ease-in-out print:hidden 
            bg-slate-900/95 backdrop-blur-xl md:rounded-2xl rounded-t-2xl shadow-2xl z-[5000] 
            overflow-y-auto border-t md:border border-white/10 
            pb-safe
            ${vehicle ? 'translate-y-0 md:translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-[120%]'}`}
          style={{ maxHeight: '85vh' }}
        >
          <div className="p-0">
            {/* Drag Handle for Mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 bg-slate-700/50 rounded-full" />
            </div>

            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {vehicle?.plate}
                  <span className={`w-2 h-2 rounded-full ${vehicle?.status === 'moving' ? 'bg-green-500 box-shadow-glow-green' : vehicle?.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                </h2>
                <p className="text-xs text-slate-400">{vehicle?.name}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400 mb-1">Speed</span>
                  <span className="text-lg font-bold text-white font-mono">{Math.round(vehicle?.speed || 0)}</span>
                  <span className="text-[10px] text-slate-500">km/h</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400 mb-1">Fuel</span>
                  <span className={`text-lg font-bold font-mono ${vehicle?.fuelLevel && vehicle.fuelLevel < 20 ? 'text-red-400' : 'text-white'}`}>
                    {Math.round(vehicle?.fuelLevel || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500">%</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-400 mb-1">Ignition</span>
                  <div className={`mt-1 w-8 h-4 rounded-full flex items-center px-1 ${vehicle?.ignition ? 'bg-green-500/20 justify-end' : 'bg-slate-700 justify-start'}`}>
                    <div className={`w-3 h-3 rounded-full ${vehicle?.ignition ? 'bg-green-500' : 'bg-slate-400'}`} />
                  </div>
                </div>
              </div>

              {/* Driver & Location */}
              <div className="bg-slate-800/30 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                      {vehicle?.driver?.name.charAt(0)}
                    </div>
                    <div className="text-sm text-slate-300">
                      {vehicle?.driver?.name || 'Unassigned'}
                    </div>
                  </div>
                  <a href={`tel:${vehicle?.driver?.phone}`} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors">
                    <Phone size={16} />
                  </a>
                </div>
                <div className="p-3 bg-black/20">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Last Update</p>
                  <p className="text-xs text-slate-300 font-mono">
                    {vehicle?.lastLocationTime ? new Date(vehicle.lastLocationTime).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Collapsible Sections or just list for now in modern view */}
              <div className="space-y-1">
                <details className="group bg-slate-800/30 rounded-xl border border-white/5 overflow-hidden">
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Gauge size={16} className="text-cyan-400" /> Telemetry Details
                    </span>
                    <span className="transform group-open:rotate-180 transition-transform text-slate-500">▼</span>
                  </summary>
                  <div className="p-3 pt-0 border-t border-white/5 bg-black/10 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-white/5 flex justify-between">
                      <span className="text-slate-500">Odometer</span>
                      <span className="text-slate-300 font-mono">{vehicle?.odometer?.toFixed(0)} km</span>
                    </div>
                    <div className="p-2 rounded bg-white/5 flex justify-between">
                      <span className="text-slate-500">Eng. Hours</span>
                      <span className="text-slate-300 font-mono">{vehicle?.engineHours?.toFixed(1)} h</span>
                    </div>
                    <div className="p-2 rounded bg-white/5 flex justify-between">
                      <span className="text-slate-500">Ext. Batt</span>
                      <span className="text-slate-300 font-mono">{(vehicle?.vehicleBattery || 0) / 1000} V</span>
                    </div>
                    <div className="p-2 rounded bg-white/5 flex justify-between">
                      <span className="text-slate-500">Int. Batt</span>
                      <span className="text-slate-300 font-mono">{(vehicle?.internalBattery || 0) / 1000} V</span>
                    </div>
                  </div>
                </details>

                <details className="group bg-slate-800/30 rounded-xl border border-white/5 overflow-hidden">
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <EyeOff size={16} className="text-orange-400" /> Fatigue Events
                    </span>
                    <span className="transform group-open:rotate-180 transition-transform text-slate-500">▼</span>
                  </summary>
                  <div className="max-h-48 overflow-y-auto p-0">
                    {loading && behaviorEvents.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs italic">Loading...</div>
                    ) : behaviorEvents.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {behaviorEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-3 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between"
                            onClick={() => event.evidenceUrl && setSelectedEvent(event)}
                          >
                            <div className="flex items-center gap-2">
                              {getEventIcon(event.type)}
                              <div>
                                <p className="text-xs text-slate-300 font-medium">{getEventLabel(event.type)}</p>
                                <p className="text-[10px] text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            {event.evidenceUrl && <div className="text-[9px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded">IMG</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-xs">No recent events</div>
                    )}
                  </div>
                </details>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 pb-32">
                <button
                  onClick={() => window.location.href = `/replay?vehicleId=${vehicle?.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
                >
                  View History
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3 text-sm font-medium border border-white/10 transition-all">
                  More Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Snapshot Modal Overlay (Reused) */}
        {selectedEvent && selectedEvent.evidenceUrl && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50 text-white">
                <div className="flex items-center gap-3">
                  {getEventIcon(selectedEvent.type)}
                  <div>
                    <h3 className="font-bold text-sm">Fatigue Snapshot</h3>
                    <p className="text-[10px] text-slate-400">
                      {getEventLabel(selectedEvent.type)} • {new Date(selectedEvent.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src={selectedEvent.evidenceUrl}
                  alt="Fatigue Evidence"
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 pointer-events-none border-[1px] border-red-500/30 m-4 flex flex-col justify-between p-4">
                  <div className="flex justify-between text-[10px] text-red-500 font-mono">
                    <span>MOVON DSM ACTIVE</span>
                    <span>{vehicle?.plate}</span>
                  </div>
                  <div className="text-[10px] text-red-500 font-mono self-end">
                    {selectedEvent ? new Date(selectedEvent.timestamp).toISOString() : ''}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-800/30 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Classic Theme (Original Return)
  return (
    <div className={`fixed right-4 top-4 h-[calc(100vh-32px)] w-96 transition-transform duration-300 ease-in-out print:hidden bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg z-[3000] overflow-y-auto border border-white/10 ${vehicle ? 'translate-x-0' : 'translate-x-[120%]'}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Vehicle Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors dark:text-slate-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Vehicle Header */}
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-3">
              <div className={`p-3 rounded-full ${vehicle.status === 'moving' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                vehicle.status === 'idle' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">{vehicle.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{vehicle.plate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className={`font-medium capitalize ${vehicle.status === 'moving' ? 'text-green-600 dark:text-green-400' :
                  vehicle.status === 'idle' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>{vehicle.status}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Speed</p>
                <p className="font-medium dark:text-white">{Math.round(vehicle.speed)} km/h</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Fuel Level</p>
                <p className="font-medium dark:text-white">{Math.round(vehicle.fuelLevel)}%</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last Update</p>
                <p className="font-medium text-xs dark:text-white">
                  {vehicle.lastLocationTime ? new Date(vehicle.lastLocationTime).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Section */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2 dark:text-white">
              <Gauge size={18} />
              Telemetry Data
            </h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              {/* Ignition Status */}
              {vehicle.ignition != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Power size={14} />
                    Ignition
                  </span>
                  <span className={`font-medium text-sm px-2 py-1 rounded ${vehicle.ignition
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {vehicle.ignition ? 'ON' : 'OFF'}
                  </span>
                </div>
              )}

              {/* Vehicle Battery */}
              {vehicle.vehicleBattery != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Battery size={14} />
                    Vehicle Battery
                  </span>
                  <span className="font-medium dark:text-white">{(vehicle.vehicleBattery / 1000).toFixed(2)} V</span>
                </div>
              )}

              {/* Internal Battery */}
              {vehicle.internalBattery != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Battery size={14} />
                    Internal Battery
                  </span>
                  <span className="font-medium dark:text-white">{(vehicle.internalBattery / 1000).toFixed(2)} V</span>
                </div>
              )}

              {/* GSM Signal */}
              {vehicle.gsmSignal != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Signal size={14} />
                    GSM Signal
                  </span>
                  <span className="font-medium dark:text-white flex items-center gap-1">
                    {'▂'.repeat(Math.min(vehicle.gsmSignal, 5))}
                    <span className="text-xs ml-1">({vehicle.gsmSignal}/5 bars)</span>
                  </span>
                </div>
              )}

              {/* Odometer */}
              {vehicle.odometer != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Gauge size={14} />
                    Odometer
                  </span>
                  <span className="font-medium dark:text-white">{vehicle.odometer.toFixed(1)} km</span>
                </div>
              )}

              {/* Engine Hours */}
              {vehicle.engineHours != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Clock size={14} />
                    Engine Hours
                  </span>
                  <span className="font-medium dark:text-white">{vehicle.engineHours.toFixed(1)} hrs</span>
                </div>
              )}

              {/* Temperature */}
              {vehicle.temperature != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-3">
                    <Thermometer size={14} />
                    Temperature
                  </span>
                  <span className={`font-medium ${vehicle.temperature > 90
                    ? 'text-red-600 dark:text-red-400'
                    : vehicle.temperature > 70
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                    }`}>
                    {vehicle.temperature.toFixed(1)} °C
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fatigue & Behavior Monitor Section */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2 dark:text-white">
              <EyeOff size={18} />
              Fatigue Monitor (Movon)
            </h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner">
              {loading && behaviorEvents.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm italic">
                  Loading events...
                </div>
              ) : behaviorEvents.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {behaviorEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 transition-colors ${event.evidenceUrl ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                      onClick={() => event.evidenceUrl && setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="flex items-center gap-2 font-bold text-xs dark:text-white">
                          {getEventIcon(event.type)}
                          {getEventLabel(event.type)}
                          {event.evidenceUrl && (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1 rounded animate-pulse">
                              Snapshot
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                          ID: {event.id.slice(-4).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-col items-center gap-2 text-gray-400" >
                    <AlertCircle size={32} className="opacity-20" />
                    <p className="text-xs" > No fatigue events detected recently.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Info */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2 dark:text-white" >
              <User size={18} />
              Driver Information
            </h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4" >
              <div className="flex items-center gap-3 mb-3" >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold" >
                  {vehicle.driver?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium dark:text-white" > {vehicle.driver?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400" > Primary Driver</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400" >
                <Phone size={16} />
                <span>{vehicle.driver?.phone}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Specs */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2 dark:text-white" >
              <Truck size={18} />
              Specifications
            </h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3" >
              <div className="flex justify-between items-center" >
                <span className="text-gray-500 dark:text-gray-400 text-sm" > Model</span>
                <span className="font-medium dark:text-white" > {vehicle.model}</span>
              </div>
              <div className="flex justify-between items-center" >
                <span className="text-gray-500 dark:text-gray-400 text-sm" > Year</span>
                <span className="font-medium dark:text-white" > {vehicle.year}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700" >
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2" >
                  <Wrench size={14} />
                  Last Maintenance
                </span>
                <span className="font-medium text-sm dark:text-white" > {vehicle.lastMaintenance}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3" >
            <button
              onClick={() => window.location.href = `/replay?vehicleId=${vehicle.id}`}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm" >
              View History
            </button>
            <button className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm" >
              Contact Driver
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Modal Overlay */}
      {selectedEvent && selectedEvent.evidenceUrl && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50 text-white">
              <div className="flex items-center gap-3">
                {getEventIcon(selectedEvent.type)}
                <div>
                  <h3 className="font-bold text-sm">Fatigue Snapshot</h3>
                  <p className="text-[10px] text-slate-400">
                    {getEventLabel(selectedEvent.type)} • {new Date(selectedEvent.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedEvent.evidenceUrl}
                alt="Fatigue Evidence"
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute inset-0 pointer-events-none border-[1px] border-red-500/30 m-4 flex flex-col justify-between p-4">
                <div className="flex justify-between text-[10px] text-red-500 font-mono">
                  <span>MOVON DSM ACTIVE</span>
                  <span>{vehicle?.plate}</span>
                </div>
                <div className="text-[10px] text-red-500 font-mono self-end">
                  {selectedEvent ? new Date(selectedEvent.timestamp).toISOString() : ''}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/30 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
