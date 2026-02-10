'use client';

import { useSession } from 'next-auth/react';
import { useFleet } from '@/context/FleetContext';
import { LayoutTemplate, MonitorSmartphone } from 'lucide-react';

export default function ThemeSwitcher() {
    const { report: session } = useSession() as any; // Quick fix for type if needed, or just useAuth
    // Actually, useSession returns { data: session, status }
    const { data: sessionData } = useSession();
    const { settings, updateSettings } = useFleet();

    // Check if user is admin or superadmin
    // Based on check_users.js output, role is 'admin'.
    // Logic: allow if role is 'admin' or 'superadmin'
    const user = sessionData?.user as any;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    if (!isAdmin) return null;

    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold mb-3 dark:text-white flex items-center gap-2">
                <LayoutTemplate size={16} />
                Interface Theme (Admin Only)
            </h3>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => updateSettings({ ...settings, themeMode: 'classic' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${settings.themeMode === 'classic'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                        }`}
                >
                    Classic
                </button>
                <button
                    onClick={() => updateSettings({ ...settings, themeMode: 'modern' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${settings.themeMode === 'modern'
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                        }`}
                >
                    <MonitorSmartphone size={16} />
                    Modern
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                &quot;Modern&quot; is optimized for mobile devices and clean aesthetics.
            </p>
        </div>
    );
}
