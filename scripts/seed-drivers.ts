import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_DRIVERS = [
    {
        name: 'Budi Santoso',
        phone: '+62 812-3456-7890',
        licenseNumber: 'SIM-B2-00123456',
        status: 'active',
        rating: 4.8,
        joinedDate: new Date('2020-03-15'),
        totalTrips: 1250,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2026-03-15')
    },
    {
        name: 'Agus Wijaya',
        phone: '+62 813-9876-5432',
        licenseNumber: 'SIM-B1-98765432',
        status: 'active',
        rating: 4.5,
        joinedDate: new Date('2021-06-10'),
        totalTrips: 850,
        lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2027-06-10')
    },
    {
        name: 'Slamet Riyadi',
        phone: '+62 811-2233-4455',
        licenseNumber: 'SIM-B2-55443322',
        status: 'active',
        rating: 4.9,
        joinedDate: new Date('2019-11-20'),
        totalTrips: 2100,
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2025-11-20')
    },
    {
        name: 'Joko Susilo',
        phone: '+62 815-1122-3344',
        licenseNumber: 'SIM-A-11223344',
        status: 'off_duty',
        rating: 4.7,
        joinedDate: new Date('2022-01-05'),
        totalTrips: 420,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        complianceStatus: 'warning',
        licenseExpiryDate: new Date('2025-01-05')
    },
    {
        name: 'Eko Prasetyo',
        phone: '+62 857-5566-7788',
        licenseNumber: 'SIM-B1-99887766',
        status: 'on_leave',
        rating: 4.6,
        joinedDate: new Date('2023-04-12'),
        totalTrips: 150,
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2028-04-12')
    },
    {
        name: 'Rudi Hartono',
        phone: '+62 812-5555-6666',
        licenseNumber: 'SIM-B2-12312312',
        status: 'active',
        rating: 4.9,
        joinedDate: new Date('2019-08-17'),
        totalTrips: 3200,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2025-08-17')
    },
    {
        name: 'Dewi Sartika',
        phone: '+62 813-4444-5555',
        licenseNumber: 'SIM-A-45645645',
        status: 'active',
        rating: 4.7,
        joinedDate: new Date('2021-02-20'),
        totalTrips: 980,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2026-02-20')
    },
    {
        name: 'Bambang Pamungkas',
        phone: '+62 811-7777-8888',
        licenseNumber: 'SIM-B1-78978978',
        status: 'active',
        rating: 4.5,
        joinedDate: new Date('2020-11-10'),
        totalTrips: 1500,
        lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        complianceStatus: 'warning',
        licenseExpiryDate: new Date('2024-11-10') // Expiring soon
    },
    {
        name: 'Susi Susanti',
        phone: '+62 857-9999-0000',
        licenseNumber: 'SIM-A-15915915',
        status: 'off_duty',
        rating: 4.8,
        joinedDate: new Date('2022-05-05'),
        totalTrips: 600,
        lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2027-05-05')
    },
    {
        name: 'Taufik Hidayat',
        phone: '+62 812-3333-2222',
        licenseNumber: 'SIM-B2-75375375',
        status: 'active',
        rating: 4.6,
        joinedDate: new Date('2021-09-09'),
        totalTrips: 1100,
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2026-09-09')
    },
    {
        name: 'Alan Budikusuma',
        phone: '+62 813-1111-2222',
        licenseNumber: 'SIM-B1-95195195',
        status: 'active',
        rating: 4.7,
        joinedDate: new Date('2020-01-01'),
        totalTrips: 1800,
        lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        complianceStatus: 'non_compliant',
        licenseExpiryDate: new Date('2024-01-01') // Expired
    },
    {
        name: 'Liem Swie King',
        phone: '+62 811-6666-5555',
        licenseNumber: 'SIM-B2-35735735',
        status: 'active',
        rating: 5.0,
        joinedDate: new Date('2018-12-12'),
        totalTrips: 4500,
        lastActivity: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2025-12-12')
    },
    {
        name: 'Verawaty Fajrin',
        phone: '+62 815-4444-3333',
        licenseNumber: 'SIM-A-25825825',
        status: 'active',
        rating: 4.8,
        joinedDate: new Date('2022-08-08'),
        totalTrips: 750,
        lastActivity: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2027-08-08')
    },
    {
        name: 'Icuk Sugiarto',
        phone: '+62 857-2222-1111',
        licenseNumber: 'SIM-B1-85285285',
        status: 'on_leave',
        rating: 4.4,
        joinedDate: new Date('2023-01-15'),
        totalTrips: 300,
        lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2028-01-15')
    },
    {
        name: 'Hariyanto Arbi',
        phone: '+62 812-8888-9999',
        licenseNumber: 'SIM-B2-65465465',
        status: 'active',
        rating: 4.6,
        joinedDate: new Date('2021-05-20'),
        totalTrips: 1200,
        lastActivity: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        complianceStatus: 'compliant',
        licenseExpiryDate: new Date('2026-05-20')
    }
];

async function main() {
    console.log('🌱 Starting driver seed...');

    // Get first company for assignment
    const company = await prisma.company.findFirst();

    if (!company) {
        console.error('❌ No company found. Please create a company first.');
        return;
    }

    console.log(`✅ Found company: ${company.name}`);

    let created = 0;
    let skipped = 0;

    for (const driver of MOCK_DRIVERS) {
        // Check if driver already exists by phone or license number
        const existing = await prisma.driver.findFirst({
            where: {
                OR: [
                    { phone: driver.phone },
                    { licenseNumber: driver.licenseNumber }
                ]
            }
        });

        if (existing) {
            console.log(`⏭️  Skipping ${driver.name} (already exists)`);
            skipped++;
            continue;
        }

        // Create driver
        await prisma.driver.create({
            data: {
                ...driver,
                companyId: company.id
            }
        });

        console.log(`✅ Created driver: ${driver.name}`);
        created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} drivers`);
    console.log(`   Skipped: ${skipped} drivers`);
    console.log(`   Total: ${MOCK_DRIVERS.length} drivers`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding drivers:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
