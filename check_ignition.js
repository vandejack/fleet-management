const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    console.log(`🔍 Checking Ignition Status for IMEI: ${imei}...`);

    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
        if (!vehicle) {
            console.log('Vehicle not found');
            return;
        }

        // Get latest history
        const history = await prisma.locationHistory.findMany({
            where: { vehicleId: vehicle.id },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        if (history.length > 0) {
            console.log(`Found ${history.length} records.`);
            history.forEach((h, index) => {
                console.log(`[${index}] Time: ${h.timestamp.toISOString()} | Ignition: ${h.ignition}`);
            });
        } else {
            console.log('❌ No Location History found.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
