const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvents() {
    try {
        // Find vehicle
        const vehicle = await prisma.vehicle.findFirst({
            where: { imei: '863719065062185' },
            select: { id: true, name: true, plate: true }
        });

        console.log('Vehicle:', vehicle);

        if (!vehicle) {
            console.log('Vehicle not found!');
            return;
        }

        // Get recent events
        const events = await prisma.driverBehaviorEvent.findMany({
            where: { vehicleId: vehicle.id },
            orderBy: { timestamp: 'desc' },
            take: 20,
            select: {
                id: true,
                type: true,
                timestamp: true,
                value: true
            }
        });

        console.log('\nRecent Events:');
        console.log(JSON.stringify(events, null, 2));

        // Count by type
        const eventCounts = await prisma.driverBehaviorEvent.groupBy({
            by: ['type'],
            where: { vehicleId: vehicle.id },
            _count: { type: true }
        });

        console.log('\nEvent Counts:');
        console.log(JSON.stringify(eventCounts, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEvents();
