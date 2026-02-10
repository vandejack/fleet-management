'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Fuel, DollarSign, TrendingUp, MapPin, Calendar, Truck, Plus, X } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const { vehicles, fuelTransactions, addFuelTransaction } = useFleet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    cost: '',
    location: '',
    odometer: ''
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate analytics data based on actual fleet size
  const analyticsData = useMemo(() => {
    const baseConsumption = 25; // Base consumption per vehicle per day
    const baseCost = 14500; // Cost per liter (Pertamina Dex approx)

    return Array.from({ length: 30 }, (_, i) => {
      // Add some randomness but scale with vehicle count
      const dailyFluctuation = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
      const activeVehicles = vehicles.filter(v => v.status !== 'stopped').length;
      // Fallback to 1 if no vehicles to show empty state or baseline
      const vehicleCount = activeVehicles || 1;

      const consumption = Math.round(vehicleCount * baseConsumption * dailyFluctuation);
      const cost = consumption * baseCost;
      const efficiency = 8 + (Math.random() * 4) - (vehicleCount * 0.1); // Efficiency drops slightly with more fleet complexity? Or just random.

      return {
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        consumption,
        cost,
        efficiency
      };
    });
  }, [vehicles]);

  // Generate recent individual fuel transactions
  const recentTransactions = useMemo(() => {
    return fuelTransactions.map(t => {
      const vehicle = vehicles.find(v => v.id === t.vehicleId);
      return {
        ...t,
        vehicleName: vehicle?.name || 'Unknown Vehicle',
        plate: vehicle?.plate || 'Unknown Plate'
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuelTransactions, vehicles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return;

    addFuelTransaction({
      vehicleId: formData.vehicleId,
      date: formData.date,
      amount: Number(formData.amount),
      cost: Number(formData.cost),
      location: formData.location,
      odometer: formData.odometer ? Number(formData.odometer) : undefined
    });

    setIsModalOpen(false);
    setFormData({
      vehicleId: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      cost: '',
      location: '',
      odometer: ''
    });
  };

  const totalConsumption = analyticsData.reduce((acc, curr) => acc + curr.consumption, 0);
  const totalCost = analyticsData.reduce((acc, curr) => acc + curr.cost, 0);
  const avgEfficiency = (analyticsData.reduce((acc, curr) => acc + curr.efficiency, 0) / analyticsData.length).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-600 dark:text-slate-300">
                {entry.name}: <span className="text-slate-900 dark:text-white font-bold">{
                  typeof entry.value === 'number'
                    ? (entry.name.includes('Cost') ? `Rp ${entry.value.toLocaleString('id-ID')}` : entry.value.toLocaleString())
                    : entry.value
                }</span>
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Fuel Analytics</h1>
          </div>

          {/* Desktop Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Fuel Record
          </button>
        </div>

        {/* Mobile Floating Add Button */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-[900]">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
          >
            <Plus size={20} />
            Add Fuel Record
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                <Fuel size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Consumption</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalConsumption.toLocaleString()} L</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Last 30 days ({vehicles.length} vehicles)</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <DollarSign size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Est. Fuel Cost</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">Rp {totalCost.toLocaleString('id-ID')}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Based on current fleet</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Avg Efficiency</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgEfficiency} km/L</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Fleet Average</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Daily Consumption Trend</h3>
            <div className="h-[300px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.slice(5)}
                      stroke="#64748b"
                      className="dark:text-slate-400"
                    />
                    <YAxis stroke="#64748b" className="dark:text-slate-400" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="consumption" fill="#f97316" name="Consumption (L)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">
                  Initializing Chart...
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Cost vs Efficiency</h3>
            <div className="h-[300px] w-full min-h-[300px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.slice(5)}
                      stroke="#64748b"
                    />
                    <YAxis yAxisId="left" stroke="#64748b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#16a34a" name="Cost (Rp)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#2563eb" name="Efficiency (km/L)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">
                  Initializing Chart...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Fuel Records Table */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Fuel Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Vehicle</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Location</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentTransactions.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar size={16} className="text-slate-400" />
                        {record.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          <Truck size={16} className="text-blue-500" />
                          {record.vehicleName}
                        </p>
                        <p className="text-xs text-slate-500 ml-6">{record.plate}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin size={16} className="text-red-400" />
                        {record.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        <Fuel size={16} className="text-orange-500" />
                        {record.amount} L
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      Rp {record.cost.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No fuel records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
