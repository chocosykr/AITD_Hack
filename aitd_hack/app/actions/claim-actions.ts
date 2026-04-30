"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function submitClaim(itemId: string, message: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("Unauthorized")
    }

    if (!message || message.trim() === "") {
      throw new Error("Proof or message is required to submit a claim")
    }

    // Verify item exists and is a "found" item
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      throw new Error("Item not found")
    }

    if (item.type !== "found") {
      throw new Error("Only found items can be claimed")
    }

    if (item.userId === userId) {
      throw new Error("You cannot claim an item you posted")
    }

    // Use a transaction to create the claim and the notification
    const [claim, _] = await prisma.$transaction([
      prisma.claim.create({
        data: {
          itemId,
          userId,
          message: message.trim(),
        }
      }),
      prisma.notification.create({
        data: {
          userId: item.userId, // Notify the finder
          title: "New Claim on Found Item",
          message: `Someone is trying to claim your found item: "${item.title}". Their message: "${message.trim()}"`,
        }
      })
    ])

    revalidatePath(`/items/${itemId}`)
    return { success: true, claim }
  } catch (error: any) {
    console.error("Failed to submit claim:", error)
    return { success: false, error: error.message || "Failed to submit claim" }
  }
}
