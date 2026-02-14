import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking driver data in database...\n');

    const drivers = await prisma.driver.findMany({
        take: 5,
        orderBy: { name: 'asc' }
    });

    console.log(`Found ${drivers.length} drivers:\n`);

    drivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name}`);
        console.log(`   Phone: ${driver.phone}`);
        console.log(`   License: ${driver.licenseNumber}`);
        console.log(`   Status: ${driver.status}`);
        console.log(`   Rating: ${driver.rating}`);
        console.log(`   Total Trips: ${driver.totalTrips}`);
        console.log(`   Last Activity: ${driver.lastActivity || 'NULL'}`);
        console.log(`   Compliance: ${driver.complianceStatus}`);
        console.log(`   License Expiry: ${driver.licenseExpiryDate}`);
        console.log('');
    });

    // Check for any drivers with NULL or default values
    const driversWithNullActivity = await prisma.driver.count({
        where: { lastActivity: null }
    });

    const driversWithZeroTrips = await prisma.driver.count({
        where: { totalTrips: 0 }
    });

    console.log('📊 Summary:');
    console.log(`   Drivers with NULL lastActivity: ${driversWithNullActivity}`);
    console.log(`   Drivers with 0 totalTrips: ${driversWithZeroTrips}`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
