import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Bell, Search, PlusCircle } from "lucide-react";

export default async function Navbar() {
  const user = await currentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            FoundIt
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Browse
          </Link>
          <Link href="/report" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Report Item
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Dashboard
          </Link>
          <Link href="/matches" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Matches
          </Link>
        </nav>

        {/* Auth / Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/report" className="hidden sm:flex items-center gap-2 text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all">
                <PlusCircle className="w-4 h-4" />
                <span>Report</span>
              </Link>
              
              <Link href="/matches" className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors group">
                <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
              </Link>
              
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-white shadow-sm ring-1 ring-slate-100" } }} />
            </>
          ) : (
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Log In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-bold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-all">Sign Up</button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
