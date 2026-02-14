import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { MOCK_VEHICLES, MOCK_DRIVERS, Vehicle, Driver, Alert } from "@/utils/mockData";

const DEMO_EMAIL = 'demo@aicrone.com';

// Helper to map DB Vehicle to Interface Vehicle
function mapDbVehicleToInterface(dbVehicle: any): Vehicle {
    return {
        id: dbVehicle.id,
        name: dbVehicle.name,
        plate: dbVehicle.plate,
        imei: dbVehicle.imei || undefined,
        status: dbVehicle.status as 'moving' | 'idle' | 'stopped',
        currentLocation: {
            lat: dbVehicle.lat ?? 0,
            lng: dbVehicle.lng ?? 0,
            timestamp: dbVehicle.lastLocationTime ? dbVehicle.lastLocationTime.toISOString() : new Date().toISOString(),
        },
        fuelLevel: dbVehicle.fuelLevel ?? 0,
        speed: dbVehicle.speed ?? 0,
        driver: dbVehicle.driver ? mapDbDriverToInterface(dbVehicle.driver) : undefined,
        model: dbVehicle.model || undefined,
        year: dbVehicle.year || undefined,
        fuelType: dbVehicle.fuelType as any || undefined,
        lastMaintenance: undefined, // TODO: Fetch maintenance if needed
    };
}

function mapDbDriverToInterface(dbDriver: any): Driver {
    return {
        id: dbDriver.id,
        name: dbDriver.name,
        phone: dbDriver.phone,
        licenseNumber: dbDriver.licenseNumber,
        status: dbDriver.status as 'active' | 'off_duty' | 'on_leave',
        rating: dbDriver.rating,
        joinedDate: dbDriver.joinedDate.toISOString(),
        totalTrips: dbDriver.totalTrips,
        photoUrl: dbDriver.photoUrl || undefined,
        lastActivity: dbDriver.lastActivity ? dbDriver.lastActivity.toISOString() : undefined,
        complianceStatus: dbDriver.complianceStatus as 'compliant' | 'warning' | 'non_compliant',
        licenseExpiryDate: dbDriver.licenseExpiryDate.toISOString(),
    };
}

export async function getVehicles(): Promise<Vehicle[]> {
    const session = await auth();
    // if (session?.user?.email === DEMO_EMAIL) {
    //     return MOCK_VEHICLES;
    // }

    try {
        const user = session?.user as any;
        const where = user?.role === 'superadmin' ? {} : { companyId: user?.companyId };

        const dbVehicles = await prisma.vehicle.findMany({
            where,
            include: { driver: true },
        });
        return dbVehicles.map(mapDbVehicleToInterface);
    } catch (error) {
        console.error("Failed to fetch vehicles from DB:", error);
        return [];
    }
}

export async function getDrivers(): Promise<Driver[]> {
    const session = await auth();
    // if (session?.user?.email === DEMO_EMAIL) {
    //     return MOCK_DRIVERS;
    // }

    try {
        const user = session?.user as any;
        const where = user?.role === 'superadmin' ? {} : { companyId: user?.companyId };

        const dbDrivers = await prisma.driver.findMany({
            where
        });
        return dbDrivers.map(mapDbDriverToInterface);
    } catch (error) {
        console.error("Failed to fetch drivers from DB:", error);
        return [];
    }
}

export async function getMaintenance(): Promise<any[]> {
    const session = await auth();
    try {
        const user = session?.user as any;
        // Maintenance needs to be filtered by vehicles that belong to the company
        // Or if maintenance table has companyId (it doesn't directly, but linked via vehicle)
        // We can query maintenance where vehicle.companyId = user.companyId

        const where = user?.role === 'superadmin' ? {} : {
            vehicle: {
                companyId: user?.companyId
            }
        };

        const maintenance = await prisma.maintenanceRecord.findMany({
            where,
            orderBy: { date: 'desc' },
            include: { vehicle: true } // metrics calculation might need vehicle info
        });

        // Map to interface if needed, or return as is (adjusting for date objects)
        return maintenance.map(m => ({
            ...m,
            date: m.date.toISOString().split('T')[0], // Component expects string YYYY-MM-DD
            // Ensure other fields match MaintenanceRecord interface
        }));
    } catch (error) {
        console.error("Failed to fetch maintenance:", error);
        return [];
    }
}
