'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFleet } from '@/context/FleetContext';
import { AlertsList } from '@/components/AlertsList';
import { Vehicle } from '@/utils/mockData';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Truck, 
  Settings, 
  Bell, 
  Search, 
  Battery, 
  Navigation, 
  BarChart3, 
  Fuel, 
  Wifi,
  Radio,
  Menu,
  ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Dynamic import for Map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-900 text-cyan-500">Initializing Navigation Systems...</div>
});

export default function Beta2Dashboard() {
  const { vehicles, alerts, dismissAlert, clearAllAlerts } = useFleet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Select first vehicle by default
  useEffect(() => {
    if (!selectedVehicle && vehicles.length > 0) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles, selectedVehicle]);

  // Update time for the futuristic clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic data for charts based on selected vehicle
  const fuelData = useMemo(() => {
    if (!selectedVehicle) return [];
    
    // Generate deterministic simulation data based on vehicle ID to mimic real history
    // In a real app, this would come from an API endpoint like /api/vehicles/{id}/fuel-history
    const seed = selectedVehicle.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => {
      const baseConsumption = selectedVehicle.model?.includes('Truck') ? 45 : 30;
      const variation = Math.sin(index * 0.8 + seed) * 10;
      return {
        name: month,
        value: Math.round(Math.max(10, baseConsumption + variation))
      };
    });
  }, [selectedVehicle]);

  const routeData = useMemo(() => {
    if (!selectedVehicle) return [];

    const seed = selectedVehicle.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const baseDist = selectedVehicle.status === 'moving' ? 150 : 80;
      const variation = Math.cos(index * 0.5 + seed) * 40;
      const dist = Math.round(Math.max(20, baseDist + variation));
      
      return {
        name: day,
        dist: dist,
        time: Math.round((dist / (selectedVehicle.speed || 40)) * 10) / 10
      };
    });
  }, [selectedVehicle]);

  // Calculate stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'moving').length;
  const avgSpeed = Math.round(vehicles.reduce((acc, v) => acc + v.speed, 0) / (vehicles.length || 1));
  const avgFuel = Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / (vehicles.length || 1));
  const activePercentage = totalVehicles > 0 ? activeVehicles / totalVehicles : 0;

  return (
    <div className="flex h-screen w-full bg-[#050b14] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-20 flex flex-col items-center py-8 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl z-50">
        <div className="mb-10 text-cyan-400">
          <HexagonLogo />
        </div>
        
        <nav className="flex-1 flex flex-col gap-6 w-full px-2">
          <NavItem icon={<LayoutDashboard size={20} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<MapIcon size={20} />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          <NavItem icon={<Truck size={20} />} active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} />
          <NavItem icon={<BarChart3 size={20} />} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavItem icon={<Settings size={20} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="font-bold text-white text-xs">AI</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 z-10 shrink-0">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider uppercase">
              Fleet Command
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest mt-1">SYSTEM ONLINE • v2.4.0</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-white/5 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono text-slate-300">GPS SIGNAL: STRONG</span>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold font-mono text-white leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">{currentTime.toLocaleDateString()}</p>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
              )}
            </button>
            
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
               <img src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=06b6d4" alt="User" />
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 relative z-10 min-h-[calc(100%-80px)] pb-6">
          
          {/* Left Panel - Fleet Status & List */}
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            {/* Status Card */}
            <GlassPanel className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Fleet Status</h3>
                <ChevronRight size={16} className="text-cyan-500" />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-4xl font-bold text-white font-mono">{activeVehicles}/{totalVehicles}</p>
                  <p className="text-xs text-cyan-400 mt-1">VEHICLES ACTIVE</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="none" />
                     <circle cx="32" cy="32" r="28" stroke="#06b6d4" strokeWidth="4" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * activePercentage)} className="transition-all duration-1000" />
                   </svg>
                   <span className="absolute text-xs font-bold">{Math.round(activePercentage * 100)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <StatusRow label="In Transit" value={activeVehicles} color="bg-cyan-500" />
                <StatusRow label="Idle" value={totalVehicles - activeVehicles} color="bg-slate-600" />
                <StatusRow label="Maintenance" value={0} color="bg-red-500" />
              </div>
            </GlassPanel>

            {/* Vehicle List */}
            <GlassPanel className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/30">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Vehicle List</h3>
                <Search size={16} className="text-slate-500" />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`group p-3 rounded-lg transition-all cursor-pointer border ${
                      selectedVehicle?.id === vehicle.id 
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' 
                        : 'hover:bg-white/5 border-transparent hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold transition-colors ${
                        selectedVehicle?.id === vehicle.id ? 'text-cyan-400' : 'text-slate-200 group-hover:text-cyan-400'
                      }`}>{vehicle.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${vehicle.status === 'moving' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/50 text-slate-400'}`}>
                        {vehicle.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>{vehicle.plate}</span>
                      <span>{Math.round(vehicle.speed)} KM/H</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* Center Panel - Map */}
          <div className="col-span-6 flex flex-col gap-6 h-full">
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] group">
              {/* Map Overlay UI */}
              <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                 <div className="bg-slate-900/80 backdrop-blur text-xs p-2 rounded border border-white/10 text-cyan-400 font-mono">
                    LAT: -3.316694 <br/> LNG: 114.590111
                 </div>
              </div>
              
              <div className="absolute top-4 right-4 z-[400] flex gap-2">
                <button className="p-2 bg-slate-900/80 backdrop-blur rounded-lg border border-white/10 hover:border-cyan-500/50 text-white transition-all">
                  <Navigation size={18} />
                </button>
                <button className="p-2 bg-slate-900/80 backdrop-blur rounded-lg border border-white/10 hover:border-cyan-500/50 text-white transition-all">
                  <Wifi size={18} />
                </button>
              </div>

              {/* Map Container */}
              <div className="h-full w-full bg-slate-900">
                 <MapComponent 
                    vehicles={vehicles} 
                    onVehicleSelect={setSelectedVehicle}
                 />
              </div>
              
              {/* Decorative Scanning Line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent z-[399] pointer-events-none animate-scan"></div>
            </div>

            {/* Bottom Stats - Route Analytics */}
            <GlassPanel className="h-48 p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Route Analytics</h3>
                <div className="flex gap-2">
                   <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                   <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
              </div>
              <div className="h-full w-full pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      cursor={{fill: 'rgba(6,182,212,0.1)'}}
                    />
                    <Bar dataKey="dist" fill="#06b6d4" radius={[2, 2, 0, 0]} barSize={12} />
                    <Bar dataKey="time" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>
          </div>

          {/* Right Panel - Details & Charts */}
          <div className="col-span-3 flex flex-col gap-6 h-full">
             {/* Selected Vehicle / Main Detail */}
             <GlassPanel className="p-0 overflow-hidden relative min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
                {selectedVehicle ? (
                  <div className="p-5 relative z-10">
                     <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Vehicle Details</h3>
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                           <Truck size={32} className="text-cyan-400" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-white">{selectedVehicle.name}</h2>
                           <p className="text-xs text-slate-500 font-mono">ID: {selectedVehicle.id.toUpperCase()} • {selectedVehicle.model || 'HEAVY DUTY'}</p>
                           <p className="text-xs text-cyan-400 font-mono mt-1">{selectedVehicle.driver?.name || 'No Driver'}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Fuel Level" value={`${selectedVehicle.fuelLevel}%`} sub={selectedVehicle.fuelLevel < 20 ? "Low Fuel" : "Normal"} active={selectedVehicle.fuelLevel < 20} />
                        <DetailItem label="Speed" value={`${Math.round(selectedVehicle.speed)} km/h`} sub="Real-time" />
                        <DetailItem label="Status" value={selectedVehicle.status.toUpperCase()} sub="Current State" active={selectedVehicle.status === 'moving'} />
                        <DetailItem label="Maintenance" value={selectedVehicle.lastMaintenance || "N/A"} sub="Last Check" />
                     </div>

                     <NeonButton className="w-full mt-6">
                        View Details
                     </NeonButton>
                  </div>
                ) : (
                  <div className="p-5 relative z-10 h-full flex flex-col items-center justify-center text-slate-500">
                    <Truck size={48} className="mb-4 opacity-20" />
                    <p>Select a vehicle to view details</p>
                  </div>
                )}
             </GlassPanel>

             {/* Fuel Consumption Chart */}
             <GlassPanel className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Fuel Consumption {selectedVehicle ? `- ${selectedVehicle.name}` : ''}</h3>
                   <Fuel size={16} className="text-slate-500" />
                </div>
                
                <div className="flex-1 w-full min-h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fuelData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </GlassPanel>

             {/* Glass Status */}
             <GlassPanel className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Quick Actions</h3>
                <ActionRow icon={<Radio size={16} />} label="Live Tracking" active />
                <ActionRow icon={<Battery size={16} />} label="Battery Health" />
                <ActionRow icon={<BarChart3 size={16} />} label="Generate Report" />
             </GlassPanel>
          </div>

        </div>

        {/* Background Gradients/Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-0"></div>

        <AlertsList alerts={alerts} onDismiss={dismissAlert} onClearAll={clearAllAlerts} />
      </main>

      {/* Global CSS for this page only - injected via style tag for simplicity in this prototype */}
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}

