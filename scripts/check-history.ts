
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- Latest Location History ---');
    const history = await prisma.locationHistory.findMany({
        take: 20,
        orderBy: { timestamp: 'desc' },
        include: {
            vehicle: { select: { name: true, plate: true } }
        }
    });

    if (history.length === 0) {
        console.log('No history found.');
    } else {
        history.forEach(h => {
            console.log(`[${h.timestamp.toISOString()}] ${h.vehicle.name}: ${h.lat}, ${h.lng} | Speed: ${h.speed}`);
        });
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
