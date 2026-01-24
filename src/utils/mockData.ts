export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  licenseNumber: string;
  status: 'active' | 'off_duty' | 'on_leave';
  rating: number;
  joinedDate: string;
  totalTrips: number;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  status: 'moving' | 'idle' | 'stopped';
  currentLocation: Coordinate;
  fuelLevel: number; // percentage
  speed: number; // km/h
  driver?: Driver;
  lastMaintenance?: string;
  model?: string;
  year?: number;
  fuelType?: 'diesel' | 'petrol' | 'electric' | 'hybrid';
}

export interface FuelRecord {
  date: string;
  consumption: number; // liters
  cost: number;
  efficiency: number; // km/l
}

export interface FuelTransaction {
  id: string;
  vehicleId: string;
  date: string;
  amount: number; // liters
  cost: number; // total cost
  location: string;
  odometer?: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  vehicleId: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed';
  date: string;
  cost: number;
  description: string;
  provider?: string;
}

export const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'm1',
    vehicleId: 'v1',
    type: 'routine',
    status: 'completed',
    date: '2024-01-15',
    cost: 1500000,
    description: 'Regular oil change and brake check',
    provider: 'Bengkel Resmi Hino'
  },
  {
    id: 'm2',
    vehicleId: 'v2',
    type: 'repair',
    status: 'completed',
    date: '2024-02-01',
    cost: 3500000,
    description: 'AC compressor replacement',
    provider: 'Cool Auto Service'
  },
  {
    id: 'm3',
    vehicleId: 'v3',
    type: 'inspection',
    status: 'scheduled',
    date: '2024-03-20',
    cost: 500000,
    description: 'Annual safety inspection',
    provider: 'Dishub'
  }
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Budi Santoso',
    phone: '+62 812-3456-7890',
    licenseNumber: 'SIM-B2-00123456',
    status: 'active',
    rating: 4.8,
    joinedDate: '2020-03-15',
    totalTrips: 1250
  },
  {
    id: 'd2',
    name: 'Agus Wijaya',
    phone: '+62 813-9876-5432',
    licenseNumber: 'SIM-B1-98765432',
    status: 'active',
    rating: 4.5,
    joinedDate: '2021-06-10',
    totalTrips: 850
  },
  {
    id: 'd3',
    name: 'Slamet Riyadi',
    phone: '+62 811-2233-4455',
    licenseNumber: 'SIM-B2-55443322',
    status: 'active',
    rating: 4.9,
    joinedDate: '2019-11-20',
    totalTrips: 2100
  },
  {
    id: 'd4',
    name: 'Joko Susilo',
    phone: '+62 815-1122-3344',
    licenseNumber: 'SIM-A-11223344',
    status: 'off_duty',
    rating: 4.7,
    joinedDate: '2022-01-05',
    totalTrips: 420
  },
  {
    id: 'd5',
    name: 'Eko Prasetyo',
    phone: '+62 857-5566-7788',
    licenseNumber: 'SIM-B1-99887766',
    status: 'on_leave',
    rating: 4.6,
    joinedDate: '2023-04-12',
    totalTrips: 150
  },
  {
    id: 'd6',
    name: 'Rudi Hartono',
    phone: '+62 812-5555-6666',
    licenseNumber: 'SIM-B2-12312312',
    status: 'active',
    rating: 4.9,
    joinedDate: '2019-08-17',
    totalTrips: 3200
  },
  {
    id: 'd7',
    name: 'Dewi Sartika',
    phone: '+62 813-4444-5555',
    licenseNumber: 'SIM-A-45645645',
    status: 'active',
    rating: 4.7,
    joinedDate: '2021-02-20',
    totalTrips: 980
  },
  {
    id: 'd8',
    name: 'Bambang Pamungkas',
    phone: '+62 811-7777-8888',
    licenseNumber: 'SIM-B1-78978978',
    status: 'active',
    rating: 4.5,
    joinedDate: '2020-11-10',
    totalTrips: 1500
  },
  {
    id: 'd9',
    name: 'Susi Susanti',
    phone: '+62 857-9999-0000',
    licenseNumber: 'SIM-A-15915915',
    status: 'off_duty',
    rating: 4.8,
    joinedDate: '2022-05-05',
    totalTrips: 600
  },
  {
    id: 'd10',
    name: 'Taufik Hidayat',
    phone: '+62 812-3333-2222',
    licenseNumber: 'SIM-B2-75375375',
    status: 'active',
    rating: 4.6,
    joinedDate: '2021-09-09',
    totalTrips: 1100
  },
  {
    id: 'd11',
    name: 'Alan Budikusuma',
    phone: '+62 813-1111-2222',
    licenseNumber: 'SIM-B1-95195195',
    status: 'active',
    rating: 4.7,
    joinedDate: '2020-01-01',
    totalTrips: 1800
  },
  {
    id: 'd12',
    name: 'Liem Swie King',
    phone: '+62 811-6666-5555',
    licenseNumber: 'SIM-B2-35735735',
    status: 'active',
    rating: 5.0,
    joinedDate: '2018-12-12',
    totalTrips: 4500
  },
  {
    id: 'd13',
    name: 'Verawaty Fajrin',
    phone: '+62 815-4444-3333',
    licenseNumber: 'SIM-A-25825825',
    status: 'active',
    rating: 4.8,
    joinedDate: '2022-08-08',
    totalTrips: 750
  },
  {
    id: 'd14',
    name: 'Icuk Sugiarto',
    phone: '+62 857-2222-1111',
    licenseNumber: 'SIM-B1-85285285',
    status: 'on_leave',
    rating: 4.4,
    joinedDate: '2023-01-15',
    totalTrips: 300
  },
  {
    id: 'd15',
    name: 'Hariyanto Arbi',
    phone: '+62 812-8888-9999',
    licenseNumber: 'SIM-B2-65465465',
    status: 'active',
    rating: 4.6,
    joinedDate: '2021-05-20',
    totalTrips: 1200
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    name: 'Truck A1',
    plate: 'DA-854-AB',
    status: 'moving',
    currentLocation: { lat: -3.316694, lng: 114.590111, timestamp: new Date().toISOString() },
    fuelLevel: 75,
    speed: 65,
    driver: MOCK_DRIVERS[0],
    model: 'Hino 500',
    year: 2022,
    lastMaintenance: '2024-01-15'
  },
  {
    id: 'v2',
    name: 'Van B2',
    plate: 'DA-321-CD',
    status: 'idle',
    currentLocation: { lat: -3.320000, lng: 114.595000, timestamp: new Date().toISOString() },
    fuelLevel: 45,
    speed: 0,
    driver: MOCK_DRIVERS[1],
    model: 'Toyota Hiace',
    year: 2021,
    lastMaintenance: '2024-02-01'
  },
  {
    id: 'v3',
    name: 'Truck C3',
    plate: 'DA-999-EF',
    status: 'moving',
    currentLocation: { lat: -3.310000, lng: 114.585000, timestamp: new Date().toISOString() },
    fuelLevel: 90,
    speed: 55,
    driver: MOCK_DRIVERS[2],
    model: 'Mitsubishi Fuso',
    year: 2023,
    lastMaintenance: '2024-02-10',
    fuelType: 'diesel'
  },
  {
    id: 'v4',
    name: 'Truck D4',
    plate: 'DA-111-GH',
    status: 'moving',
    currentLocation: { lat: -3.315000, lng: 114.592000, timestamp: new Date().toISOString() },
    fuelLevel: 80,
    speed: 60,
    driver: MOCK_DRIVERS[5],
    model: 'Hino 500',
    year: 2022,
    lastMaintenance: '2024-03-01'
  },
  {
    id: 'v5',
    name: 'Van E5',
    plate: 'DA-222-IJ',
    status: 'idle',
    currentLocation: { lat: -3.318000, lng: 114.588000, timestamp: new Date().toISOString() },
    fuelLevel: 50,
    speed: 0,
    driver: MOCK_DRIVERS[6],
    model: 'Toyota Hiace',
    year: 2021,
    lastMaintenance: '2024-02-15'
  },
  {
    id: 'v6',
    name: 'Truck F6',
    plate: 'DA-333-KL',
    status: 'moving',
    currentLocation: { lat: -3.312000, lng: 114.595000, timestamp: new Date().toISOString() },
    fuelLevel: 70,
    speed: 55,
    driver: MOCK_DRIVERS[7],
    model: 'Mitsubishi Fuso',
    year: 2023,
    lastMaintenance: '2024-01-20',
    fuelType: 'diesel'
  },
  {
    id: 'v7',
    name: 'Pickup G7',
    plate: 'DA-444-MN',
    status: 'moving',
    currentLocation: { lat: -3.322000, lng: 114.585000, timestamp: new Date().toISOString() },
    fuelLevel: 65,
    speed: 45,
    driver: MOCK_DRIVERS[8],
    model: 'Suzuki Carry',
    year: 2023,
    lastMaintenance: '2024-03-10',
    fuelType: 'petrol'
  },
  {
    id: 'v8',
    name: 'Truck H8',
    plate: 'DA-555-OP',
    status: 'stopped',
    currentLocation: { lat: -3.314000, lng: 114.598000, timestamp: new Date().toISOString() },
    fuelLevel: 20,
    speed: 0,
    driver: MOCK_DRIVERS[9],
    model: 'Isuzu Elf',
    year: 2020,
    lastMaintenance: '2024-02-28',
    fuelType: 'diesel'
  },
  {
    id: 'v9',
    name: 'Van I9',
    plate: 'DA-666-QR',
    status: 'moving',
    currentLocation: { lat: -3.319000, lng: 114.582000, timestamp: new Date().toISOString() },
    fuelLevel: 85,
    speed: 70,
    driver: MOCK_DRIVERS[10],
    model: 'Daihatsu Gran Max',
    year: 2022,
    lastMaintenance: '2024-01-05',
    fuelType: 'petrol'
  },
  {
    id: 'v10',
    name: 'Truck J10',
    plate: 'DA-777-ST',
    status: 'moving',
    currentLocation: { lat: -3.311000, lng: 114.591000, timestamp: new Date().toISOString() },
    fuelLevel: 95,
    speed: 50,
    driver: MOCK_DRIVERS[11],
    model: 'Hino Dutro',
    year: 2023,
    lastMaintenance: '2024-03-15',
    fuelType: 'diesel'
  },
  {
    id: 'v11',
    name: 'Pickup K11',
    plate: 'DA-888-UV',
    status: 'idle',
    currentLocation: { lat: -3.321000, lng: 114.589000, timestamp: new Date().toISOString() },
    fuelLevel: 40,
    speed: 0,
    driver: MOCK_DRIVERS[12],
    model: 'Mitsubishi L300',
    year: 2019,
    lastMaintenance: '2024-02-10',
    fuelType: 'diesel'
  },
  {
    id: 'v12',
    name: 'Truck L12',
    plate: 'DA-999-WX',
    status: 'moving',
    currentLocation: { lat: -3.313000, lng: 114.593000, timestamp: new Date().toISOString() },
    fuelLevel: 60,
    speed: 58,
    driver: MOCK_DRIVERS[13],
    model: 'Nissan UD Trucks',
    year: 2021,
    lastMaintenance: '2024-01-25',
    fuelType: 'diesel'
  },
  {
    id: 'v13',
    name: 'Van M13',
    plate: 'DA-000-YZ',
    status: 'moving',
    currentLocation: { lat: -3.317000, lng: 114.587000, timestamp: new Date().toISOString() },
    fuelLevel: 75,
    speed: 62,
    driver: MOCK_DRIVERS[14],
    model: 'Toyota Dyna',
    year: 2022,
    lastMaintenance: '2024-03-05',
    fuelType: 'diesel'
  }
];

