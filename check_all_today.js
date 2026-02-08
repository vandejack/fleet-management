const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for ALL TODAY\'s Data (GPS + Events)...\n');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(`📅 Since: ${today.toISOString()}\n`);

        // 1. Location History
        const locations = await prisma.locationHistory.findMany({
            where: { timestamp: { gte: today } },
            orderBy: { timestamp: 'desc' },
            take: 5
        });
        console.log(`📍 GPS Records: ${locations.length}`);
        if (locations.length > 0) console.log(`   Latest: ${locations[0].timestamp}, Speed: ${locations[0].speed}`);

        // 2. Driver Behavior Events
        const events = await prisma.driverBehaviorEvent.findMany({
            where: { timestamp: { gte: today } },
            orderBy: { timestamp: 'desc' },
            take: 5
        });
        console.log(`⚠️ Behavior Events: ${events.length}`);
        if (events.length > 0) {
            events.forEach(e => console.log(`   • ${e.type} @ ${e.timestamp} (Val: ${e.value})`));
        }

        // 3. Raw Data logs (if we had a table, but we don't. We check identifying info)

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
