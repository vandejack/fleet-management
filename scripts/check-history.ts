
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Location History...");

    const vehicles = await prisma.vehicle.findMany();
    if (vehicles.length === 0) {
        console.log("No vehicles found.");
        return;
    }

    for (const v of vehicles) {
        const count = await prisma.locationHistory.count({
            where: { vehicleId: v.id }
        });
        console.log(`Vehicle ${v.name} (${v.plate}): ${count} history records`);

        if (count > 0) {
            const first = await prisma.locationHistory.findFirst({ where: { vehicleId: v.id }, orderBy: { timestamp: 'asc' } });
            const last = await prisma.locationHistory.findFirst({ where: { vehicleId: v.id }, orderBy: { timestamp: 'desc' } });
            console.log(`  Range: ${first?.timestamp.toISOString()} - ${last?.timestamp.toISOString()}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
