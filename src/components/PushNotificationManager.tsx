'use client';

import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { savePushToken } from '@/lib/actions/notifications';
import { useSession } from 'next-auth/react';

export const PushNotificationManager = () => {
    const { data: session } = useSession();

    useEffect(() => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        // Only run if user is logged in
        if (!session?.user) {
            return;
        }

        const registerPush = async () => {
            try {
                // Request permission
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    console.log('Push notification permission denied');
                    return;
                }

                // Register with FCM
                await PushNotifications.register();

                // Listen for successful registration
                PushNotifications.addListener('registration', (token) => {
                    console.log('Push registration success:', token.value);
                    savePushToken(token.value, Capacitor.getPlatform());
                });

                // Listen for registration errors
                PushNotifications.addListener('registrationError', (error) => {
                    console.error('Push registration error:', error.error);
                });

                // Listen for notifications received
                PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    console.log('Push received:', notification);
                });

                // Listen for notification actions
                PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                    console.log('Push action performed:', notification);
                });

            } catch (error) {
                console.error('Error during push notification setup:', error);
            }
        };

        registerPush();

        // Cleanup listeners
        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [session]);

    return null; // This component doesn't render anything
};
