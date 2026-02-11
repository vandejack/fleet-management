'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getSystemSettings, updateSystemSetting } from '@/lib/actions/settings';
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
  themeMode: 'classic' | 'modern';
}

// Server Actions
import {
  createDriver as createDriverAction, updateDriver as updateDriverAction, deleteDriver as deleteDriverAction,
  createVehicle as createVehicleAction, updateVehicle as updateVehicleAction,
  createMaintenance as createMaintenanceAction, updateMaintenance as updateMaintenanceAction,
  getVehicles as getVehiclesAction,
  assignDriver as assignDriverAction, unassignDriver as unassignDriverAction
} from '@/lib/actions';

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    email: true,
    push: false,
    sms: true
  },
  simulation: {
    autoPlay: false,
    speed: 1,
    updateInterval: 2000
  },
  display: {
    showTraffic: true,
    showWeather: false,
    units: 'metric'
  },
  themeMode: 'modern'
};

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  alerts: Alert[];
  settings: Settings;
  maintenance: MaintenanceRecord[];
  fuelTransactions: FuelTransaction[];
  selectedVehicle: Vehicle | null;
  isOffline: boolean;
  lastSyncTime: string | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
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
  replayState: {
    isActive: boolean;
    vehicleId: string | null;
    route: any[];
    currentIndex: number;
    isPlaying: boolean;
  };
  startReplay: (route: any[], vehicleId: string) => void;
  stopReplay: () => void;
  toggleReplay: () => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider = ({ children, initialVehicles, initialDrivers, initialMaintenance }: { children: ReactNode, initialVehicles?: Vehicle[], initialDrivers?: Driver[], initialMaintenance?: MaintenanceRecord[] }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles || []);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers || []);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(initialMaintenance || []);
  const [fuelTransactions, setFuelTransactions] = useState<FuelTransaction[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
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
        try {
          const parsedVehicles = JSON.parse(savedVehicles);
          setVehicles(parsedVehicles);
        } catch (e) { console.error("Failed to parse savedVehicles", e); }
      }
      // If undefined and no local storage, maybe mock? Or empty?
      // For safety in this hybrid app, we might default to mock if TRULY undefined (client-side only nav)
      // BUT for our specific use case, we want to avoid mock for real users.
      // Since layout always passes array (mock or db), this block is only for client-side usage without SSR.
      else setVehicles([]);
    } else {
      // initialVehicles is provided ([], [data], etc). 
      // We Use IT. Pure and simple.
      // Optional: Merge with localStorage if we want "offline" support, but for "Real DB" mode, Server > Local.
      setVehicles(initialVehicles);
    }

    if (initialDrivers === undefined) {
      if (savedDrivers) {
        try {
          setDrivers(JSON.parse(savedDrivers));
        } catch (e) { console.error("Failed to parse savedDrivers", e); }
      }
      else setDrivers([]);
    } else {
      setDrivers(initialDrivers);
    }

    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) { console.error("Failed to parse savedAlerts", e); }
    }

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Deep merge top-level objects to ensure new properties like simulation are present if missing in old data
        setSettings(prev => ({
          ...DEFAULT_SETTINGS,
          ...parsed,
          simulation: { ...DEFAULT_SETTINGS.simulation, ...(parsed.simulation || {}) },
          display: { ...DEFAULT_SETTINGS.display, ...(parsed.display || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) }
        }));
      } catch (e) { console.error("Failed to parse savedSettings", e); }
    }

    if (initialMaintenance === undefined) {
      if (savedMaintenance) {
        try {
          setMaintenance(JSON.parse(savedMaintenance));
        } catch (e) { console.error("Failed to parse savedMaintenance", e); }
      }
      else setMaintenance([]);
    } else {
      setMaintenance(initialMaintenance);
    }

    setIsInitialized(true);
  }, [initialVehicles, initialDrivers, initialMaintenance]);

  const { data: session, status } = useSession();

  // LIVE TRACKING POLLING
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Poll for vehicle updates every 3 seconds
    const interval = setInterval(async () => {
      try {
        const result = await getVehiclesAction();
        if (result.success && result.vehicles) {
          setIsOffline(false);
          setLastSyncTime(new Date().toISOString());
          setVehicles(prev => {
            // Map server vehicles to UI format
            return result.vehicles.map((v: any) => ({
              ...v,
              currentLocation: {
                lat: v.lat,
                lng: v.lng,
                timestamp: v.lastLocationTime ? new Date(v.lastLocationTime).toISOString() : new Date().toISOString()
              },
              fuelLevel: v.fuelLevel || 0,
              speed: v.speed || 0,
              status: v.status || 'idle'
            }));
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        setIsOffline(true);
      }
    }, 3000);

    // Initial check and browser online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    window.removeEventListener('offline', handleOffline);
  };
}, [status]);

