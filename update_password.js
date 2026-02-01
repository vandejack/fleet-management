
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@aicrone.com';
    const newPassword = 'admin123'; // Matches the user's likely expectation

    console.log(`Updating password for user: ${email} to '${newPassword}'...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: newPassword },
        });
        console.log('✅ Password updated successfully.');
        console.log(`- User: ${user.name}`);
        console.log(`- New Password in DB: ${user.password}`);
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
