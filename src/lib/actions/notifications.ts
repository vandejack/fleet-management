'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function savePushToken(token: string, deviceType: string = 'android') {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await prisma.pushToken.upsert({
            where: { token },
            update: {
                userId,
                deviceType,
                updatedAt: new Date(),
            },
            create: {
                token,
                userId,
                deviceType,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to save push token:', error);
        return { success: false, error: 'Failed to save token' };
    }
}

export async function removePushToken(token: string) {
    try {
        await prisma.pushToken.delete({
            where: { token },
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to remove push token:', error);
        return { success: false, error: 'Failed to remove token' };
    }
}
