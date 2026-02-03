'use client';
import { Vehicle } from '@/utils/mockData';
import { X, User, Phone, Truck, Calendar, Wrench, Battery, Signal, Gauge, Clock, Thermometer, Power } from 'lucide-react';

interface VehicleDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleDetailPanel = ({ vehicle, onClose }: VehicleDetailPanelProps) => {
  if (!vehicle) return null;

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

          {/* Driver Info */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2 dark:text-white">
              <User size={18} />
              Driver Information
            </h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  {vehicle.driver?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium dark:text-white">{vehicle.driver?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Primary Driver</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={16} />
                <span>{vehicle.driver?.phone}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Specs */}
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2 dark:text-white">
              <Truck size={18} />
              Specifications
            </h4>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Model</span>
                <span className="font-medium dark:text-white">{vehicle.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Year</span>
                <span className="font-medium dark:text-white">{vehicle.year}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                  <Wrench size={14} />
                  Last Maintenance
                </span>
                <span className="font-medium text-sm dark:text-white">{vehicle.lastMaintenance}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = `/replay?vehicleId=${vehicle.id}`}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              View History
            </button>
            <button className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm">
              Contact Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
