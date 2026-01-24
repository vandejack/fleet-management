'use client';
import React from 'react';
import { Map, BarChart3, History, Settings, ChevronLeft, ChevronRight, User, Truck, LogOut, Wrench, Calendar, Hexagon } from 'lucide-react';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';
import { useSession } from 'next-auth/react';
import { logout } from '@/app/login/actions';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });

import { ThemeToggle } from './ThemeToggle';

export const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const { data: session } = useSession();

  return (
    <div 
      className={`h-screen w-64 bg-slate-900/40 backdrop-blur-lg text-white flex flex-col p-4 shadow-2xl z-[2000] fixed left-0 top-0 border-r border-white/10 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-8 top-6 bg-slate-900/60 backdrop-blur-md text-white p-1 rounded-r-md border-y border-r border-white/10 hover:bg-slate-800 transition-colors"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10">
           {/* Glow Effect */}
           <div className="absolute inset-0 bg-cyan-500/50 blur-lg rounded-full"></div>
           <Hexagon size={32} className="text-cyan-400 fill-cyan-400 relative z-10" />
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider font-sans">
          AICRONE
        </h1>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        <Link href="/" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <Map size={20} />
          <span>Live Tracking</span>
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <BarChart3 size={20} />
          <span>Fuel & Analytics</span>
        </Link>
        <Link href="/replay" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <History size={20} />
          <span>Route Replay</span>
        </Link>
        <Link href="/drivers" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <User size={20} />
          <span>Drivers</span>
        </Link>
        <Link href="/vehicles" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <Truck size={20} />
          <span>Vehicles</span>
        </Link>
        <Link href="/maintenance" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <Wrench size={20} />
          <span>Maintenance</span>
        </Link>
        <Link href="/calendar" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
          <Calendar size={20} />
          <span>Schedule</span>
        </Link>
        
        <div className="mt-auto border-t border-white/10 pt-4 space-y-2">
          <ThemeToggle />
          <Link href="/settings" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          
          {session?.user && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg">
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
      </nav>
    </div>
  );
};
