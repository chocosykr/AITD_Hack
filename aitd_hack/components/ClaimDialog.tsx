"use client"

import { useState, useTransition } from "react"
import { submitClaim } from "@/app/actions/claim-actions"
import { ShieldCheck, HandHeart, X, Send } from "lucide-react"

export function ClaimDialog({ itemId }: { itemId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setError("")
    startTransition(async () => {
      const result = await submitClaim(itemId, message)
      if (result.success) {
        setSuccess(true)
        setMessage("")
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 3000)
      } else {
        setError(result.error || "Failed to submit claim")
      }
    })
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-colors relative z-10 flex items-center justify-center gap-2 group shadow-lg"
      >
        <HandHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Claim this Item
      </button>
    )
  }

  return (
    <div className="w-full bg-white rounded-[2rem] p-6 text-slate-900 relative z-10 border border-slate-200 shadow-xl overflow-hidden mt-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-indigo-50 rounded-full blur-2xl z-0" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold tracking-tight">Verify Ownership</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="font-bold text-emerald-700">Claim Submitted!</p>
            <p className="text-sm text-emerald-600/80 mt-1">The finder has been securely notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 leading-relaxed">
                Please provide details or proof of ownership to the finder (e.g., serial number, distinctive marks, or contact info).
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isPending}
                placeholder="I can identify this item by..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 outline-none placeholder:text-slate-400 min-h-[100px] resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center gap-2"
            >
              {isPending ? "Submitting..." : "Send Secure Claim"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
