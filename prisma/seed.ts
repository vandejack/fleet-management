import { PrismaClient } from '@prisma/client';
import { MOCK_DRIVERS, MOCK_VEHICLES, MOCK_FUEL_TRANSACTIONS, MOCK_MAINTENANCE } from '../src/utils/mockData';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  // 1. Create Default Company
  const defaultCompanyName = 'AICrone Logistics';
  let defaultCompany = await prisma.company.findFirst({ where: { name: defaultCompanyName } });

  if (!defaultCompany) {
    defaultCompany = await prisma.company.create({
      data: {
        name: defaultCompanyName,
        address: '123 Tech Blvd',
        city: 'Jakarta',
        country: 'Indonesia'
      }
    });
    console.log('Created default company:', defaultCompany.name);
  }

  // 2. Create Superadmin (No Company or Special System Company?)
  // For now, superadmin is independent or belongs to a "HQ" company.
  // Let's create a Superadmin user.
  const superEmail = 'superadmin@aicrone.com';
  const existingSuper = await prisma.user.findUnique({ where: { email: superEmail } });
  if (!existingSuper) {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: superEmail,
        password: 'superadmin1234', // Hash in prod
        role: 'superadmin',
        image: 'https://ui-avatars.com/api/?name=Super+Admin&background=000&color=fff',
        // Superadmin might not belong to a specific client company, or belongs to the "Provider" company.
        // We leave companyId null for now, or create a Provider company.
      }
    });
    console.log('Created superadmin user');
  }

  // 3. Create Admin User (Linked to Default Company)
  const adminEmail = 'admin@aicrone.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: 'admin1234',
        role: 'admin',
        image: 'https://ui-avatars.com/api/?name=Admin+User&background=FF8800&color=fff',
        companyId: defaultCompany.id
      },
    });
    console.log('Created admin user linked to company');
  } else {
    // Link existing admin to company if not linked
    if (!existingAdmin.companyId) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { companyId: defaultCompany.id }
      });
      console.log('Linked existing admin to default company');
    }
  }

  // 4. Create Demo User (Linked to Default Company for consistency in "Real" mode usage)
  const demoEmail = 'demo@aicrone.com';
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: 'Demo User',
        email: demoEmail,
        password: 'demo1234',
        role: 'user',
        image: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
        companyId: defaultCompany.id
      },
    });
    console.log('Created demo user');
  } else {
    if (!existingUser.companyId) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { companyId: defaultCompany.id }
      });
    }
  }

  // 5. Seed Drivers (Linked to Default Company)
  for (const driver of MOCK_DRIVERS) {
    const exists = await prisma.driver.findUnique({ where: { id: driver.id } });
    if (!exists) {
      const joinedDate = new Date(driver.joinedDate);
      await prisma.driver.create({
        data: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          status: driver.status,
          rating: driver.rating,
          joinedDate: joinedDate,
          totalTrips: driver.totalTrips,
          photoUrl: undefined,
          companyId: defaultCompany.id
        }
      });
    } else {
      if (!exists.companyId) {
        await prisma.driver.update({ where: { id: driver.id }, data: { companyId: defaultCompany.id } });
      }
    }
  }
  console.log('Seeded drivers');

  // 6. Seed Vehicles (Linked to Default Company)
  for (const vehicle of MOCK_VEHICLES) {
    const exists = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    if (!exists) {
      await prisma.vehicle.create({
        data: {
          id: vehicle.id,
          name: vehicle.name,
          plate: vehicle.plate,
          status: vehicle.status,
          lat: vehicle.currentLocation.lat,
          lng: vehicle.currentLocation.lng,
          lastLocationTime: new Date(vehicle.currentLocation.timestamp || Date.now()),
          fuelLevel: vehicle.fuelLevel,
          speed: vehicle.speed,
          model: vehicle.model,
          year: vehicle.year,
          fuelType: vehicle.fuelType,
          driverId: vehicle.driver?.id,
          companyId: defaultCompany.id
        }
      });
    } else {
      if (!exists.companyId) {
        await prisma.vehicle.update({ where: { id: vehicle.id }, data: { companyId: defaultCompany.id } });
      }
    }
  }
  console.log('Seeded vehicles');

  // Seed Fuel Transactions (No companyId on transaction directly, linked via vehicle)
  for (const ft of MOCK_FUEL_TRANSACTIONS) {
    const exists = await prisma.fuelTransaction.findUnique({ where: { id: ft.id } });
    if (!exists) {
      await prisma.fuelTransaction.create({
        data: {
          id: ft.id,
          vehicleId: ft.vehicleId,
          date: new Date(ft.date),
          amount: ft.amount,
          cost: ft.cost,
          location: ft.location,
          odometer: ft.odometer
        }
      });
    }
  }
  console.log('Seeded fuel transactions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
