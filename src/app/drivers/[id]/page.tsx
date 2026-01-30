'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { useParams, useRouter } from 'next/navigation';
import { User, Phone, Star, Calendar, FileText, Truck, MapPin, Clock, Shield, Award, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mock Trip History for UI demonstration
const MOCK_TRIP_HISTORY = [
  { id: 1, date: '2024-03-10', route: 'Jakarta - Bandung', distance: '145 km', duration: '3h 15m', score: 98, status: 'Completed' },
  { id: 2, date: '2024-03-08', route: 'Jakarta City Logistics', distance: '45 km', duration: '4h 30m', score: 92, status: 'Completed' },
  { id: 3, date: '2024-03-05', route: 'Tangerang - Bekasi', distance: '62 km', duration: '2h 10m', score: 95, status: 'Completed' },
  { id: 4, date: '2024-03-01', route: 'Bogor - Jakarta', distance: '55 km', duration: '1h 45m', score: 100, status: 'Completed' },
];

export default function DriverDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { drivers, vehicles } = useFleet();
  
  // Find driver
  const driver = drivers.find(d => d.id === id);
  
  // Find assigned vehicle
  const assignedVehicle = vehicles.find(v => v.driver?.id === id);

  if (!driver) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold text-slate-800">Driver Not Found</h2>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline flex items-center gap-2"
          >
            <ChevronLeft size={20} /> Back to Drivers
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'off_duty': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'on_leave': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header / Nav */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-2"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Drivers List</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
              <div className="w-32 h-32 bg-white dark:bg-slate-800 p-1 rounded-full shadow-lg">
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 font-bold text-4xl overflow-hidden">
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
                  ) : (
                    driver.name.charAt(0)
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{driver.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(driver.status)}`}>
                        {driver.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm">
                        <MapPin size={14} /> Jakarta, Indonesia
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Edit Profile
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                      <Phone size={18} />
                      Contact Driver
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Rating</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{driver.rating}/5.0</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Total Trips</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{driver.totalTrips}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Joined Date</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{new Date(driver.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">License</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{driver.licenseNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details & Vehicle */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-slate-400 dark:text-slate-500" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Full Name</span>
                  <span className="font-medium text-slate-900 dark:text-white">{driver.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Phone Number</span>
                  <span className="font-medium text-slate-900 dark:text-white">{driver.phone}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Email</span>
                  <span className="font-medium text-slate-900 dark:text-white">{driver.name.toLowerCase().replace(' ', '.')}@aicrone.com</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Employee ID</span>
                  <span className="font-medium text-slate-900 dark:text-white">{driver.id.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Current Vehicle */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck size={20} className="text-slate-400 dark:text-slate-500" />
                Current Assignment
              </h3>
              {assignedVehicle ? (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{assignedVehicle.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{assignedVehicle.model} • {assignedVehicle.year}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700/50">
                      <span className="block text-xs text-slate-400 dark:text-slate-500">Plate Number</span>
                      <span className="font-mono font-medium dark:text-slate-200">{assignedVehicle.plate}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700/50">
                      <span className="block text-xs text-slate-400 dark:text-slate-500">Fuel Level</span>
                      <span className={`font-medium ${assignedVehicle.fuelLevel < 20 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {Math.round(assignedVehicle.fuelLevel)}%
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    View Vehicle Details
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                  <Truck size={32} className="mx-auto text-slate-300 dark:text-slate-500 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No vehicle currently assigned</p>
                  <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    Assign a Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trip History & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Shield size={16} />
                  <span>Safety Score</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">98</span>
                  <span className="text-sm text-slate-400 dark:text-slate-500 mb-1">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                  <div className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Clock size={16} />
                  <span>On-Time Rate</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">95%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                  <div className="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Award size={16} />
                  <span>Efficiency</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">4.8</span>
                  <span className="text-sm text-slate-400 dark:text-slate-500 mb-1">km/l</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                  <div className="bg-purple-500 dark:bg-purple-400 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Trip History Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Trip History</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All History</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-700/50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Route</th>
                      <th className="px-6 py-3">Distance</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {MOCK_TRIP_HISTORY.map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{trip.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{trip.route}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{trip.distance}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{trip.duration}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 font-bold ${trip.score >= 95 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {trip.score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
