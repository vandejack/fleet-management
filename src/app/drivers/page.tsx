'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { useState } from 'react';
import { User, Phone, Star, Calendar, FileText, Search, Filter, Truck, X, Check, Edit2, Clock, TrendingUp, Shield, AlertCircle } from 'lucide-react';
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
    status: 'active' as 'active' | 'off_duty' | 'on_leave',
    complianceStatus: 'compliant' as 'compliant' | 'warning' | 'non_compliant',
    licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]
  });

  const openAddModal = () => {
    setEditingDriver(null);
    setDriverFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      status: 'active',
      complianceStatus: 'compliant',
      licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]
    });
    setIsDriverModalOpen(true);
  };

  const openEditModal = (driver: any) => {
    setEditingDriver(driver);
    setDriverFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      complianceStatus: driver.complianceStatus || 'compliant',
      licenseExpiryDate: driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toISOString().split('T')[0] : new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]
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

  const getTimeAgo = (isoDate: string) => {
    const now = new Date();
    const date = new Date(isoDate);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'non_compliant': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return Shield;
      case 'warning': return AlertCircle;
      case 'non_compliant': return AlertCircle;
      default: return Shield;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8 min-h-screen">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Driver Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your fleet drivers and their assignments
          </p>
        </div>

        {/* Statistics Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 md:gap-8">
              {/* Total Drivers */}
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 md:p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <User size={18} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Drivers:</div>
                  <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{drivers.length}</div>
                </div>
              </div>

              {/* Active Drivers */}
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Active:</div>
                  <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                    {drivers.filter(d => d.status === 'active').length}
                  </div>
                </div>
              </div>

              {/* Inactive Drivers */}
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Inactive:</div>
                  <div className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {drivers.filter(d => d.status !== 'active').length}
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Driver Button */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <User size={18} />
              <span className="hidden md:inline">Add Driver</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6 md:mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search drivers by name or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-base"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-slate-500 dark:text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all cursor-pointer"
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
              <div key={driver.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group border border-slate-100/50 dark:border-slate-700/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xl group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/40 dark:group-hover:to-blue-800/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 shadow-sm">
                        {driver.photoUrl ? (
                          <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          driver.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[19px] text-slate-900 dark:text-white mb-1.5 leading-tight">{driver.name}</h3>
                        <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${getStatusColor(driver.status)} uppercase tracking-widest`}>
                          {driver.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/30 dark:to-amber-900/30 px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-yellow-400 shadow-sm border border-amber-100/50 dark:border-yellow-900/30">
                      <Star size={13} fill="currentColor" />
                      <span className="font-bold text-sm">{driver.rating}</span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Phone */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Phone size={13} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone</div>
                        <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{driver.phone}</div>
                      </div>
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Clock size={13} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Active</div>
                        <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                          {driver.lastActivity ? getTimeAgo(driver.lastActivity) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* License Number */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FileText size={13} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">License</div>
                        <div className="font-mono text-[12px] font-medium text-slate-700 dark:text-slate-300 truncate">{driver.licenseNumber}</div>
                      </div>
                    </div>

                    {/* Total Trips */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <TrendingUp size={13} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Trips</div>
                        <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{driver.totalTrips.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* License Expiry */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Calendar size={13} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">License Expiry</div>
                        <div className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                          {new Date(driver.licenseExpiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Compliance Status */}
                    <div className="flex items-center gap-2.5">
                      {(() => {
                        const ComplianceIcon = getComplianceIcon(driver.complianceStatus);
                        return (
                          <>
                            <div className={`p-1.5 rounded-lg ${getComplianceColor(driver.complianceStatus)}`}>
                              <ComplianceIcon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Compliance</div>
                              <div className={`text-[13px] font-semibold capitalize ${getComplianceColor(driver.complianceStatus)}`}>
                                {driver.complianceStatus?.replace('_', ' ') || 'N/A'}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Assignment Status - Layered Section */}
                  <div className="mt-5 -mx-6 -mb-6 pt-4 px-6 pb-6 bg-gradient-to-br from-blue-50/30 via-blue-50/20 to-transparent dark:from-blue-950/20 dark:via-blue-950/10 dark:to-transparent border-t border-slate-100/80 dark:border-slate-700/50">
                    {/* Section Label */}
                    <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Vehicle Assignment
                    </div>

                    {assignedVehicle ? (
                      <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl border border-blue-200/40 dark:border-blue-800/40 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Truck size={15} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="text-[14px] font-medium text-blue-900 dark:text-blue-100 block">{assignedVehicle.name}</span>
                            <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70 font-medium">{assignedVehicle.plate}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassign(driver.id)}
                          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          title="Unassign Vehicle"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-3 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                        <span className="text-[13px] text-slate-500 dark:text-slate-400 italic font-medium">No vehicle assigned</span>
                        <button
                          onClick={() => openAssignModal(driver.id)}
                          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                          Assign Vehicle
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100/50 dark:border-slate-700/30 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {driver.totalTrips} Total Trips
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <Link href={`/drivers/${driver.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Compliance</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={driverFormData.complianceStatus}
                      onChange={e => setDriverFormData({ ...driverFormData, complianceStatus: e.target.value as any })}
                    >
                      <option value="compliant">Compliant</option>
                      <option value="warning">Warning</option>
                      <option value="non_compliant">Non-Compliant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Expiry</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={driverFormData.licenseExpiryDate}
                      onChange={e => setDriverFormData({ ...driverFormData, licenseExpiryDate: e.target.value })}
                    />
                  </div>
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
