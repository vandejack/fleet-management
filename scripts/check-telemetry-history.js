
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const latest = await prisma.locationHistory.findMany({
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log('LATEST LOCATION HISTORY RECORDS:');
        latest.forEach((rec, i) => {
            console.log(`Record ${i}:`);
            console.log(`  Time: ${rec.timestamp.toISOString()}`);
            console.log(`  Odo : ${rec.odometer}`);
            console.log(`  EH  : ${rec.engineHours}`);
            console.log(`  Temp: ${rec.temperature}`);
            console.log(`  Fuel: ${rec.fuelLevel}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
