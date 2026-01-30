
import { PrismaClient } from '@prisma/client';
import { MOCK_VEHICLES, MOCK_DRIVERS, MOCK_MAINTENANCE } from '../src/utils/mockData';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up mock data...');

    // Delete seeded vehicles by plate
    const mockPlates = MOCK_VEHICLES.map(v => v.plate);

    // Find IDs of mock vehicles first
    const mockVehicles = await prisma.vehicle.findMany({
        where: { plate: { in: mockPlates } },
        select: { id: true }
    });
    const mockVehicleIds = mockVehicles.map(v => v.id);

    // Delete related FuelTransactions
    await prisma.fuelTransaction.deleteMany({
        where: { vehicleId: { in: mockVehicleIds } }
    });

    // Delete related MaintenanceRecords
    await prisma.maintenanceRecord.deleteMany({
        where: { vehicleId: { in: mockVehicleIds } }
    });

    // Delete related Alerts
    await prisma.alert.deleteMany({
        where: { vehicleId: { in: mockVehicleIds } }
    });

    // Now delete vehicles
    const { count: vCount } = await prisma.vehicle.deleteMany({
        where: { id: { in: mockVehicleIds } }
    });
    console.log(`Deleted ${vCount} mock vehicles.`);

    // Delete seeded drivers by license number
    const mockLicenses = MOCK_DRIVERS.map(d => d.licenseNumber);
    const { count: dCount } = await prisma.driver.deleteMany({
        where: { licenseNumber: { in: mockLicenses } }
    });
    console.log(`Deleted ${dCount} mock drivers.`);

    // Maintenance records linked to these will be deleted via cascade if set, 
    // but Prisma relation Actions usually restrict. 
    // We should've deleted maintenance linked to vehicles?
    // Let's delete maintenance with explicit providers from mock data if needed, 
    // but normally deleting vehicle handles it if cascade is on.
    // If not, we might error. Let's try.
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
