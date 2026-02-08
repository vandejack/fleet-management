const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    try {
        const latestHist = await prisma.locationHistory.findFirst({
            where: { vehicle: { imei } },
            orderBy: { timestamp: 'desc' }
        });

        if (latestHist) {
            console.log('--- LATEST PACKET ---');
            console.log(`Server Received: ${new Date().toISOString()}`); // Approximation
            console.log(`Packet Time:     ${latestHist.timestamp.toISOString()}`);
            console.log(`Speed:           ${latestHist.speed}`);
            console.log(`Ignition:        ${latestHist.ignition}`);
        } else {
            console.log('NO DATA FOUND');
        }
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
