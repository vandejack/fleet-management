
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== Checking for Recent Movon Data ===");

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check for recent DriverBehaviorEvents (not just SPEEDING)
    const recently = await prisma.driverBehaviorEvent.findMany({
        where: {
            type: { not: 'SPEEDING' },
            timestamp: { gte: today }
        },
        include: {
            vehicle: true,
            driver: true
        },
        orderBy: { timestamp: 'desc' }
    });

    console.log(`\n--- Recently recorded Movon/Behavior Events (Today) ---`);
    if (recently.length === 0) {
        console.log("No non-speeding events recorded today.");
    } else {
        recently.forEach(e => {
            console.log(`[${e.timestamp.toISOString()}] ${e.type} - Vehicle: ${e.vehicle.name} - Driver: ${e.driver?.name || 'N/A'}`);
        });
    }

    // 2. Check all history for today
    const count = await prisma.driverBehaviorEvent.count({
        where: { type: { not: 'SPEEDING' } }
    });
    console.log(`\nTotal Movon/Behavior events in DB: ${count}`);

    // 3. Check Vehicles last activity
    const vehicles = await prisma.vehicle.findMany({
        take: 10,
        orderBy: { lastLocationTime: 'desc' },
        include: { driver: true }
    });

    console.log(`\n--- Recent Vehicle Activity ---`);
    vehicles.forEach(v => {
        console.log(`${v.name} (${v.imei}) - Last Update: ${v.lastLocationTime?.toISOString()} - Status: ${v.status} - Driver: ${v.driver?.name || 'NONE'}`);
    });

    // 4. Suggestion: If events are missing but data is coming, check the assignment
    const unassigned = vehicles.filter(v => !v.driver);
    if (unassigned.length > 0) {
        console.log(`\nWARNING: ${unassigned.length} active vehicles have NO DRIVER assigned. Movon events won't be recorded for them.`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
