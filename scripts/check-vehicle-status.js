
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { imei: '863719065062185' }
        });

        console.log('VEHICLE STATUS:');
        if (!vehicle) {
            console.log("Vehicle not found!");
            return;
        }

        console.log(`  Name: ${vehicle.name}`);
        console.log(`  Lat : ${vehicle.lat}`);
        console.log(`  Lng : ${vehicle.lng}`);
        console.log(`  Last: ${vehicle.lastLocationTime ? vehicle.lastLocationTime.toISOString() : 'null'}`);
        console.log(`  Spd : ${vehicle.speed}`);
        console.log(`  Upd : ${vehicle.updatedAt.toISOString()}`);
        console.log(`  Loc : ${JSON.stringify(vehicle.currentLocation)}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
