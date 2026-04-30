// lib/prisma.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export { Prisma };

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  connectionString = connectionString.replace('?sslmode=require', '').replace('&sslmode=require', '');

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
  });
}

export const prisma =
  globalForPrisma.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = prisma;
}