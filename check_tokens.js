const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const COMPANY_ID = 'cmlg3ww2700004oeub4mt1b9v';
        console.log(`Checking vehicles for Company ID: ${COMPANY_ID}...`);

        const vehicles = await prisma.vehicle.findMany({
            where: {
                companyId: COMPANY_ID,
                imei: { not: null }
            }
        });

        console.log(`Found ${vehicles.length} vehicles with IMEI.`);
        if (vehicles.length > 0) {
            console.log(`Using IMEI: ${vehicles[0].imei}`);
        } else {
            console.log('No vehicles with IMEI found. Assigning test IMEI to Truck A1...');
            const truck = await prisma.vehicle.findFirst({
                where: { companyId: COMPANY_ID }
            });
            if (truck) {
                const testImei = '123456789012345';
                await prisma.vehicle.update({
                    where: { id: truck.id },
                    data: { imei: testImei }
                });
                console.log(`Assigned IMEI ${testImei} to ${truck.name}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
