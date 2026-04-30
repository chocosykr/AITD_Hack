"use client"

import { useState, useTransition } from "react"
import { addComment } from "@/app/actions/comment-actions"
import { MessageSquare, Send, User } from "lucide-react"

type CommentData = {
  id: string
  text: string
  createdAt: Date
  user: {
    username: string | null
    email: string
  }
}

export function CommentSection({ 
  itemId, 
  initialComments = [] 
}: { 
  itemId: string
  initialComments: CommentData[]
}) {
  const [comments, setComments] = useState<CommentData[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setError("")
    
    // Optimistic UI update could go here, but for simplicity we rely on revalidatePath
    startTransition(async () => {
      const result = await addComment(itemId, newComment)
      if (result.success && result.comment) {
        setNewComment("")
        // Refresh the page or the comments list (revalidatePath handles server update)
        // Since we are client-side, we can just append it locally for instant feedback
        // if we fetch user details or we can just rely on the server revalidation.
        // Actually, revalidatePath will refresh the Server Component props automatically!
      } else {
        setError(result.error || "Failed to add comment")
      }
    })
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 ring-1 ring-slate-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Community Notes</h3>
      </div>

      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
        {initialComments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">No notes yet. Be the first to share details!</p>
          </div>
        ) : (
          initialComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="shrink-0 pt-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 shadow-sm">
                  {comment.user.username ? comment.user.username[0].toUpperCase() : <User className="w-5 h-5" />}
                </div>
              </div>
              <div className="flex-1 bg-slate-50/50 p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm group-hover:bg-white group-hover:border-slate-200 transition-all">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {comment.user.username || "Anonymous"}
                  </span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <div className="absolute top-4 left-4 text-slate-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a note or provide more details..."
          disabled={isPending}
          className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isPending || !newComment.trim()}
          className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
        {error && <p className="text-red-500 text-xs mt-2 px-2">{error}</p>}
      </form>
    </div>
  )
}
