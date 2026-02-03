
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== Real-time Event Monitor (Last 15 mins) ===");
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    const events = await prisma.driverBehaviorEvent.findMany({
        where: { timestamp: { gte: fifteenMinsAgo } },
        include: { vehicle: true, driver: true },
        orderBy: { timestamp: 'desc' }
    });

    if (events.length === 0) {
        console.log("No behavior events recorded in the last 15 minutes.");
    } else {
        events.forEach(e => {
            console.log(`[${e.timestamp.toISOString()}] ${e.type} | ${e.vehicle.name} | Driver: ${e.driver?.name || 'N/A'}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
