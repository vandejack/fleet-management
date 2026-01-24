'use client';
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isMapPage = pathname === '/';

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Background Pattern for Blur Visibility */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-[0.02] pointer-events-none z-0"></div>
      
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main 
        className={`flex-1 overflow-hidden relative flex flex-col transition-all duration-300 z-10 ${
          isSidebarOpen && !isMapPage ? 'ml-64' : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  );
};
