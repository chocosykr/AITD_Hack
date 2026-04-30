"use server"

import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// A fixed ID for anonymous users who report without logging in.
const GUEST_USER_ID = "guest_anonymous"
const GUEST_EMAIL = "guest@foundit.app"

export async function createItem(data: {
  title: string;
  description: string;
  imageUrl?: string;
  locationName: string;
  type: string;
}) {
  const { userId: clerkUserId } = await auth()
  const user = await currentUser()

  // Determine the actual userId — either Clerk user or guest
  const userId = clerkUserId ?? GUEST_USER_ID

  // Ensure the profile exists (either real user or guest)
  await prisma.profile.upsert({
    where: { id: userId },
    update: {
      email: user?.emailAddresses[0]?.emailAddress ?? GUEST_EMAIL,
      username: user?.username ?? user?.firstName ?? "Guest",
    },
    create: {
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? GUEST_EMAIL,
      username: user?.username ?? user?.firstName ?? "Guest",
    },
  })

  // Create the Item record
  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || "",
      locationName: data.locationName,
      type: data.type,
      userId,
    },
  })

  // Call the Python AI backend to generate the vector embedding and find matches
  try {
    const formData = new FormData()
    
    // Attach image if available
    if (data.imageUrl) {
      const imageResponse = await fetch(data.imageUrl)
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob()
        formData.append("file", imageBlob, "image.jpg")
      }
    }
    
    formData.append("item_id", item.id)
    formData.append("location", data.locationName || "Unknown")
    formData.append("item_type", data.type)
    formData.append("description", data.description || "")
    formData.append("timestamp", new Date().toISOString())

    const aiResponse = await fetch("http://localhost:8000/process_item", {
      method: "POST",
      body: formData,
    })

      const aiResult = await aiResponse.json()
      console.log("AI Result:", aiResult)

      // Store the vector embedding in Supabase Postgres (pgvector column)
      if (aiResult.embedding && Array.isArray(aiResult.embedding)) {
        const vectorString = `[${aiResult.embedding.join(",")}]`
        // Use $executeRawUnsafe so the ::vector cast works correctly
        await prisma.$executeRawUnsafe(
          `UPDATE "Item" SET embedding = '${vectorString}'::vector WHERE id = '${item.id}'`
        )
        console.log(`✅ Embedding stored for item ${item.id} (${aiResult.embedding.length} dims)`)
      } else {
        console.warn("⚠️ No embedding returned from AI backend:", aiResult.system_verdict)
      }

      // Check for pgvector matches > 60% and notify the owner of the LOST item
      if (aiResult.embedding && Array.isArray(aiResult.embedding)) {
        const { findSimilarItems } = await import("@/app/actions/similarity-actions")
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key")

        const similarItems = await findSimilarItems(item.id, data.type, 5)
        
        for (const similar of similarItems) {
          if (similar.similarity > 0.6) {
            const lostId = data.type === "lost" ? item.id : similar.id
            const foundId = data.type === "found" ? item.id : similar.id

            // Ensure match doesn't already exist
            const existingMatch = await (prisma as any).match.findFirst({
              where: { lostItemId: lostId, foundItemId: foundId },
            })

            if (!existingMatch) {
              const matchRecord = await (prisma as any).match.create({
                data: {
                  lostItemId: lostId,
                  foundItemId: foundId,
                  similarityScore: similar.similarity * 100,
                  status: "pending",
                },
              })

              // Notify the person who LOST the item
              const lostItem = await prisma.item.findUnique({
                where: { id: lostId },
                include: { user: true },
              })

              if (lostItem && lostItem.userId !== GUEST_USER_ID) {
                // 1. In-App Notification
                await (prisma as any).notification.create({
                  data: {
                    title: "Potential Match Found!",
                    message: `We found an item that is ${Math.round(similar.similarity * 100)}% similar to your lost item "${lostItem.title}".`,
                    userId: lostItem.userId,
                    matchId: matchRecord.id,
                  },
                })

                // 2. Email Notification
                if (lostItem.user?.email && process.env.RESEND_API_KEY) {
                  const foundImageUrl = data.type === "found" ? data.imageUrl : similar.imageUrl;
                  try {
                    await resend.emails.send({
                      from: "FoundIt Updates <onboarding@resend.dev>", // default testing domain
                      to: lostItem.user.email,
                      subject: "Good news! Potential match for your lost item",
                      html: `
                        <h2>Potential Match Found</h2>
                        <p>We found an item that is a <strong>${Math.round(similar.similarity * 100)}% match</strong> to your lost item: <em>${lostItem.title}</em>.</p>
                        ${foundImageUrl ? `<p>Here is a picture of the newly found item:</p><img src="${foundImageUrl}" alt="Found Item" style="max-width: 400px; border-radius: 8px; margin: 16px 0;" />` : ''}
                        <p>Log in to your FoundIt dashboard to review it!</p>
                      `,
                    })
                    console.log(`📧 Email sent successfully to ${lostItem.user.email}`)
                  } catch (e) {
                    console.error("Email sending failed:", e)
                  }
                } else {
                  console.log(`📧 [EMAIL MOCK] Would send email to ${lostItem.user?.email} regarding match ${matchRecord.id}`)
                }
              }
            }
          }
        }
      }
  } catch (err) {
    console.error("AI Backend Error:", err)
    // Swallow error — item is still saved successfully
  }

  revalidatePath("/")
  return { success: true, item }
}