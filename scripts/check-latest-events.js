
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatest() {
    try {
        const events = await prisma.driverBehaviorEvent.findMany({
            orderBy: { timestamp: 'desc' },
            take: 10
        });
        console.log('LATEST EVENTS:');
        events.forEach(e => {
            console.log(`- ${e.timestamp.toISOString()} | TYPE: ${e.type} | ID: ${e.id}`);
        });

        const latestLoc = await prisma.locationHistory.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        console.log(`LATEST LOCATION: ${latestLoc ? latestLoc.timestamp.toISOString() : 'NONE'}`);

        const vehicle = await prisma.vehicle.findUnique({
            where: { imei: '863719065062185' }
        });
        console.log('VEHICLE STATUS:', JSON.stringify(vehicle, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatest();
