'use client';
import Link from 'next/link';
import { Map, BarChart3, Users, Truck, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const BottomNav = () => {
    const pathname = usePathname();
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: '/drivers', icon: Users, label: 'Drivers' },
        { href: '/analytics', icon: BarChart3, label: 'Stats' },
        { href: '/', icon: Map, label: 'Map' },
        { href: '/vehicles', icon: Truck, label: 'Vehicles' },
        { href: '/settings', icon: Settings, label: 'Settings' },
    ];

    useEffect(() => {
        const activeIndex = navItems.findIndex(item => item.href === pathname);
        if (activeIndex !== -1) {
            const itemWidth = window.innerWidth / navItems.length;
            setIndicatorStyle({
                left: activeIndex * itemWidth,
                width: itemWidth
            });
        }
    }, [pathname]);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[1000] pb-safe bg-white/[0.5] dark:bg-slate-900/[0.5] border-t border-white/20 dark:border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] print:hidden"
            style={{
                backdropFilter: 'blur(10px) saturate(100%)',
                WebkitBackdropFilter: 'blur(10px) saturate(100%)'
            }}
        >
            <div className="flex justify-around items-center h-16 relative z-10">
                {/* Minimalist Sliding Indicator - Thinner and centered */}
                <div
                    className="absolute bottom-1 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500 ease-out z-20"
                    style={{
                        left: `${indicatorStyle.left + (indicatorStyle.width * 0.35)}px`,
                        width: `${indicatorStyle.width * 0.3}px`
                    }}
                />
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group ${active ? 'scale-100' : 'scale-90'}`}
                        >
                            {/* Icon Container - Minimalist look */}
                            <div className={`relative transition-all duration-300 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                                <Icon
                                    size={22}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}
                                />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] mt-1 font-bold transition-all duration-300 ${active
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                                }`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
