const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const TARGET_ID = 'cmlg3ww2700004oeub4mt1b9v';
        const EMAIL = 'superadmin@aicrone.com';

        console.log(`Assigning ${EMAIL} to company ${TARGET_ID}...`);

        const updated = await prisma.user.update({
            where: { email: EMAIL },
            data: { companyId: TARGET_ID }
        });

        console.log(`Updated user: ${updated.email}, CompanyId: ${updated.companyId}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
