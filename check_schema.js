const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.systemSettings.count();
        console.log('SystemSettings table exists. Count:', count);
    } catch (e) {
        console.error('Error accessing SystemSettings:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
