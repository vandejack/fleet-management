
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- RECENT LOCATION HISTORY (Latest 3) ---');
        const history = await prisma.locationHistory.findMany({
            orderBy: { timestamp: 'desc' },
            take: 3
        });
        history.forEach(r => console.log(`[HIST] ${r.timestamp.toISOString()} | Lat: ${r.lat}, Lng: ${r.lng} | Spd: ${r.speed}`));

        console.log('\n--- VEHICLE STATUS (Pajero) ---');
        const vehicle = await prisma.vehicle.findUnique({
            where: { imei: '863719065062185' }
        });
        if (vehicle) {
            console.log(`[VEH] LastLocTime: ${vehicle.lastLocationTime ? vehicle.lastLocationTime.toISOString() : 'NULL'}`);
            console.log(`[VEH] Lat: ${vehicle.lat}, Lng: ${vehicle.lng}`);
            console.log(`[VEH] UpdatedAt: ${vehicle.updatedAt.toISOString()}`);
        } else {
            console.log('[VEH] Not Found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
