const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding complete - already done via SQL');
  const count = await prisma.user.count();
  console.log('Users:', count);
  const courses = await prisma.course.count();
  console.log('Courses:', courses);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

