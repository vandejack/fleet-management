const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const imei = '863719065062185';
    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { imei } });
        console.log('--- VEHICLE STATUS ---');
        console.log('ID:', vehicle.id);
        console.log('Updated At (System):', vehicle.updatedAt);
        console.log('Last Loc Time (Field):', vehicle.lastLocationTime);
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
