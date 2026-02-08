'use client';
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobile } from '@/hooks/useMobile';
import FloatingPanel from './FloatingPanel';
import VehicleListPanel from './panels/VehicleListPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import HistoryPanel from './panels/HistoryPanel';
import SettingsPanel from './panels/SettingsPanel';
import DriversPanel from './panels/DriversPanel';
import MaintenancePanel from './panels/MaintenancePanel';
import SchedulePanel from './panels/SchedulePanel';

type PanelType = 'vehicles' | 'analytics' | 'history' | 'settings' | 'drivers' | 'maintenance' | 'schedule' | 'routes' | null;

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const pathname = usePathname();
  const isMapPage = pathname === '/';
  const isMobile = useMobile();

  const handleMenuClick = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-[0.02] pointer-events-none z-0"></div>

      {/* Desktop Layout with Floating Panels */}
      {!isMobile && isMapPage && (
        <>
          {/* Floating Sidebar */}
          <div className="fixed top-4 left-4 h-[calc(100vh-32px)] z-[1000]">
            <Sidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              onMenuClick={handleMenuClick}
              activePanel={activePanel}
            />
          </div>

          {/* Floating Content Panels */}






          <FloatingPanel
            isOpen={activePanel === 'settings'}
            onClose={() => setActivePanel(null)}
            title="System Settings"
            width="30%"
          >
            <SettingsPanel />
          </FloatingPanel>






        </>
      )}

      {/* Traditional Sidebar for non-map pages on desktop */}
      {!isMobile && !isMapPage && (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activePanel={activePanel}
        />
      )}

      {/* Floating SOP Button (Hidden on Mobile) */}
      {!isMobile && (
        <Link
          href="/sop"
          className="fixed bottom-6 right-6 z-[2000] bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center gap-2 font-medium print:hidden"
        >
          <BookOpen size={20} />
          <span className="hidden sm:inline">SOP / Guide</span>
        </Link>
      )}

      {/* Main Content */}
      <main
        className={`${isMapPage ? 'w-full h-full' : 'flex-1 relative flex flex-col'} transition-all duration-300 z-10 print:ml-0 print:h-auto print:overflow-visible 
          ${!isMobile && isSidebarOpen && !isMapPage ? 'ml-64' : 'ml-0'} 
          ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'}
          ${isMobile ? 'pb-16' : ''} 
        `}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && <BottomNav />}
    </div>
  );
};