// Generate a route for replay
export const generateRoute = (start: Coordinate, count: number): Coordinate[] => {
  const route: Coordinate[] = [];
  let { lat, lng } = start;
  
  for (let i = 0; i < count; i++) {
    // Simulate movement
    lat += (Math.random() - 0.5) * 0.01;
    lng += (Math.random() - 0.5) * 0.01;
    
    route.push({
      lat,
      lng,
      timestamp: new Date(Date.now() - (count - i) * 60000).toISOString()
    });
  }
  
  return route;
};

export const MOCK_ROUTE = generateRoute({ lat: -3.316694, lng: 114.590111, timestamp: '' }, 50);

export const FUEL_DATA: FuelRecord[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  consumption: 20 + Math.random() * 15,
  cost: 300000 + Math.random() * 200000, // In Rupiah (approx 300k - 500k)
  efficiency: 8 + Math.random() * 4
}));

export const MOCK_FUEL_TRANSACTIONS: FuelTransaction[] = [
  {
    id: 'ft-1',
    vehicleId: 'v1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 45,
    cost: 652500,
    location: 'SPBU Pertamina KM 57'
  },
  {
    id: 'ft-2',
    vehicleId: 'v2',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 30,
    cost: 435000,
    location: 'Shell Gatot Subroto'
  },
  {
    id: 'ft-3',
    vehicleId: 'v3',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 55,
    cost: 797500,
    location: 'BP AKR'
  }
];
