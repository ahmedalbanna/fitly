const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding Fitly data...');

  await prisma.$transaction([
    prisma.resetToken.deleteMany(),
    prisma.otpToken.deleteMany(),
    prisma.measurement.deleteMany(),
    prisma.card.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.trialStatus.deleteMany(),
    prisma.user.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.conversionTable.deleteMany(),
  ]);

  const conversions = [
    // === SHIRTS (chest in cm) ===
    // EU
    { productType: 'Shirts', system: 'EU', sizeLabel: 'XS', minValue: 76, maxValue: 83 },
    { productType: 'Shirts', system: 'EU', sizeLabel: 'S', minValue: 84, maxValue: 91 },
    { productType: 'Shirts', system: 'EU', sizeLabel: 'M', minValue: 92, maxValue: 99 },
    { productType: 'Shirts', system: 'EU', sizeLabel: 'L', minValue: 100, maxValue: 107 },
    { productType: 'Shirts', system: 'EU', sizeLabel: 'XL', minValue: 108, maxValue: 115 },
    { productType: 'Shirts', system: 'EU', sizeLabel: 'XXL', minValue: 116, maxValue: 123 },
    { productType: 'Shirts', system: 'EU', sizeLabel: 'XXXL', minValue: 124, maxValue: 131 },
    // US
    { productType: 'Shirts', system: 'US', sizeLabel: 'XS', minValue: 76, maxValue: 83 },
    { productType: 'Shirts', system: 'US', sizeLabel: 'S', minValue: 84, maxValue: 91 },
    { productType: 'Shirts', system: 'US', sizeLabel: 'M', minValue: 92, maxValue: 99 },
    { productType: 'Shirts', system: 'US', sizeLabel: 'L', minValue: 100, maxValue: 107 },
    { productType: 'Shirts', system: 'US', sizeLabel: 'XL', minValue: 108, maxValue: 115 },
    { productType: 'Shirts', system: 'US', sizeLabel: 'XXL', minValue: 116, maxValue: 123 },
    // UK
    { productType: 'Shirts', system: 'UK', sizeLabel: 'XS', minValue: 76, maxValue: 83 },
    { productType: 'Shirts', system: 'UK', sizeLabel: 'S', minValue: 84, maxValue: 91 },
    { productType: 'Shirts', system: 'UK', sizeLabel: 'M', minValue: 92, maxValue: 99 },
    { productType: 'Shirts', system: 'UK', sizeLabel: 'L', minValue: 100, maxValue: 107 },
    { productType: 'Shirts', system: 'UK', sizeLabel: 'XL', minValue: 108, maxValue: 115 },
    { productType: 'Shirts', system: 'UK', sizeLabel: 'XXL', minValue: 116, maxValue: 123 },

    // === PANTS (waist in cm) ===
    // EU
    { productType: 'Pants', system: 'EU', sizeLabel: '38', minValue: 68, maxValue: 72 },
    { productType: 'Pants', system: 'EU', sizeLabel: '40', minValue: 73, maxValue: 77 },
    { productType: 'Pants', system: 'EU', sizeLabel: '42', minValue: 78, maxValue: 82 },
    { productType: 'Pants', system: 'EU', sizeLabel: '44', minValue: 83, maxValue: 87 },
    { productType: 'Pants', system: 'EU', sizeLabel: '46', minValue: 88, maxValue: 92 },
    { productType: 'Pants', system: 'EU', sizeLabel: '48', minValue: 93, maxValue: 97 },
    { productType: 'Pants', system: 'EU', sizeLabel: '50', minValue: 98, maxValue: 102 },
    { productType: 'Pants', system: 'EU', sizeLabel: '52', minValue: 103, maxValue: 107 },
    // US (waist in inches mapped from cm)
    { productType: 'Pants', system: 'US', sizeLabel: 'W28', minValue: 68, maxValue: 72 },
    { productType: 'Pants', system: 'US', sizeLabel: 'W30', minValue: 73, maxValue: 77 },
    { productType: 'Pants', system: 'US', sizeLabel: 'W32', minValue: 78, maxValue: 82 },
    { productType: 'Pants', system: 'US', sizeLabel: 'W34', minValue: 83, maxValue: 87 },
    { productType: 'Pants', system: 'US', sizeLabel: 'W36', minValue: 88, maxValue: 92 },
    { productType: 'Pants', system: 'US', sizeLabel: 'W38', minValue: 93, maxValue: 97 },
    { productType: 'Pants', system: 'US', sizeLabel: 'W40', minValue: 98, maxValue: 102 },
    // UK
    { productType: 'Pants', system: 'UK', sizeLabel: 'W28', minValue: 68, maxValue: 72 },
    { productType: 'Pants', system: 'UK', sizeLabel: 'W30', minValue: 73, maxValue: 77 },
    { productType: 'Pants', system: 'UK', sizeLabel: 'W32', minValue: 78, maxValue: 82 },
    { productType: 'Pants', system: 'UK', sizeLabel: 'W34', minValue: 83, maxValue: 87 },
    { productType: 'Pants', system: 'UK', sizeLabel: 'W36', minValue: 88, maxValue: 92 },
    { productType: 'Pants', system: 'UK', sizeLabel: 'W38', minValue: 93, maxValue: 97 },

    // === SHOES (foot length in cm) ===
    // EU
    { productType: 'Shoes', system: 'EU', sizeLabel: '36', minValue: 22.5, maxValue: 23.2 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '37', minValue: 23.3, maxValue: 24.0 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '38', minValue: 24.1, maxValue: 24.7 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '39', minValue: 24.8, maxValue: 25.5 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '40', minValue: 25.6, maxValue: 26.2 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '41', minValue: 26.3, maxValue: 27.0 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '42', minValue: 27.1, maxValue: 27.7 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '43', minValue: 27.8, maxValue: 28.5 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '44', minValue: 28.6, maxValue: 29.2 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '45', minValue: 29.3, maxValue: 30.0 },
    { productType: 'Shoes', system: 'EU', sizeLabel: '46', minValue: 30.1, maxValue: 30.7 },
    // US
    { productType: 'Shoes', system: 'US', sizeLabel: '5', minValue: 22.5, maxValue: 23.2 },
    { productType: 'Shoes', system: 'US', sizeLabel: '6', minValue: 23.3, maxValue: 24.0 },
    { productType: 'Shoes', system: 'US', sizeLabel: '7', minValue: 24.1, maxValue: 24.7 },
    { productType: 'Shoes', system: 'US', sizeLabel: '8', minValue: 24.8, maxValue: 25.5 },
    { productType: 'Shoes', system: 'US', sizeLabel: '9', minValue: 25.6, maxValue: 26.2 },
    { productType: 'Shoes', system: 'US', sizeLabel: '10', minValue: 26.3, maxValue: 27.0 },
    { productType: 'Shoes', system: 'US', sizeLabel: '11', minValue: 27.1, maxValue: 27.7 },
    { productType: 'Shoes', system: 'US', sizeLabel: '12', minValue: 27.8, maxValue: 28.5 },
    { productType: 'Shoes', system: 'US', sizeLabel: '13', minValue: 28.6, maxValue: 29.2 },
    // UK
    { productType: 'Shoes', system: 'UK', sizeLabel: '4', minValue: 22.5, maxValue: 23.2 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '5', minValue: 23.3, maxValue: 24.0 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '6', minValue: 24.1, maxValue: 24.7 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '7', minValue: 24.8, maxValue: 25.5 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '8', minValue: 25.6, maxValue: 26.2 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '9', minValue: 26.3, maxValue: 27.0 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '10', minValue: 27.1, maxValue: 27.7 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '11', minValue: 27.8, maxValue: 28.5 },
    { productType: 'Shoes', system: 'UK', sizeLabel: '12', minValue: 28.6, maxValue: 29.2 },

    // === THOBE (height in cm) ===
    { productType: 'Thobe', system: 'EU', sizeLabel: '50', minValue: 155, maxValue: 160 },
    { productType: 'Thobe', system: 'EU', sizeLabel: '52', minValue: 161, maxValue: 165 },
    { productType: 'Thobe', system: 'EU', sizeLabel: '54', minValue: 166, maxValue: 170 },
    { productType: 'Thobe', system: 'EU', sizeLabel: '56', minValue: 171, maxValue: 175 },
    { productType: 'Thobe', system: 'EU', sizeLabel: '58', minValue: 176, maxValue: 180 },
    { productType: 'Thobe', system: 'EU', sizeLabel: '60', minValue: 181, maxValue: 185 },
    { productType: 'Thobe', system: 'EU', sizeLabel: '62', minValue: 186, maxValue: 190 },
  ];

  await prisma.conversionTable.createMany({ data: conversions });

  const banners = [
    {
      imageUrl: 'https://via.placeholder.com/800x200/6C63FF/FFFFFF?text=FITLY+App',
      linkUrl: null,
      active: true,
      sortOrder: 1,
    },
    {
      imageUrl: 'https://via.placeholder.com/800x200/FF6584/FFFFFF?text=New+Arrivals',
      linkUrl: 'https://fitly.example.com/new-arrivals',
      active: true,
      sortOrder: 2,
    },
  ];

  await prisma.banner.createMany({ data: banners });

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);

  const users = await prisma.user.createMany({
    data: [
      {
        email: 'demo@fitly.app',
        passwordHash,
        phone: '+15550000001',
        emailVerified: true,
      },
      {
        email: 'trial@fitly.app',
        passwordHash,
        phone: '+15550000002',
        emailVerified: true,
      },
      {
        email: 'pending@fitly.app',
        passwordHash,
        phone: '+15550000003',
        emailVerified: false,
      },
    ],
  });

  const seededUsers = await prisma.user.findMany({
    where: { email: { in: ['demo@fitly.app', 'trial@fitly.app', 'pending@fitly.app'] } },
    orderBy: { email: 'asc' },
  });

  const [demoUser, pendingUser, trialUser] = seededUsers.sort((a, b) => a.email.localeCompare(b.email));

  const profiles = await prisma.profile.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Demo User',
        isMain: true,
        gender: 'female',
      },
      {
        userId: demoUser.id,
        name: 'Demo Partner',
        isMain: false,
        gender: 'male',
      },
      {
        userId: trialUser.id,
        name: 'Trial User',
        isMain: true,
        gender: 'male',
      },
      {
        userId: pendingUser.id,
        name: 'Pending User',
        isMain: true,
        gender: null,
      },
    ],
  });

  const createdProfiles = await prisma.profile.findMany({
    where: { userId: { in: [demoUser.id, trialUser.id, pendingUser.id] } },
  });

  const demoMain = createdProfiles.find((profile) => profile.userId === demoUser.id && profile.isMain);
  const demoSecondary = createdProfiles.find((profile) => profile.userId === demoUser.id && !profile.isMain);
  const trialProfile = createdProfiles.find((profile) => profile.userId === trialUser.id);

  const now = new Date();
  const measurements = [
    {
      profileId: demoMain.id,
      height: 168,
      weight: 62,
      chest: 92,
      waist: 72,
      hip: 98,
      armLength: 58,
      legLength: 92,
      shoeSize: 24.5,
      recordedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      profileId: demoMain.id,
      height: 168,
      weight: 61,
      chest: 90,
      waist: 70,
      hip: 97,
      armLength: 58,
      legLength: 92,
      shoeSize: 24.3,
      recordedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      profileId: demoSecondary.id,
      height: 182,
      weight: 82,
      chest: 104,
      waist: 86,
      hip: 102,
      armLength: 63,
      legLength: 98,
      shoeSize: 27.2,
      recordedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      profileId: trialProfile.id,
      height: 175,
      weight: 75,
      chest: 100,
      waist: 83,
      hip: 100,
      armLength: 61,
      legLength: 95,
      shoeSize: 26.0,
    },
  ];

  await prisma.measurement.createMany({ data: measurements });

  const cards = [
    {
      profileId: demoMain.id,
      data: {
        title: 'Spring Capsule',
        sizes: {
          shirts: 'M',
          pants: 'EU 40',
          shoes: 'EU 38',
          thobe: '52',
        },
        notes: 'Updated after March fitting.',
      },
    },
    {
      profileId: demoSecondary.id,
      data: {
        title: 'Workout Gear',
        sizes: {
          shirts: 'L',
          pants: 'EU 46',
          shoes: 'EU 43',
        },
        notes: 'Running gear setup.',
      },
    },
  ];

  await prisma.card.createMany({ data: cards });

  await prisma.trialStatus.createMany({
    data: [
      {
        userId: demoUser.id,
        used: true,
        activatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: trialUser.id,
        used: true,
        activatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: pendingUser.id,
        used: false,
      },
    ],
  });

  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      type: 'ANNUAL',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
    },
  });

  const otpCode = '123456';
  await prisma.otpToken.create({
    data: {
      userId: pendingUser.id,
      code: otpCode,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    },
  });

  await prisma.resetToken.create({
    data: {
      userId: demoUser.id,
      token: 'demo-reset-token',
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    },
  });

  console.log(`Seeded ${conversions.length} conversion entries, ${banners.length} banners, and ${users.count} users.`);
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
