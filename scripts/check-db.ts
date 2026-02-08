
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.vehicle.count();
    console.log(`Total Vehicles: ${count}`);
    const vehicles = await prisma.vehicle.findMany({ select: { name: true, plate: true, imei: true, driverId: true } });
    console.log(vehicles);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
