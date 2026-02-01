'use client';
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobile } from '@/hooks/useMobile';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isMapPage = pathname === '/';
  const isMobile = useMobile();

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Background Pattern for Blur Visibility */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-[0.02] pointer-events-none z-0"></div>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
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

      <main
        className={`flex-1 relative flex flex-col transition-all duration-300 z-10 print:ml-0 print:h-auto print:overflow-visible 
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
