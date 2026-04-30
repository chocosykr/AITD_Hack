import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export default async function MatchesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  // Fetch matches where the user is either the loser or finder
  const matches = await (prisma as any).match.findMany({
    where: {
      OR: [
        { lostItem: { userId } },
        { foundItem: { userId } }
      ]
    },
    include: {
      lostItem: { include: { user: true } },
      foundItem: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Also fetch and mark notifications as read
  await (prisma as any).notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  })

  async function confirmMatch(matchId: string) {
    "use server"
    
    // For Hackathon MVP: One party confirming marks the match as confirmed
    const match = await (prisma as any).match.update({
      where: { id: matchId },
      data: { status: "confirmed" }
    })
    
    // Update both items to "returned"
    await prisma.item.update({ where: { id: match.lostItemId }, data: { status: "returned" } })
    await prisma.item.update({ where: { id: match.foundItemId }, data: { status: "returned" } })
    
    revalidatePath("/matches")
    revalidatePath("/")
  }

  async function rejectMatch(matchId: string) {
    "use server"
    await (prisma as any).match.update({
      where: { id: matchId },
      data: { status: "rejected" }
    })
    revalidatePath("/matches")
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Matches & Notifications</h1>
          <p className="text-slate-500">Review potential matches for your reported items.</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No matches found yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Our AI is constantly scanning. We will notify you instantly the moment a visual match is detected for your items.
          </p>
          <Link href="/report" className="text-primary font-medium hover:underline">
            Report another item
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match: any) => {
            const isMyLostItem = match.lostItem.userId === userId
            const myItem = isMyLostItem ? match.lostItem : match.foundItem
            const otherItem = isMyLostItem ? match.foundItem : match.lostItem
            const otherUser = otherItem.user

            return (
              <div key={match.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                
                {/* Visual Comparison */}
                <div className="flex w-full md:w-1/2 p-4 gap-4 bg-slate-50 border-r border-slate-100 items-center justify-center">
                  <div className="flex flex-col items-center w-1/2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Item</span>
                    <img src={myItem.imageUrl} className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                    <span className="text-sm font-medium mt-2 text-center truncate w-full px-2">{myItem.title}</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-sm border border-emerald-200">
                      {Math.round(match.similarityScore)}% Match
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-1/2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Potential Match</span>
                    <img src={otherItem.imageUrl} className="w-full h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                    <span className="text-sm font-medium mt-2 text-center truncate w-full px-2">{otherItem.title}</span>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-6 flex flex-col justify-between w-full md:w-1/2">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-xl text-slate-900">
                        {isMyLostItem ? "Someone found an item like yours!" : "Someone lost an item like you found!"}
                      </h3>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      <strong>Location difference:</strong> {myItem.locationName} vs {otherItem.locationName} <br/>
                      <strong>Description:</strong> {otherItem.description || "None provided"}
                    </p>
                    
                    {match.status === "confirmed" && (
                      <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm border border-blue-100 mb-4">
                        <strong>Match Confirmed!</strong> Contact {otherUser.username} at <strong>{otherUser.email}</strong> to arrange the exchange.
                      </div>
                    )}
                  </div>

                  {match.status === "pending" && (
                    <div className="flex gap-3 mt-4">
                      <form action={confirmMatch.bind(null, match.id)} className="flex-1">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                          <CheckCircle className="w-4 h-4" />
                          Confirm Match
                        </button>
                      </form>
                      <form action={rejectMatch.bind(null, match.id)} className="flex-1">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl font-medium transition-colors">
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </form>
                    </div>
                  )}

                  {match.status === "rejected" && (
                    <div className="bg-slate-100 text-slate-500 py-2 text-center rounded-xl font-medium text-sm">
                      Match Rejected
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
