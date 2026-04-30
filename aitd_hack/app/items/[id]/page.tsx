import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { MapPin, Clock, ArrowLeft, ShieldCheck, Search, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { CommentSection } from "@/components/CommentSection"
import { getComments } from "@/app/actions/comment-actions"
import { ClaimDialog } from "@/components/ClaimDialog"
import { auth } from "@clerk/nextjs/server"

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
    },
  })

  if (!item) {
    notFound()
  }

  // Fetch comments
  const { comments } = await getComments(item.id)

  return (
    <main className="min-h-screen bg-[#fcfcfd] pb-24">
      {/* Header Background */}
      <div className="relative pt-12 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <Link href="/browse" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Registry
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.type === "lost" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {item.type} Item
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  item.status === "active" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}>
                  {item.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">{item.title}</h1>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {(item.user?.username || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reported By</p>
                <p className="text-sm font-bold text-white">{item.user?.username || "Anonymous"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image & Details Card */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden ring-1 ring-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              {/* Image Hero */}
              <div className="relative h-80 sm:h-96 w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <ImageIcon className="w-16 h-16 text-slate-400" />
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">No Visual Data</p>
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Verified Entry</span>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-8 md:p-10 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-3">Item Description</h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {item.description || "No specific details provided. System is using AI visual matching for this entry."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-500"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Last Seen Location</p>
                      <p className="font-bold text-slate-900">{item.locationName || "Location not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-500"><Clock className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Time Reported</p>
                      <p className="font-bold text-slate-900">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <CommentSection itemId={item.id} initialComments={comments as any} />
            
          </div>

          {/* Sidebar / Context Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 ring-1 ring-slate-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Matching</h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">
                This item is being continuously monitored by the FoundIt AI engine. If a high-confidence match is detected, the owner will be notified instantly.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Visual Scan</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Semantic Search</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Active</span>
                </div>
              </div>
            </div>
            
            {/* Extra Info Box */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl" />
               
               {item.type === "found" && userId !== item.userId ? (
                 <>
                   <h3 className="text-lg font-bold mb-2 relative z-10">Is this yours?</h3>
                   <p className="text-slate-400 text-sm mb-6 relative z-10">Securely verify your ownership and coordinate the return of this item.</p>
                   <ClaimDialog itemId={item.id} />
                 </>
               ) : (
                 <>
                   <h3 className="text-lg font-bold mb-2 relative z-10">Have Information?</h3>
                   <p className="text-slate-400 text-sm mb-6 relative z-10">Use the community notes section to securely coordinate the return of this item.</p>
                   {userId !== item.userId && (
                     <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors relative z-10 shadow-lg">
                       Contact Founder
                     </button>
                   )}
                 </>
               )}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  )
}
