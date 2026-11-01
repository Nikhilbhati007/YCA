"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Home, Shield, Users, Trophy, User } from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function DashboardShell({
  role,
  children,
}: {
  role: "Admin" | "Coach" | "Parent";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<{ name: string; code: string; role: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("yca_logged_user");
      if (stored) {
        try {
          setLoggedUser(JSON.parse(stored));
        } catch {}
      }
    }
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  async function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("yca_active_player");
      localStorage.removeItem("yca_logged_user");
    }
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    router.push("/login");
  }

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
            {/* Academy Portal Switcher - Only visible to Academy Staff (Admin / Coach), NEVER to Parents */}
            {role !== "Parent" && loggedUser?.role !== "parent" && (
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
              </div>
            )}

            {loggedUser ? (
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-white/90 text-xs font-medium">
                <User className="w-3 h-3 text-[#f5b700]" />
                <span className="max-w-[140px] truncate">{loggedUser.name}</span>
              </span>
            ) : userEmail ? (
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-white/90 text-xs font-medium">
                <User className="w-3 h-3 text-[#f5b700]" />
                <span className="max-w-[140px] truncate">{userEmail}</span>
              </span>
            ) : null}

            <Link
              href="/"
              title="Return to Public Website"
              className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 text-xs hidden sm:flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:border-white hover:bg-white/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl w-full px-5 py-8 flex-1">{children}</main>

      {/* Dashboard Footer */}
      <footer className="mt-auto border-t border-navy/10 bg-white py-4 text-center text-xs text-navy/60">
        <p>Yadav Cricket Academy &amp; Pace Foundation · Nagpur · Est. 2024</p>
      </footer>
    </div>
  );
}
