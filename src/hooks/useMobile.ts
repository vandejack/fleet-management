import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

export function useMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if running on native platform (Android/iOS) or small screen
        const checkMobile = () => {
            const isNative = Capacitor.isNativePlatform();
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(isNative || isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}
