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
        status: dbVehicle.status as 'moving' | 'idle' | 'stopped',
        currentLocation: {
            lat: dbVehicle.lat,
            lng: dbVehicle.lng,
            timestamp: dbVehicle.lastLocationTime.toISOString(),
        },
        fuelLevel: dbVehicle.fuelLevel,
        speed: dbVehicle.speed,
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
