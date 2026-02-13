const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIOData() {
    try {
        console.log('=== CHECKING WHAT IO DATA IS BEING RECEIVED ===\n');

        // Get vehicle
        const vehicle = await prisma.vehicle.findFirst({
            where: { imei: '863719065062185' }
        });

        if (!vehicle) {
            console.log('Vehicle not found!');
            return;
        }

        console.log(`Vehicle: ${vehicle.name} (${vehicle.plate})`);
        console.log(`IMEI: 863719065062185\n`);

        // Check recent location history with ALL fields
        const recent = await prisma.locationHistory.findMany({
            where: { vehicleId: vehicle.id },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        console.log('=== LAST 10 LOCATION HISTORY RECORDS ===\n');

        recent.forEach((record, idx) => {
            console.log(`Record ${idx + 1} - ${record.timestamp.toISOString()}`);
            console.log(`  Position: ${record.lat}, ${record.lng}`);
            console.log(`  Speed: ${record.speed} km/h`);
            console.log(`  Odometer: ${record.odometer !== null ? record.odometer + ' km' : 'NULL ❌'}`);
            console.log(`  Fuel Level: ${record.fuelLevel !== null ? record.fuelLevel + '%' : 'NULL ❌'}`);
            console.log(`  Engine Hours: ${record.engineHours !== null ? record.engineHours + ' hrs' : 'NULL ❌'}`);
            console.log(`  Temperature: ${record.temperature !== null ? record.temperature + '°C' : 'NULL ❌'}`);
            console.log(`  Ignition: ${record.ignition !== null ? record.ignition : 'NULL ❌'}`);
            console.log(`  Battery: ${record.internalBattery !== null ? record.internalBattery + ' mV' : 'NULL ❌'}`);
            console.log(`  GSM Signal: ${record.gsmSignal !== null ? record.gsmSignal : 'NULL ❌'}`);
            console.log('');
        });

        // Summary
        console.log('=== SUMMARY ===\n');
        const hasOdometer = recent.filter(r => r.odometer !== null).length;
        const hasFuel = recent.filter(r => r.fuelLevel !== null).length;
        const hasEngine = recent.filter(r => r.engineHours !== null).length;
        const hasTemp = recent.filter(r => r.temperature !== null).length;
        const hasIgnition = recent.filter(r => r.ignition !== null).length;
        const hasBattery = recent.filter(r => r.internalBattery !== null).length;
        const hasGSM = recent.filter(r => r.gsmSignal !== null).length;

        console.log(`Odometer: ${hasOdometer}/10 records ${hasOdometer === 0 ? '❌ MISSING' : hasOdometer < 10 ? '⚠️ PARTIAL' : '✅'}`);
        console.log(`Fuel Level: ${hasFuel}/10 records ${hasFuel === 0 ? '❌ MISSING' : hasFuel < 10 ? '⚠️ PARTIAL' : '✅'}`);
        console.log(`Engine Hours: ${hasEngine}/10 records ${hasEngine === 0 ? '❌ MISSING' : hasEngine < 10 ? '⚠️ PARTIAL' : '✅'}`);
        console.log(`Temperature: ${hasTemp}/10 records ${hasTemp === 0 ? '❌ MISSING' : hasTemp < 10 ? '⚠️ PARTIAL' : '✅'}`);
        console.log(`Ignition: ${hasIgnition}/10 records ${hasIgnition === 0 ? '❌ MISSING' : hasIgnition < 10 ? '⚠️ PARTIAL' : '✅'}`);
        console.log(`Battery: ${hasBattery}/10 records ${hasBattery === 0 ? '❌ MISSING' : hasBattery < 10 ? '⚠️ PARTIAL' : '✅'}`);
        console.log(`GSM Signal: ${hasGSM}/10 records ${hasGSM === 0 ? '❌ MISSING' : hasGSM < 10 ? '⚠️ PARTIAL' : '✅'}`);

        console.log('\n=== CURRENT VEHICLE STATE ===\n');
        console.log(`Odometer: ${vehicle.odometer} km`);
        console.log(`Fuel Level: ${vehicle.fuelLevel}%`);
        console.log(`Engine Hours: ${vehicle.engineHours} hrs`);
        console.log(`Temperature: ${vehicle.temperature}°C`);
        console.log(`Ignition: ${vehicle.ignition}`);
        console.log(`Battery: ${vehicle.internalBattery} mV`);
        console.log(`GSM Signal: ${vehicle.gsmSignal}`);
        console.log(`Last Update: ${vehicle.lastLocationTime}`);

        if (hasOdometer === 0 && hasFuel === 0) {
            console.log('\n⚠️  WARNING: Telemetry data is in Vehicle table but NOT in LocationHistory!');
            console.log('This means:');
            console.log('  1. Device IS sending the data (visible in Vehicle table)');
            console.log('  2. But teltonika-server is NOT saving it to LocationHistory');
            console.log('  3. Possible cause: Old code still running, needs restart');
            console.log('\nSOLUTION: Restart teltonika-server after deploying latest code');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkIOData();
