import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle, Coordinate } from '@/utils/mockData';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

// Custom vehicle icon
const getVehicleIcon = (status: string) => {
  // Colors matching the user provided image (Blue, White, Red)
  const colors = status === 'moving'
    ? { base: '#3b82f6', dark: '#1e3a8a', light: '#60a5fa' } // Blue (Moving)
    : status === 'idle'
      ? { base: '#f8fafc', dark: '#cbd5e1', light: '#ffffff' } // White (Idle)
      : { base: '#ef4444', dark: '#991b1b', light: '#fca5a5' }; // Red (Stopped/Error)

  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="width: 52px; height: 52px; position: relative; filter: drop-shadow(0 10px 8px rgba(0,0,0,0.5)); transform-style: preserve-3d; perspective: 1000px;">
        <!-- Isometric 3D Box Truck SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="width: 100%; height: 100%; overflow: visible;">
          <!-- Shadow -->
          <ellipse cx="50" cy="85" rx="30" ry="10" fill="rgba(0,0,0,0.4)" filter="blur(4px)"/>
          
          <!-- Cargo Box - Left Face (Longer and Taller) -->
          <path d="M15 45 L45 60 L45 85 L15 70 Z" fill="${colors.dark}" stroke="${colors.dark}" stroke-width="1"/>
          
          <!-- Cargo Box - Right Face -->
          <path d="M45 60 L75 45 L75 70 L45 85 Z" fill="${colors.base}" stroke="${colors.base}" stroke-width="1"/>
          
          <!-- Cargo Box - Top Face -->
          <path d="M15 45 L45 30 L75 45 L45 60 Z" fill="${colors.light}" stroke="${colors.light}" stroke-width="1"/>
          
          <!-- Cabin (Separate front part) - Left Face -->
          <path d="M75 70 L85 75 L85 55 L75 45 Z" fill="${colors.dark}" fill-opacity="0.9"/>
          
          <!-- Cabin - Right Face -->
          <path d="M85 75 L95 70 L95 50 L85 55 Z" fill="${colors.base}" fill-opacity="0.9"/>
          
          <!-- Cabin - Top Face -->
          <path d="M75 45 L85 55 L95 50 L85 40 Z" fill="${colors.light}" fill-opacity="0.9"/>
          
          <!-- Windshield -->
          <path d="M85 48 L92 51 L94 49 L87 46 Z" fill="#bae6fd" fill-opacity="0.9"/>
          
          <!-- Wheels -->
          <path d="M25 75 L25 83 L30 85.5 L30 77.5 Z" fill="#1e293b"/>
          <path d="M60 88 L60 96 L65 98.5 L65 90.5 Z" fill="#1e293b"/>
          <path d="M85 78 L85 86 L90 88.5 L90 80.5 Z" fill="#1e293b"/>

          <!-- Box Detail Lines (to match image ridges) -->
           <path d="M45 35 L70 47.5" stroke="${colors.dark}" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>
           <path d="M45 40 L70 52.5" stroke="${colors.dark}" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>

        </svg>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -26]
  });
};


interface MapProps {
  vehicles?: Vehicle[];
  route?: Coordinate[];
  center?: [number, number];
  zoom?: number;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

// Component for smooth marker movement
const SmoothVehicleMarker = ({ vehicle, onSelect }: { vehicle: Vehicle, onSelect?: (v: Vehicle) => void }) => {
  const markerRef = useRef<L.Marker>(null);
  // Store initial position to prevent React from resetting Leaflet's internal position on re-renders
  const initialPos = useRef<[number, number]>([vehicle.currentLocation.lat, vehicle.currentLocation.lng]).current;

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const startLat = marker.getLatLng().lat;
    const startLng = marker.getLatLng().lng;
    const targetLat = vehicle.currentLocation.lat;
    const targetLng = vehicle.currentLocation.lng;

    // Skip animation if position hasn't changed or distance is negligible
    if (Math.abs(startLat - targetLat) < 0.000001 && Math.abs(startLng - targetLng) < 0.000001) {
      return;
    }

    const startTime = performance.now();
    const duration = 2000; // Match simulation update interval

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear interpolation
      const currentLat = startLat + (targetLat - startLat) * progress;
      const currentLng = startLng + (targetLng - startLng) * progress;

      marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [vehicle.currentLocation.lat, vehicle.currentLocation.lng]);

  return (
    <Marker
      ref={markerRef}
      position={initialPos}
      icon={getVehicleIcon(vehicle.status)}
      eventHandlers={{
        click: () => onSelect?.(vehicle),
      }}
    >
      <Popup className="custom-popup">
        <div className="p-2 cursor-pointer min-w-[150px]" onClick={() => onSelect?.(vehicle)}>
          <h3 className="font-bold text-slate-900 dark:text-white">{vehicle.name}</h3>
          <p className="text-slate-600 dark:text-slate-300">Status: <span className={`font-semibold ${vehicle.status === 'moving' ? 'text-green-600 dark:text-green-400' :
              vehicle.status === 'idle' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
            }`}>{vehicle.status.toUpperCase()}</span></p>
          <p className="text-slate-600 dark:text-slate-300">Speed: {Math.round(vehicle.speed)} km/h</p>
          <p className="text-slate-600 dark:text-slate-300">Fuel: {typeof vehicle.fuelLevel === 'number' ? vehicle.fuelLevel.toFixed(2) : vehicle.fuelLevel}%</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Click for details &rarr;</p>
        </div>
      </Popup>
    </Marker>
  );
};

// Controls map view state (zoom/center)
const MapController = ({ vehicles, route, center, zoom }: MapProps) => {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 1. Replay Mode: Always fit route bounds if route exists
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route.map(p => [p.lat, p.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      return;
    }

    // 2. Live Mode: Auto-fit fleet on first load or fallback to user specific center
    if (!hasInitialized.current && vehicles && vehicles.length > 0) {
      if (vehicles.length === 1) {
        map.setView([vehicles[0].currentLocation.lat, vehicles[0].currentLocation.lng], 16);
      } else {
        const bounds = L.latLngBounds(vehicles.map(v => [v.currentLocation.lat, v.currentLocation.lng]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
      hasInitialized.current = true;
    } else if (!hasInitialized.current && (!vehicles || vehicles.length === 0)) {
      // Just use default center provided
      map.setView(center || [-3.316694, 114.590111], zoom || 16);
      hasInitialized.current = true;
    }
  }, [vehicles, route, map, center, zoom]);

  return null;
};

const MapComponent = ({ vehicles = [], route = [], center = [-3.316694, 114.590111], zoom = 16, onVehicleSelect }: MapProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className={`relative h-full w-full ${isDarkMode ? 'map-dark-mode' : ''}`}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', background: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController vehicles={vehicles} route={route} center={center} zoom={zoom} />

        {vehicles.map((vehicle) => (
          <SmoothVehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            onSelect={onVehicleSelect}
          />
        ))}

        {route.length > 0 && (
          <Polyline
            positions={route.map(pt => [pt.lat, pt.lng])}
            color="blue"
            weight={4}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
