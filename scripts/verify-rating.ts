
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Driver Ratings ---");

    // 1. Check Events
    const events = await prisma.driverBehaviorEvent.count();
    console.log(`Total Behavior Events: ${events}`);

    if (events > 0) {
        const lastEvent = await prisma.driverBehaviorEvent.findFirst({
            orderBy: { timestamp: 'desc' },
            include: { driver: true }
        });
        console.log(`Last Event: ${lastEvent?.type} value=${lastEvent?.value} for ${lastEvent?.driver.name} at ${lastEvent?.timestamp.toISOString()}`);
    }

    // 2. Check Drivers
    const drivers = await prisma.driver.findMany({
        where: { vehicles: { some: {} } }, // Only drivers with vehicles
        include: { vehicles: true }
    });

    for (const d of drivers) {
        console.log(`Driver: ${d.name} | Rating: ${d.rating} | Vehicle: ${d.vehicles[0]?.plate}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
