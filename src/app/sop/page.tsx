'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Book, CheckCircle2, AlertCircle, Map as MapIcon, BarChart3, Bell, Settings, Printer } from 'lucide-react';
import Image from 'next/image';

export default function SOPPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="h-full w-full p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 print:bg-white print:p-0 print:overflow-visible print:h-auto">
        <div className="max-w-4xl mx-auto space-y-8 pb-20 print:pb-0 print:max-w-none">
          
          {/* Header */}
          <div className="text-center space-y-4 mb-12 relative">
            <button
              onClick={handlePrint}
              className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg transition-colors print:hidden"
            >
              <Printer size={20} />
              <span className="font-semibold">Export PDF</span>
            </button>
            
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 print:text-black print:bg-none">
              Standard Operating Procedure (SOP)
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              AICRONE Fleet Management System User Guide
            </p>
          </div>

          {/* 1. Introduction */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
              <Book className="text-cyan-500" />
              1. Introduction
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              This document serves as the Standard Operating Procedure for the AICRONE Fleet Management System. 
              It guides users through the core functionalities, including real-time tracking, alert management, and system navigation.
            </p>
          </section>

          {/* 2. Getting Started */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-green-500" />
              2. Getting Started
            </h2>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">2.1 Login</h3>
              <div className="pl-4 border-l-2 border-cyan-500/30 space-y-2">
                <p className="text-slate-600 dark:text-slate-300">Access the system via the secure login page:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-2">
                  <li>Enter your <strong className="text-cyan-600 dark:text-cyan-400">Username</strong> and <strong className="text-cyan-600 dark:text-cyan-400">Password</strong>.</li>
                  <li>Click <strong className="text-cyan-600 dark:text-cyan-400">"Sign In"</strong>.</li>
                  <li><em>Note:</em> The background features a live map visualization of the operational area.</li>
                </ol>
              </div>
              <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Login Page Screenshot Placeholder</span>
              </div>
            </div>
          </section>

          {/* 3. Dashboard Overview */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <BarChart3 className="text-purple-500" />
              3. Dashboard Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Upon successful login, you are directed to the main Dashboard. The interface consists of three main areas:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <li className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-800 dark:text-white mb-1">1. Sidebar (Left)</strong>
                <span className="text-sm text-slate-500 dark:text-slate-400">Navigation menu for different modules.</span>
              </li>
              <li className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-800 dark:text-white mb-1">2. Live Map (Center)</strong>
                <span className="text-sm text-slate-500 dark:text-slate-400">Real-time visualization of the fleet.</span>
              </li>
              <li className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong className="block text-slate-800 dark:text-white mb-1">3. Stats Panel (Top Right)</strong>
                <span className="text-sm text-slate-500 dark:text-slate-400">Quick summary of fleet status.</span>
              </li>
            </ul>
            <div className="aspect-video relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-lg flex">
              {/* Mock Sidebar */}
              <div className="w-16 h-full bg-slate-800/50 border-r border-white/5 flex flex-col items-center py-4 gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20"></div>
                <div className="w-6 h-6 rounded bg-slate-700/50"></div>
                <div className="w-6 h-6 rounded bg-slate-700/50"></div>
                <div className="w-6 h-6 rounded bg-slate-700/50"></div>
              </div>
              {/* Mock Content */}
              <div className="flex-1 flex flex-col">
                {/* Stats Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-end px-4 gap-4">
                  <div className="w-24 h-8 bg-slate-800/50 rounded"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                </div>
                {/* Map Area */}
                <div className="flex-1 relative bg-slate-900">
                  <div className="absolute inset-0 opacity-20" 
                       style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  </div>
                  {/* Mock Vehicle Pins */}
                  <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                  <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-slate-500 rounded-full"></div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white/70">
                Dashboard Visualization
              </div>
            </div>
          </section>

          {/* 4. Live Tracking */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <MapIcon className="text-blue-500" />
              4. Live Tracking Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">4.1 Fleet Visualization</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span><strong>Blue/Moving:</strong> Vehicle is currently in transit.</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span><strong>Yellow/Idle:</strong> Vehicle is stationary but active.</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                    <span><strong>Grey/Stopped:</strong> Vehicle is turned off.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">4.2 Vehicle Details</h3>
                <p className="text-slate-600 dark:text-slate-300">Click on any vehicle icon to open the Detail Panel showing:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-center dark:text-slate-300">Driver Info</div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-center dark:text-slate-300">Speed & Fuel</div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-center dark:text-slate-300">GPS Coords</div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded text-center dark:text-slate-300">Plate Number</div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Alerts */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <Bell className="text-red-500" />
              5. Alert Management System
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">5.1 Alert Types</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <strong className="text-red-600 dark:text-red-400 block mb-1">Critical (Red)</strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Speeding, Accidents, Geofence Breaches</span>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <strong className="text-orange-600 dark:text-orange-400 block mb-1">Warning (Orange)</strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Low Fuel, Maintenance Due</span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">Info (Blue)</strong>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Trip Started, Trip Ended</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">5.2 Actions</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-2">
                  <li><strong>View Driver:</strong> The alert card displays the name of the driver responsible.</li>
                  <li><strong>Dismiss:</strong> Click the "X" button (visible on hover) to remove a single alert.</li>
                  <li><strong>Clear All:</strong> Click the "Clear All" button to remove all visible notifications.</li>
                </ul>
              </div>
              
              {/* Mock Alert Notification */}
              <div className="aspect-[3/1] relative bg-slate-900/50 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-lg flex items-center justify-center p-8">
                 <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-lg p-4 flex items-start gap-4 shadow-xl">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200/20 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-200/10 rounded"></div>
                    </div>
                    <div className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 cursor-pointer"></div>
                 </div>
                 <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white/70">
                   Alert Notification Visualization
                 </div>
              </div>
            </div>
          </section>

          {/* 6. System Navigation (Sidebar) */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
               <Settings className="text-slate-500" />
               6. System Navigation (Sidebar)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
               <ul className="space-y-4 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <MapIcon size={20} className="text-blue-500" />
                    <span><strong>Live Tracking:</strong> Return to the main map view.</span>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <BarChart3 size={20} className="text-purple-500" />
                    <span><strong>Fuel & Analytics:</strong> View fuel consumption reports.</span>
                  </li>
                  {/* Additional items omitted for brevity in mock but implied */}
                  <li className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                     <Settings size={20} className="text-slate-500" />
                     <span><strong>Settings:</strong> Manage profile and app preferences.</span>
                  </li>
               </ul>

               {/* Mock Sidebar Visual */}
               <div className="h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col relative">
                  <div className="p-4 flex items-center gap-2 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                    <div className="h-4 w-24 bg-white/20 rounded"></div>
                  </div>
                  <div className="p-2 space-y-1">
                     {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-10 rounded-lg flex items-center gap-3 px-3 ${i === 1 ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}>
                           <div className={`w-5 h-5 rounded ${i === 1 ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                           <div className={`h-3 w-20 rounded ${i === 1 ? 'bg-cyan-400/50' : 'bg-slate-700'}`}></div>
                        </div>
                     ))}
                  </div>
                  <div className="mt-auto p-4 border-t border-white/10">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500"></div>
                        <div className="space-y-1">
                           <div className="h-3 w-16 bg-white/20 rounded"></div>
                           <div className="h-2 w-24 bg-white/10 rounded"></div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white/70">
                    Sidebar Menu Visualization
                  </div>
               </div>
            </div>
          </section>

          {/* 7. Settings */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <Settings className="text-slate-500" />
              7. Settings & Customization
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Theme Toggle</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Switch between Light Mode and Dark Mode using the toggle button in the sidebar footer. 
                  The dashboard adapts immediately with a glass-like aesthetic.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Profile Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View the currently logged-in user details at the bottom of the sidebar. 
                  Click "Sign Out" to exit the system securely.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Troubleshooting */}
          <section className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl print:bg-transparent print:shadow-none print:border-none print:backdrop-blur-none">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <AlertCircle className="text-orange-500" />
              8. Troubleshooting
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex-shrink-0 w-1 h-full bg-orange-500 rounded-full"></div>
                <div>
                  <strong className="block text-slate-800 dark:text-white mb-1">Map Not Loading?</strong>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ensure you have an active internet connection. The system will show a "Initializing Map System" screen with a grid pattern while connecting.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex-shrink-0 w-1 h-full bg-red-500 rounded-full"></div>
                <div>
                  <strong className="block text-slate-800 dark:text-white mb-1">No GPS Data?</strong>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Check if the vehicle tracking devices are online and transmitting data.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
}