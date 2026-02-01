
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        await prisma.locationHistory.count();
        console.log("LocationHistory table exists.");
    } catch (e) {
        console.error("LocationHistory table does NOT exist or client is outdated.", e);
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
