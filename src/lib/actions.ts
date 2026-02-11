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

// DRIVER ACTIONS
export async function createDriver(data: any) {
    const session = await auth();
    const user = session?.user as any;
    if (!user?.companyId && user?.role !== 'superadmin') throw new Error('Unauthorized');

    try {
        const driver = await prisma.driver.create({
            data: {
                ...data,
                companyId: user.companyId || data.companyId, // Allow superadmin to specify, else use user's company
                joinedDate: new Date(),
                totalTrips: 0,
                rating: 5.0
            }
        });
        revalidatePath('/drivers');
        return { success: true, driver };
    } catch (error) {
        console.error('Failed to create driver:', error);
        return { success: false, error: 'Failed to create driver' };
    }
}

export async function updateDriver(id: string, data: any) {
    const session = await auth(); // Add stricter checks if needed
    try {
        const driver = await prisma.driver.update({
            where: { id },
            data
        });
        revalidatePath('/drivers');
        return { success: true, driver };
    } catch (error) {
        return { success: false, error: 'Failed to update driver' };
    }
}

export async function deleteDriver(id: string) {
    const session = await auth();
    try {
        await prisma.driver.delete({ where: { id } });
        revalidatePath('/drivers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete driver' };
    }
}

// VEHICLE ACTIONS
export async function createVehicle(data: any) {
    const session = await auth();
    const user = session?.user as any;
    if (!user?.companyId && user?.role !== 'superadmin') throw new Error('Unauthorized');

    try {
        // Sanitize IMEI: empty string -> null to allow multiple vehicles without IMEI
        const imei = data.imei && data.imei.trim() !== '' ? data.imei.trim() : null;

        const vehicle = await prisma.vehicle.create({
            data: {
                ...data,
                imei,
                companyId: user.companyId || data.companyId,
                status: 'idle',
                speed: 0,
                lastLocationTime: new Date(),
                lat: -6.2, // Default to Jakarta if no loc
                lng: 106.8,
                fuelLevel: 100 // Default fuel level
            }
        });
        revalidatePath('/vehicles');
        return { success: true, vehicle };
    } catch (error: any) {
        console.error('Failed to create vehicle:', error);

        // Handle Unique Constraint Violations (P2002)
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (Array.isArray(target)) {
                if (target.includes('imei')) {
                    return { success: false, error: 'This IMEI is already registered.' };
                }
                if (target.includes('plate')) {
                    return { success: false, error: 'This License Plate is already registered.' };
                }
            }
        }
        return { success: false, error: 'Failed to create vehicle. Please check your input.' };
    }
}

export async function updateVehicle(id: string, data: any) {
    const session = await auth();
    try {
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data
        });
        revalidatePath('/vehicles');
        return { success: true, vehicle };
    } catch (error) {
        return { success: false, error: 'Failed to update vehicle' };
    }
}

// MAINTENANCE ACTIONS
export async function createMaintenance(data: any) {
    const session = await auth();
    try {
        const maintenance = await prisma.maintenanceRecord.create({
            data: {
                vehicleId: data.vehicleId,
                // userId: user.id? Only if we track who created it
                type: data.type,
                status: data.status,
                date: new Date(data.date),
                cost: data.cost,
                description: data.description,
                provider: data.provider
            }
        });
        revalidatePath('/maintenance');
        return { success: true, maintenance };
    } catch (error) {
        console.error('Failed to create maintenance:', error);
        return { success: false, error: 'Failed to create maintenance' };
    }
}

export async function updateMaintenance(id: string, data: any) {
    const session = await auth();
    try {
        const maintenance = await prisma.maintenanceRecord.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined
            }
        });
        revalidatePath('/maintenance');
        return { success: true, maintenance };
    } catch (error) {
        return { success: false, error: 'Failed to update maintenance' };
    }
}

export async function getVehicles() {
    let session;
    try {
        session = await auth();
    } catch (e) {
        console.error('Auth check failed:', e);
        return { success: false, error: 'Auth check failed' };
    }

    try {
        console.log('[getVehicles] Start');
        const user = session?.user as any;
        if (!user) {
            console.log('[getVehicles] No user session');
            return { success: false, error: 'Unauthorized' };
        }
        console.log('[getVehicles] User:', user.email);
        const where = user.role === 'superadmin' ? {} : { companyId: user.companyId };

        const vehicles = await prisma.vehicle.findMany({
            where, // Apply the filter!
            include: {
                driver: true
            },
            orderBy: { updatedAt: 'desc' }
        });
        return { success: true, vehicles };
    } catch (error) {
        console.error('Failed to fetch vehicles:', error);
        return { success: false, error: 'Failed to fetch vehicles' };
    }
}


export async function assignDriver(vehicleId: string, driverId: string) {
    const session = await auth();
    try {
        // 1. Unassign driver from any other vehicle (ensure 1-1 active assignment)
        await prisma.vehicle.updateMany({
            where: { driverId },
            data: { driverId: null }
        });

        // 2. Assign to new vehicle
        const vehicle = await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { driverId }
        });

        revalidatePath('/vehicles');
        return { success: true, vehicle };
    } catch (error) {
        console.error('Failed to assign driver:', error);
        return { success: false, error: 'Failed to assign driver' };
    }
}

export async function unassignDriver(vehicleId: string) {
    const session = await auth();
    try {
        const vehicle = await prisma.vehicle.update({
            where: { id: vehicleId },
            data: { driverId: null }
        });
        revalidatePath('/vehicles');
        return { success: true, vehicle };
    } catch (error) {
        return { success: false, error: 'Failed to unassign driver' };
    }
}

export async function getVehicleHistory(vehicleId: string, start?: string, end?: string) {
    try {
        const startDate = start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default 24h
        const endDate = end ? new Date(end) : new Date();

        const history = await prisma.locationHistory.findMany({
            where: {
                vehicleId,
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { timestamp: 'asc' }
        });

        // Map to format expected by UI (lat, lng, timestamp string)
        // Also handling Prisma weirdness if generated types are old, but TS check passed with any?
        // Let's assume types are OK or rely on JS flexibility.
        const route = history
            .filter(h => h.lat !== 0 || h.lng !== 0)
            .map(h => ({
                lat: h.lat,
                lng: h.lng,
                timestamp: h.timestamp.toISOString(),
                speed: h.speed,
                ignition: h.ignition
            }));

        return { success: true, route };
    } catch (error) {
        console.error('Failed to fetch history:', error);
        return { success: false, error: 'Failed to fetch history', route: [] };
    }
}

export async function getVehicleBehaviorEvents(vehicleId: string) {
    try {
        const events = await prisma.driverBehaviorEvent.findMany({
            where: { vehicleId },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        return {
            success: true,
            events: events.map(e => ({
                id: e.id,
                type: e.type,
                value: e.value,
                timestamp: e.timestamp.toISOString(),
                evidenceUrl: e.evidenceUrl
            }))
        };
    } catch (error) {
        console.error('Failed to fetch behavior events:', error);
        return { success: false, error: 'Failed to fetch behavior events', events: [] };
    }
}

