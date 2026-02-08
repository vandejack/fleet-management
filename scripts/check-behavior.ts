
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- Latest Driver Behavior Events ---');
    const events = await prisma.driverBehaviorEvent.findMany({
        take: 20,
        orderBy: { timestamp: 'desc' },
        include: {
            vehicle: { select: { name: true, plate: true } },
            driver: { select: { name: true } }
        }
    });

    if (events.length === 0) {
        console.log('No events found.');
    } else {
        events.forEach(e => {
            console.log(`[${e.timestamp.toISOString()}] ${e.vehicle.name} (${e.vehicle.plate}): ${e.type} - ${e.severity}`);
        });
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
