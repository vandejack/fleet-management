
import { PrismaClient } from '@prisma/client';

const OLD_DB_URL = "postgres://c41844224b367b9a07ee68e2506ec870a075ed8a589fe7e687c06765435975c4:sk_W5ke4XmUQXeQcLjl8G0CY@db.prisma.io:5432/postgres?sslmode=require";
const NEW_DB_URL = process.env.DATABASE_URL || "postgresql://aicrone_admin:admin123@100.106.212.122:5432/aicrone_fms?schema=public";

const source = new PrismaClient({
    datasources: { db: { url: OLD_DB_URL } },
});

const target = new PrismaClient({
    datasources: { db: { url: NEW_DB_URL } },
});

async function main() {
    console.log('🚀 Starting migration...');
    console.log('Source:', OLD_DB_URL.split('@')[1]); // Log masked URL
    console.log('Target:', NEW_DB_URL.split('@')[1]);

    try {
        // 1. Clean Target Database
        console.log('\n🧹 Cleaning target database...');
        // Delete in reverse dependency order
        await target.locationHistory.deleteMany();
        await target.maintenanceRecord.deleteMany();
        await target.alert.deleteMany();
        await target.fuelTransaction.deleteMany();
        await target.driverBehaviorEvent.deleteMany();
        await target.vehicle.deleteMany();
        await target.driver.deleteMany();
        await target.user.deleteMany();
        await target.company.deleteMany();
        console.log('✅ Target database cleaned.');

        // 2. Migrate Data
        console.log('\n📦 Migrating data...');

        // -- Company --
        console.log('Migrating Companies...');
        const companies = await source.company.findMany();
        if (companies.length) await target.company.createMany({ data: companies });
        console.log(`  - Migrated ${companies.length} companies`);

        // -- User --
        console.log('Migrating Users...');
        const users = await source.user.findMany();
        if (users.length) await target.user.createMany({ data: users });
        console.log(`  - Migrated ${users.length} users`);

        // -- Driver --
        console.log('Migrating Drivers...');
        const drivers = await source.driver.findMany();
        if (drivers.length) {
            // Clean data to avoid null issues if any
            const validDrivers = drivers.map(d => ({
                ...d,
            }));
            await target.driver.createMany({ data: validDrivers });
        }
        console.log(`  - Migrated ${drivers.length} drivers`);

        // -- Vehicle --
        console.log('Migrating Vehicles...');
        const vehicles = await source.vehicle.findMany();
        if (vehicles.length) await target.vehicle.createMany({ data: vehicles });
        console.log(`  - Migrated ${vehicles.length} vehicles`);

        // -- DriverBehaviorEvent --
        console.log('Migrating DriverBehaviorEvents...');
        const behaviorEvents = await source.driverBehaviorEvent.findMany();
        if (behaviorEvents.length) await target.driverBehaviorEvent.createMany({ data: behaviorEvents });
        console.log(`  - Migrated ${behaviorEvents.length} events`);

        // -- FuelTransaction --
        console.log('Migrating FuelTransactions...');
        const fuel = await source.fuelTransaction.findMany();
        if (fuel.length) await target.fuelTransaction.createMany({ data: fuel });
        console.log(`  - Migrated ${fuel.length} fuel transactions`);

        // -- Alert --
        console.log('Migrating Alerts...');
        const alerts = await source.alert.findMany();
        if (alerts.length) await target.alert.createMany({ data: alerts });
        console.log(`  - Migrated ${alerts.length} alerts`);

        // -- MaintenanceRecord --
        console.log('Migrating MaintenanceRecords...');
        const maintenance = await source.maintenanceRecord.findMany();
        if (maintenance.length) await target.maintenanceRecord.createMany({ data: maintenance });
        console.log(`  - Migrated ${maintenance.length} maintenance records`);

        // -- LocationHistory --
        console.log('Migrating LocationHistory...');
        // Process in chunks to avoid memory issues
        const chunkSize = 1000;
        let skip = 0;
        let totalHistory = 0;
        while (true) {
            const history = await source.locationHistory.findMany({ skip, take: chunkSize });
            if (history.length === 0) break;
            await target.locationHistory.createMany({ data: history });
            totalHistory += history.length;
            skip += chunkSize;
            process.stdout.write(`  - Migrated ${totalHistory} records...\r`);
        }
        console.log(`  - Migrated ${totalHistory} location history records`);

        console.log('\n✨ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await source.$disconnect();
        await target.$disconnect();
    }
}

main();
