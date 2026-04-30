import prisma from "@/lib/prisma"
import { ScanForm } from "./ScanForm"
import { AlertTriangle, Home } from "lucide-react"
import Link from "next/link"

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const userId = resolvedParams.u as string

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid QR Code</h1>
          <p className="text-slate-500 mb-6">This QR code doesn't seem to be linked to a valid FoundIt user.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <Home className="w-4 h-4" /> Go back home
          </Link>
        </div>
      </main>
    )
  }

  // Look up the user
  const owner = await prisma.profile.findUnique({
    where: { id: userId }
  })

  if (!owner) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Owner Not Found</h1>
          <p className="text-slate-500 mb-6">The user associated with this QR code could not be found.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <Home className="w-4 h-4" /> Go back home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">You found it!</h1>
          <p className="text-slate-600 text-lg">
            This item belongs to <span className="font-bold text-primary">{owner.username}</span>. 
            Send them a message below so they can get it back.
          </p>
        </div>

        <ScanForm userId={owner.id} username={owner.username || "the owner"} />
      </div>
    </main>
  )
}
