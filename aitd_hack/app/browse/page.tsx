import prisma from "@/lib/prisma"
import { Search, MapPin, Clock, Filter, ArrowUpRight, Grid2X2 } from "lucide-react"
import Link from "next/link"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { type?: string; q?: string }
}) {
  const filterType = searchParams.type
  const searchQuery = searchParams.q

  const items = await prisma.item.findMany({
    where: {
      ...(filterType ? { type: filterType } : {}),
      ...(searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery, mode: "insensitive" as const } },
              { description: { contains: searchQuery, mode: "insensitive" as const } },
              { locationName: { contains: searchQuery, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  })

  return (
    <main className="min-h-screen bg-[#fcfcfd] pb-24">
      {/* --- REFINED HEADER --- */}
      <div className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
              <Grid2X2 className="w-4 h-4" />
              Global Registry
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-none">
              Explore <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Discoveries</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-xl">
              Navigate through reported items with visual intelligence. Every entry is cross-referenced for potential matches.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* --- FLOATING SEARCH DASHBOARD --- */}
        <div className="relative z-30 -mt-12 mb-16">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-3 ring-1 ring-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/40">
            <form method="GET" action="/browse" className="flex flex-col lg:flex-row items-center gap-3">
              
              {/* Intelligent Search Input */}
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name="q"
                  type="text"
                  defaultValue={searchQuery || ""}
                  placeholder="Query title, tags, or location..."
                  className="w-full pl-12 pr-6 py-4 rounded-3xl bg-slate-50/50 border-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Filter Architecture */}
              <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 rounded-[2rem] w-full lg:w-auto">
                <Link
                  href="/browse"
                  className={`px-6 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${
                    !filterType
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All Entries
                </Link>
                <Link
                  href="/browse?type=lost"
                  className={`px-6 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${
                    filterType === "lost"
                      ? "bg-red-500 text-white shadow-[0_10px_20px_-5px_rgba(239,68,68,0.3)]"
                      : "text-slate-500 hover:text-red-500"
                  }`}
                >
                  Lost
                </Link>
                <Link
                  href="/browse?type=found"
                  className={`px-6 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${
                    filterType === "found"
                      ? "bg-emerald-500 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]"
                      : "text-slate-500 hover:text-emerald-500"
                  }`}
                >
                  Found
                </Link>
              </div>

              <button
                type="submit"
                className="w-full lg:w-auto px-8 py-4 bg-slate-900 text-white rounded-3xl text-sm font-bold hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* --- GRID ARCHITECTURE --- */}
        {items.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] ring-1 ring-slate-200/50">
            <div className="p-6 bg-slate-50 rounded-full mb-6">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">No matches found</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2 font-medium">Try broadening your search terms or adjusting the category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group relative bg-white rounded-[2rem] overflow-hidden ring-1 ring-slate-200/60 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col"
              >
                {/* Visual Asset Container */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-50 shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="object-cover w-full h-full scale-[1.01] group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                  )}

                  {/* Glass Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm
                        ${item.type === "lost"
                          ? "bg-red-500/90 text-white border-red-400/50"
                          : "bg-emerald-500/90 text-white border-emerald-400/50"
                        }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white p-2 rounded-full shadow-lg">
                      <ArrowUpRight className="w-4 h-4 text-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Information Cluster */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium opacity-80 mb-6">
                    {item.description || "Authentication pending. Visual match engine active."}
                  </p>

                  <div className="mt-auto space-y-4">
                    {/* Meta Row */}
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span className="truncate max-w-[100px]">{item.locationName || "Unknown"}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Footer / User Profile */}
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                          {(item.user?.username || "U")[0].toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-[80px]">
                          {item.user?.username || "Anonymous"}
                        </span>
                      </div>
                      
                      {item.status !== "active" && (
                        <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-400 uppercase">
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}