import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

export function useMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if running on native platform (Android/iOS)
        setIsMobile(Capacitor.isNativePlatform());

        // Optional: Also check screen width for responsive web behavior if desired
        // const checkWidth = () => setIsMobile(window.innerWidth < 768 || Capacitor.isNativePlatform());
        // checkWidth();
        // window.addEventListener('resize', checkWidth);
        // return () => window.removeEventListener('resize', checkWidth);
    }, []);

    return isMobile;
}
