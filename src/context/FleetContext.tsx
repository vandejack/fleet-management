'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Vehicle, Driver, Alert, MOCK_VEHICLES, MOCK_DRIVERS, MaintenanceRecord, MOCK_MAINTENANCE, FuelTransaction, MOCK_FUEL_TRANSACTIONS } from '@/utils/mockData';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  simulation: {
    autoPlay: boolean;
    speed: number;
    updateInterval: number;
  };
  display: {
    showTraffic: boolean;
    showWeather: boolean;
    units: 'metric' | 'imperial';
  };
}

// Server Actions
import {
  createDriver as createDriverAction, updateDriver as updateDriverAction, deleteDriver as deleteDriverAction,
  createVehicle as createVehicleAction, updateVehicle as updateVehicleAction,
  createMaintenance as createMaintenanceAction, updateMaintenance as updateMaintenanceAction
} from '@/lib/actions';

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    email: true,
    push: false,
    sms: true
  },
  simulation: {
    autoPlay: true,
    speed: 1,
    updateInterval: 2000
  },
  display: {
    showTraffic: true,
    showWeather: false,
    units: 'metric'
  }
};

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
  settings: Settings;
  maintenance: MaintenanceRecord[];
  fuelTransactions: FuelTransaction[];
  assignDriver: (driverId: string, vehicleId: string) => void;
  unassignDriver: (driverId: string) => void;
  dismissAlert: (id: string) => void;
  clearAllAlerts: () => void;
  updateSettings: (newSettings: Settings) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'currentLocation' | 'speed' | 'status' | 'fuelLevel' | 'lastMaintenance'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  addDriver: (driver: Omit<Driver, 'id' | 'joinedDate' | 'totalTrips' | 'rating'>) => void;
  updateDriver: (id: string, data: Partial<Driver>) => void;
  addMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenance: (id: string, data: Partial<MaintenanceRecord>) => void;
  addFuelTransaction: (transaction: Omit<FuelTransaction, 'id'>) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider = ({ children, initialVehicles, initialDrivers, initialMaintenance }: { children: ReactNode, initialVehicles?: Vehicle[], initialDrivers?: Driver[], initialMaintenance?: MaintenanceRecord[] }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles || []);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers || []);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(initialMaintenance || []);
  const [fuelTransactions, setFuelTransactions] = useState<FuelTransaction[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastAlertTimeRef = useRef<Record<string, number>>({});

  // Initialize from localStorage or Props
  useEffect(() => {
    // If initial data is provided (from server), prioritize it over mock/default, but check localStorage for Demo persistence?
    // For now, let's treat server data as truth if provided. 
    // If not provided (undefined), fallback to existing logic.

    // Actually, if initialVehicles is passed, we already set it in useState(initialVehicles).
    // But we might want to check localStorage too.

    const savedVehicles = localStorage.getItem('fleet_vehicles');
    const savedDrivers = localStorage.getItem('fleet_drivers');
    const savedAlerts = localStorage.getItem('fleet_alerts');
    const savedSettings = localStorage.getItem('fleet_settings');
    const savedMaintenance = localStorage.getItem('fleet_maintenance');

    if (initialVehicles === undefined) {
      if (savedVehicles) {
        const parsedVehicles = JSON.parse(savedVehicles);
        setVehicles(parsedVehicles);
      }
      // If undefined and no local storage, maybe mock? Or empty?
      // For safety in this hybrid app, we might default to mock if TRULY undefined (client-side only nav)
      // BUT for our specific use case, we want to avoid mock for real users.
      // Since layout always passes array (mock or db), this block is only for client-side usage without SSR.
      else setVehicles(MOCK_VEHICLES);
    } else {
      // initialVehicles is provided ([], [data], etc). 
      // We Use IT. Pure and simple.
      // Optional: Merge with localStorage if we want "offline" support, but for "Real DB" mode, Server > Local.
      setVehicles(initialVehicles);
    }

    if (initialDrivers === undefined) {
      if (savedDrivers) {
        setDrivers(JSON.parse(savedDrivers));
      }
      else setDrivers(MOCK_DRIVERS);
    } else {
      setDrivers(initialDrivers);
    }

    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    if (savedSettings) setSettings(JSON.parse(savedSettings));

    if (initialMaintenance === undefined) {
      if (savedMaintenance) setMaintenance(JSON.parse(savedMaintenance));
      else setMaintenance(MOCK_MAINTENANCE);
    } else {
      setMaintenance(initialMaintenance);
    }

    setIsInitialized(true);
  }, [initialVehicles, initialDrivers, initialMaintenance]);

  // Persist to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('fleet_vehicles', JSON.stringify(vehicles));
  }, [vehicles, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('fleet_drivers', JSON.stringify(drivers));
  }, [drivers, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('fleet_alerts', JSON.stringify(alerts));
  }, [alerts, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('fleet_settings', JSON.stringify(settings));
  }, [settings, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('fleet_maintenance', JSON.stringify(maintenance));
  }, [maintenance, isInitialized]);

  // Simulation Logic
  useEffect(() => {
    if (!settings.simulation.autoPlay) return;

    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status !== 'moving') return v;

        const latChange = (Math.random() - 0.5) * 0.001 * settings.simulation.speed;
        const lngChange = (Math.random() - 0.5) * 0.001 * settings.simulation.speed;
        const fuelConsumption = Math.random() * 0.1 * settings.simulation.speed;

        return {
          ...v,
          currentLocation: {
            ...v.currentLocation,
            lat: v.currentLocation.lat + latChange,
            lng: v.currentLocation.lng + lngChange,
            timestamp: new Date().toISOString()
          },
          fuelLevel: Math.max(0, v.fuelLevel - fuelConsumption),
          speed: Math.max(0, Math.min(120, v.speed + (Math.random() - 0.5) * 10))
        };
      }));
    }, settings.simulation.updateInterval);

    return () => clearInterval(interval);
  }, [settings.simulation.autoPlay, settings.simulation.speed, settings.simulation.updateInterval]);

  // Alert Monitoring Logic
  useEffect(() => {
    vehicles.forEach(v => {
      const now = Date.now();
      const lastTime = lastAlertTimeRef.current[v.id + '_speed'] || 0;
      const lastFuelTime = lastAlertTimeRef.current[v.id + '_fuel'] || 0;

      // Speed Alert (Cooldown: 20s)
      if (v.speed > 90 && now - lastTime > 20000) {
        const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'critical',
          message: `${v.name} is speeding (${Math.round(v.speed)} km/h)`,
          timestamp: new Date().toISOString(),
          vehicleId: v.id
        };
        setAlerts(prev => [newAlert, ...prev]);
        lastAlertTimeRef.current[v.id + '_speed'] = now;
      }

      // Low Fuel Alert (Cooldown: 60s)
      if (v.fuelLevel < 20 && now - lastFuelTime > 60000) {
        const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'warning',
          message: `${v.name} has low fuel (${Math.round(v.fuelLevel)}%)`,
          timestamp: new Date().toISOString(),
          vehicleId: v.id
        };
        setAlerts(prev => [newAlert, ...prev]);
        lastAlertTimeRef.current[v.id + '_fuel'] = now;
      }
    });
  }, [vehicles]);

  const assignDriver = (driverId: string, vehicleId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    // 1. Remove driver from any other vehicle
    const updatedVehicles = vehicles.map(v => {
      if (v.driver?.id === driverId) {
        return { ...v, driver: undefined };
      }
      return v;
    });

    // 2. Assign to new vehicle
    setVehicles(updatedVehicles.map(v => {
      if (v.id === vehicleId) {
        return { ...v, driver };
      }
      return v;
    }));

    // 3. Update driver status (optional, if we want to track 'assigned' status on driver object)
    // For now, vehicle.driver is the source of truth for assignment.
  };

  const unassignDriver = (driverId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.driver?.id === driverId) {
        return { ...v, driver: undefined };
      }
      return v;
    }));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'currentLocation' | 'speed' | 'status' | 'fuelLevel' | 'lastMaintenance'>) => {
    // 1. Optimistic Update or Wait for Server?
    // Let's call server first for reliability in this version
    const result = await createVehicleAction(vehicleData);
    if (result.success && result.vehicle) {
      // Map DB result to UI model if needed (dates are usually strings in JSON response but check types)
      // result.vehicle from actions return Prisma object. 
      // We need to map it to our Vehicle interface.
      // For simplicity, we can assume the result matches mostly or we map manually.
      // Ideally we reuse the mapper from data.ts but that's server side.
      // Let's just push the local data + id for now, or reload page.

      // Better: Refresh page to get canonical data? 
      // Or just append consistent with UI type
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: result.vehicle.id,
        currentLocation: {
          lat: -6.2, lng: 106.8, timestamp: new Date().toISOString()
        },
        speed: 0,
        status: 'idle',
        fuelLevel: 100
      };
      setVehicles(prev => [newVehicle, ...prev]);
    } else {
      alert('Failed to create vehicle: ' + result.error);
    }
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    const result = await updateVehicleAction(id, data);
    if (result.success) {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
    }
  };

  const addDriver = async (driverData: Omit<Driver, 'id' | 'joinedDate' | 'totalTrips' | 'rating'>) => {
    const result = await createDriverAction(driverData);
    if (result.success && result.driver) {
      const newDriver: Driver = {
        ...driverData,
        id: result.driver.id,
        joinedDate: new Date().toISOString().split('T')[0],
        totalTrips: 0,
        rating: 5.0
      };
      setDrivers(prev => [...prev, newDriver]);
    }
  };

  const updateDriver = async (id: string, data: Partial<Driver>) => {
    await updateDriverAction(id, data);
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const addMaintenance = async (record: Omit<MaintenanceRecord, 'id'>) => {
    const result = await createMaintenanceAction(record);
    if (result.success && result.maintenance) {
      const newRecord: MaintenanceRecord = {
        ...record,
        id: result.maintenance.id
      };
      setMaintenance(prev => [...prev, newRecord]);
    }
  };

  const updateMaintenance = async (id: string, data: Partial<MaintenanceRecord>) => {
    await updateMaintenanceAction(id, data);
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const addFuelTransaction = (transaction: Omit<FuelTransaction, 'id'>) => {
    const newTransaction: FuelTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9)
    };
    setFuelTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <FleetContext.Provider value={{
      vehicles,
      drivers,
      alerts,
      settings,
      maintenance,
      fuelTransactions,
      assignDriver,
      unassignDriver,
      dismissAlert,
      clearAllAlerts,
      updateSettings,
      addVehicle,
      updateVehicle,
      addDriver,
      updateDriver,
      addMaintenance,
      updateMaintenance,
      addFuelTransaction
    }}>
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
