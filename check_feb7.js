const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for Data from Feb 7th (Today)...');

    // Set start of today (Feb 7)
    const startOfDay = new Date('2026-02-07T00:00:00Z');

    try {
        const locs = await prisma.locationHistory.findMany({
            where: {
                timestamp: {
                    gte: startOfDay
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log(`Found ${locs.length} records for Feb 7th.`);
        if (locs.length > 0) {
            locs.forEach(l => {
                console.log(`[${l.timestamp.toISOString()}] Speed: ${l.speed}, Lat: ${l.lat}, Lng: ${l.lng}`);
            });
        }

        // Also check raw logs just in case it failed to parse
        const vehicle = await prisma.vehicle.findFirst();
        if (vehicle) {
            console.log(`Vehicle Last Update: ${vehicle.lastLocationTime} (System: ${vehicle.updatedAt})`);
        }

    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
