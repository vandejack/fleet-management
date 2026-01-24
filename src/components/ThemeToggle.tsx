'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  minimal?: boolean;
}

export function ThemeToggle({ minimal = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed ${minimal ? '' : 'w-full flex items-center gap-3'}`}>
        <Sun size={20} />
        {!minimal && <span>Loading...</span>}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`
        flex items-center justify-center transition-colors rounded-lg
        ${minimal 
          ? 'p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm' 
          : 'w-full gap-3 p-3 hover:bg-slate-800 text-slate-400 hover:text-white justify-start'
        }
      `}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Moon size={20} />
          {!minimal && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={20} />
          {!minimal && <span>Light Mode</span>}
        </>
      )}
    </button>
  );
}
