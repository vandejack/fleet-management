const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    console.log(`🔍 Checking Latest GPS Transmit for IMEI: ${imei}`);
    console.log(`🕒 Current Server Time: ${new Date().toISOString()}`);

    try {
        // 1. Check Vehicle Status
        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
        if (vehicle) {
            console.log('\n--- VEHICLE STATUS ---');
            console.log(`Last Location Time: ${vehicle.lastLocationTime ? vehicle.lastLocationTime.toISOString() : 'N/A'}`);
            console.log(`System Updated At:  ${vehicle.updatedAt.toISOString()}`);
        } else {
            console.log('❌ Vehicle not found in DB.');
        }

        // 2. Check Recent History
        const recentHistory = await prisma.locationHistory.findMany({
            where: { vehicleId: vehicle?.id },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log(`\n--- LATEST 5 PACKETS ---`);
        if (recentHistory.length > 0) {
            recentHistory.forEach((h, i) => {
                console.log(`[${i}] Time: ${h.timestamp.toISOString()} | Speed: ${h.speed} | Lat/Lng: ${h.lat},${h.lng} | Ign: ${h.ignition}`);
            });
        } else {
            console.log('❌ No history records found.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
