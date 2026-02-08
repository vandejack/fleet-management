
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const latest = await prisma.locationHistory.findMany({
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        console.log('LATEST MOVEMENT RECORDS:');
        if (latest.length === 0) {
            console.log("No records found.");
        }
        latest.forEach((rec, i) => {
            console.log(`Record ${i}:`);
            console.log(`  Time: ${rec.timestamp.toISOString()}`);
            console.log(`  Lat : ${rec.lat}`);
            console.log(`  Lng : ${rec.lng}`);
            console.log(`  Spd : ${rec.speed} km/h`);
            console.log(`  Ign : ${rec.ignition}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
