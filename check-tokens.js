const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.pushToken.count();
        console.log(`PushToken count: ${count}`);
        const tokens = await prisma.pushToken.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
        console.log('Sample tokens:', tokens);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
