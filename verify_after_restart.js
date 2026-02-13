const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAfterRestart() {
    try {
        console.log('===========================================');
        console.log('  VERIFICATION AFTER TELTONIKA RESTART');
        console.log('===========================================\n');

        const vehicle = await prisma.vehicle.findFirst({
            where: { imei: '863719065062185' }
        });

        if (!vehicle) {
            console.log('❌ Vehicle not found!');
            return;
        }

        console.log(`Vehicle: ${vehicle.name} (${vehicle.plate})`);
        console.log(`IMEI: 863719065062185\n`);

        // Get timestamp 5 minutes ago to check recent data
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        console.log('===========================================');
        console.log('  TEST 1: TELEMETRY DATA IN LOCATION HISTORY');
        console.log('===========================================\n');

        const recentHistory = await prisma.locationHistory.findMany({
            where: {
                vehicleId: vehicle.id,
                timestamp: { gte: fiveMinutesAgo }
            },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log(`Found ${recentHistory.length} records in last 5 minutes\n`);

        if (recentHistory.length === 0) {
            console.log('⚠️  No new data in last 5 minutes. Wait for device to send data.\n');
        } else {
            let hasOdometer = 0;
            let hasFuel = 0;
            let hasEngine = 0;
            let hasTemp = 0;
            let hasIgnition = 0;
            let hasBattery = 0;
            let hasGSM = 0;

            recentHistory.forEach((record, idx) => {
                console.log(`Record ${idx + 1} - ${record.timestamp.toISOString()}`);
                console.log(`  Position: ${record.lat}, ${record.lng}`);
                console.log(`  Speed: ${record.speed} km/h`);

                const odoStatus = record.odometer !== null ? '✅' : '❌';
                const fuelStatus = record.fuelLevel !== null ? '✅' : '❌';
                const engineStatus = record.engineHours !== null ? '✅' : '❌';
                const tempStatus = record.temperature !== null ? '✅' : '❌';
                const ignitionStatus = record.ignition !== null ? '✅' : '❌';
                const batteryStatus = record.internalBattery !== null ? '✅' : '❌';
                const gsmStatus = record.gsmSignal !== null ? '✅' : '❌';

                console.log(`  ${odoStatus} Odometer: ${record.odometer !== null ? record.odometer + ' km' : 'NULL'}`);
                console.log(`  ${fuelStatus} Fuel Level: ${record.fuelLevel !== null ? record.fuelLevel + '%' : 'NULL'}`);
                console.log(`  ${engineStatus} Engine Hours: ${record.engineHours !== null ? record.engineHours + ' hrs' : 'NULL'}`);
                console.log(`  ${tempStatus} Temperature: ${record.temperature !== null ? record.temperature + '°C' : 'NULL'}`);
                console.log(`  ${ignitionStatus} Ignition: ${record.ignition !== null ? record.ignition : 'NULL'}`);
                console.log(`  ${batteryStatus} Battery: ${record.internalBattery !== null ? record.internalBattery + ' mV' : 'NULL'}`);
                console.log(`  ${gsmStatus} GSM Signal: ${record.gsmSignal !== null ? record.gsmSignal : 'NULL'}`);
                console.log('');

                if (record.odometer !== null) hasOdometer++;
                if (record.fuelLevel !== null) hasFuel++;
                if (record.engineHours !== null) hasEngine++;
                if (record.temperature !== null) hasTemp++;
                if (record.ignition !== null) hasIgnition++;
                if (record.internalBattery !== null) hasBattery++;
                if (record.gsmSignal !== null) hasGSM++;
            });

            console.log('Summary:');
            console.log(`  Odometer: ${hasOdometer}/${recentHistory.length} ${hasOdometer > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log(`  Fuel Level: ${hasFuel}/${recentHistory.length} ${hasFuel > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log(`  Engine Hours: ${hasEngine}/${recentHistory.length} ${hasEngine > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log(`  Temperature: ${hasTemp}/${recentHistory.length} ${hasTemp > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log(`  Ignition: ${hasIgnition}/${recentHistory.length} ${hasIgnition > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log(`  Battery: ${hasBattery}/${recentHistory.length} ${hasBattery > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log(`  GSM Signal: ${hasGSM}/${recentHistory.length} ${hasGSM > 0 ? '✅ WORKING' : '❌ STILL MISSING'}`);
            console.log('');
        }

        console.log('===========================================');
        console.log('  TEST 2: SPEEDING EVENTS');
        console.log('===========================================\n');

        const speedingEvents = await prisma.driverBehaviorEvent.findMany({
            where: {
                vehicleId: vehicle.id,
                type: 'SPEEDING',
                timestamp: { gte: fiveMinutesAgo }
            },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log(`Found ${speedingEvents.length} SPEEDING events in last 5 minutes\n`);

        if (speedingEvents.length === 0) {
            console.log('⚠️  No speeding events yet. This is normal if vehicle hasn\'t exceeded 100 km/h.\n');

            // Check if there are any old speeding events
            const oldSpeedingCount = await prisma.driverBehaviorEvent.count({
                where: {
                    vehicleId: vehicle.id,
                    type: 'SPEEDING'
                }
            });

            console.log(`Total SPEEDING events (all time): ${oldSpeedingCount}`);
            if (oldSpeedingCount === 1) {
                console.log('  (This is probably the manual test event)\n');
            }
        } else {
            speedingEvents.forEach((event, idx) => {
                console.log(`✅ Event ${idx + 1}:`);
                console.log(`   Time: ${event.timestamp.toISOString()}`);
                console.log(`   Speed: ${event.value} km/h`);
                console.log(`   Driver ID: ${event.driverId}`);
                console.log('');
            });
        }

        console.log('===========================================');
        console.log('  TEST 3: OTHER BEHAVIOR EVENTS');
        console.log('===========================================\n');

        const recentEvents = await prisma.driverBehaviorEvent.findMany({
            where: {
                vehicleId: vehicle.id,
                timestamp: { gte: fiveMinutesAgo }
            },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        console.log(`Found ${recentEvents.length} behavior events in last 5 minutes\n`);

        if (recentEvents.length > 0) {
            const eventCounts = {};
            recentEvents.forEach(event => {
                eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
            });

            console.log('Event breakdown:');
            Object.entries(eventCounts).forEach(([type, count]) => {
                console.log(`  ${type}: ${count} events`);
            });
            console.log('');
        }

        console.log('===========================================');
        console.log('  FINAL VERDICT');
        console.log('===========================================\n');

        if (recentHistory.length === 0) {
            console.log('⏳ WAITING FOR DATA');
            console.log('   No new GPS data in last 5 minutes.');
            console.log('   Please wait for device to send data, then run this script again.\n');
        } else {
            const hasAnyTelemetry = recentHistory.some(r =>
                r.odometer !== null ||
                r.fuelLevel !== null ||
                r.engineHours !== null
            );

            if (hasAnyTelemetry) {
                console.log('✅ SUCCESS! TELEMETRY DATA IS NOW BEING SAVED!');
                console.log('   - LocationHistory now contains telemetry data');
                console.log('   - Fuel Analytics will now work');
                console.log('   - Historical tracking is active\n');
            } else {
                console.log('❌ STILL BROKEN');
                console.log('   - Telemetry data still NULL in LocationHistory');
                console.log('   - Possible causes:');
                console.log('     1. teltonika-server not restarted yet');
                console.log('     2. Old code still running');
                console.log('     3. Device not sending IO data\n');
                console.log('   Next steps:');
                console.log('     1. Check: pm2 logs teltonika-server');
                console.log('     2. Verify: pm2 info teltonika-server (check restart time)');
                console.log('     3. Confirm: git pull was successful\n');
            }
        }

        console.log('===========================================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAfterRestart();
