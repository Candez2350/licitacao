const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const distinctValues = await prisma.item.groupBy({
    by: ['materialOuServico'],
    _count: true
  });

  console.log('Unique materialOuServico values in DB:', distinctValues);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
