const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeRawData() {
    try {
        // Find the vehicle
        const vehicle = await prisma.vehicle.findFirst({
            where: { imei: '863719065062185' },
            select: {
                id: true,
                name: true,
                plate: true,
                lat: true,
                lng: true,
                speed: true,
                odometer: true,
                fuelLevel: true,
                engineHours: true,
                temperature: true,
                ignition: true,
                internalBattery: true,
                gsmSignal: true,
                lastLocationTime: true
            }
        });

        console.log('=== VEHICLE CURRENT STATE ===');
        console.log(JSON.stringify(vehicle, null, 2));

        // Get latest location history records
        const recentHistory = await prisma.locationHistory.findMany({
            where: { vehicleId: vehicle.id },
            orderBy: { timestamp: 'desc' },
            take: 5,
            select: {
                timestamp: true,
                lat: true,
                lng: true,
                speed: true,
                odometer: true,
                fuelLevel: true,
                engineHours: true,
                temperature: true,
                ignition: true,
                internalBattery: true,
                gsmSignal: true
            }
        });

        console.log('\n=== RECENT LOCATION HISTORY (Last 5 records) ===');
        console.log(JSON.stringify(recentHistory, null, 2));

        // Check which fields are being populated
        console.log('\n=== FIELD POPULATION ANALYSIS ===');
        const fieldStats = {
            lat: 0, lng: 0, speed: 0, odometer: 0, fuelLevel: 0,
            engineHours: 0, temperature: 0, ignition: 0,
            internalBattery: 0, gsmSignal: 0
        };

        recentHistory.forEach(record => {
            if (record.lat !== null) fieldStats.lat++;
            if (record.lng !== null) fieldStats.lng++;
            if (record.speed !== null) fieldStats.speed++;
            if (record.odometer !== null) fieldStats.odometer++;
            if (record.fuelLevel !== null) fieldStats.fuelLevel++;
            if (record.engineHours !== null) fieldStats.engineHours++;
            if (record.temperature !== null) fieldStats.temperature++;
            if (record.ignition !== null) fieldStats.ignition++;
            if (record.internalBattery !== null) fieldStats.internalBattery++;
            if (record.gsmSignal !== null) fieldStats.gsmSignal++;
        });

        console.log('Fields populated (out of 5 records):');
        Object.entries(fieldStats).forEach(([field, count]) => {
            const status = count === 5 ? '✅' : count > 0 ? '⚠️' : '❌';
            console.log(`  ${status} ${field}: ${count}/5`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeRawData();
