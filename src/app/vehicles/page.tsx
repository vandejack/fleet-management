'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { Search, Filter, Truck, Fuel, AlertTriangle, MoreVertical, Plus, User, Calendar, X, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getGPSVendors } from '@/lib/actions';

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, maintenance } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    name: '',
    plate: '',
    imei: '',
    model: '',
    year: new Date().getFullYear(),
    fuelType: 'diesel' as 'diesel' | 'petrol' | 'electric' | 'hybrid',
    gpsVendorId: '',
    gpsModelId: '',
  });

  const [gpsVendors, setGpsVendors] = useState<any[]>([]);

  useEffect(() => {
    async function loadVendors() {
      const vendors = await getGPSVendors();
      setGpsVendors(vendors);
    }
    loadVendors();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setVehicleFormData({
      name: '',
      plate: '',
      imei: '',
      model: '',
      year: new Date().getFullYear(),
      fuelType: 'diesel',
      gpsVendorId: '',
      gpsModelId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setVehicleFormData({
      name: vehicle.name,
      plate: vehicle.plate,
      imei: vehicle.imei || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      fuelType: vehicle.fuelType || 'diesel',
      gpsVendorId: vehicle.gpsVendorId || '',
      gpsModelId: vehicle.gpsModelId || '',
    });
    setIsModalOpen(true);
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleFormData);
    } else {
      addVehicle(vehicleFormData);
    }
    setIsModalOpen(false);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'idle': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'stopped': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getFuelColor = (level: number) => {
    if (level > 70) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Vehicle Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor and manage your fleet vehicles</p>
          </div>

          <button
            onClick={openAddModal}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add New Vehicle
          </button>
        </div>

        {/* Mobile Floating Add Button */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-[900]">
          <button
            onClick={openAddModal}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            <Plus size={20} />
            Add New Vehicle
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Vehicles</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{vehicles.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active / Moving</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {vehicles.filter(v => v.status === 'moving').length}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
                <Fuel size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Low Fuel</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {vehicles.filter(v => v.fuelLevel < 30).length}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Maintenance Due</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {maintenance ? maintenance.filter(m => m.status === 'scheduled' || m.status === 'in_progress').length : 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by vehicle name or plate..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <Filter size={18} className="text-slate-500 dark:text-slate-400" />
              <select
                className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all" className="dark:bg-slate-800">All Status</option>
                <option value="moving" className="dark:bg-slate-800">Moving</option>
                <option value="idle" className="dark:bg-slate-800">Idle</option>
                <option value="stopped" className="dark:bg-slate-800">Stopped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{vehicle.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                        {vehicle.plate}
                      </p>
                      <button
                        onClick={() => openEditModal(vehicle)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Model</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{vehicle.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Year</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{vehicle.year || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">Fuel Type</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">{vehicle.fuelType || 'Diesel'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 mb-1">GPS Hardware</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {vehicle.gpsVendor?.name || 'N/A'} {vehicle.gpsModel?.name || ''}
                      </p>
                    </div>
                  </div>

                  {/* Fuel Level */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Fuel size={14} /> Fuel Level
                      </span>
                      <span className={`text-sm font-bold ${getFuelColor(vehicle.fuelLevel)}`}>
                        {typeof vehicle.fuelLevel === 'number' ? vehicle.fuelLevel.toFixed(2) : vehicle.fuelLevel}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${vehicle.fuelLevel > 70 ? 'bg-green-500' :
                          vehicle.fuelLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${vehicle.fuelLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Assigned Driver */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3">Assigned Driver</p>
                    {vehicle.driver ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                          {vehicle.driver.photoUrl ? (
                            <img src={vehicle.driver.photoUrl} alt={vehicle.driver.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            vehicle.driver.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{vehicle.driver.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.driver.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic text-sm">
                        <User size={16} />
                        No driver assigned
                      </div>
                    )}
                  </div>

                  {/* Maintenance Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <Calendar size={14} />
                    <span>Last Maintenance: {vehicle.lastMaintenance || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  View Details
                </button>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Truck size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No vehicles found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Truck A-01"
                  value={vehicleFormData.name}
                  onChange={e => setVehicleFormData({ ...vehicleFormData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IMEI (GPS Device)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 123456789012345"
                  value={vehicleFormData.imei}
                  onChange={e => setVehicleFormData({ ...vehicleFormData, imei: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Plate</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. B 1234 CD"
                  value={vehicleFormData.plate}
                  onChange={e => setVehicleFormData({ ...vehicleFormData, plate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Hino 500"
                    value={vehicleFormData.model}
                    onChange={e => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={vehicleFormData.year}
                    onChange={e => setVehicleFormData({ ...vehicleFormData, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fuel Type</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={vehicleFormData.fuelType}
                    onChange={e => setVehicleFormData({ ...vehicleFormData, fuelType: e.target.value as any })}
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  {/* Empty grid space or add more fields later */}
                </div>
              </div>

              {/* GPS Vendor & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GPS Vendor</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={vehicleFormData.gpsVendorId}
                    onChange={e => setVehicleFormData({ ...vehicleFormData, gpsVendorId: e.target.value, gpsModelId: '' })}
                  >
                    <option value="">Select Vendor</option>
                    {gpsVendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GPS Model</label>
                  <select
                    disabled={!vehicleFormData.gpsVendorId}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    value={vehicleFormData.gpsModelId}
                    onChange={e => setVehicleFormData({ ...vehicleFormData, gpsModelId: e.target.value })}
                  >
                    <option value="">Select Model</option>
                    {gpsVendors.find(v => v.id === vehicleFormData.gpsVendorId)?.models?.map((model: any) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
