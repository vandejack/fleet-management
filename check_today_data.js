const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for TODAY\'s GPS Data...\n');

    try {
        // Get today's date in UTC
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log(`📅 Checking data from: ${today.toISOString()}\n`);

        // Check location history from today
        const todayLocations = await prisma.locationHistory.findMany({
            where: {
                timestamp: {
                    gte: today
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
            include: { vehicle: true }
        });

        console.log(`📍 Location Records from Today: ${todayLocations.length} records\n`);

        if (todayLocations.length > 0) {
            console.log('Latest records:');
            todayLocations.forEach(loc => {
                console.log(`  • ${loc.vehicle?.name || 'Unknown'} (IMEI: ${loc.vehicle?.imei || 'N/A'})`);
                console.log(`    Lat: ${loc.lat}, Lng: ${loc.lng}, Speed: ${loc.speed} km/h`);
                console.log(`    Timestamp: ${loc.timestamp}`);
                console.log('');
            });
        } else {
            console.log('❌ No location data received today yet.');
            console.log('   Waiting for GPS device to send data...\n');
        }

        // Check last update times for all vehicles
        console.log('🚗 All Vehicles Last Update Times:');
        const allVehicles = await prisma.vehicle.findMany({
            orderBy: { lastLocationTime: 'desc' }
        });

        allVehicles.forEach(v => {
            const lastUpdate = v.lastLocationTime ? new Date(v.lastLocationTime) : null;
            const isToday = lastUpdate && lastUpdate >= today;
            console.log(`  ${isToday ? '✅' : '❌'} ${v.name} - Last: ${v.lastLocationTime || 'Never'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
