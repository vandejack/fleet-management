'use client';
import Link from 'next/link';
import { Map, BarChart3, Users, Truck, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const BottomNav = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: '/', icon: Map, label: 'Map' },
        { href: '/analytics', icon: BarChart3, label: 'Stats' },
        { href: '/drivers', icon: Users, label: 'Drivers' },
        { href: '/vehicles', icon: Truck, label: 'Vehicles' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 z-[1000] pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(href)
                            ? 'text-cyan-400'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive(href) ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">{label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
