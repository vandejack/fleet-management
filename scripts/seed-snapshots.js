
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEvents() {
    try {
        const events = await prisma.driverBehaviorEvent.findMany({
            where: { evidenceUrl: null, type: { not: 'SPEEDING' } },
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log(`Updating ${events.length} events...`);
        for (const event of events) {
            await prisma.driverBehaviorEvent.update({
                where: { id: event.id },
                data: { evidenceUrl: '/snapshots/fatigue-demo.png' }
            });
            console.log(`Updated event ${event.id}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

updateEvents();
