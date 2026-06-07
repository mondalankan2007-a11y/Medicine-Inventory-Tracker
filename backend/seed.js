const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('password123', salt);

  const user = await prisma.user.upsert({
    where: { email: 'admin@pharmatrack.com' },
    update: {},
    create: {
      email: 'admin@pharmatrack.com',
      name: 'Admin Pharmacist',
      password_hash,
      role: 'admin',
    },
  });
  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
