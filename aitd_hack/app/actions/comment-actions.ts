"use server"

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function addComment(itemId: string, text: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("Unauthorized")
    }

    if (!text || text.trim() === "") {
      throw new Error("Comment text is required")
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        itemId,
        userId,
      },
    })

    revalidatePath(`/items/${itemId}`)
    return { success: true, comment }
  } catch (error) {
    console.error("Failed to add comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

export async function getComments(itemId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        itemId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return { success: true, comments }
  } catch (error) {
    console.error("Failed to get comments:", error)
    return { success: false, error: "Failed to fetch comments" }
  }
}
