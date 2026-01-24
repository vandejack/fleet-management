'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { Search, Filter, Wrench, Calendar, DollarSign, Plus, X, Edit2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { MaintenanceRecord } from '@/utils/mockData';

export default function MaintenancePage() {
  const { maintenance, vehicles, addMaintenance, updateMaintenance } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<MaintenanceRecord, 'id'>>({
    vehicleId: '',
    type: 'routine',
    status: 'scheduled',
    date: new Date().toISOString().split('T')[0],
    cost: 0,
    description: '',
    provider: ''
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      vehicleId: vehicles[0]?.id || '',
      type: 'routine',
      status: 'scheduled',
      date: new Date().toISOString().split('T')[0],
      cost: 0,
      description: '',
      provider: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: MaintenanceRecord) => {
    setEditingId(record.id);
    setFormData({
      vehicleId: record.vehicleId,
      type: record.type,
      status: record.status,
      date: record.date,
      cost: record.cost,
      description: record.description,
      provider: record.provider || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMaintenance(editingId, formData);
    } else {
      addMaintenance(formData);
    }
    setIsModalOpen(false);
  };

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.name} (${v.plate})` : 'Unknown Vehicle';
  };

  const filteredMaintenance = maintenance.filter(record => {
    const vehicleName = getVehicleName(record.vehicleId).toLowerCase();
    const matchesSearch = vehicleName.includes(searchTerm.toLowerCase()) || 
                          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (record.provider || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'scheduled': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
        case 'routine': return <Clock size={16} />;
        case 'repair': return <Wrench size={16} />;
        case 'inspection': return <CheckCircle size={16} />;
        default: return <Wrench size={16} />;
    }
  };

  const totalCost = maintenance.reduce((sum, record) => sum + record.cost, 0);

  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track vehicle repairs and scheduled services</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Schedule Maintenance
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Wrench size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Records</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{maintenance.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Scheduled</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {maintenance.filter(m => m.status === 'scheduled').length}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completed</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {maintenance.filter(m => m.status === 'completed').length}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Cost</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Rp {(totalCost / 1000000).toFixed(1)}M
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
              placeholder="Search vehicle, description, provider..." 
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
                <option value="scheduled" className="dark:bg-slate-800">Scheduled</option>
                <option value="in_progress" className="dark:bg-slate-800">In Progress</option>
                <option value="completed" className="dark:bg-slate-800">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Cost</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredMaintenance.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                                <span className="font-medium text-slate-900 dark:text-white">{getVehicleName(record.vehicleId)}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 capitalize">
                                    {getTypeIcon(record.type)}
                                    <span>{record.type}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-slate-600 dark:text-slate-300">
                                    <p className="truncate max-w-xs" title={record.description}>{record.description}</p>
                                    {record.provider && <p className="text-xs text-slate-400 mt-1">{record.provider}</p>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                                {record.date}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                                Rp {record.cost.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(record.status)}`}>
                                    {record.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => openEditModal(record)}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                    title="Edit Record"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            
            {filteredMaintenance.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Wrench size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">No maintenance records found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                </div>
            )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingId ? 'Edit Maintenance Record' : 'Schedule Maintenance'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.vehicleId}
                  onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                >
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                        <option value="routine">Routine</option>
                        <option value="repair">Repair</option>
                        <option value="inspection">Inspection</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the maintenance task..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                        required
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost (Rp)</label>
                    <input
                        required
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.cost}
                        onChange={e => setFormData({...formData, cost: parseInt(e.target.value) || 0})}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Provider</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Bengkel Resmi"
                  value={formData.provider}
                  onChange={e => setFormData({...formData, provider: e.target.value})}
                />
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
                  {editingId ? 'Save Changes' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
