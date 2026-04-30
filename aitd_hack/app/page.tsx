import prisma from "@/lib/prisma"
import { syncUser } from "@/lib/syncUser"
import { ArrowRight, Search, UploadCloud, MapPin, Sparkles, ShieldCheck, Globe } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  await syncUser()

  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <main className="flex flex-col items-center bg-[#fcfcfd] min-h-screen">
      {/* --- PREMIUM HERO SECTION --- */}
      <section className="w-full relative pt-24 pb-40 lg:pt-36 lg:pb-60 overflow-hidden">
        {/* Architectural Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent" />
          <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-purple-200/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-blue-200/20 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-8">

            <h1 className="text-6xl md:text-8xl font-bold tracking-[-0.04em] text-slate-900 leading-[0.95]">
              Reuniting what <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent italic tracking-tight">matters most.</span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
              FoundIt leverages proprietary visual intelligence to bridge the gap between lost belongings and their owners. Sophisticated matching, simplified.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
              <Link href="/report?type=lost" 
                className="group relative flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-semibold transition-all hover:bg-indigo-600 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-[0.98]">
                <Search className="w-5 h-5 opacity-70 group-hover:rotate-12 transition-transform" />
                Report Lost Item
              </Link>
              <Link href="/report?type=found" 
                className="group flex items-center justify-center gap-3 bg-white text-slate-900 ring-1 ring-slate-200 px-10 py-5 rounded-2xl font-semibold transition-all hover:ring-slate-300 hover:bg-slate-50 active:scale-[0.98]">
                <UploadCloud className="w-5 h-5 text-slate-400 group-hover:-translate-y-1 transition-transform" />
                I Found Something
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO CONTENT FEED --- */}
      <section className="w-full container mx-auto px-6 -mt-32 relative z-20 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" />
              Intelligence Feed
            </div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Recently Resolved & Active</h2>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
            Explore Registry <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="w-full h-96 flex flex-col items-center justify-center rounded-[3rem] bg-white/50 backdrop-blur-sm ring-1 ring-slate-200/50">
            <div className="p-5 bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 mb-4">
              <Globe className="w-8 h-8 text-slate-300 animate-pulse" />
            </div>
            <p className="text-slate-400 font-medium tracking-tight">Scanning community database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className={`group relative bg-white rounded-[2.5rem] overflow-hidden ring-1 ring-slate-200/60 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 ${idx === 1 ? 'md:scale-105 z-30' : 'z-10'}`}
              >
                {/* Visual Header */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-50">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="object-cover w-full h-full scale-[1.01] group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-[radial-gradient(circle_at_center,_#f8fafc_0%,_#f1f5f9_100%)]">
                      <ShieldCheck className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                  
                  {/* Minimal Badges */}
                  <div className="absolute inset-x-5 top-5 flex justify-between items-start">
                    <span className={`backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm
                      ${item.type === 'lost' 
                        ? 'bg-white/90 text-red-600 border-red-100' 
                        : 'bg-white/90 text-emerald-600 border-emerald-100'
                      }`}
                    >
                      {item.type}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                    </div>
                  </div>
                </div>
                
                {/* Detail Body */}
                <div className="p-8 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <MapPin className="w-3 h-3" />
                      {item.locationName || "Unspecified Area"}
                    </div>
                    <h3 className="font-bold text-2xl text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium opacity-80">
                    {item.description || "Authentication pending. Visual match engine active for this entry."}
                  </p>
                  
                  <div className="pt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                           <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                        </div>
                      ))}
                      <div className="h-6 w-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600">
                        +4
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}