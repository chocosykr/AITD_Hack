"use server"

import prisma from "@/lib/prisma"

interface SimilarItem {
  id: string
  title: string
  imageUrl: string
  locationName: string | null
  type: string
  status: string
  createdAt: Date
  similarity: number
}

/**
 * Uses pgvector cosine distance to find items most similar to the given item.
 * Searches for "found" items when given a "lost" item, and vice versa.
 */
export async function findSimilarItems(
  itemId: string,
  itemType: string,
  limit: number = 6
): Promise<SimilarItem[]> {
  try {
    // The opposite type: if we lost something, search found items
    const searchType = itemType === "lost" ? "found" : "lost"

    // pgvector cosine distance query:
    // 1 - (embedding <=> target) gives us similarity (1 = identical, 0 = unrelated)
    const results = await prisma.$queryRawUnsafe<SimilarItem[]>(`
      SELECT 
        i.id,
        i.title,
        i."imageUrl",
        i."locationName",
        i.type,
        i.status,
        i."createdAt",
        1 - (i.embedding <=> source.embedding) as similarity
      FROM "Item" i, "Item" source
      WHERE source.id = $1
        AND source.embedding IS NOT NULL
        AND i.embedding IS NOT NULL
        AND i.type = $2
        AND i.id != $1
      ORDER BY i.embedding <=> source.embedding ASC
      LIMIT $3
    `, itemId, searchType, limit)

    return results
  } catch (err) {
    console.error("Vector search error:", err)
    return []
  }
}
