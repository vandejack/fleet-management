'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  getFuelAnalytics,
  getDailyConsumptionTrend,
  detectRefuelingEvents
} from '@/lib/actions/fuel-analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Fuel, DollarSign, TrendingUp, MapPin, Calendar, Truck, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [refuelings, setRefuelings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadData();

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [analyticsRes, trendsRes, refuelRes] = await Promise.all([
        getFuelAnalytics({
          startDate: thirtyDaysAgo.toISOString(),
          endDate: new Date().toISOString(),
        }),
        getDailyConsumptionTrend({
          startDate: thirtyDaysAgo.toISOString(),
          endDate: new Date().toISOString(),
        }),
        detectRefuelingEvents('all', 30),
      ]);

      if (analyticsRes.success) {
        setAnalytics(analyticsRes);
      }
      if (trendsRes.success) {
        setDailyTrends(trendsRes.dailyTrends || []);
      }
      if (refuelRes.success) {
        setRefuelings(refuelRes.refuelings || []);
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load fuel analytics:', error);
      setLoading(false);
    }
  }

  const summary = analytics?.summary || {
    totalDistance: 0,
    totalFuelConsumed: 0,
    totalCost: 0,
    averageEfficiency: 0,
    totalRefuelings: 0,
  };

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
                    ? (entry.name.includes('Cost') || entry.name.includes('Rp')
                      ? `Rp ${entry.value.toLocaleString('id-ID')}`
                      : entry.value.toLocaleString())
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

  if (loading && !analytics) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading fuel analytics from GPS data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Fuel & Analytics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automatic tracking from GPS data
              {lastUpdate && (
                <span className="ml-2">• Last update: {lastUpdate.toLocaleTimeString()}</span>
              )}
            </p>
          </div>

          <button
            onClick={loadData}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                <Fuel size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Consumption</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {summary.totalFuelConsumed.toFixed(1)} L
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Last 30 days</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <DollarSign size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Est. Fuel Cost</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              Rp {summary.totalCost.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Based on GPS data</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Avg Efficiency</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {summary.averageEfficiency.toFixed(1)} km/L
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Fleet Average</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                <Truck size={24} />
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Distance</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {summary.totalDistance.toFixed(0)} km
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">Total traveled</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Daily Consumption Trend</h3>
            <div className="h-[300px]">
              {isMounted && dailyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTrends}>
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
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {isMounted ? 'No data available' : 'Loading chart...'}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Cost vs Efficiency</h3>
            <div className="h-[300px] w-full min-h-[300px]">
              {isMounted && dailyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrends}>
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
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {isMounted ? 'No data available' : 'Loading chart...'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refueling Events Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Auto-Detected Refueling Events
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automatically detected from GPS fuel level increases
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date & Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Vehicle</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Location</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Fuel Added</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Odometer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {refuelings.map((event, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(event.timestamp).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        <Truck size={16} className="text-blue-500" />
                        {event.vehicleName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin size={16} className="text-red-400" />
                        {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        <Fuel size={16} className="text-orange-500" />
                        ~{event.fuelAdded.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {event.odometer ? `${event.odometer.toFixed(0)} km` : 'N/A'}
                    </td>
                  </tr>
                ))}
                {refuelings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      No refueling events detected in the last 30 days
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
