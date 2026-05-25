const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const licitacoesCount = await prisma.licitacao.count();
  const itemsCount = await prisma.item.count();
  const itemsWithMaterial = await prisma.item.count({ where: { materialOuServico: 'M' } });
  const itemsWithService = await prisma.item.count({ where: { materialOuServico: 'S' } });

  console.log({
    licitacoesCount,
    itemsCount,
    itemsWithMaterial,
    itemsWithService
  });

  const sampleItems = await prisma.item.findMany({ take: 10 });
  console.log('Sample items materialOuServico values:', sampleItems.map(i => i.materialOuServico));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