// Update selected vehicle when vehicles array changes
useEffect(() => {
  if (selectedVehicle) {
    const updated = vehicles.find(v => v.id === selectedVehicle.id);
    if (updated) {
      setSelectedVehicle(updated);
    }
  }
}, [vehicles]);

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
  if (!settings.simulation?.autoPlay) return;

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
}, [settings.simulation?.autoPlay, settings.simulation?.speed, settings.simulation?.updateInterval]);

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

const assignDriver = async (driverId: string, vehicleId: string) => {
  const result = await assignDriverAction(vehicleId, driverId);
  if (result.success && result.vehicle) {
    // Optimistically update or rely on polling. 
    // Let's rely on polling for full consistency or update local state immediately.
    // Update local state:
    const driver = drivers.find(d => d.id === driverId);

    setVehicles(prev => {
      // Unassign from others
      const cleaned = prev.map(v => v.driver?.id === driverId ? { ...v, driver: undefined } : v);
      // Assign to target
      return cleaned.map(v => v.id === vehicleId ? { ...v, driver: driver } : v);
    });
  }
};

const unassignDriver = async (vehicleId: string) => {
  // Note: Original signature was (driverId), but usually we unassign from a vehicle.
  // Or if we unassign a driver, we find their vehicle.
  // Let's support both or check how it's used.
  // The context signature said `unassignDriver: (driverId: string) => void;`
  // I should adhere to that or find the vehicle for that driver.

  const vehicle = vehicles.find(v => v.driver?.id === vehicleId); // vehicleId here is actually driverId argument
  if (vehicle) {
    const result = await unassignDriverAction(vehicle.id);
    if (result.success) {
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, driver: undefined } : v));
    }
  }
};

const dismissAlert = (id: string) => {
  setAlerts(prev => prev.filter(a => a.id !== id));
};

const clearAllAlerts = () => {
  setAlerts([]);
};

// Load settings from localStorage and Database
useEffect(() => {
  const loadSettings = async () => {
    // 1. Load Local
    const savedSettings = localStorage.getItem('fleet_settings');
    let currentSettings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;

    // 2. Load Global
    try {
      const globalSettings = await getSystemSettings();
      if (globalSettings.themeMode) {
        currentSettings = { ...currentSettings, themeMode: globalSettings.themeMode };
      }
    } catch (error) {
      console.error('Failed to load global settings:', error);
    }

    setSettings(currentSettings);
    setIsInitialized(true);
  };

  loadSettings();

  // Poll for global updates (Simple sync for now)
  const interval = setInterval(async () => {
    try {
      const globalSettings = await getSystemSettings();
      if (globalSettings.themeMode) {
        setSettings(prev => {
          if (prev.themeMode !== globalSettings.themeMode) {
            return { ...prev, themeMode: globalSettings.themeMode as 'classic' | 'modern' };
          }
          return prev;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, 5000); // Check every 5 seconds

  return () => clearInterval(interval);
}, []);

const updateSettings = async (newSettings: Settings) => {
  setSettings(newSettings);
  localStorage.setItem('fleet_settings', JSON.stringify(newSettings));

  // If theme changed, update global setting
  if (newSettings.themeMode !== settings.themeMode) {
    try {
      await updateSystemSetting('themeMode', newSettings.themeMode);
    } catch (e) {
      console.error('Failed to update global theme:', e);
    }
  }
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

// Replay State
const [replayState, setReplayState] = useState<{
  isActive: boolean;
  vehicleId: string | null;
  route: any[];
  currentIndex: number;
  isPlaying: boolean;
}>({
  isActive: false,
  vehicleId: null,
  route: [],
  currentIndex: 0,
  isPlaying: false
});

const startReplay = (route: any[], vehicleId: string) => {
  setReplayState({
    isActive: true,
    vehicleId,
    route,
    currentIndex: 0,
    isPlaying: true
  });
};

const stopReplay = () => {
  setReplayState(prev => ({ ...prev, isActive: false, isPlaying: false, currentIndex: 0 }));
};

const toggleReplay = () => {
  setReplayState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
};

// Replay Loop
useEffect(() => {
  if (!replayState.isActive || !replayState.isPlaying || replayState.route.length === 0) return;

  const interval = setInterval(() => {
    setReplayState(prev => {
      if (prev.currentIndex >= prev.route.length - 1) {
        // End of route
        return { ...prev, isPlaying: false };
      }
      return { ...prev, currentIndex: prev.currentIndex + 1 };
    });
  }, 1000); // 1 second per point

  return () => clearInterval(interval);
}, [replayState.isActive, replayState.isPlaying, replayState.route]);

return (
  <FleetContext.Provider value={{
    vehicles,
    drivers,
    alerts,
    settings,
    maintenance,
    fuelTransactions,
    replayState,
    isOffline,
    lastSyncTime,
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
    addFuelTransaction,
    selectedVehicle,
    setSelectedVehicle,
    startReplay,
    stopReplay,
    toggleReplay
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
