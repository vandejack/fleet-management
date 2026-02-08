const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    console.log(`🔄 Syncing Vehicle Status for IMEI: ${imei}...`);

    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
        if (!vehicle) { console.log('Vehicle not found'); return; }

        console.log(`Current Vehicle Last Update: ${vehicle.lastLocationTime}`);

        // Get latest history
        const latestHist = await prisma.locationHistory.findFirst({
            where: { vehicleId: vehicle.id },
            orderBy: { timestamp: 'desc' }
        });

        if (latestHist) {
            console.log(`Found Latest History: ${latestHist.timestamp}`);

            if (latestHist.timestamp > vehicle.lastLocationTime) {
                console.log('⚡ History is newer! Preparing to update...');

                const updateData = {
                    lastLocationTime: latestHist.timestamp,
                    lat: latestHist.lat,
                    lng: latestHist.lng,
                    speed: latestHist.speed,
                    status: latestHist.speed > 5 ? 'moving' : 'idle',
                    ignition: latestHist.ignition,
                    internalBattery: latestHist.internalBattery,
                    gsmSignal: latestHist.gsmSignal,
                    odometer: latestHist.odometer,
                    engineHours: latestHist.engineHours,
                    fuelLevel: latestHist.fuelLevel,
                    temperature: latestHist.temperature
                };

                console.log('Payload:', JSON.stringify(updateData, null, 2));

                await prisma.vehicle.update({
                    where: { id: vehicle.id },
                    data: updateData
                });
                console.log('✅ Vehicle Table Updated Successfully.');
            } else {
                console.log('✅ Vehicle is already up to date (or newer than history).');
            }
        } else {
            console.log('❌ No Location History found.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
