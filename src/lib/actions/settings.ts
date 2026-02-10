'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getSystemSettings() {
    try {
        const settings = await prisma.systemSettings.findMany();
        return settings.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    } catch (error) {
        console.error('Failed to fetch system settings:', error);
        return {};
    }
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        const session = await auth();
        const user = session?.user as any;

        if (user?.role !== 'admin' && user?.role !== 'superadmin') {
            throw new Error('Unauthorized');
        }

        await prisma.systemSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update system setting:', error);
        return { success: false, error: 'Failed to update setting' };
    }
}
