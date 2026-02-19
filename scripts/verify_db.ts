import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Connection Verification ---');
    try {
        console.log('1. Attempting to connect to Database...');
        await prisma.$connect();
        console.log('✅ Connected successfully.');

        console.log('2. Checking latest LocationHistory...');
        const latestHistory = await prisma.locationHistory.findFirst({
            orderBy: { timestamp: 'desc' }
        });

        if (latestHistory) {
            console.log(`✅ Latest LocationHistory found: ${latestHistory.timestamp.toISOString()}`);
            console.log(`   VehicleID: ${latestHistory.vehicleId}`);
        } else {
            console.log('⚠️ No LocationHistory records found.');
        }

        console.log('3. Checking Vehicle count...');
        const count = await prisma.vehicle.count();
        console.log(`✅ Total Vehicles: ${count}`);

    } catch (e: any) {
        console.error('❌ Database Error:', e.message);
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
