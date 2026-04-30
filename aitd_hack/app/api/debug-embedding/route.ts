import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, itemId } = await req.json()

    // Step 1: Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Could not fetch image from URL" }, { status: 400 })
    }
    const imageBlob = await imageResponse.blob()

    // Step 2: Send to Python AI backend
    const formData = new FormData()
    formData.append("file", imageBlob, "image.jpg")
    formData.append("item_id", itemId)
    formData.append("location", "Test")
    formData.append("item_type", "found")
    formData.append("timestamp", new Date().toISOString())

    const aiResponse = await fetch("http://localhost:8000/process_item", {
      method: "POST",
      body: formData,
    })

    if (!aiResponse.ok) {
      return NextResponse.json({ error: `AI backend returned ${aiResponse.status}`, detail: await aiResponse.text() }, { status: 500 })
    }

    const aiResult = await aiResponse.json()

    if (!aiResult.embedding || !Array.isArray(aiResult.embedding)) {
      return NextResponse.json({
        error: "No embedding returned from AI backend",
        aiResult,
      }, { status: 500 })
    }

    // Step 3: Store embedding in Supabase
    const vectorString = `[${aiResult.embedding.join(",")}]`

    // Check actual table name in DB
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    await prisma.$executeRaw`UPDATE "Item" SET embedding = ${vectorString}::vector WHERE id = ${itemId}`

    // Verify it was stored
    const updated = await prisma.$queryRaw<{ id: string; has_embedding: boolean }[]>`
      SELECT id, embedding IS NOT NULL as has_embedding FROM "Item" WHERE id = ${itemId}
    `

    return NextResponse.json({
      success: true,
      embeddingLength: aiResult.embedding.length,
      tables: tables.map((t) => t.tablename),
      itemStatus: updated[0],
      aiVerdict: aiResult.system_verdict,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}
