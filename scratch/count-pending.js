const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.item.count({
    where: {
      statusCategorizacao: 'PENDENTE'
    }
  });
  console.log('Pendentes:', count);
}

main().finally(() => prisma.$disconnect());
