import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Find or create the main user
  let mainUser = await prisma.user.findUnique({
    where: { email: 'conor.smetana@gmail.com' },
  });

  if (!mainUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    mainUser = await prisma.user.create({
      data: {
        email: 'conor.smetana@gmail.com',
        name: 'Conor Smetana',
        password: hashedPassword,
      },
    });
    console.log('✅ Created main user: Conor Smetana');
  } else {
    console.log('✅ Found existing user: Conor Smetana');
  }

  // Create fake users
  const fakeUsers = [
    { email: 'alex.johnson@example.com', name: 'Alex Johnson' },
    { email: 'sarah.williams@example.com', name: 'Sarah Williams' },
    { email: 'mike.chen@example.com', name: 'Mike Chen' },
    { email: 'emma.davis@example.com', name: 'Emma Davis' },
    { email: 'james.wilson@example.com', name: 'James Wilson' },
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  const createdUsers = [];

  for (const fakeUser of fakeUsers) {
    let user = await prisma.user.findUnique({
      where: { email: fakeUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          ...fakeUser,
          password: hashedPassword,
        },
      });
      console.log(`✅ Created user: ${fakeUser.name}`);
    } else {
      console.log(`✅ Found existing user: ${fakeUser.name}`);
    }
    createdUsers.push(user);
  }

  // Create a group
  let group = await prisma.group.findFirst({
    where: { name: 'Push-Up Champions' },
  });

  if (!group) {
    group = await prisma.group.create({
      data: {
        name: 'Push-Up Champions',
        inviteCode: 'CHAMP123',
      },
    });
    console.log('✅ Created group: Push-Up Champions');
  } else {
    console.log('✅ Found existing group: Push-Up Champions');
  }

  // Add all users to the group
  const allUsers = [mainUser, ...createdUsers];
  
  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const existingMember = await prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: user.id },
    });

    if (!existingMember) {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: user.id,
          role: i === 0 ? 'owner' : 'member', // First user (Conor) is owner
        },
      });
      console.log(`✅ Added ${user.name} to group`);
    }
  }

  // Generate pushup entries for the last 30 days
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (const user of allUsers) {
    // Delete existing entries for clean seed
    await prisma.pushupEntry.deleteMany({
      where: { userId: user.id },
    });

    // Generate random entries for the last 30 days
    for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - daysAgo);

      // Random chance (70%) of having entries on any given day
      if (Math.random() < 0.7) {
        // 1-3 entries per day
        const numEntries = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < numEntries; j++) {
          // Random count between 10-50
          const count = Math.floor(Math.random() * 41) + 10;

          await prisma.pushupEntry.create({
            data: {
              userId: user.id,
              count,
              date: entryDate,
            },
          });
        }
      }
    }

    // Calculate total for this user
    const total = await prisma.pushupEntry.aggregate({
      where: { userId: user.id },
      _sum: { count: true },
    });

    console.log(`✅ Generated entries for ${user.name}: ${total._sum.count || 0} total push-ups`);
  }

  // Create a second group
  let group2 = await prisma.group.findFirst({
    where: { name: 'Fitness Warriors' },
  });

  if (!group2) {
    group2 = await prisma.group.create({
      data: {
        name: 'Fitness Warriors',
        inviteCode: 'WAR2024',
      },
    });
    console.log('✅ Created group: Fitness Warriors');

    // Add main user and a few others
    await prisma.groupMember.create({
      data: { groupId: group2.id, userId: mainUser.id, role: 'member' },
    });
    await prisma.groupMember.create({
      data: { groupId: group2.id, userId: createdUsers[0].id, role: 'owner' },
    });
    await prisma.groupMember.create({
      data: { groupId: group2.id, userId: createdUsers[2].id, role: 'member' },
    });
    console.log('✅ Added members to Fitness Warriors');
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nTest accounts (all use password: password123):');
  console.log('- conor.smetana@gmail.com (Conor Smetana)');
  fakeUsers.forEach((u) => console.log(`- ${u.email} (${u.name})`));
  console.log('\nGroups:');
  console.log('- Push-Up Champions (code: CHAMP123)');
  console.log('- Fitness Warriors (code: WAR2024)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
