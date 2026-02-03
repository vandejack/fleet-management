
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== Driver Assignment Check ===");
    const drivers = await prisma.driver.findMany();
    console.log(`\nDrivers list:`);
    drivers.forEach(d => console.log(`- ${d.name} (Rating: ${d.rating})`));

    const vehicles = await prisma.vehicle.findMany({ include: { driver: true } });
    console.log(`\nVehicle Assignments:`);
    vehicles.forEach(v => console.log(`- ${v.name}: Driver ${v.driver?.name || 'NONE'}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
