import { prisma } from './lib/prisma';

async function test() {
  try {
    const item = await prisma.item.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (!item) {
      console.log('No items found');
      return;
    }
    console.log('Latest item id:', item.id);
    
    // Attempt to set a dummy embedding
    const dummyEmbedding = new Array(768).fill(0.1);
    
    console.log('Executing raw query...');
    await prisma.$executeRaw`UPDATE "Item" SET embedding = ${JSON.stringify(dummyEmbedding)}::vector WHERE id = ${item.id}`;
    
    console.log('Query successful, checking value...');
    const result = await prisma.$queryRaw`SELECT id, embedding::text FROM "Item" WHERE id = ${item.id}`;
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
