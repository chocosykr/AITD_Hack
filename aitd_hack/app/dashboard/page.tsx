import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { 
  Search, MapPin, Clock, Eye, Package, 
  AlertTriangle, CheckCircle2, ArrowRight, 
  Sparkles, Zap, LayoutDashboard, Plus
} from "lucide-react"
import Link from "next/link"
import { findSimilarItems } from "@/app/actions/similarity-actions"
import { QRCodeSection } from "./QRCodeSection"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const userItems = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const lostItems = userItems.filter((i) => i.type === "lost")
  const foundItems = userItems.filter((i) => i.type === "found")

  const matches = await (prisma as any).match.findMany({
    where: {
      OR: [{ lostItem: { userId } }, { foundItem: { userId } }],
    },
    include: {
      lostItem: { include: { user: true } },
      foundItem: { include: { user: true } },
    },
    orderBy: { similarityScore: "desc" },
  })

  const lostItemMatches: Record<string, any[]> = {}
  const lostItemSimilar: Record<string, any[]> = {}
  
  for (const item of lostItems) {
    lostItemMatches[item.id] = matches.filter((m: any) => m.lostItemId === item.id)
    lostItemSimilar[item.id] = await findSimilarItems(item.id, item.type, 6)
  }

  const stats = [
    { label: "Total Reports", value: userItems.length, icon: Package, color: "indigo" },
    { label: "Active Listings", value: userItems.filter(i => i.status === "active").length, icon: Eye, color: "amber" },
    { label: "AI Matches", value: matches.filter((m: any) => m.status === "pending").length, icon: Zap, color: "purple" },
    { label: "Resolved", value: userItems.filter(i => i.status === "matched" || i.status === "returned").length, icon: CheckCircle2, color: "emerald" },
  ]

  return (
    <main className="min-h-screen bg-[#fcfcfd] pb-24">
      {/* --- REFINED DASHBOARD HEADER --- */}
      <div className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent" />
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                <LayoutDashboard className="w-4 h-4" />
                Command Center
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">My Dashboard</h1>
              <p className="text-slate-500 font-medium">Monitoring your registry and autonomous visual matches.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/report?type=lost" className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-indigo-600 active:scale-95">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Report New
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 space-y-12 -mt-10 relative z-20">
        
        {/* QR Section with Glass Effect */}
        <div className="rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <QRCodeSection userId={userId} domainUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="group bg-white rounded-[2rem] p-8 ring-1 ring-slate-200/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${stat.color}-50 ring-1 ring-${stat.color}-100`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* --- MY LOST ITEMS (High Priority) --- */}
        <section className="space-y-8">
          <div className="flex items-end justify-between px-2">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-red-500" />
              Lost Registry
            </h2>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{lostItems.length} Entries</span>
          </div>

          {lostItems.length === 0 ? (
            <div className="py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center">
              <Package className="w-10 h-10 text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">No lost items on record.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {lostItems.map((item) => {
                const itemMatches = lostItemMatches[item.id] || []
                const similarItems = lostItemSimilar[item.id] || []
                return (
                  <div key={item.id} className="group bg-white rounded-[3rem] ring-1 ring-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                    
                    {/* Item Master Card */}
                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-72 h-64 lg:h-auto bg-slate-50 relative overflow-hidden shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <Search className="w-10 h-10 text-slate-300" />
                        )}
                        <div className="absolute top-6 left-6">
                           <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-md text-red-600 border border-red-100">Lost</span>
                        </div>
                      </div>

                      <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                              {item.title}
                            </h3>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              item.status === 'active' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-2xl">{item.description || "System authentication pending..."}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {item.locationName || "Goa, India"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI SUB-SECTION: Intelligence Feed */}
                    {(itemMatches.length > 0 || similarItems.length > 0) && (
                      <div className="bg-[#f8fafc]/80 backdrop-blur-md border-t border-slate-100 p-10 space-y-8">
                        
                        {/* Confirmed High-Probability Matches */}
                        {itemMatches.length > 0 && (
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">
                               <Zap className="w-4 h-4 fill-emerald-100" />
                               Confirmed Visual Matches
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {itemMatches.map((match: any) => (
                                 <div key={match.id} className="bg-white rounded-3xl p-4 ring-1 ring-emerald-100 flex items-center gap-4 hover:shadow-lg transition-all">
                                   <img src={match.foundItem.imageUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                                   <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-900 truncate">{match.foundItem.title}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg">{Math.round(match.similarityScore)}% Score</span>
                                      </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}

                        {/* Similarity Engine (pgvector) */}
                        {similarItems.length > 0 && (
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-600 tracking-[0.2em]">
                               <Sparkles className="w-4 h-4 fill-purple-100" />
                               Autonomous Similarity Search
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {similarItems.map((similar: any) => (
                                 <div key={similar.id} className="bg-white/60 rounded-3xl p-4 ring-1 ring-purple-100 flex items-center gap-4 hover:bg-white transition-all">
                                   <img src={similar.imageUrl} className="w-16 h-16 rounded-2xl object-cover grayscale-[0.5] hover:grayscale-0 transition-all" alt="" />
                                   <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-900 truncate">{similar.title}</p>
                                      <span className="text-[10px] font-black text-purple-500 uppercase">{Math.round((similar.similarity ?? 0) * 100)}% Similarity</span>
                                   </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* --- FOUND ITEMS GRID --- */}
        <section className="space-y-8">
           <div className="flex items-end justify-between px-2">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-emerald-500" />
              Found Log
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {foundItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden ring-1 ring-slate-200/50 shadow-sm hover:shadow-xl transition-all duration-500">
                 <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <Search className="w-8 h-8 text-slate-300" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white">Found</span>
                    </div>
                 </div>
                 <div className="p-8">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50 text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                       <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.locationName || "Local"}</span>
                       <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}