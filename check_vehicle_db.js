const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    console.log(`🔍 Checking Vehicle Record for IMEI: ${imei}`);

    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { imei: imei }
        });

        if (vehicle) {
            console.log('Vehicle Found:');
            console.log(`ID: ${vehicle.id}`);
            console.log(`Name: ${vehicle.name}`);
            console.log(`Last Location Time: ${vehicle.lastLocationTime} (ISO: ${vehicle.lastLocationTime?.toISOString()})`);
            console.log(`Updated At: ${vehicle.updatedAt}`);
        } else {
            console.log('❌ Vehicle not found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
