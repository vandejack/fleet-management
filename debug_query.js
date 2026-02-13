const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const TARGET_ID = 'cmlg3ww2700004oeub4mt1b9v';
        console.log(`Debug Query for CompanyID: "${TARGET_ID}"`);

        // 1. Check if Company exists
        const company = await prisma.company.findUnique({ where: { id: TARGET_ID } });
        console.log('Company found:', company ? company.name : 'NULL');

        // 2. Find Users with this companyId
        const users = await prisma.user.findMany({
            where: { companyId: TARGET_ID },
            include: { pushTokens: true }
        });
        console.log(`Users found via string query: ${users.length}`);
        users.forEach(u => console.log(` - ${u.email} (Tokens: ${u.pushTokens.length})`));

        // 3. Find Superadmin and check its companyId
        const sa = await prisma.user.findUnique({ where: { email: 'superadmin@aicrone.com' } });
        console.log(`Superadmin companyId: "${sa.companyId}"`);
        console.log(`Match? ${sa.companyId === TARGET_ID}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
