// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@example.com',
      address: '123 Admin Street',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create store owner
  const ownerPassword = await argon2.hash('owner123');
  const storeOwner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Store Owner',
      email: 'owner@example.com',
      address: '456 Business Ave',
      password: ownerPassword,
      role: Role.STORE_OWNER,
    },
  });

  console.log('✅ Created store owner:', storeOwner.email);

  // Create normal users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const userPassword = await argon2.hash('user123');
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        address: `${i}00 User Street`,
        password: userPassword,
        role: Role.USER,
      },
    });
    users.push(user);
  }

  console.log('✅ Created 5 normal users');

  // Create stores
  const stores = [
    {
      name: 'Tech Electronics Store',
      email: 'tech@example.com',
      address: '100 Tech Boulevard',
      ownerId: storeOwner.id,
    },
    {
      name: 'Fashion Hub',
      email: 'fashion@example.com',
      address: '200 Style Street',
      ownerId: null,
    },
    {
      name: 'Book Paradise',
      email: 'books@example.com',
      address: '300 Reading Lane',
      ownerId: null,
    },
    {
      name: 'Coffee Corner',
      email: 'coffee@example.com',
      address: '400 Brew Avenue',
      ownerId: null,
    },
    {
      name: 'Sports Gear',
      email: 'sports@example.com',
      address: '500 Athletic Drive',
      ownerId: null,
    },
  ];

  const createdStores = [];
  for (const storeData of stores) {
    const store = await prisma.store.create({
      data: storeData,
    });
    createdStores.push(store);
  }

  console.log('✅ Created 5 stores');

  // Create sample ratings
  const ratings = [
    { userId: users[0].id, storeId: createdStores[0].id, score: 5, comment: 'Excellent service!' },
    { userId: users[1].id, storeId: createdStores[0].id, score: 4, comment: 'Great products' },
    { userId: users[2].id, storeId: createdStores[0].id, score: 5, comment: 'Highly recommended' },
    { userId: users[0].id, storeId: createdStores[1].id, score: 3, comment: 'Average experience' },
    { userId: users[1].id, storeId: createdStores[1].id, score: 4, comment: 'Good selection' },
    { userId: users[2].id, storeId: createdStores[2].id, score: 5, comment: 'Love this bookstore!' },
    { userId: users[3].id, storeId: createdStores[2].id, score: 4, comment: 'Great atmosphere' },
    { userId: users[0].id, storeId: createdStores[3].id, score: 5, comment: 'Best coffee in town' },
    { userId: users[4].id, storeId: createdStores[4].id, score: 4, comment: 'Quality sports equipment' },
  ];

  for (const ratingData of ratings) {
    await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: ratingData.userId,
          storeId: ratingData.storeId,
        },
      },
      update: {},
      create: ratingData,
    });
  }

  console.log('✅ Created sample ratings');

  // Update store averages
  for (const store of createdStores) {
    const ratings = await prisma.rating.findMany({
      where: { storeId: store.id },
    });

    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length;
      await prisma.store.update({
        where: { id: store.id },
        data: {
          avgRating,
          ratingCount: ratings.length,
        },
      });
    }
  }

  console.log('✅ Updated store averages');

  console.log('🎉 Seeding completed!');
  console.log('\n📋 Test accounts:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Store Owner: owner@example.com / owner123');
  console.log('User: user1@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });