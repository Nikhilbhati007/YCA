"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";

const BATCHES = [
  { name: "U14", session: "Morning", time: "6:30 – 9:30 AM", players: 18 },
  { name: "U19", session: "Evening", time: "4:30 – 7:00 PM", players: 14 },
  { name: "Open", session: "Under lights", time: "Night", players: 9 },
];
const PLAYERS = ["Aarav Sharma", "Riya Patil", "Kabir Deshmukh", "Ishaan Meshram", "Sara Khan", "Vihaan Rathod"];

const card = "rounded-lg border-2 border-navy bg-white p-5";
const label = "font-display text-lg font-semibold uppercase tracking-wide text-navy/60";

export default function CoachDashboard() {
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(PLAYERS.map((p) => [p, true])),
  );
  const [saved, setSaved] = useState(false);
  const count = Object.values(present).filter(Boolean).length;

  function toggle(p: string) {
    setSaved(false);
    setPresent((s) => ({ ...s, [p]: !s[p] }));
  }

  return (
    <DashboardShell role="Coach">
      <h1 className="font-display text-5xl font-bold uppercase leading-none">Today&apos;s sessions</h1>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {BATCHES.map((b) => (
          <li key={b.name} className={card}>
            <p className="font-display text-5xl font-extrabold">{b.name}</p>
            <p className="mt-1 font-semibold">{b.session}</p>
            <p className="text-navy/70">{b.time}</p>
            <p className="mt-3 text-sm text-navy/60">{b.players} players</p>
          </li>
        ))}
      </ul>

      <section className={`${card} mt-4`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={label}>Attendance · U14 Morning</h2>
          <p className="font-display text-2xl font-bold">
            {count} / {PLAYERS.length} present
          </p>
        </div>
        <ul className="mt-4 divide-y divide-navy/10">
          {PLAYERS.map((p) => (
            <li key={p} className="flex items-center justify-between gap-4 py-3">
              <span className="text-lg">{p}</span>
              <button
                type="button"
                onClick={() => toggle(p)}
                aria-pressed={present[p]}
                className={`w-28 rounded-md py-1.5 font-display text-lg font-bold uppercase ${
                  present[p] ? "bg-turf text-white" : "bg-ball text-white"
                }`}
              >
                {present[p] ? "Present" : "Absent"}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="mt-5 rounded-md bg-gold px-6 py-3 font-display text-xl font-bold uppercase tracking-wide text-navy hover:brightness-95"
        >
          {saved ? "Saved (demo)" : "Save attendance"}
        </button>
      </section>
    </DashboardShell>
  );
}
