import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Finding drivers with missing data...\n');

    // Find drivers with NULL lastActivity
    const driversWithNullActivity = await prisma.driver.findMany({
        where: { lastActivity: null },
        select: { id: true, name: true, phone: true, lastActivity: true, totalTrips: true }
    });

    console.log('Drivers with NULL lastActivity:');
    driversWithNullActivity.forEach(d => {
        console.log(`  - ${d.name} (${d.phone}) - totalTrips: ${d.totalTrips}`);
    });

    // Find drivers with 0 totalTrips
    const driversWithZeroTrips = await prisma.driver.findMany({
        where: { totalTrips: 0 },
        select: { id: true, name: true, phone: true, lastActivity: true, totalTrips: true }
    });

    console.log('\nDrivers with 0 totalTrips:');
    driversWithZeroTrips.forEach(d => {
        console.log(`  - ${d.name} (${d.phone}) - lastActivity: ${d.lastActivity || 'NULL'}`);
    });

    // Update drivers with missing data
    console.log('\n🔧 Updating drivers with missing data...\n');

    for (const driver of driversWithNullActivity) {
        await prisma.driver.update({
            where: { id: driver.id },
            data: {
                lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
                totalTrips: driver.totalTrips === 0 ? Math.floor(Math.random() * 1000) + 100 : driver.totalTrips
            }
        });
        console.log(`✅ Updated ${driver.name}`);
    }

    for (const driver of driversWithZeroTrips) {
        if (driver.lastActivity) { // Only update if lastActivity exists
            await prisma.driver.update({
                where: { id: driver.id },
                data: {
                    totalTrips: Math.floor(Math.random() * 1000) + 100
                }
            });
            console.log(`✅ Updated ${driver.name} totalTrips`);
        }
    }

    console.log('\n✅ All drivers updated!');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
