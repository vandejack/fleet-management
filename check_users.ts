
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@aicrone.com';
    console.log(`Checking for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('✅ User found:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Password Hash: ${user.password.substring(0, 10)}...`);
    } else {
        console.log('❌ User NOT found.');

        // List all users to see who is there
        const allUsers = await prisma.user.findMany({ select: { email: true } });
        console.log('Existing users:', allUsers.map(u => u.email));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
