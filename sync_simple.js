const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
    const latestHist = await prisma.locationHistory.findFirst({
        where: { vehicleId: vehicle.id },
        orderBy: { timestamp: 'desc' }
    });

    if (latestHist) {
        console.log(`Updating to: ${latestHist.timestamp}`);
        try {
            await prisma.vehicle.update({
                where: { id: vehicle.id },
                data: {
                    lastLocationTime: latestHist.timestamp,
                    updatedAt: new Date() // Force update updated_at
                }
            });
            console.log('SUCCESS');
        } catch (e) {
            console.log('ERROR_CODE:', e.code);
            console.log('ERROR_MSG:', e.message);
        }
    }
}
main();
