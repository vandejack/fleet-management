import * as admin from 'firebase-admin';
import prisma from './prisma';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized');
        } else {
            console.warn('FIREBASE_SERVICE_ACCOUNT not found in environment');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export async function sendPushNotification(userId: string, payload: NotificationPayload) {
    if (!admin.apps.length) {
        console.error('Firebase Admin not initialized. Notification not sent.');
        return { success: false, error: 'Firebase not initialized' };
    }

    try {
        // Get all tokens for the user
        const userTokens = await prisma.pushToken.findMany({
            where: { userId },
        });

        if (userTokens.length === 0) {
            return { success: false, error: 'No push tokens found for user' };
        }

        const tokens = userTokens.map((t) => t.token);

        const message: admin.messaging.MulticastMessage = {
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    clickAction: 'FCM_PLUGIN_ACTIVITY',
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} notifications; ${response.failureCount} failed.`);

        // Clean up invalid tokens if necessary
        if (response.failureCount > 0) {
            const tokensToRemove: string[] = [];
            response.responses.forEach((res, index) => {
                if (!res.success && res.error) {
                    if (
                        res.error.code === 'messaging/invalid-registration-token' ||
                        res.error.code === 'messaging/registration-token-not-registered'
                    ) {
                        tokensToRemove.push(tokens[index]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                await prisma.pushToken.deleteMany({
                    where: { token: { in: tokensToRemove } },
                });
                console.log(`Removed ${tokensToRemove.length} invalid tokens`);
            }
        }

        return { success: true, response };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error };
    }
}

/**
 * Sends a notification to all users associated with a company
 */
export async function sendCompanyNotification(companyId: string, payload: NotificationPayload) {
    try {
        const users = await prisma.user.findMany({
            where: { companyId },
            select: { id: true },
        });

        const results = await Promise.all(
            users.map((user) => sendPushNotification(user.id, payload))
        );

        return results;
    } catch (error) {
        console.error('Error sending company notifications:', error);
        return [];
    }
}
