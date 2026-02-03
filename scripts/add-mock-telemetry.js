const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📊 Adding mock telemetry data...\n');

    try {
        // Get the first vehicle
        const vehicle = await prisma.vehicle.findFirst({
            orderBy: { createdAt: 'asc' }
        });

        if (!vehicle) {
            console.log('❌ No vehicles found in database');
            return;
        }

        console.log(`✏️  Updating vehicle: ${vehicle.name} (${vehicle.plate})\n`);

        // Update with realistic mock telemetry data
        const updated = await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: {
                ignition: true,                    // Engine ON
                vehicleBattery: 12800,             // 12.8V (in mV)
                internalBattery: 4200,             // 4.2V (in mV)
                gsmSignal: 4,                      // 4 bars (out of 5)
                odometer: 45678.5,                 // 45,678.5 km
                engineHours: 1234.5,               // 1,234.5 hours
                temperature: 85.5                  // 85.5°C
            }
        });

        console.log('✅ Mock telemetry data added successfully!\n');
        console.log('Telemetry values:');
        console.log(`  🔌 Ignition: ${updated.ignition ? 'ON' : 'OFF'}`);
        console.log(`  🔋 Vehicle Battery: ${(updated.vehicleBattery / 1000).toFixed(2)} V`);
        console.log(`  🔋 Internal Battery: ${(updated.internalBattery / 1000).toFixed(2)} V`);
        console.log(`  📶 GSM Signal: ${updated.gsmSignal}/5 bars`);
        console.log(`  🛣️  Odometer: ${updated.odometer.toFixed(1)} km`);
        console.log(`  ⏱️  Engine Hours: ${updated.engineHours.toFixed(1)} hrs`);
        console.log(`  🌡️  Temperature: ${updated.temperature.toFixed(1)} °C`);
        console.log('\n🎯 Now click on this vehicle in the map to see the telemetry data!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
