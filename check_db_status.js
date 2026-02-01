
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('📡 Testing Database Connection...');

    try {
        // 1. Check Users
        const userCount = await prisma.user.count();
        console.log(`✅ Users Table Accessible. Count: ${userCount}`);

        // 2. Check Drivers
        const driverCount = await prisma.driver.count();
        console.log(`✅ Drivers Table Accessible. Count: ${driverCount}`);

        // 3. Check Vehicles
        const vehicleCount = await prisma.vehicle.count();
        console.log(`✅ Vehicles Table Accessible. Count: ${vehicleCount}`);

        // 4. Simple Query
        const company = await prisma.company.findFirst();
        if (company) {
            console.log(`✅ Company Table Accessible. Found: ${company.name}`);
        } else {
            console.log('⚠️ Company Table Accessible but empty.');
        }

        console.log('🚀 Database Connection is HEALTHY.');

    } catch (error) {
        console.error('❌ Database Connection FAILED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
