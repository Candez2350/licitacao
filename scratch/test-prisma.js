const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const item = await prisma.item.findFirst();
    console.log("Item fields:", Object.keys(item));
    console.log("statusCategorizacao:", item.statusCategorizacao);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
