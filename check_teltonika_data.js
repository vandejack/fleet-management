const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📡 Checking Teltonika Data Reception...\n');

    try {
        // 1. Check latest location history
        const latestLocations = await prisma.locationHistory.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' },
            include: { vehicle: true }
        });

        console.log('🗺️ Latest Location History (5 records):');
        if (latestLocations.length > 0) {
            latestLocations.forEach(loc => {
                console.log(`  • ${loc.vehicle?.name || 'Unknown'} (${loc.vehicle?.imei || 'N/A'})`);
                console.log(`    Lat: ${loc.lat}, Lng: ${loc.lng}, Speed: ${loc.speed} km/h`);
                console.log(`    Time: ${loc.timestamp}`);
            });
        } else {
            console.log('  ❌ No location history found.');
        }

        console.log('\n🚗 Vehicles with recent updates:');
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { lastLocationTime: 'desc' },
            take: 5
        });

        vehicles.forEach(v => {
            console.log(`  • ${v.name} (IMEI: ${v.imei || 'N/A'})`);
            console.log(`    Last Update: ${v.lastLocationTime}`);
            console.log(`    Status: ${v.status}, Speed: ${v.speed} km/h`);
        });

        console.log('\n📊 Total Records:');
        const historyCount = await prisma.locationHistory.count();
        const vehicleCount = await prisma.vehicle.count();
        console.log(`  • Location History: ${historyCount} records`);
        console.log(`  • Vehicles: ${vehicleCount} units`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
