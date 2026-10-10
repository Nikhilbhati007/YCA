"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const ROLES = {
  parent: { label: "Parent", to: "/parent", hint: "Follow your child's attendance, fees and progress." },
  coach: { label: "Coach", to: "/coach", hint: "Mark attendance and keep track of your players." },
} as const;
type Role = keyof typeof ROLES;

const field =
  "mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-navy focus:border-navy";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("parent");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // DEMO ONLY: any email and password works. Replace with Supabase sign-in,
    // then redirect by the role stored in the database, never by the selected tab.
    router.push(ROLES[role].to);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="stripes hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-light.png" alt="" width={48} height={52} className="h-auto w-12" />
          <span className="font-display text-2xl font-bold tracking-wide">YCA PACE</span>
        </Link>
        <p className="font-display text-7xl font-extrabold uppercase leading-[0.9]">
          Train.<br />Perform.<br />Progress.
        </p>
        <p className="text-white/70">Yadav Cricket Academy &amp; Pace Foundation</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-sm font-semibold text-navy/70 hover:text-navy">
            ← Back to website
          </Link>
          <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-none">Login</h1>

          <div role="tablist" className="mt-6 grid grid-cols-2 rounded-md border-2 border-navy p-1">
            {(Object.keys(ROLES) as Role[]).map((r) => (
              <button
                key={r}
                role="tab"
                type="button"
                aria-selected={role === r}
                onClick={() => setRole(r)}
                className={`rounded py-2 font-display text-xl font-bold uppercase tracking-wide ${
                  role === r ? "bg-navy text-gold" : "text-navy hover:bg-navy/10"
                }`}
              >
                {ROLES[r].label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-navy/70">{ROLES[role].hint}</p>

          <form onSubmit={submit} className="mt-6">
            <label className="block font-semibold">
              Email
              <input type="email" required autoComplete="username" className={field} />
            </label>
            <label className="mt-4 block font-semibold">
              Password
              <input type="password" required autoComplete="current-password" className={field} />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-gold px-5 py-3 font-display text-xl font-bold uppercase tracking-wide text-navy hover:brightness-95"
            >
              Login as {ROLES[role].label}
            </button>
          </form>

          <p className="mt-4 text-sm">
            <a href="#" className="font-semibold underline">Forgot password?</a>
          </p>
          <p className="mt-6 text-sm text-navy/60">
            Accounts are created by the academy. Ask the academy office for your login.
          </p>
        </div>
      </main>
    </div>
  );
}
