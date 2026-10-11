"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Shield, Users, Trophy } from "lucide-react";

export default function DashboardShell({
  role,
  children,
}: {
  role: "Admin" | "Coach" | "Parent";
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-[#0a1a33] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#0a1a33] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo-light.png"
                alt="YCA Pace Logo"
                width={36}
                height={40}
                className="h-auto w-9 transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display text-xl font-bold tracking-wide block leading-tight">
                  YCA PACE
                </span>
                <span className="text-[11px] font-medium text-white/60 tracking-wider uppercase block">
                  Hingna Road · Nagpur
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#f5b700] text-[#0a1a33]">
              {role} Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Portal Switcher for Demo */}
            <div className="hidden md:flex items-center bg-white/10 rounded-lg p-1 text-xs">
              <Link
                href="/admin"
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  pathname.startsWith("/admin")
                    ? "bg-[#f5b700] text-[#0a1a33] font-bold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Shield className="w-3 h-3" /> Admin
              </Link>
              <Link
                href="/coach"
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  pathname.startsWith("/coach")
                    ? "bg-[#f5b700] text-[#0a1a33] font-bold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Users className="w-3 h-3" /> Coach
              </Link>
              <Link
                href="/parent"
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  pathname.startsWith("/parent")
                    ? "bg-[#f5b700] text-[#0a1a33] font-bold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Trophy className="w-3 h-3" /> Parent
              </Link>
            </div>

            <Link
              href="/"
              title="Return to Public Website"
              className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 text-xs hidden sm:flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:border-white hover:bg-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Notification Bar */}
      <div className="bg-[#f5b700]/20 border-b border-[#f5b700]/30 px-5 py-1 text-center text-xs font-semibold text-[#0a1a33]/90 flex items-center justify-center gap-2">
        <span>⚡ Interactive Academy Management Demo with Live Sample Records.</span>
        <span className="hidden sm:inline text-[#0a1a33]/60">Switch portals using the header navigation.</span>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl w-full px-5 py-8 flex-1">{children}</main>

      {/* Dashboard Footer */}
      <footer className="mt-auto border-t border-navy/10 bg-white py-4 text-center text-xs text-navy/60">
        <p>Yadav Cricket Academy &amp; Pace Foundation · Nagpur · Est. 2024</p>
      </footer>
    </div>
  );
}
