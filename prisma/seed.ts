import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const groceries = await prisma.category.create({
    data: {
      name: 'Groceries',
      type: 'expense',
    },
  });
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
