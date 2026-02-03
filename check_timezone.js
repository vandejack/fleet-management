const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTimezone() {
    console.log('🕐 Timezone Check\n');

    // Server time
    const now = new Date();
    console.log('Server Time (UTC):', now.toISOString());
    console.log('Server Time (WIB):', now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    console.log('');

    // Latest GPS data timestamp
    const latest = await prisma.locationHistory.findFirst({
        orderBy: { timestamp: 'desc' },
        include: { vehicle: true }
    });

    if (latest) {
        console.log('Latest GPS Record:');
        console.log('  Vehicle:', latest.vehicle?.name);
        console.log('  Timestamp (UTC):', latest.timestamp.toISOString());
        console.log('  Timestamp (WIB):', latest.timestamp.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
        console.log('');

        // Time difference
        const diff = Math.abs(now - latest.timestamp) / 1000 / 60; // minutes
        console.log(`  Age: ${Math.floor(diff)} minutes ago`);
    }

    await prisma.$disconnect();
}

checkTimezone();
