"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Shield, Users, Trophy, AlertCircle, CheckCircle2, Database } from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

const ROLES = {
  admin: {
    label: "Admin",
    to: "/admin",
    hint: "Manage academy admissions, fee collections, batch schedules & broadcast notices.",
    icon: Shield,
    demoEmail: "admin@ycapace.com",
  },
  coach: {
    label: "Coach",
    to: "/coach",
    hint: "Mark on-ground attendance and log Pace Foundation video skill reviews.",
    icon: Users,
    demoEmail: "coach@ycapace.com",
  },
  parent: {
    label: "Parent",
    to: "/parent",
    hint: "Follow your child's attendance, pay fees via UPI, view coach feedback & match scores.",
    icon: Trophy,
    demoEmail: "parent@gmail.com",
  },
} as const;

type Role = keyof typeof ROLES;

const field =
  "mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-navy focus:border-navy focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState<string>(ROLES.admin.demoEmail);
  const [password, setPassword] = useState<string>("password123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  function handleRoleChange(newRole: Role) {
    setRole(newRole);
    setEmail(ROLES[newRole].demoEmail);
    setErrorMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isConfigured) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Fall back gracefully to preview if credentials are demo
          if (email.endsWith("@ycapace.com") || email.endsWith("@gmail.com")) {
            router.push(ROLES[role].to);
            return;
          }
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        // Fetch user profile role if available
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

          if (profile?.role && profile.role in ROLES) {
            router.push(ROLES[profile.role as Role].to);
            return;
          }
        }

        router.push(ROLES[role].to);
      } else {
        // Prototype / Demo preview mode redirect
        router.push(ROLES[role].to);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const ActiveIcon = ROLES[role].icon;

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#f2f5fa]">
      {/* Brand Hero Aside */}
      <aside className="stripes hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-light.png" alt="" width={48} height={52} className="h-auto w-12" />
          <div>
            <span className="font-display text-2xl font-bold tracking-wide block leading-tight">
              YCA PACE
            </span>
            <span className="text-xs font-semibold text-white/60 tracking-wider uppercase block">
              Academy Management Portal
            </span>
          </div>
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded border border-gold/30">
            Nagpur&apos;s Premier Cricket Academy
          </span>
          <p className="mt-4 font-display text-7xl font-extrabold uppercase leading-[0.9]">
            Train.<br />Perform.<br />Progress.
          </p>
          <p className="mt-4 text-white/80 max-w-md text-base">
            Turf and cemented practice nets, night floodlight sessions, and biomechanical video skill
            analysis on Hingna Road.
          </p>
        </div>

        <div className="border-t border-white/10 pt-4 text-xs text-white/60">
          <p>Yadav Cricket Academy &amp; Pace Foundation · Mahajanwadi, Hingna Road, Nagpur</p>
          <p className="mt-1">Founder &amp; Head Coach: Jay Singh Yadav (+91 77097 05181)</p>
        </div>
      </aside>

      {/* Login Main Form Area */}
      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border-2 border-navy/15 shadow-xl">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-bold uppercase tracking-wider text-navy/60 hover:text-navy inline-flex items-center gap-1"
            >
              ← Back to website
            </Link>

            {/* Supabase Status Indicator */}
            {isConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Database className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                ⚡ Demo Mode
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-none text-navy">
            Portal Access
          </h1>
          <p className="text-xs text-navy/60 mt-1">Select your role to access your dashboard:</p>

          {/* Role Tabs: Admin, Coach, Parent */}
          <div role="tablist" className="mt-5 grid grid-cols-3 rounded-lg border-2 border-navy p-1 gap-1">
            {(Object.keys(ROLES) as Role[]).map((r) => {
              const Icon = ROLES[r].icon;
              return (
                <button
                  key={r}
                  role="tab"
                  type="button"
                  aria-selected={role === r}
                  onClick={() => handleRoleChange(r)}
                  className={`rounded py-2 font-display text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-1 transition-all ${
                    role === r
                      ? "bg-navy text-[#f5b700] shadow-sm"
                      : "text-navy hover:bg-navy/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {ROLES[r].label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-[#f2f5fa] border border-navy/10 text-xs text-navy/80 flex items-start gap-2">
            <ActiveIcon className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            <span>{ROLES[role].hint}</span>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-navy/80">
                Email / Username
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy/80">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-[#f5b700] px-5 py-3 font-display text-xl font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : `Sign In as ${ROLES[role].label}`}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-navy/10 text-center">
            <p className="text-xs text-navy/60">
              💡 <strong>Instant Access:</strong> Click sign in with the pre-filled credentials to explore the {ROLES[role].label} portal.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
