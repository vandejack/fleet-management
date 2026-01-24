'use client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useFleet } from '@/context/FleetContext';
import { ChevronLeft, ChevronRight, Wrench, Calendar as CalendarIcon, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function CalendarPage() {
  const { maintenance, vehicles } = useFleet();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getMaintenanceForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return maintenance.filter(record => record.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'in_progress': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <DashboardLayout>
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Schedule</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Maintenance and fleet events calendar</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold min-w-[140px] text-center text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
            {days.map(day => (
              <div key={day} className="py-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr">
            {/* Empty cells for previous month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="border-b border-r border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20 p-2 min-h-[100px]"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getMaintenanceForDate(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <div 
                  key={day} 
                  className={`border-b border-r border-slate-100 dark:border-slate-700/50 p-2 min-h-[100px] transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${
                    isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs font-bold text-slate-400">
                        {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`text-xs p-1.5 rounded-md border flex items-center gap-1.5 truncate ${getStatusColor(event.status)}`}
                        title={`${getVehicleName(event.vehicleId)} - ${event.type}`}
                      >
                        {event.status === 'completed' && <CheckCircle size={10} />}
                        {event.status === 'in_progress' && <Clock size={10} />}
                        {event.status === 'scheduled' && <CalendarIcon size={10} />}
                        <span className="truncate font-medium">{getVehicleName(event.vehicleId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Empty cells for next month to fill grid */}
            {Array.from({ length: 42 - (daysInMonth + firstDayOfMonth) }).map((_, index) => (
              <div key={`next-${index}`} className="border-b border-r border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20 p-2 min-h-[100px]"></div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
