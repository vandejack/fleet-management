'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { Bell, Monitor, Globe, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { settings, updateSettings } = useFleet();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleSimulationChange = (key: keyof typeof settings.simulation, value: number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      simulation: {
        ...prev.simulation,
        [key]: value
      }
    }));
  };

  const handleDisplayChange = (key: keyof typeof settings.display, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your application preferences</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm ${
              isSaved 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaved ? <span className="flex items-center gap-2">Saved!</span> : <><Save size={20} /> Save Changes</>}
          </button>
        </div>

        <div className="space-y-6">
          {/* Notifications Section */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage how you receive alerts and updates</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive daily reports and critical alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={localSettings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get real-time alerts in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={localSettings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">SMS Alerts</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receive critical vehicle status updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={localSettings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Simulation Settings */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Monitor size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Simulation</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure real-time tracking simulation parameters</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Auto-Play on Load</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Automatically start vehicle simulation when dashboard loads</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={localSettings.simulation.autoPlay}
                    onChange={() => handleSimulationChange('autoPlay', !localSettings.simulation.autoPlay)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-slate-900 dark:text-white">Simulation Speed ({localSettings.simulation.speed}x)</label>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Faster speeds may affect performance</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.5"
                  value={localSettings.simulation.speed}
                  onChange={(e) => handleSimulationChange('speed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                  <span>4x</span>
                  <span>5x</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-slate-900 dark:text-white">Update Interval ({localSettings.simulation.updateInterval}ms)</label>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Frequency of position updates</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="10000" 
                  step="1000"
                  value={localSettings.simulation.updateInterval}
                  onChange={(e) => handleSimulationChange('updateInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>1s</span>
                  <span>5s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>
          </section>

          {/* Display Settings */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Display & Map</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize your dashboard appearance</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Measurement Units</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred unit system</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => handleDisplayChange('units', 'metric')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      localSettings.display.units === 'metric' 
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Metric (km/L)
                  </button>
                  <button 
                    onClick={() => handleDisplayChange('units', 'imperial')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      localSettings.display.units === 'imperial' 
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Imperial (mpg)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Show Traffic Layer</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Display real-time traffic conditions on map</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={localSettings.display.showTraffic}
                    onChange={() => handleDisplayChange('showTraffic', !localSettings.display.showTraffic)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Show Weather Info</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Display weather conditions for vehicle locations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={localSettings.display.showWeather}
                    onChange={() => handleDisplayChange('showWeather', !localSettings.display.showWeather)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
