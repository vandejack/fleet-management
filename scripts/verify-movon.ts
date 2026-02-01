
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Movon Events ---");

    // 1. Check Events
    const events = await prisma.driverBehaviorEvent.findMany({
        where: { type: { in: ['DROWSINESS', 'DISTRACTION', 'YAWNING', 'PHONE_USAGE'] } },
        orderBy: { timestamp: 'desc' },
        take: 5,
        include: { driver: true }
    });

    console.log(`Found ${events.length} Movon events.`);

    for (const e of events) {
        console.log(`Event: ${e.type} | Value: ${e.value} | Driver: ${e.driver.name} | Time: ${e.timestamp.toISOString()}`);
    }

    // 2. Check Driver Rating (Rifani should be lower than 5.0)
    const driver = await prisma.driver.findFirst({
        where: { name: 'Rifani' } // Assuming this is the driver for the test vehicle
    });

    if (driver) {
        console.log(`Driver ${driver.name} Rating: ${driver.rating}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
