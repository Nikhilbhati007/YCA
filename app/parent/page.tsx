"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import PaymentModal from "@/components/PaymentModal";
import ReceiptModal from "@/components/ReceiptModal";
import { Player, VideoAnalysis, Announcement, FeeRecord } from "@/lib/types";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
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
  ShieldCheck,
  Database,
} from "lucide-react";

export default function ParentDashboard() {
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [playersList, setPlayersList] = useState<Player[]>(MOCK_PLAYERS);
  const [selectedPlayerId, setSelectedPlayerId] = useState(MOCK_PLAYERS[0].id);
  const currentPlayer =
    playersList.find((p) => p.id === selectedPlayerId) || playersList[0] || MOCK_PLAYERS[0];

  // Attendance string (P: Present, A: Absent)
  const ATTENDANCE_STR = "PPPPAPPPPPPAPPPPPPPPPP";
  const attendanceList = [...ATTENDANCE_STR];
  const presentCount = attendanceList.filter((c) => c === "P").length;
  const pct = Math.round((presentCount / attendanceList.length) * 100);

  // Fees ledger state
  const [feesList, setFeesList] = useState<FeeRecord[]>(MOCK_FEES);
  const [videoList, setVideoList] = useState<VideoAnalysis[]>(MOCK_VIDEO_ANALYSIS);
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  // Fetch live Supabase records on mount
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsLiveDb(configured);
    if (!configured) return;

    const supabase = createClient();

    async function loadSupabase() {
      try {
        // 1. Players
        const { data: dbPlayers } = await supabase.from("players").select("*");
        if (dbPlayers && dbPlayers.length > 0) {
          const mappedPlayers: Player[] = dbPlayers.map((p: any) => ({
            id: p.id,
            playerCode: p.player_code,
            fullName: p.full_name,
            dob: p.dob || "2012-01-01",
            age: 14,
            gender: p.gender || "Boy",
            batchId: p.batch_id || "batch-u14",
            batchName: "U14",
            parentId: p.parent_id || "parent-1",
            parentName: "Parent",
            parentPhone: "+91 98220 12345",
            primaryRole: p.primary_role || "Fast Bowler",
            bowlingStyle: p.bowling_style,
            battingStyle: p.batting_style,
            status: p.status || "active",
            joiningDate: p.created_at?.split("T")[0] || "2026-10-10",
          }));
          setPlayersList(mappedPlayers);
          setSelectedPlayerId(mappedPlayers[0].id);
        }

        // 2. Fees
        const { data: dbFees } = await supabase.from("fees").select("*");
        if (dbFees && dbFees.length > 0) {
          const mappedFees: FeeRecord[] = dbFees.map((f: any) => ({
            id: f.id,
            playerId: f.player_id,
            monthYear: f.month_year,
            amount: Number(f.amount),
            dueDate: f.due_date,
            status: f.status,
            paymentMode: f.payment_mode,
            transactionRef: f.transaction_ref,
            paidAt: f.paid_at,
            receiptNo: f.receipt_no,
          }));
          setFeesList((prev) => {
            const merged = [...mappedFees];
            for (const pf of prev) {
              if (!merged.some((m) => m.monthYear === pf.monthYear && (m.playerId === pf.playerId || m.id === pf.id))) {
                merged.push(pf);
              }
            }
            return merged;
          });
        }

        // 3. Video Analyses
        const { data: dbVideos } = await supabase
          .from("video_analyses")
          .select("*")
          .order("created_at", { ascending: false });
        if (dbVideos && dbVideos.length > 0) {
          const mappedVideos: VideoAnalysis[] = dbVideos.map((v: any) => ({
            id: v.id,
            playerId: v.player_id,
            coachName: "Jay Singh Yadav",
            date: v.created_at
              ? new Date(v.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Today",
            videoUrl: v.video_url,
            thumbnailPlaceholderColor: "#1e5a3c",
            skillCategory: v.skill_category || "Release Point",
            bowlingSpeedKmph: v.measured_speed_kmph ? Number(v.measured_speed_kmph) : 115,
            feedback: v.coach_feedback,
            keyPointers: [
              "Tracked & analyzed on Hingna turf pitch",
              "Synced to Supabase Cloud",
            ],
          }));
          setVideoList(mappedVideos);
        }

        // 4. Announcements
        const { data: dbAnn } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });
        if (dbAnn && dbAnn.length > 0) {
          const mappedAnn: Announcement[] = dbAnn.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.body,
            category: a.category || "Notice",
            date: a.created_at
              ? new Date(a.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Today",
          }));
          setAnnouncementsList(mappedAnn);
        }
      } catch (err) {
        console.warn("Supabase fetch notice:", err);
      }
    }

    loadSupabase();
  }, []);

  // Current student fees
  const playerFees = feesList.filter((f) => f.playerId === currentPlayer.id);
  const octoberFee = playerFees.find((f) => f.monthYear.includes("October")) || {
    id: `f-oct-${currentPlayer.id}`,
    playerId: currentPlayer.id,
    monthYear: "October 2026",
    amount: 2500,
    dueDate: "2026-10-05",
    status: "paid" as const,
    paymentMode: "UPI" as const,
    transactionRef: "UPI-42890128912",
    receiptNo: "RCP-2026-1042",
    paidAt: "2026-10-04",
  };
  const novemberFee = playerFees.find((f) => f.monthYear.includes("November")) || {
    id: `f-nov-${currentPlayer.id}`,
    playerId: currentPlayer.id,
    monthYear: "November 2026",
    amount: 2500,
    dueDate: "2026-11-05",
    status: "pending" as const,
  };

  // State for Payment Gateway & Official Receipt Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<{
    receiptNo: string;
    studentName: string;
    playerCode: string;
    batchName: string;
    monthYear: string;
    amount: number;
    paymentMode: string;
    transactionRef: string;
    paidAt: string;
  } | null>(null);

  function openReceiptForFee(feeRecord: FeeRecord) {
    setActiveReceipt({
      receiptNo: feeRecord.receiptNo || "RCP-2026-1042",
      studentName: currentPlayer.fullName,
      playerCode: currentPlayer.playerCode,
      batchName: currentPlayer.batchName,
      monthYear: feeRecord.monthYear,
      amount: feeRecord.amount,
      paymentMode: feeRecord.paymentMode || "UPI (Verified)",
      transactionRef: feeRecord.transactionRef || "UPI-42890128912",
      paidAt: feeRecord.paidAt || new Date().toISOString(),
    });
    setShowReceiptModal(true);
  }

  function handlePaymentSuccess(details: {
    receiptNo: string;
    paymentId: string;
    paidAt: string;
    method: string;
    amount: number;
    monthYear: string;
  }) {
    setFeesList((prev) => {
      const existingIdx = prev.findIndex(
        (f) => f.playerId === currentPlayer.id && f.monthYear === details.monthYear
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          status: "paid",
          paymentMode: "UPI",
          transactionRef: details.paymentId,
          receiptNo: details.receiptNo,
          paidAt: details.paidAt,
        };
        return copy;
      }
      return [
        {
          id: `fee-paid-${Date.now()}`,
          playerId: currentPlayer.id,
          monthYear: details.monthYear,
          amount: details.amount,
          dueDate: "2026-11-05",
          status: "paid",
          paymentMode: "UPI",
          transactionRef: details.paymentId,
          receiptNo: details.receiptNo,
          paidAt: details.paidAt,
        },
        ...prev,
      ];
    });

    setShowPaymentModal(false);
    setActiveReceipt({
      receiptNo: details.receiptNo,
      studentName: currentPlayer.fullName,
      playerCode: currentPlayer.playerCode,
      batchName: currentPlayer.batchName,
      monthYear: details.monthYear,
      amount: details.amount,
      paymentMode: details.method,
      transactionRef: details.paymentId,
      paidAt: details.paidAt,
    });
    setShowReceiptModal(true);
  }

  // Video analysis reviews for this player
  const playerVideos = videoList.filter(
    (v) =>
      v.playerId === currentPlayer.id ||
      currentPlayer.id === "p1" ||
      currentPlayer.id === playersList[0]?.id
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
            {isLiveDb ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Database className="w-3 h-3 text-emerald-600" /> Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                ⚡ Demo Mode
              </span>
            )}
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
          {playersList.slice(0, 3).map((p) => (
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

            {novemberFee.status === "paid" ? (
              <>
                <div className="mt-3">
                  <p className="font-display text-3xl font-extrabold text-[#1e5a3c]">
                    November 2026: Paid ✓
                  </p>
                  <p className="text-xs text-navy/70 mt-0.5">
                    Paid ₹{novemberFee.amount} (Ref: {novemberFee.receiptNo || "Verified"})
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Account Up to Date
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-800">No Dues</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                    Next cycle: December 2026
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mt-3">
                  <p className="font-display text-3xl font-extrabold text-[#1e5a3c]">
                    October 2026: Paid ✓
                  </p>
                  <p className="text-xs text-navy/70 mt-0.5">
                    Paid ₹2,500 via UPI (Ref: {octoberFee.receiptNo || "RCP-2026-1042"})
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-[#f2f5fa] border border-navy/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-navy/70 font-medium">November 2026 Fee:</span>
                    <span className="font-bold text-navy">₹{novemberFee.amount}</span>
                  </div>
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">
                    Due date: {novemberFee.dueDate}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-navy/10 flex gap-2">
            {novemberFee.status === "paid" ? (
              <>
                <button
                  type="button"
                  onClick={() => openReceiptForFee(novemberFee)}
                  className="flex-1 py-2 rounded-lg bg-[#0a1a33] text-gold text-xs font-bold uppercase hover:bg-navy/90 flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Nov Receipt
                </button>
                <button
                  type="button"
                  onClick={() => openReceiptForFee(octoberFee)}
                  className="px-3 py-2 rounded-lg border border-navy/20 text-xs font-bold uppercase text-navy hover:bg-slate-50 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="View Previous October Receipt"
                >
                  Oct Receipt
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openReceiptForFee(octoberFee)}
                  className="px-3 py-2 rounded-lg border border-navy/20 text-xs font-bold uppercase text-navy hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Oct Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="flex-1 py-2 rounded-lg bg-[#f5b700] text-navy text-xs font-bold uppercase hover:brightness-95 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> Pay Nov (₹2,500)
                </button>
              </>
            )}
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
                {/* Real Video Player or Fallback Simulated Player */}
                {review.videoUrl && (review.videoUrl.startsWith("http") || review.videoUrl.startsWith("blob")) ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-md">
                      <video
                        src={review.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      {review.bowlingSpeedKmph && (
                        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-gold border border-white/20 pointer-events-none">
                          ⚡ {review.bowlingSpeedKmph} km/h
                        </div>
                      )}
                    </div>

                    {/* Biomechanics Slow-Motion Speed Control */}
                    <div className="flex items-center justify-between text-xs bg-navy/5 px-3 py-1.5 rounded-lg border border-navy/10">
                      <span className="font-semibold text-navy/70 text-[11px]">Biomechanics Speed:</span>
                      <div className="flex items-center gap-1">
                        {[0.25, 0.5, 1.0].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={(e) => {
                              const parentDiv = e.currentTarget.closest(".space-y-2");
                              const videoEl = parentDiv?.querySelector("video") as HTMLVideoElement;
                              if (videoEl) {
                                videoEl.playbackRate = rate;
                              }
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-navy/20 hover:bg-[#f5b700] hover:text-navy text-navy transition-colors cursor-pointer"
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}

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
            {announcementsList.map((ann) => (
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

      {/* REAL PAYMENT GATEWAY CHECKOUT (RAZORPAY + UPI APP INTENT & QR) */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        player={currentPlayer}
        fee={{
          id: novemberFee.id,
          monthYear: novemberFee.monthYear,
          amount: novemberFee.amount,
          dueDate: novemberFee.dueDate,
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* OFFICIAL PRINTABLE YCA PACE RECEIPT MODAL */}
      {activeReceipt && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          receiptData={activeReceipt}
        />
      )}
    </DashboardShell>
  );
}
