const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for Data from Feb 5th...');
    const targetDate = new Date('2026-02-05T00:00:00Z');
    const endDate = new Date('2026-02-05T23:59:59Z');

    const locs = await prisma.locationHistory.findMany({
        where: {
            timestamp: {
                gte: targetDate,
                lte: endDate
            }
        },
        take: 5
    });

    console.log(`Found ${locs.length} records for Feb 5th.`);
    if (locs.length > 0) {
        console.log('Sample:', locs[0]);
    }
}
main();
