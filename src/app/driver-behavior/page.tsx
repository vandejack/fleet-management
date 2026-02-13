'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import {
    getDriverBehaviorEvents,
    getDriverBehaviorStats,
    getEventsTrend,
    getEventsByTimeOfDay,
    type DriverBehaviorEvent,
    type DriverBehaviorStats
} from '@/lib/actions/driver-behavior';
import { AlertTriangle, TrendingUp, Users, Car, Download, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DriverBehaviorPage() {
    const [events, setEvents] = useState<DriverBehaviorEvent[]>([]);
    const [stats, setStats] = useState<DriverBehaviorStats | null>(null);
    const [trend, setTrend] = useState<Array<{ date: string; count: number }>>([]);
    const [timeOfDay, setTimeOfDay] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [selectedEventType, setSelectedEventType] = useState<string>('');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [selectedVehicle, selectedDriver, selectedEventType]);

    const loadData = async () => {
        setLoading(true);
        const filters = {
            vehicleId: selectedVehicle || undefined,
            driverId: selectedDriver || undefined,
            eventType: selectedEventType || undefined,
        };

        const [eventsData, statsData, trendData, timeData] = await Promise.all([
            getDriverBehaviorEvents(filters),
            getDriverBehaviorStats(filters),
            getEventsTrend(filters, 30),
            getEventsByTimeOfDay(filters),
        ]);

        setEvents(eventsData);
        setStats(statsData);
        setTrend(trendData);
        setTimeOfDay(timeData);
        setLoading(false);
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Vehicle ID', 'Driver ID', 'Event Type', 'Severity', 'Speed', 'G-Force', 'Latitude', 'Longitude'];
        const rows = events.map(e => [
            new Date(e.timestamp).toISOString(),
            e.vehicleId,
            e.driverId || 'N/A',
            e.eventType,
            e.severity,
            e.speed || 'N/A',
            e.gForce || 'N/A',
            e.latitude || 'N/A',
            e.longitude || 'N/A',
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `driver-behavior-events-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Prepare chart data
    const eventTypeData = stats ? Object.entries(stats.byType).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
    })) : [];

    const severityData = stats ? Object.entries(stats.bySeverity).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    })) : [];

    const vehicleData = stats ? Object.entries(stats.byVehicle).slice(0, 10).map(([name, value]) => ({
        name,
        events: value
    })) : [];

    const timeOfDayData = Object.entries(timeOfDay).map(([hour, count]) => ({
        hour: `${hour}:00`,
        events: count
    }));

    const COLORS = {
        harsh_braking: '#ef4444',
        harsh_acceleration: '#f97316',
        harsh_cornering: '#eab308',
        speeding: '#dc2626',
        low: '#eab308',
        medium: '#f97316',
        high: '#dc2626',
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 max-w-7xl mx-auto pt-16 md:pt-8 pb-24 md:pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Driver Behavior Events</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor and analyze driver safety events</p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEvents}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Events</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <TrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{Object.keys(stats.byType).length}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Event Types</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Car className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{Object.keys(stats.byVehicle).length}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Vehicles</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Users className="text-green-600 dark:text-green-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{Object.keys(stats.byDriver).length}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Drivers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Events by Type - Pie Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Events by Type</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={eventTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {eventTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Events Over Time - Line Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Events Trend (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Events by Vehicle - Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top 10 Vehicles by Events</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={vehicleData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="events" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Severity Distribution - Pie Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Severity Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#6366f1'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Time of Day Analysis - Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 md:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Events by Time of Day</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={timeOfDayData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="events" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Events Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Events</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {events.slice(0, 50).map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                            {event.vehicleId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                                {event.eventType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                event.severity === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                {event.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                                            {event.speed ? `${event.speed} km/h` : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
