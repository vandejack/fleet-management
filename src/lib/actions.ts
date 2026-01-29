'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Helper to check for superadmin
async function checkSuperadmin() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'superadmin') {
        throw new Error('Unauthorized: Superadmin access required');
    }
    return session;
}

export async function getCompanies() {
    await checkSuperadmin();
    try {
        const companies = await prisma.company.findMany({
            include: {
                _count: {
                    select: { users: true, vehicles: true, drivers: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return companies;
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        throw new Error('Failed to fetch companies');
    }
}

export async function createCompany(data: { name: string; address?: string; city?: string; country?: string }) {
    await checkSuperadmin();
    try {
        const company = await prisma.company.create({
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                country: data.country
            }
        });
        revalidatePath('/companies');
        return { success: true, company };
    } catch (error) {
        console.error('Failed to create company:', error);
        return { success: false, error: 'Failed to create company' };
    }
}

export async function updateCompany(id: string, data: { name: string; address?: string; city?: string; country?: string }) {
    await checkSuperadmin();
    try {
        const company = await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                address: data.address,
                city: data.city,
                country: data.country
            }
        });
        revalidatePath('/companies');
        return { success: true, company };
    } catch (error) {
        console.error('Failed to update company:', error);
        return { success: false, error: 'Failed to update company' };
    }
}

export async function deleteCompany(id: string) {
    await checkSuperadmin();
    try {
        // Check if company has users or assets
        const counts = await prisma.company.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { users: true, vehicles: true, drivers: true }
                }
            }
        });

        if (counts && (counts._count.users > 0 || counts._count.vehicles > 0 || counts._count.drivers > 0)) {
            return { success: false, error: 'Cannot delete company with active users or assets. Please reassign or delete them first.' };
        }

        await prisma.company.delete({ where: { id } });
        revalidatePath('/companies');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete company:', error);
        return { success: false, error: 'Failed to delete company' };
    }
}

export async function getUsersForCompany(companyId: string) {
    await checkSuperadmin();
    try {
        return await prisma.user.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        return [];
    }
}

export async function createUserForCompany(companyId: string, data: { name: string; email: string; password: string; role: string }) {
    await checkSuperadmin();
    try {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) return { success: false, error: 'Email already exists' };

        const user = await prisma.user.create({
            data: {
                companyId,
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
            }
        });
        revalidatePath('/companies');
        return { success: true, user };
    } catch (error) {
        return { success: false, error: 'Failed to create user' };
    }
}

export async function deleteUser(id: string) {
    await checkSuperadmin();
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath('/companies');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete user' };
    }
}
