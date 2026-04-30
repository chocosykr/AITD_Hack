"use client"

import { useState } from "react"
import { notifyOwnerFromQR } from "@/app/actions/qr-actions"
import { toast } from "sonner"
import { Send, User, MapPin, Mail, MessageSquare } from "lucide-react"

export function ScanForm({ userId, username }: { userId: string; username: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await notifyOwnerFromQR(userId, formData)
    
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setIsSuccess(true)
      toast.success("Message sent! The owner has been notified.")
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-800 mb-2">Message Sent!</h3>
        <p className="text-emerald-600 mb-6">
          Thank you for helping! An email and notification have been sent to {username}. They will contact you shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <User className="w-4 h-4 text-slate-400" /> Your Name
        </label>
        <input
          name="name"
          type="text"
          placeholder="e.g. John Doe"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-slate-400" /> Your Email or Phone *
        </label>
        <input
          name="contact"
          type="text"
          required
          placeholder="So the owner can reach you"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-400" /> Where did you find it?
        </label>
        <input
          name="location"
          type="text"
          placeholder="e.g. Central Park Bench"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-slate-400" /> Message to Owner *
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="I found your item, it's safe with me..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Notify Owner"} <Send className="w-5 h-5" />
      </button>
    </form>
  )
}
