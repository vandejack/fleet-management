import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Running database migration...');

    try {
        // Add columns one by one
        console.log('Adding lastActivity column...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Driver" 
      ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP
    `);

        console.log('Adding complianceStatus column...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Driver" 
      ADD COLUMN IF NOT EXISTS "complianceStatus" TEXT NOT NULL DEFAULT 'compliant'
    `);

        console.log('Adding licenseExpiryDate column...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Driver" 
      ADD COLUMN IF NOT EXISTS "licenseExpiryDate" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '5 years'
    `);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
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
