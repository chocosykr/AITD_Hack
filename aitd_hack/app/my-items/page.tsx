// app/my-items/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma, Prisma } from '@/lib/prisma';
import MyItemsClient from '@/components/MyItemsClient';

export const metadata = {
  title: 'My Items — Lost & Found',
  description: 'Your reported lost and found items with AI-powered match suggestions.',
};

export type Match = {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'LOST' | 'FOUND';
  category: string;
  imageUrl: string | null;
  createdAt: string;
  similarity: number; // 0–100 %
};

export type MyItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'LOST' | 'FOUND';
  category: string;
  status: string;
  imageUrl: string | null;
  images: string[];
  createdAt: string;
  lostDate: string;
  lostTime: string;
  hasEmbedding: boolean;
  matches: Match[];
};

export default async function MyItemsPage() {
  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  // Fetch user's own items (with images)
  const rawItems = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { images: true },
  });

  // For each item, check embedding & run similarity query
  const myItems: MyItem[] = await Promise.all(
    rawItems.map(async (item) => {
      // Check if this item has a stored embedding
      const embRow = await prisma.$queryRaw<{ has_emb: boolean }[]>`
        SELECT (embedding IS NOT NULL) as has_emb
        FROM "Item"
        WHERE id = ${item.id}
      `;
      const hasEmbedding = embRow[0]?.has_emb ?? false;

      let matches: Match[] = [];

      if (hasEmbedding) {
        const oppositeType = item.type === 'LOST' ? 'FOUND' : 'LOST';

        try {
          // pgvector cosine distance: <=> gives distance in [0, 2].
          // Cosine similarity = 1 - distance. We want similarity > 0.6 → distance < 0.4
          const rawMatches = await prisma.$queryRaw<
            {
              id: string;
              title: string;
              description: string | null;
              location: string | null;
              type: string;
              category: string;
              imageurl: string | null;
              createdat: Date;
              similarity: number;
            }[]
          >(
            Prisma.sql`
              SELECT
                i.id,
                i.title,
                i.description,
                i."locationName"  AS location,
                i.type::text      AS type,
                i.category::text  AS category,
                i."imageUrl"      AS imageurl,
                i."createdAt"     AS createdat,
                ROUND(((1 - (i.embedding <=> ref.embedding)) * 100)::numeric, 1)::float AS similarity
              FROM "Item" i
              CROSS JOIN (
                SELECT embedding FROM "Item" WHERE id = ${item.id}
              ) ref
              WHERE i.type::text = ${oppositeType}
                AND i.id        != ${item.id}
                AND i.embedding IS NOT NULL
                AND ref.embedding IS NOT NULL
                AND (1 - (i.embedding <=> ref.embedding)) > 0.6
              ORDER BY similarity DESC
              LIMIT 5
            `
          );

          matches = rawMatches.map((m) => ({
            id: m.id,
            title: m.title,
            description: m.description ?? '',
            location: m.location ?? '',
            type: m.type as 'LOST' | 'FOUND',
            category: m.category,
            imageUrl: m.imageurl ?? null,
            createdAt: m.createdat.toISOString(),
            similarity: Number(m.similarity),
          }));
        } catch (err) {
          console.warn(`Similarity query failed for item ${item.id}:`, err);
        }
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description ?? '',
        location: item.locationName ?? '',
        type: item.type as 'LOST' | 'FOUND',
        category: item.category as string,
        status: item.status as string,
        imageUrl: item.imageUrl ?? null,
        images: item.images.map((img) => img.url),
        createdAt: item.createdAt.toISOString(),
        lostDate: item.lostDate?.toISOString() ?? '',
        lostTime: item.lostTime ?? '',
        hasEmbedding,
        matches,
      };
    })
  );

  return <MyItemsClient items={myItems} />;
}
