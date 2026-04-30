const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Get the most recent item
    const item = await prisma.item.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (!item) {
      console.log("No items found.");
      return;
    }
    console.log("Latest item ID:", item.id);
    console.log("Title:", item.title);
    
    // Prisma returns Unsupported types as not selectable by default or we need to use a raw query
    const rawItems = await prisma.$queryRaw`SELECT id, embedding::text FROM "Item" WHERE id = ${item.id}`;
    if (rawItems.length > 0) {
      const emb = rawItems[0].embedding;
      console.log("Embedding string length:", emb ? emb.length : "NULL");
      if (emb) {
        console.log("Starts with:", emb.substring(0, 20));
      }
    }
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
