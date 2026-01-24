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

export const FleetProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [fuelTransactions, setFuelTransactions] = useState<FuelTransaction[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastAlertTimeRef = useRef<Record<string, number>>({});

  // Initialize from localStorage
  useEffect(() => {
    const savedVehicles = localStorage.getItem('fleet_vehicles');
    const savedDrivers = localStorage.getItem('fleet_drivers');
    const savedAlerts = localStorage.getItem('fleet_alerts');
    const savedSettings = localStorage.getItem('fleet_settings');
    const savedMaintenance = localStorage.getItem('fleet_maintenance');

    if (savedVehicles) {
      const parsedVehicles = JSON.parse(savedVehicles);
      // Heuristic: If mock data has significantly more items than saved data, 
      // assume it's a dev update and use mock data.
      if (parsedVehicles.length < MOCK_VEHICLES.length) {
        setVehicles(MOCK_VEHICLES);
      } else {
        setVehicles(parsedVehicles);
      }
    }
    else setVehicles(MOCK_VEHICLES);

    if (savedDrivers) {
      const parsedDrivers = JSON.parse(savedDrivers);
      if (parsedDrivers.length < MOCK_DRIVERS.length) {
        setDrivers(MOCK_DRIVERS);
      } else {
        setDrivers(parsedDrivers);
      }
    }
    else setDrivers(MOCK_DRIVERS);

    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    if (savedMaintenance) setMaintenance(JSON.parse(savedMaintenance));
    else setMaintenance(MOCK_MAINTENANCE);

    setIsInitialized(true);
  }, []);

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

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'currentLocation' | 'speed' | 'status' | 'fuelLevel' | 'lastMaintenance'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Math.random().toString(36).substr(2, 9),
      currentLocation: {
        lat: -6.200000 + (Math.random() - 0.5) * 0.1, // Random location around Jakarta
        lng: 106.816666 + (Math.random() - 0.5) * 0.1,
        timestamp: new Date().toISOString()
      },
      speed: 0,
      status: 'idle',
      fuelLevel: 100,
      lastMaintenance: new Date().toISOString().split('T')[0]
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  const addDriver = (driverData: Omit<Driver, 'id' | 'joinedDate' | 'totalTrips' | 'rating'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: Math.random().toString(36).substr(2, 9),
      joinedDate: new Date().toISOString().split('T')[0],
      totalTrips: 0,
      rating: 5.0
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const updateDriver = (id: string, data: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const addMaintenance = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9)
    };
    setMaintenance(prev => [...prev, newRecord]);
  };

  const updateMaintenance = (id: string, data: Partial<MaintenanceRecord>) => {
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
