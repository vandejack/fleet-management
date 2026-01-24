'use client';
import { Alert } from '@/utils/mockData';
import { AlertTriangle, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertsListProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  onClearAll?: () => void;
}

export const AlertsList = ({ alerts, onDismiss, onClearAll }: AlertsListProps) => {
  // Only show the last 5 alerts
  const displayAlerts = alerts.slice(0, 5);

  if (displayAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-80 flex flex-col gap-2 pointer-events-none">
      {onClearAll && alerts.length > 0 && (
        <div className="pointer-events-auto flex justify-end mb-2">
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-lg text-xs font-medium transition-all backdrop-blur-md shadow-lg"
          >
            <Trash2 size={12} />
            Clear All ({alerts.length})
          </button>
        </div>
      )}
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            pointer-events-auto p-4 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right
            ${alert.type === 'critical' ? 'bg-red-500/90 text-white border-red-600' : 
              alert.type === 'warning' ? 'bg-orange-500/90 text-white border-orange-600' : 
              'bg-blue-500/90 text-white border-blue-600'}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="mt-1">
              {alert.type === 'critical' ? <AlertCircle size={20} /> :
               alert.type === 'warning' ? <AlertTriangle size={20} /> :
               <Info size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-wider mb-1">{alert.type} ALERT</h4>
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button 
              onClick={() => onDismiss(alert.id)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
