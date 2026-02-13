'use client';

import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
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

                // Create a channel for Android 8+ (Oreo)
                await PushNotifications.createChannel({
                    id: 'fms_alerts',
                    name: 'FMS Alerts',
                    description: 'Speeding and Safety Alerts',
                    importance: 5,
                    visibility: 1,
                    vibration: true,
                });

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
                PushNotifications.addListener('pushNotificationReceived', async (notification) => {
                    console.log('Push received:', notification);
                    // Schedule a local notification to show the alert
                    await LocalNotifications.schedule({
                        notifications: [
                            {
                                title: notification.title || 'New Notification',
                                body: notification.body || '',
                                id: new Date().getTime(),
                                schedule: { at: new Date(Date.now() + 100) },
                                sound: 'default',
                                attachments: null,
                                actionTypeId: '',
                                extra: null
                            }
                        ]
                    });
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
