'use client';
import React from 'react';
import { Map, BarChart3, History, Settings, ChevronLeft, ChevronRight, User, Truck, LogOut, Wrench, Calendar, BookOpen, Building } from 'lucide-react';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';
import { useSession } from 'next-auth/react';
import { logout } from '@/app/login/actions';
import { usePathname } from 'next/navigation';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });

import { ThemeToggle } from './ThemeToggle';

type PanelType = 'vehicles' | 'analytics' | 'history' | 'settings' | 'drivers' | 'maintenance' | 'schedule' | 'routes' | null;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onMenuClick?: (panel: PanelType) => void;
  activePanel?: PanelType;
}

export const Sidebar = ({ isOpen, onToggle, onMenuClick, activePanel }: SidebarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isMapPage = pathname === '/';

  const handleItemClick = (panel: PanelType, href: string) => (e: React.MouseEvent) => {
    if (isMapPage && onMenuClick) {
      e.preventDefault();
      onMenuClick(panel);
    }
  };

  return (
    <div
      className={`w-64 floating-panel text-white flex flex-col p-4 z-[2000] transition-transform duration-300 ease-in-out print:hidden translate-x-0 bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg pointer-events-auto gap-4 border border-white/10 transition-colors flex-shrink-0 md:w-auto h-full ${isMapPage ? '' : 'fixed left-0 top-0 border-r border-white/10 rounded-none h-screen'
        }`}
    >
      <div className="border-b border-white/10 pt-4 pb-4 bg-slate-900/0 mb-4 flex flex-col items-center justify-center gap-2">
        <img
          src="/aicrone-logo.png"
          alt="AICrone Logo"
          className="h-5 w-auto object-contain brightness-0 invert"
          width={25}
        />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            onClick={handleItemClick(null, '/')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === null && isMapPage ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <Map size={20} />
            <span>Live Tracking</span>
          </Link>
          <Link
            href="/analytics"
            onClick={handleItemClick('analytics', '/analytics')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === 'analytics' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <BarChart3 size={20} />
            <span>Fuel & Analytics</span>
          </Link>
          <Link
            href="/replay"
            onClick={handleItemClick('history', '/replay')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === 'history' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <History size={20} />
            <span>Route Replay</span>
          </Link>
          <Link
            href="/drivers"
            onClick={handleItemClick('drivers', '/drivers')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === 'drivers' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <User size={20} />
            <span>Drivers</span>
          </Link>
          <Link
            href="/vehicles"
            onClick={handleItemClick('vehicles', '/vehicles')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === 'vehicles' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <Truck size={20} />
            <span>Vehicles</span>
          </Link>
          <Link
            href="/maintenance"
            onClick={handleItemClick('maintenance', '/maintenance')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === 'maintenance' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <Wrench size={20} />
            <span>Maintenance</span>
          </Link>
          <Link
            href="/schedule"
            onClick={handleItemClick('schedule', '/schedule')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activePanel === 'schedule' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <Calendar size={20} />
            <span>Schedule</span>
          </Link>
          <Link href="/sop" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors md:hidden">
            <BookOpen size={20} />
            <span>SOP / Guide</span>
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4 space-y-2 bg-slate-900/0">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/settings"
            onClick={handleItemClick('settings', '/settings')}
            className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-colors ${activePanel === 'settings' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800'
              }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>

        {(session?.user as any)?.role === 'superadmin' && (
          <Link href="/companies" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors text-cyan-400">
            <Building size={20} />
            <span>Companies</span>
          </Link>
        )}

        {session?.user && (
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
      </div>
    </div>
  );
};
