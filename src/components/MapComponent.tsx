import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle, Coordinate } from '@/utils/mockData';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

// Custom vehicle icon - Apple Maps style circle (minimal)
const getVehicleIcon = (status: string) => {
  // Colors for different statuses (Apple style)
  const color = status === 'moving'
    ? '#34C759' // Apple green (Moving)
    : status === 'idle'
      ? '#FF9500' // Apple orange (Idle)
      : '#FF3B30'; // Apple red (Stopped)

  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="width: 26px; height: 26px; position: relative; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">
          <!-- Outer white border ring -->
          <circle cx="13" cy="13" r="13" fill="white"/>
          
          <!-- Main colored circle -->
          <circle cx="13" cy="13" r="10" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
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

// Custom Zoom Slider component
const ZoomSlider = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => { map.off('zoomend', handleZoom); };
  }, [map]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setZoom(val);
    map.setZoom(val);
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-4 bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl transition-all hover:bg-slate-900/80 group">
      <span className="text-white/40 group-hover:text-white/60 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </span>
      <div className="relative flex items-center w-48 sm:w-64">
        <input
          type="range"
          min={map.getMinZoom()}
          max={map.getMaxZoom()}
          value={zoom}
          onChange={handleChange}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(zoom - map.getMinZoom()) / (map.getMaxZoom() - map.getMinZoom()) * 100}%, rgba(255,255,255,0.1) ${(zoom - map.getMinZoom()) / (map.getMaxZoom() - map.getMinZoom()) * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>
      <span className="text-white/40 group-hover:text-white/60 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </span>
    </div>
  );
};

const MapComponent = ({ vehicles = [], route = [], center = [-3.316694, 114.590111], zoom = 16, onVehicleSelect }: MapProps) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className={`relative h-full w-full ${isDarkMode ? 'map-dark-mode' : ''}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: isDarkMode ? '#1e293b' : '#f1f5f9' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController vehicles={vehicles} route={route} center={center} zoom={zoom} />
        <ZoomSlider />

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
