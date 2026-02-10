'use client';
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { BookOpen, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobile } from '@/hooks/useMobile';
import { useFleet } from '@/context/FleetContext';
import FloatingPanel from './FloatingPanel';
import VehicleListPanel from './panels/VehicleListPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import HistoryPanel from './panels/HistoryPanel';
import SettingsPanel from './panels/SettingsPanel';
import DriversPanel from './panels/DriversPanel';
import MaintenancePanel from './panels/MaintenancePanel';
import SchedulePanel from './panels/SchedulePanel';
import { VehicleDetailPanel } from './VehicleDetailPanel';

type PanelType = 'vehicles' | 'analytics' | 'history' | 'settings' | 'drivers' | 'maintenance' | 'schedule' | 'routes' | null;

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isScrolled, setIsScrolled] = useState(false); // New state for scroll detection
  const { settings, selectedVehicle, setSelectedVehicle } = useFleet();
  const pathname = usePathname();
  const isMapPage = pathname === '/' || pathname === '/replay';
  const isMobile = useMobile();

  // Close sidebar by default on mobile
  React.useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
    else setIsSidebarOpen(true);
  }, [isMobile]);

  const handleMenuClick = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 20);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-[0.02] pointer-events-none z-0"></div>

      {/* Mobile Hamburger Menu (Modern Theme Only) - HIDDEN as per user request
      {isMobile && settings.themeMode === 'modern' && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-[2000] p-3 bg-slate-900/80 backdrop-blur-md text-white rounded-full shadow-lg border border-white/10"
        >
          <Menu size={24} />
        </button>
      )}
      */}

      {/* Mobile Header Logo */}
      {isMobile && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
          <img
            src="/aicrone-logo.png"
            alt="AICrone"
            className="h-8 w-auto object-contain brightness-0 dark:invert lg:hidden"
          />
        </div>
      )}

      {/* Desktop Layout with Floating Panels */}
      {!isMobile && isMapPage && (
        <>
          {/* Floating Sidebar */}
          <div className="hidden md:block fixed top-4 left-4 h-[calc(100vh-32px)] z-[1000]">
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

      {/* Mobile Sidebar (Modern Theme) */}
      {isMobile && settings.themeMode === 'modern' && (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onMenuClick={handleMenuClick}
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
        onScroll={handleScroll}
        className={`${isMapPage ? 'w-full h-full' : 'flex-1 min-h-0 relative flex flex-col'} transition-all duration-300 z-10 print:ml-0 print:h-auto print:overflow-visible 
          ${!isMobile && isSidebarOpen && !isMapPage ? 'ml-64' : 'ml-0'} 
          ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'}
          ${isMobile ? 'pb-16' : ''} 
        `}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && <BottomNav />}

      {/* Global Vehicle Detail Panel */}
      <VehicleDetailPanel
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
};
