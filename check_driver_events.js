const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Latest Driver Behavior Events...');

    try {
        const events = await prisma.driverBehaviorEvent.findMany({
            orderBy: { timestamp: 'desc' },
            take: 10,
            include: { vehicle: true } // Include vehicle details if needed
        });

        if (events.length > 0) {
            console.log(`Found ${events.length} events in DB:`);
            events.forEach(e => {
                console.log(`[${e.timestamp.toISOString()}] Type: ${e.type} | Value: ${e.value} | Vehicle: ${e.vehicle?.imei}`);
            });
        } else {
            console.log('❌ No Driver Behavior Events found in DB.');
        }

    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
