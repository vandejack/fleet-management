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
      <div className="absolute top-4 right-4 z-[1000] grid grid-cols-1 gap-4 w-64 pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-lg p-4 rounded-lg shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] pointer-events-auto flex items-center gap-4 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
          <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-white">Total Vehicles</p>
            <p className="text-2xl font-bold">{vehicles.length}</p>
          </div>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-lg p-4 rounded-lg shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] pointer-events-auto flex items-center gap-4 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
          <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-full text-green-600 dark:text-green-400">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-white">Active Now</p>
            <p className="text-2xl font-bold">{activeVehicles}</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-lg p-4 rounded-lg shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] pointer-events-auto flex items-center gap-4 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-colors">
          <div className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400">
            <Battery size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-white">Avg Fuel Level</p>
            <p className="text-2xl font-bold">
              {Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / vehicles.length)}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-full w-full">
        <Map vehicles={vehicles} onVehicleSelect={setSelectedVehicle} />
      </div>

      <AlertsList alerts={alerts} onDismiss={dismissAlert} onClearAll={clearAllAlerts} />
      <VehicleDetailPanel vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </DashboardLayout>
  );
}
