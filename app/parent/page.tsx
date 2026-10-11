"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  MOCK_PLAYERS,
  MOCK_FEES,
  MOCK_MATCHES,
  MOCK_VIDEO_ANALYSIS,
  MOCK_ANNOUNCEMENTS,
} from "@/lib/mockData";
import {
  Calendar,
  CreditCard,
  Video,
  Trophy,
  Bell,
  CheckCircle2,
  Download,
  QrCode,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function ParentDashboard() {
  const [selectedPlayerId, setSelectedPlayerId] = useState(MOCK_PLAYERS[0].id);
  const currentPlayer =
    MOCK_PLAYERS.find((p) => p.id === selectedPlayerId) || MOCK_PLAYERS[0];

  // Attendance string (P: Present, A: Absent)
  const ATTENDANCE_STR = "PPPPAPPPPPPAPPPPPPPPPP";
  const attendanceList = [...ATTENDANCE_STR];
  const presentCount = attendanceList.filter((c) => c === "P").length;
  const pct = Math.round((presentCount / attendanceList.length) * 100);

  // Fees for current player
  const playerFees = MOCK_FEES.filter((f) => f.playerId === currentPlayer.id);
  const latestFee = playerFees[0] || {
    id: "f-fallback",
    monthYear: "October 2026",
    amount: 2500,
    dueDate: "2026-10-05",
    status: "paid" as const,
    paymentMode: "UPI" as const,
    receiptNo: "RCP-2026-1042",
  };

  // State for modals
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);
  const [feePaidSimulated, setFeePaidSimulated] = useState(false);

  // Video analysis reviews for this player
  const playerVideos = MOCK_VIDEO_ANALYSIS.filter(
    (v) => v.playerId === currentPlayer.id || currentPlayer.id === "p1"
  );

  return (
    <DashboardShell role="Parent">
      {/* Student Switcher & Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy/15 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Student Profile
            </span>
            <span className="text-xs font-mono font-bold text-navy/60">
              {currentPlayer.playerCode}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase leading-tight text-navy mt-1">
            {currentPlayer.fullName}
          </h1>

          <p className="text-navy/70 text-sm mt-1">
            Batch: <strong className="text-navy">{currentPlayer.batchName}</strong> ·{" "}
            Discipline: <strong className="text-navy">{currentPlayer.primaryRole}</strong> · Age:{" "}
            {currentPlayer.age} yrs
          </p>
        </div>

        {/* Child Selector if multiple siblings */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-navy/15 shadow-sm">
          <span className="text-xs font-bold uppercase text-navy/60 px-2">Switch Child:</span>
          {MOCK_PLAYERS.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlayerId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPlayerId === p.id
                  ? "bg-[#0a1a33] text-[#f5b700] shadow-sm"
                  : "text-navy hover:bg-slate-100"
              }`}
            >
              {p.fullName.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-5">
        {/* Card 1: Attendance */}
        <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold uppercase tracking-wide text-navy/60">
                Monthly Attendance
              </span>
              <Calendar className="w-5 h-5 text-emerald-700" />
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-5xl font-extrabold text-navy">{pct}%</span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {presentCount} / {attendanceList.length} Sessions
              </span>
            </div>

            {/* Attendance matrix dots */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {attendanceList.map((c, i) => (
                <span
                  key={i}
                  title={`Session ${i + 1}: ${c === "P" ? "Present" : "Absent"}`}
                  className={`h-5 w-5 rounded transition-transform hover:scale-125 ${
                    c === "P" ? "bg-[#1e5a3c]" : "bg-[#b3202a]"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-4 pt-3 border-t border-navy/10 text-xs text-navy/60">
            Green = Attended on ground, Red = Absent.
          </p>
        </div>

        {/* Card 2: Fees Status */}
        <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold uppercase tracking-wide text-navy/60">
                Fee Account
              </span>
              <CreditCard className="w-5 h-5 text-navy" />
            </div>

            <div className="mt-3">
              <p className="font-display text-3xl font-extrabold text-[#1e5a3c]">
                October 2026: Paid ✓
              </p>
              <p className="text-xs text-navy/70 mt-0.5">
                Paid ₹2,500 via UPI (Ref: {latestFee.receiptNo || "RCP-1042"})
              </p>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[#f2f5fa] border border-navy/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-navy/70 font-medium">November 2026 Fee:</span>
                <span className="font-bold text-navy">₹2,500</span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">Due date: 05 Nov 2026</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy/10 flex gap-2">
            <button
              onClick={() => setShowReceiptModal(latestFee.receiptNo || "RCP-2026-1042")}
              className="flex-1 py-2 rounded-lg border border-navy/20 text-xs font-bold uppercase text-navy hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Receipt
            </button>
            <button
              onClick={() => setShowUpiModal(true)}
              className="flex-1 py-2 rounded-lg bg-[#f5b700] text-navy text-xs font-bold uppercase hover:brightness-95 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5" /> Pay Nov
            </button>
          </div>
        </div>

        {/* Card 3: Head Coach Remark */}
        <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold uppercase tracking-wide text-navy/60">
                Coach Assessment
              </span>
              <TrendingUp className="w-5 h-5 text-[#b3202a]" />
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/60">
                Jay Singh Yadav · Head Coach
              </span>
              <p className="mt-2 text-sm text-navy/85 italic bg-[#f2f5fa] p-3 rounded-lg border border-navy/10">
                &ldquo;Aarav has shown outstanding discipline in the morning run-up. His release point
                is consistent outside the off-stump. Working now on full length yorkers.&rdquo;
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between text-xs text-navy/60">
            <span>Updated: 06 Oct 2026</span>
            <span className="text-emerald-800 font-semibold">Tracked on video</span>
          </div>
        </div>
      </div>

      {/* Pace Foundation Video Skill Analysis Section */}
      <section className="mt-8 rounded-xl border-2 border-[#1e5a3c]/30 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#1e5a3c] text-white flex items-center justify-center shadow-sm">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e5a3c]">
                Pace Foundation Feature
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-navy">
                Video Skill &amp; Biomechanical Analysis
              </h2>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded bg-[#1e5a3c]/10 text-[#1e5a3c]">
            {playerVideos.length} Video Reviews Available
          </span>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {playerVideos.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border-2 border-navy/15 bg-[#f2f5fa] p-5 flex flex-col justify-between"
            >
              <div>
                {/* Simulated Video Player Box */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-navy flex items-center justify-center group cursor-pointer shadow-inner">
                  <div className="text-center text-white p-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f5b700] text-navy font-bold shadow-lg transition-transform group-hover:scale-110">
                      ▶
                    </span>
                    <p className="mt-2 text-xs font-semibold tracking-wider uppercase text-white/80">
                      Bowling Action: {review.skillCategory}
                    </p>
                  </div>
                  {review.bowlingSpeedKmph && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-gold border border-white/20">
                      ⚡ {review.bowlingSpeedKmph} km/h
                    </div>
                  )}
                  <div className="absolute bottom-2 left-3 text-[11px] text-white/70">
                    Recorded at YCA Hingna Nets · {review.date}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold uppercase text-navy">
                      {review.skillCategory}
                    </h3>
                    <span className="text-xs font-semibold text-navy/60">
                      Coach: {review.coachName}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-navy/80">{review.feedback}</p>

                  <div className="mt-3 space-y-1">
                    {review.keyPointers.map((ptr, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-navy/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{ptr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy/10 flex justify-between items-center text-xs">
                <span className="text-navy/60">Analyzed for {currentPlayer.fullName}</span>
                <span className="text-[#1e5a3c] font-bold">Good Length Drill</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Match Scores and Announcements Grid */}
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Match Performance Table */}
        <section className="lg:col-span-2 rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-navy/10 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#b3202a]" />
              <h2 className="font-display text-2xl font-bold uppercase text-navy">
                Recent Match Scorecards
              </h2>
            </div>
            <span className="text-xs text-navy/60">Season 2026</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-navy">
              <thead className="bg-[#f2f5fa] border-b border-navy/15 text-xs font-bold uppercase tracking-wider text-navy/70">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Match</th>
                  <th className="py-2.5 px-3">Against</th>
                  <th className="py-2.5 px-3">Batting</th>
                  <th className="py-2.5 px-3">Bowling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {MOCK_MATCHES.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-xs text-navy/70">{m.matchDate}</td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-navy text-gold">
                        {m.level}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-xs">{m.opponent}</td>
                    <td className="py-3 px-3 font-mono font-bold text-xs">{m.battingScore}</td>
                    <td className="py-3 px-3 font-mono font-bold text-xs text-emerald-800">
                      {m.bowlingFigures}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notices & Announcements */}
        <section className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-navy/10 pb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-navy" />
              <h2 className="font-display text-2xl font-bold uppercase text-navy">
                Academy Notices
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {MOCK_ANNOUNCEMENTS.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-lg bg-[#f2f5fa] border border-navy/10 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy text-gold">
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-navy/50">{ann.date}</span>
                </div>
                <h3 className="font-bold text-sm text-navy">{ann.title}</h3>
                <p className="text-xs text-navy/75 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL 1: UPI PAYMENT QR CODE */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl text-center">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display text-2xl font-bold uppercase text-navy">
                Pay November Fee
              </h3>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-navy/50 hover:text-navy text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#f2f5fa] border border-navy/15 flex flex-col items-center">
              {/* Simulated QR Code */}
              <div className="w-44 h-44 bg-white p-3 rounded-lg border-2 border-navy flex flex-col items-center justify-center shadow-md">
                <QrCode className="w-32 h-32 text-navy" />
                <span className="text-[10px] font-mono font-bold text-navy mt-1">7709705181@upi</span>
              </div>

              <p className="mt-3 font-display text-3xl font-extrabold text-navy">₹2,500.00</p>
              <p className="text-xs text-navy/70">Yadav Cricket Academy &amp; Pace Foundation</p>
              <p className="text-[11px] text-navy/50">Accepted on GPay, PhonePe, Paytm, BHIM</p>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setFeePaidSimulated(true);
                  setShowUpiModal(false);
                }}
                className="w-full rounded-md bg-emerald-700 py-2.5 font-display text-base font-bold uppercase tracking-wide text-white hover:bg-emerald-800 transition-colors shadow-sm"
              >
                I Have Completed UPI Payment
              </button>
              <button
                onClick={() => setShowUpiModal(false)}
                className="w-full py-1 text-xs text-navy/60 hover:text-navy"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="font-display text-xl font-bold uppercase text-navy">
                Fee Receipt
              </span>
              <button
                onClick={() => setShowReceiptModal(null)}
                className="text-navy/50 hover:text-navy text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 border-2 border-navy/20 p-5 rounded-lg bg-[#f2f5fa]/50 space-y-3 text-sm">
              <div className="text-center border-b border-navy/15 pb-3">
                <h4 className="font-display text-2xl font-bold uppercase text-navy">
                  Yadav Cricket Academy
                </h4>
                <p className="text-xs text-navy/70">Pace Foundation · Hingna Road, Nagpur</p>
                <p className="text-xs font-mono font-bold text-navy mt-1">
                  Receipt No: {showReceiptModal}
                </p>
              </div>

              <div className="flex justify-between">
                <span className="text-navy/60">Student:</span>
                <span className="font-bold text-navy">{currentPlayer.fullName} ({currentPlayer.playerCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/60">Batch:</span>
                <span className="font-semibold text-navy">{currentPlayer.batchName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/60">Month:</span>
                <span className="font-semibold text-navy">October 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/60">Payment Mode:</span>
                <span className="font-semibold text-navy">UPI (Verified)</span>
              </div>
              <div className="flex justify-between border-t border-navy/15 pt-2">
                <span className="font-bold text-navy">Total Paid:</span>
                <span className="font-display text-2xl font-bold text-emerald-800">₹2,500.00</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 rounded-md bg-[#0a1a33] py-2.5 font-display text-base font-bold uppercase tracking-wide text-gold hover:bg-[#06122a] flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={() => setShowReceiptModal(null)}
                className="px-4 rounded-md border border-navy/20 text-xs font-bold uppercase text-navy hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
