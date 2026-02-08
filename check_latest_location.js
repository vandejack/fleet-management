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
            console.log('--- LATEST GPS RAW LOCATION ---');
            console.log(`Packet Time: ${latestHist.timestamp.toISOString()}`);
            console.log(`Latitude:    ${latestHist.lat}`);
            console.log(`Longitude:   ${latestHist.lng}`);
            console.log(`Speed:       ${latestHist.speed}`);
            console.log(`Maps Link:   https://www.google.com/maps?q=${latestHist.lat},${latestHist.lng}`);
        } else {
            console.log('NO DATA FOUND');
        }
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
