'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import Map from '@/components/Map';
import { AlertsList } from '@/components/AlertsList';
import { VehicleDetailPanel } from '@/components/VehicleDetailPanel';
import { Vehicle } from '@/utils/mockData';
import { Truck, Battery } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFleet } from '@/context/FleetContext';

export default function Home() {
  const { vehicles, alerts, dismissAlert, clearAllAlerts } = useFleet();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (selectedVehicle) {
      const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id);
      if (updatedVehicle) {
        setSelectedVehicle(updatedVehicle);
      }
    }
  }, [vehicles, selectedVehicle]);

  const activeVehicles = vehicles.filter(v => v.status === 'moving').length;

  return (
    <DashboardLayout>
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-64 z-[1000] flex md:grid md:grid-cols-1 gap-4 overflow-x-auto md:overflow-visible pointer-events-none no-scrollbar pb-2 md:pb-0">
        <div className="transition-transform duration-300 ease-in-out print:hidden translate-x-0 bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg pointer-events-auto flex items-center gap-4 border border-white/10 text-white transition-colors flex-shrink-0 w-64 md:w-auto p-4">
          <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-300">Total Vehicles</p>
            <p className="text-2xl font-bold">{vehicles.length}</p>
          </div>
        </div>

        <div className="transition-transform duration-300 ease-in-out print:hidden translate-x-0 bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg pointer-events-auto flex items-center gap-4 border border-white/10 text-white transition-colors flex-shrink-0 w-64 md:w-auto p-4">
          <div className="p-3 bg-green-500/20 rounded-full text-green-400">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-300">Active Now</p>
            <p className="text-2xl font-bold">{activeVehicles}</p>
          </div>
        </div>

        <div className="transition-transform duration-300 ease-in-out print:hidden translate-x-0 bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg pointer-events-auto flex items-center gap-4 border border-white/10 text-white transition-colors flex-shrink-0 w-64 md:w-auto p-4">
          <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400">
            <Battery size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-300">Avg Fuel Level</p>
            <p className="text-2xl font-bold">
              {Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / vehicles.length)}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-full w-full">
        <Map vehicles={vehicles} onVehicleSelect={setSelectedVehicle} />
      </div>

      <AlertsList alerts={alerts} vehicles={vehicles} onDismiss={dismissAlert} onClearAll={clearAllAlerts} />
      <VehicleDetailPanel vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </DashboardLayout>
  );
}
