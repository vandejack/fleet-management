'use client';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-200 dark:bg-[#1a1b26] relative overflow-hidden">
      {/* Grid Pattern with higher contrast for immediate glass effect visibility */}
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.3]" 
           style={{ 
             backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #94a3b8 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Simulated Map Blocks to create texture under the sidebar */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/20 transform -skew-y-3"></div>
         <div className="absolute bottom-0 right-0 w-2/3 h-full bg-slate-500/10 transform skew-x-12"></div>
      </div>
      
      <div className="flex flex-col items-center gap-3 relative z-10 p-6 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <div className="text-slate-700 dark:text-cyan-100 font-medium animate-pulse tracking-wide">Initializing Map System...</div>
      </div>
    </div>
  )
});

export default MapComponent;
