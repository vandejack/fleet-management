import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DRIVER_UPDATES = [
    { phone: '+62 812-3456-7890', lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2026-03-15') },
    { phone: '+62 813-9876-5432', lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2027-06-10') },
    { phone: '+62 811-2233-4455', lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2025-11-20') },
    { phone: '+62 815-1122-3344', lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), complianceStatus: 'warning', licenseExpiryDate: new Date('2025-01-05') },
    { phone: '+62 857-5566-7788', lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2028-04-12') },
    { phone: '+62 812-5555-6666', lastActivity: new Date(Date.now() - 30 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2025-08-17') },
    { phone: '+62 813-4444-5555', lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2026-02-20') },
    { phone: '+62 811-7777-8888', lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000), complianceStatus: 'warning', licenseExpiryDate: new Date('2024-11-10') },
    { phone: '+62 857-9999-0000', lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2027-05-05') },
    { phone: '+62 812-3333-2222', lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2026-09-09') },
    { phone: '+62 813-1111-2222', lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000), complianceStatus: 'non_compliant', licenseExpiryDate: new Date('2024-01-01') },
    { phone: '+62 811-6666-5555', lastActivity: new Date(Date.now() - 45 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2025-12-12') },
    { phone: '+62 815-4444-3333', lastActivity: new Date(Date.now() - 10 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2027-08-08') },
    { phone: '+62 857-2222-1111', lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2028-01-15') },
    { phone: '+62 812-8888-9999', lastActivity: new Date(Date.now() - 7 * 60 * 60 * 1000), complianceStatus: 'compliant', licenseExpiryDate: new Date('2026-05-20') }
];

async function main() {
    console.log('🔄 Updating existing drivers with new field values...');

    let updated = 0;

    for (const update of DRIVER_UPDATES) {
        const { phone, ...data } = update;

        try {
            await prisma.driver.updateMany({
                where: { phone },
                data
            });
            console.log(`✅ Updated driver: ${phone}`);
            updated++;
        } catch (error) {
            console.error(`❌ Failed to update ${phone}:`, error);
        }
    }

    console.log(`\n📊 Summary: Updated ${updated}/${DRIVER_UPDATES.length} drivers`);
}

main()
    .catch((e) => {
        console.error('❌ Error updating drivers:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
