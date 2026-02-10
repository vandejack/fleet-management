'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { useState } from 'react';
import { User, Phone, Star, Calendar, FileText, Search, Filter, Truck, X, Check, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function DriversPage() {
  const { drivers, vehicles, assignDriver, unassignDriver, addDriver, updateDriver } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'off_duty' | 'on_leave'>('all');

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // Add/Edit Driver Modal State
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    status: 'active' as 'active' | 'off_duty' | 'on_leave'
  });

  const openAddModal = () => {
    setEditingDriver(null);
    setDriverFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      status: 'active'
    });
    setIsDriverModalOpen(true);
  };

  const openEditModal = (driver: any) => {
    setEditingDriver(driver);
    setDriverFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status
    });
    setIsDriverModalOpen(true);
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, driverFormData);
    } else {
      addDriver(driverFormData);
    }
    setIsDriverModalOpen(false);
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'off_duty': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'on_leave': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getAssignedVehicle = (driverId: string) => {
    return vehicles.find(v => v.driver?.id === driverId);
  };

  const openAssignModal = (driverId: string) => {
    setSelectedDriverId(driverId);
    setIsAssignModalOpen(true);
  };

  const handleAssign = (vehicleId: string) => {
    if (selectedDriverId) {
      assignDriver(selectedDriverId, vehicleId);
      setIsAssignModalOpen(false);
      setSelectedDriverId(null);
    }
  };

  const handleUnassign = (driverId: string) => {
    if (confirm('Are you sure you want to unassign this driver?')) {
      unassignDriver(driverId);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Driver Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your fleet drivers and their assignments</p>
          </div>

          {/* Desktop Add Button */}
          <button
            onClick={openAddModal}
            className="hidden md:flex bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors items-center gap-2 font-medium shadow-sm"
          >
            <User size={20} />
            Add New Driver
          </button>
        </div>

        {/* Mobile Floating Add Button */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-[900]">
          <button
            onClick={openAddModal}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            <User size={20} />
            Add New Driver
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search drivers by name or license..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-slate-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className="text-slate-400 dark:text-slate-500" />
            <select
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="off_duty">Off Duty</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map(driver => {
            const assignedVehicle = getAssignedVehicle(driver.id);

            return (
              <div key={driver.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {driver.photoUrl ? (
                          <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          driver.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{driver.name}</h3>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(driver.status)} uppercase tracking-wide`}>
                          {driver.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg text-yellow-700 dark:text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      <span className="font-bold text-sm">{driver.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-400" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <span className="font-mono">{driver.licenseNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Joined {new Date(driver.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Assignment Status */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    {assignedVehicle ? (
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{assignedVehicle.name}</span>
                          <span className="text-xs text-blue-500 dark:text-blue-300">({assignedVehicle.plate})</span>
                        </div>
                        <button
                          onClick={() => handleUnassign(driver.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Unassign Vehicle"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 italic">No vehicle assigned</span>
                        <button
                          onClick={() => openAssignModal(driver.id)}
                          className="text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Assign Vehicle
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {driver.totalTrips} Total Trips
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <Link href={`/drivers/${driver.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
              <User size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No drivers found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}

        {/* Add/Edit Driver Modal */}
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </h3>
                <button onClick={() => setIsDriverModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleDriverSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. John Doe"
                    value={driverFormData.name}
                    onChange={e => setDriverFormData({ ...driverFormData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. +62 812-3456-7890"
                    value={driverFormData.phone}
                    onChange={e => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. SIM-B2-00123456"
                    value={driverFormData.licenseNumber}
                    onChange={e => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={driverFormData.status}
                    onChange={e => setDriverFormData({ ...driverFormData, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDriverModalOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {editingDriver ? 'Save Changes' : 'Add Driver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Vehicle Modal */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Assign Vehicle</h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-2">Select a vehicle to assign to this driver:</p>
                {vehicles.map(vehicle => {
                  const isAssigned = !!vehicle.driver;
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => handleAssign(vehicle.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group
                        ${isAssigned
                          ? 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-75 hover:opacity-100'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isAssigned ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                          <Truck size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{vehicle.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{vehicle.plate}</div>
                        </div>
                      </div>
                      {isAssigned ? (
                        <div className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-medium">
                          {vehicle.driver?.name}
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400">
                          <Check size={18} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 text-center">
                <button onClick={() => setIsAssignModalOpen(false)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
