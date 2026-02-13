'use client';

import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  minimal?: boolean;
}

export function ThemeToggle({ minimal = false }: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-theme-toggle]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) {
    return (
      <button className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed ${minimal ? '' : 'w-full flex items-center gap-3'}`}>
        <Sun size={20} />
        {!minimal && <span>Loading...</span>}
      </button>
    );
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return <Monitor size={20} />;
    } else if (theme === 'dark') {
      return <Moon size={20} />;
    } else {
      return <Sun size={20} />;
    }
  };

  const getCurrentLabel = () => {
    if (theme === 'system') {
      return `System (${systemTheme === 'dark' ? 'Dark' : 'Light'})`;
    } else if (theme === 'dark') {
      return 'Dark Mode';
    } else {
      return 'Light Mode';
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  if (minimal) {
    return (
      <div className="relative" data-theme-toggle>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center transition-colors rounded-lg p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm"
          title={getCurrentLabel()}
        >
          {getCurrentIcon()}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {isActive && <Check size={16} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Sidebar version (full width)
  return (
    <div className="relative" data-theme-toggle>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {getCurrentIcon()}
          <span>{getCurrentLabel()}</span>
        </div>
        <span className={`transform transition-transform text-xs ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="mt-1 bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{option.label}</span>
                </div>
                {isActive && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
