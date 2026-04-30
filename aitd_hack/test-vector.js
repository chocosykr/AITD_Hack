/**
 * End-to-end test for vector embedding storage in Postgres via Prisma.
 * Loads DATABASE_URL from .env, then:
 *  1. Reads the latest Item row
 *  2. Writes a 768-dim dummy embedding with $executeRaw
 *  3. Reads back the embedding::text to confirm it was persisted
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

function buildPrisma() {
  let url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');

  // Strip sslmode so explicit ssl config takes effect
  url = url.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '').replace(/&$/, '');

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = buildPrisma();
  try {
    // Step 1 – find latest item
    const item = await prisma.item.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!item) {
      console.log('No items found in DB. Create one via the UI first.');
      return;
    }
    console.log('Latest item:', item.id, '|', item.title);

    // Step 2 – build a dummy 768-dim embedding and write it
    const dummy = new Array(768).fill(0).map((_, i) => i / 768);
    const vecStr = `[${dummy.join(',')}]`;
    console.log('Writing embedding...');

    await prisma.$executeRaw`UPDATE "Item" SET embedding = ${vecStr}::vector WHERE id = ${item.id}`;
    console.log('Write succeeded.');

    // Step 3 – read back
    const rows = await prisma.$queryRaw`SELECT id, embedding::text FROM "Item" WHERE id = ${item.id}`;
    const embText = rows[0]?.embedding ?? null;
    if (embText) {
      console.log('Embedding stored! Length of text:', embText.length, 'chars');
      console.log('First 60 chars:', embText.substring(0, 60));
    } else {
      console.log('Embedding is NULL after write – something went wrong.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
