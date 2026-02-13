'use client';
import { Alert, Vehicle } from '@/utils/mockData';
import { AlertTriangle, AlertCircle, Info, X, Trash2, User } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface AlertsListProps {
  alerts: Alert[];
  vehicles?: Vehicle[];
  onDismiss: (id: string) => void;
  onClearAll?: () => void;
}

// Individual Alert Component with auto-close
const AlertItem = ({
  alert,
  driverName,
  onDismiss
}: {
  alert: Alert;
  driverName?: string;
  onDismiss: (id: string) => void;
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const handleDismiss = useCallback(() => {
    onDismiss(alert.id);
  }, [alert.id, onDismiss]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(handleDismiss, 5000); // 5 seconds auto-close

    return () => clearTimeout(timer);
  }, [isPaused, handleDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group pointer-events-auto relative p-3 transition-transform duration-300 ease-in-out print:hidden translate-y-0 bg-white/95 dark:bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg border border-slate-200 dark:border-white/10 animate-in slide-in-from-top hover:scale-[1.02]"
    >
      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-500 hover:text-white z-10"
      >
        <X size={12} strokeWidth={3} />
      </button>

      <div className="flex gap-3">
        {/* App Icon / Type Indicator */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md
          ${alert.type === 'critical' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
            alert.type === 'warning' ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
              'bg-gradient-to-br from-blue-500 to-blue-600 text-white'}
        `}>
          {alert.type === 'critical' ? <AlertCircle size={20} /> :
            alert.type === 'warning' ? <AlertTriangle size={20} /> :
              <Info size={20} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-[13px] text-slate-900 dark:text-white leading-tight">
              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-snug mt-0.5">
            {alert.message}
          </p>

          {driverName && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                <User size={10} />
                <span>{driverName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-close indicator - subtle progress bar */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-b-lg overflow-hidden">
          <div className="h-full bg-blue-500 dark:bg-blue-400 animate-[shrink_5s_linear]" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export const AlertsList = ({ alerts, vehicles = [], onDismiss, onClearAll }: AlertsListProps) => {
  // Only show the last 5 alerts
  const displayAlerts = alerts.slice(0, 5);

  const getDriverName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.driver?.name;
  };

  if (displayAlerts.length === 0) return null;

  return (
    <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2 z-[9999] w-[340px] max-w-[calc(100vw-2rem)] flex flex-col gap-3 pointer-events-none font-sans">
      {displayAlerts.map((alert) => {
        const driverName = getDriverName(alert.vehicleId);
        return (
          <AlertItem
            key={alert.id}
            alert={alert}
            driverName={driverName}
            onDismiss={onDismiss}
          />
        );
      })}
      {onClearAll && alerts.length > 0 && (
        <div className="pointer-events-auto flex justify-end mt-1">
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-white/10 rounded-full text-[11px] font-medium transition-all backdrop-blur-xl shadow-sm hover:shadow-md"
          >
            <Trash2 size={12} />
            Clear All ({alerts.length})
          </button>
        </div>
      )}
    </div>
  );
};
