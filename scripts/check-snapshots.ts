
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSnapshots() {
    const events = await prisma.driverBehaviorEvent.findMany({
        where: {
            evidenceUrl: { not: null }
        },
        take: 5
    });

    console.log(`Found ${events.length} events with snapshots:`);
    console.log(JSON.stringify(events, null, 2));

    const allEventsCount = await prisma.driverBehaviorEvent.count();
    console.log(`Total events in DB: ${allEventsCount}`);
}

checkSnapshots()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
