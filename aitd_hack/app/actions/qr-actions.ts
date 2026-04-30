"use server"

import prisma from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key")

export async function notifyOwnerFromQR(userId: string, formData: FormData) {
  try {
    const finderName = formData.get("name") as string
    const finderContact = formData.get("contact") as string
    const location = formData.get("location") as string
    const message = formData.get("message") as string

    if (!finderContact || !message) {
      return { error: "Contact info and message are required." }
    }

    // Lookup the owner
    const owner = await prisma.profile.findUnique({
      where: { id: userId },
    })

    if (!owner) {
      return { error: "Owner not found." }
    }

    // Create an in-app notification
    await (prisma as any).notification.create({
      data: {
        title: "QR Tag Scanned! Item Found",
        message: `${finderName || "Someone"} found your item at "${location || "Unknown"}". Message: "${message}". Contact them at: ${finderContact}`,
        userId: owner.id,
      },
    })

    // Send an Email using Resend
    if (owner.email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "FoundIt Alerts <onboarding@resend.dev>",
        to: owner.email,
        subject: "🚨 Someone found your item! (QR Scan)",
        html: `
          <h2>Great news! Your Smart QR Tag was scanned.</h2>
          <p><strong>Finder:</strong> ${finderName || "Anonymous"}</p>
          <p><strong>Contact Info:</strong> ${finderContact}</p>
          <p><strong>Location Found:</strong> ${location || "Not specified"}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background: #f9f9f9; border-left: 4px solid #ccc; padding: 10px;">
            ${message}
          </blockquote>
          <p>Reach out to them ASAP to get your item back!</p>
        `,
      })
      console.log(`📧 QR Scan Email sent to ${owner.email}`)
    } else {
      console.log(`[EMAIL MOCK] Would send QR email to ${owner?.email}.`)
    }

    return { success: true }
  } catch (err: any) {
    console.error("Error notifying owner from QR scan:", err)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
