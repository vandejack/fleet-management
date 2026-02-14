const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vendors = [
        {
            name: 'Teltonika',
            models: ['FMB920', 'FMB120', 'FMB130', 'FMC130', 'FMM130', 'FMB640', 'FMC650']
        },
        {
            name: 'Concox',
            models: ['GT06N', 'GV20', 'GT800', 'WETRACK 2', 'AT4']
        },
        {
            name: 'Jimi IoT',
            models: ['JM-VL03', 'JM-VG02U', 'JM-LL01', 'GV40']
        },
        {
            name: 'Queclink',
            models: ['GV300', 'GV50', 'GV600', 'GL300']
        },
        {
            name: 'Suntech',
            models: ['ST310U', 'ST4300', 'ST710']
        },
        {
            name: 'Coban',
            models: ['GPS303', 'GPS403', 'GPS103']
        }
    ];

    console.log('Seeding GPS Vendors and Models...');

    for (const v of vendors) {
        const vendor = await prisma.gPSVendor.upsert({
            where: { name: v.name },
            update: {},
            create: { name: v.name },
        });

        for (const m of v.models) {
            await prisma.gPSModel.upsert({
                where: {
                    name_vendorId: {
                        name: m,
                        vendorId: vendor.id,
                    },
                },
                update: {},
                create: {
                    name: m,
                    vendorId: vendor.id,
                },
            });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
