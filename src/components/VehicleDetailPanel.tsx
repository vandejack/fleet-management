'use client';
import { Vehicle } from '@/utils/mockData';
import { X, User, Phone, Truck, Calendar, Wrench } from 'lucide-react';

interface VehicleDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleDetailPanel = ({ vehicle, onClose }: VehicleDetailPanelProps) => {
  if (!vehicle) return null;

  return (
    <div className={`fixed right-0 top-0 h-screen w-96 bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[3000] overflow-y-auto ${vehicle ? 'translate-x-0' : 'translate-x-full'}`}>
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
