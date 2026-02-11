import { Geolocation } from '@capacitor/geolocation';

export const getCurrentPosition = async () => {
    try {
        const coordinates = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
        });
        return coordinates;
    } catch (error) {
        console.error('Geolocation error:', error);
        return null;
    }
};

export const watchPosition = (callback: (position: any) => void) => {
    return Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000
    }, (position, err) => {
        if (err) {
            console.error('Watch error:', err);
            return;
        }
        callback(position);
    });
};
