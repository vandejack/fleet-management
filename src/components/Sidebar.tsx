'use client';
import React, { useState } from 'react';
import { Map, BarChart3, History, Settings, ChevronLeft, ChevronRight, User, Truck, LogOut, Wrench, Calendar, BookOpen, Building, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { logout } from '@/app/login/actions';
import { usePathname } from 'next/navigation';

type PanelType = 'vehicles' | 'analytics' | 'history' | 'settings' | 'drivers' | 'maintenance' | 'schedule' | 'routes' | null;

import { useMobile } from '@/hooks/useMobile';
import { useFleet } from '@/context/FleetContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMenuClick?: (panel: PanelType) => void;
  activePanel?: PanelType;
}

export const Sidebar = ({ isOpen, onToggle, onMenuClick, activePanel }: SidebarProps) => {
  const { data: session } = useSession();
  const { settings } = useFleet();
  const pathname = usePathname();
  const isMapPage = pathname === '/';
  const isMobile = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleItemClick = (panel: PanelType, href: string) => (e: React.MouseEvent) => {
    if (isMobile && settings.themeMode === 'modern') {
      onToggle();
    }
    if (isMapPage && onMenuClick) {
      e.preventDefault();
      onMenuClick(panel);
    }
  };

  const isModernMobile = isMobile && settings.themeMode === 'modern';

  const drawerClasses = isModernMobile
    ? `fixed inset-y-0 left-0 z-[2001] w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `hidden md:flex fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} text-white flex-col p-4 z-[2000] bg-slate-900/40 backdrop-blur-lg border-r border-white/10 print:hidden transition-all duration-300`;

  return (
    <>
      {isModernMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
          onClick={onToggle}
        />
      )}
      <div className={drawerClasses}>
        {/* Header with Logo and Toggle */}
        <div className="border-b border-white/10 pt-4 pb-4 bg-slate-900/0 mb-4 flex flex-col items-center justify-center gap-2 relative">
          {isCollapsed ? (
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI
            </div>
          ) : (
            <img
              src="/aicrone-logo.png"
              alt="AICrone Logo"
              className="h-5 w-auto object-contain brightness-0 invert"
              width={25}
            />
          )}

          {/* Toggle Button */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-full flex items-center justify-center transition-colors"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto sidebar-scroll py-2 pr-2">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={handleItemClick(null, '/')}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${activePanel === null && isMapPage ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Live Tracking' : ''}
            >
              <Map size={20} />
              {!isCollapsed && <span>Live Tracking</span>}
            </Link>
            <Link
              href="/analytics"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/analytics' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Fuel & Analytics' : ''}
            >
              <BarChart3 size={20} />
              {!isCollapsed && <span>Fuel & Analytics</span>}
            </Link>
            <Link
              href="/replay"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/replay' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Route Replay' : ''}
            >
              <History size={20} />
              {!isCollapsed && <span>Route Replay</span>}
            </Link>
            <Link
              href="/drivers"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/drivers' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Drivers' : ''}
            >
              <User size={20} />
              {!isCollapsed && <span>Drivers</span>}
            </Link>
            <Link
              href="/vehicles"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/vehicles' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Vehicles' : ''}
            >
              <Truck size={20} />
              {!isCollapsed && <span>Vehicles</span>}
            </Link>
            <Link
              href="/driver-behavior"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/driver-behavior' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Driver Behavior' : ''}
            >
              <AlertTriangle size={20} />
              {!isCollapsed && <span>Driver Behavior</span>}
            </Link>
            <Link
              href="/maintenance"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/maintenance' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Maintenance' : ''}
            >
              <Wrench size={20} />
              {!isCollapsed && <span>Maintenance</span>}
            </Link>
            <Link
              href="/calendar"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${pathname === '/calendar' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
                }`}
              title={isCollapsed ? 'Schedule' : ''}
            >
              <Calendar size={20} />
              {!isCollapsed && <span>Schedule</span>}
            </Link>
            <Link
              href="/sop"
              className={`flex items-center ${isCollapsed ? 'justify-center md:hidden' : 'gap-3'} p-3 hover:bg-slate-800 rounded-lg transition-colors md:hidden`}
              title={isCollapsed ? 'SOP / Guide' : ''}
            >
              <BookOpen size={20} />
              {!isCollapsed && <span>SOP / Guide</span>}
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-4 space-y-2 bg-slate-900/0">
          <Link
            href="/settings"
            onClick={handleItemClick('settings', '/settings')}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-colors ${activePanel === 'settings' ? 'bg-blue-600 text-white border border-blue-500' : 'hover:bg-slate-800 text-white'
              }`}
            title={isCollapsed ? 'Settings' : ''}
          >
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </Link>

          {(session?.user as any)?.role === 'superadmin' && (
            <Link
              href="/companies"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 hover:bg-slate-800 rounded-lg transition-colors text-cyan-400`}
              title={isCollapsed ? 'Companies' : ''}
            >
              <Building size={20} />
              {!isCollapsed && <span>Companies</span>}
            </Link>
          )}

          {session?.user && !isCollapsed && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg text-white">
                  {session.user.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{session.user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-md transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}

          {session?.user && isCollapsed && (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center p-3 hover:bg-slate-800 rounded-lg transition-colors text-red-400"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
