const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    console.log(`🔍 Checking Latest Telemetry for IMEI: ${imei}...`);

    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
        if (!vehicle) { console.log('Vehicle not found'); return; }

        console.log('--- VEHICLE TABLE (Current Status) ---');
        console.log(`Last Update: ${vehicle.lastLocationTime}`);
        console.log(`Ignition: ${vehicle.ignition}`);
        console.log(`Vehicle Battery: ${vehicle.vehicleBattery}`);
        console.log(`Internal Battery: ${vehicle.internalBattery}`);
        console.log(`GSM Signal: ${vehicle.gsmSignal}`);
        console.log(`Odometer: ${vehicle.odometer}`);
        console.log(`Engine Hours: ${vehicle.engineHours}`);
        console.log(`Temperature: ${vehicle.temperature}`);

        // Get latest history to check incoming packets
        const latestHist = await prisma.locationHistory.findFirst({
            where: { vehicleId: vehicle.id },
            orderBy: { timestamp: 'desc' }
        });

        if (latestHist) {
            console.log('\n--- LATEST HISTORY PACKET ---');
            console.log(`Timestamp: ${latestHist.timestamp}`);
            console.log(`Ignition: ${latestHist.ignition}`);
            console.log(`Vehicle Battery: ${latestHist.vehicleBattery}`);
            console.log(`Internal Battery: ${latestHist.internalBattery}`);
            console.log(`GSM Signal: ${latestHist.gsmSignal}`);
            console.log(`Odometer: ${latestHist.odometer}`);
            console.log(`Engine Hours: ${latestHist.engineHours}`);
            console.log(`Temperature: ${latestHist.temperature}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