// Glassmorphism panel component with enhanced glowing effect
function GlassPanel({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative bg-slate-950/40 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-[inset_0_0_30px_rgba(6,182,212,0.15)] overflow-hidden group ${className}`}>
      {/* Internal Glow Effect - Inverted/Bottom-up */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-cyan-500/10 pointer-events-none"></div>
      
      {/* Top Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

function NavItem({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group ${
        active 
          ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
      }`}
    >
      {icon}
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
      
      {/* Tooltip hint */}
      <div className="absolute left-14 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
        View
      </div>
    </button>
  );
}

function StatusRow({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`}></span>
        <span className="text-slate-400">{label}</span>
      </div>
      <span className="font-mono font-bold text-slate-200">{value}</span>
    </div>
  );
}

function DetailItem({ label, value, sub, active }: { label: string, value: string, sub: string, active?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${active ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-transparent'}`}>
      <p className="text-[10px] text-slate-500 uppercase mb-1">{label}</p>
      <p className={`text-sm font-bold ${active ? 'text-cyan-400' : 'text-slate-200'}`}>{value}</p>
      <p className="text-[10px] text-slate-500">{sub}</p>
    </div>
  );
}

function ActionRow({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
      active 
        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
    }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>}
    </div>
  );
}

function NeonButton({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative group overflow-hidden rounded-xl transition-all duration-300
        bg-slate-950/40 backdrop-blur-md
        border border-cyan-500/50
        text-cyan-400 font-medium tracking-wide
        shadow-[inset_0_0_20px_rgba(6,182,212,0.3)]
        hover:shadow-[inset_0_0_30px_rgba(6,182,212,0.5)]
        hover:border-cyan-400
        hover:text-cyan-300
        active:scale-[0.98]
        ${className}
      `}
    >
      {/* Inner glow gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-cyan-500/10 opacity-50 group-hover:opacity-80 transition-opacity"></div>
      
      {/* Top reflection line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      
      <span className="relative z-10 flex items-center justify-center gap-2 py-3 px-6 drop-shadow-md">
        {children}
      </span>
    </button>
  );
}

function HexagonLogo() {
  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className="absolute inset-0 bg-cyan-500/50 blur-lg rounded-full"></div>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#22d3ee" stroke="none" className="relative z-10 text-cyan-400">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    </div>
  );
}
