"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  MOCK_BATCHES,
  MOCK_PLAYERS,
  MOCK_FEES,
  MOCK_ENQUIRIES,
  MOCK_ANNOUNCEMENTS,
} from "@/lib/mockData";
import { Player, Enquiry, FeeRecord, Announcement, Batch } from "@/lib/types";
import {
  Users,
  CreditCard,
  PhoneCall,
  CalendarCheck,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  Database,
  Download,
} from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import ReceiptModal from "@/components/ReceiptModal";

export default function AdminDashboard() {
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "batches" | "fees" | "enquiries" | "announcements"
  >("overview");

  // State for data tables
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES);
  const [fees, setFees] = useState<FeeRecord[]>(MOCK_FEES);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");

  // New Student Modal / Form state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerAge, setNewPlayerAge] = useState("");
  const [newPlayerBatch, setNewPlayerBatch] = useState("batch-u14");
  const [newPlayerRole, setNewPlayerRole] = useState("Fast Bowler");
  const [newParentName, setNewParentName] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");

  // New Announcement form state
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnCategory, setNewAnnCategory] = useState<"Notice" | "Match Day" | "Holiday">("Notice");

  // Quick Action notification feedback
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Admin printable receipt modal state
  const [adminReceiptData, setAdminReceiptData] = useState<{
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

  function openReceiptForAdmin(player: Player, fee: FeeRecord) {
    setAdminReceiptData({
      receiptNo: fee.receiptNo || `RCP-${fee.id.slice(-6)}`,
      studentName: player.fullName,
      playerCode: player.playerCode,
      batchName: player.batchName,
      monthYear: fee.monthYear,
      amount: fee.amount,
      paymentMode: fee.paymentMode || "Cash / Direct",
      transactionRef: fee.transactionRef || "OFFLINE-REC",
      paidAt: fee.paidAt || new Date().toISOString(),
    });
  }

  function triggerFeedback(msg: string) {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  }

  // Fetch live records from Supabase if configured
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsLiveDb(configured);

    if (!configured) return;

    const supabase = createClient();

    async function loadDb() {
      try {
        // Load Batches
        const { data: dbBatches } = await supabase.from("batches").select("*");
        const batchMap: Record<string, string> = {};
        if (dbBatches && dbBatches.length > 0) {
          const mappedB: Batch[] = dbBatches.map((b: any) => {
            batchMap[b.id] = b.name;
            return {
              id: b.id,
              name: b.name,
              sessionTime: b.session_time,
              timeSlot: b.time_slot,
              playerCount: b.player_count || 0,
              leadCoach: b.lead_coach || "Nilesh Raut",
            };
          });
          setBatches(mappedB);
        }

        // Load Players
        const { data: dbPlayers } = await supabase.from("players").select("*");
        if (dbPlayers && dbPlayers.length > 0) {
          const mapped: Player[] = dbPlayers.map((p: any) => {
            const birthYear = p.dob ? new Date(p.dob).getFullYear() : 2013;
            const age = Math.max(5, 2026 - birthYear);
            return {
              id: p.id,
              playerCode: p.player_code,
              fullName: p.full_name,
              dob: p.dob || "2013-01-01",
              age,
              gender: p.gender || "Boy",
              batchId: p.batch_id || "batch-u14",
              batchName: batchMap[p.batch_id] || "U14",
              parentId: p.parent_id || undefined,
              parentName: p.parent_name || undefined,
              parentPhone: p.parent_phone || undefined,
              primaryRole: p.primary_role || "Fast Bowler",
              bowlingStyle: p.bowling_style,
              battingStyle: p.batting_style,
              status: p.status || "active",
              joiningDate: p.created_at?.split("T")[0] || "2026-10-10",
            };
          });
          setPlayers(mapped);
        }

        // Load Enquiries
        const { data: dbEnquiries } = await supabase.from("enquiries").select("*");
        if (dbEnquiries && dbEnquiries.length > 0) {
          const mappedE: Enquiry[] = dbEnquiries.map((e: any) => ({
            id: e.id,
            playerName: e.player_name,
            age: e.age,
            phone: e.contact_phone,
            preferredBatch: e.preferred_batch,
            status: e.status,
            createdAt: e.created_at?.split("T")[0] || "Today",
            notes: e.notes,
          }));
          setEnquiries(mappedE);
        }

        // Load Announcements
        const { data: dbAnnouncements } = await supabase.from("announcements").select("*");
        if (dbAnnouncements && dbAnnouncements.length > 0) {
          const mappedA: Announcement[] = dbAnnouncements.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.body,
            category: a.category,
            date: a.created_at?.split("T")[0] || "Today",
          }));
          setAnnouncements(mappedA);
        }
      } catch (err) {
        console.warn("Error loading records from Supabase:", err);
      }
    }

    loadDb();
  }, []);

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const b = batches.find((item) => item.id === newPlayerBatch);
    const newPlayerCode = `YCA-00${players.length + 43}`;

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      playerCode: newPlayerCode,
      fullName: newPlayerName,
      dob: "2012-01-01",
      age: parseInt(newPlayerAge, 10) || 14,
      gender: "Boy",
      batchId: newPlayerBatch,
      batchName: b?.name || "U14",
      parentId: `parent-${Date.now()}`,
      parentName: newParentName || "Parent",
      parentPhone: newParentPhone || "+91 99999 00000",
      primaryRole: newPlayerRole as Player["primaryRole"],
      status: "active",
      joiningDate: new Date().toISOString().split("T")[0],
    };

    // If Supabase is configured, write to live database!
    if (isLiveDb) {
      try {
        const supabase = createClient();
        await supabase.from("players").insert({
          player_code: newPlayerCode,
          full_name: newPlayerName,
          dob: "2012-01-01",
          gender: "Boy",
          primary_role: newPlayerRole,
          status: "active",
        });
        triggerFeedback(`Player ${newPlayer.fullName} saved in your Supabase database!`);
      } catch (err) {
        console.error("Supabase insert error:", err);
        triggerFeedback(`Player added to local view (Check Supabase connection).`);
      }
    } else {
      triggerFeedback(`Player ${newPlayer.fullName} enrolled in ${newPlayer.batchName}!`);
    }

    setPlayers([newPlayer, ...players]);
    setShowAddPlayer(false);
    setNewPlayerName("");
    setNewPlayerAge("");
    setNewParentName("");
    setNewParentPhone("");
  }

  async function handleEnquiryStatusChange(id: string, newStatus: Enquiry["status"]) {
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    if (isLiveDb) {
      try {
        const supabase = createClient();
        await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);
        triggerFeedback("Status synchronized with Supabase!");
        return;
      } catch (err) {
        console.warn("Could not sync with Supabase:", err);
      }
    }
    triggerFeedback("Enquiry lead status updated!");
  }

  async function markFeePaid(feeId: string) {
    const today = new Date().toISOString().split("T")[0];
    const receipt = `RCP-${Date.now().toString().slice(-6)}`;

    setFees((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: "paid",
              paymentMode: "Cash",
              paidAt: today,
              receiptNo: receipt,
            }
          : f
      )
    );

    if (isLiveDb) {
      try {
        const supabase = createClient();
        await supabase
          .from("fees")
          .update({
            status: "paid",
            payment_mode: "Cash",
            paid_at: today,
            receipt_no: receipt,
          })
          .eq("id", feeId);
        triggerFeedback("Payment recorded and saved in Supabase!");
        return;
      } catch (err) {
        console.warn("Could not sync with Supabase:", err);
      }
    }
    triggerFeedback("Payment recorded and receipt generated!");
  }

  function sendFeeReminder(player: Player, fee: FeeRecord) {
    if (!player.parentPhone) {
      triggerFeedback(`Parent phone not registered for ${player.fullName}.`);
      return;
    }
    const text = `Namaste ${player.parentName || "Parent"}, gentle reminder from Yadav Cricket Academy & Pace Foundation: Monthly cricket coaching fee for ${player.fullName} (${fee.monthYear}) is due. Kindly pay via UPI to 7709705181. Thank you!`;
    const cleanPhone = player.parentPhone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handlePostAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    const ann: Announcement = {
      id: `an-${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      category: newAnnCategory,
      date: "Today",
    };

    if (isLiveDb) {
      try {
        const supabase = createClient();
        await supabase.from("announcements").insert({
          title: newAnnTitle,
          body: newAnnContent,
          category: newAnnCategory,
        });
        triggerFeedback("Broadcast published to Supabase database & all portals!");
      } catch (err) {
        console.warn("Could not save to Supabase:", err);
        triggerFeedback("Broadcast published locally!");
      }
    } else {
      triggerFeedback("Broadcast announcement published to Parent & Coach portals!");
    }

    setAnnouncements([ann, ...announcements]);
    setNewAnnTitle("");
    setNewAnnContent("");
  }

  // Filtered players
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.playerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.parentPhone && p.parentPhone.includes(searchQuery));
    const matchesBatch = selectedBatchFilter === "all" || p.batchId === selectedBatchFilter;
    return matchesSearch && matchesBatch;
  });

  const totalFeeCollected = fees
    .filter((f) => f.status === "paid")
    .reduce((acc, f) => acc + f.amount, 0);
  const totalFeePending = fees
    .filter((f) => f.status !== "paid")
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <DashboardShell role="Admin">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-white shadow-xl animate-fade-in">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium text-sm">{actionFeedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b3202a]">
              Head Coach &amp; Management Office
            </span>

            {isLiveDb ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Database className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Academy Roster
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase leading-tight text-navy mt-1">
            Academy Control Center
          </h1>
          <p className="text-navy/70 text-sm mt-1">
            Yadav Cricket Academy &amp; Pace Foundation · Mahajanwadi, Hingna Road, Nagpur
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddPlayer(true)}
            className="flex items-center gap-2 rounded-md bg-[#0a1a33] px-4 py-2.5 font-display text-base font-bold uppercase tracking-wide text-gold hover:bg-[#06122a] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Enroll Player
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-navy/60">
            <span className="text-xs font-bold uppercase tracking-wider">Active Players</span>
            <Users className="h-5 w-5 text-[#0a1a33]" />
          </div>
          <p className="mt-3 font-display text-4xl font-extrabold text-navy">{players.length}</p>
          <p className="mt-1 text-xs text-navy/60">Across {batches.length} training batches</p>
        </div>

        <div className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-navy/60">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Attendance</span>
            <CalendarCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <p className="mt-3 font-display text-4xl font-extrabold text-navy">—</p>
          <p className="mt-1 text-xs text-navy/60">Pending daily coach roster</p>
        </div>

        <div className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-navy/60">
            <span className="text-xs font-bold uppercase tracking-wider">Fee Collection</span>
            <CreditCard className="h-5 w-5 text-navy" />
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-navy">
            ₹{totalFeeCollected.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-amber-700 font-semibold">
            ₹{totalFeePending.toLocaleString("en-IN")} pending
          </p>
        </div>

        <div className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-navy/60">
            <span className="text-xs font-bold uppercase tracking-wider">Trial Leads</span>
            <PhoneCall className="h-5 w-5 text-[#b3202a]" />
          </div>
          <p className="mt-3 font-display text-4xl font-extrabold text-[#b3202a]">
            {enquiries.filter((e) => e.status === "new" || e.status === "trial_booked").length}
          </p>
          <p className="mt-1 text-xs text-navy/60">From website trial bookings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8 border-b-2 border-navy/20 flex gap-2 sm:gap-6 overflow-x-auto">
        {[
          { key: "overview", label: "Overview" },
          { key: "students", label: `Students (${players.length})` },
          { key: "batches", label: "Batches & Pitches" },
          { key: "fees", label: "Fee Ledger" },
          { key: "enquiries", label: `Enquiries (${enquiries.length})` },
          { key: "announcements", label: "Broadcasts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-2 font-display text-lg font-bold uppercase tracking-wide border-b-4 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#f5b700] text-navy"
                : "border-transparent text-navy/50 hover:text-navy hover:border-navy/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Session Schedule */}
            <div className="lg:col-span-2 rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
                Today&apos;s Academy Ground Schedule
              </h2>
              <p className="text-sm text-navy/70 mt-1">
                Pitch allocation: 3 Turf Pitches &amp; 4 Cemented Practice Nets
              </p>

              <div className="mt-5 space-y-3">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-[#f2f5fa] border border-navy/10 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-2xl font-bold text-navy">{b.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-navy text-gold">
                          {b.sessionTime}
                        </span>
                      </div>
                      <p className="text-sm text-navy/70 mt-1">
                        Time: <strong className="text-navy">{b.timeSlot}</strong> · Lead: {b.leadCoach}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-navy/80 bg-white px-3 py-1.5 rounded border border-navy/15">
                        {b.playerCount} Registered
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded">
                        Active Ground
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
                  Academy Operations
                </h2>
                <p className="text-sm text-navy/70 mt-1">Direct admin controls</p>

                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => setActiveTab("students")}
                    className="w-full text-left p-3 rounded-lg border border-navy/15 hover:bg-gold/15 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-sm">View Student Directory</span>
                    <span className="text-xs font-bold text-navy">→</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("fees")}
                    className="w-full text-left p-3 rounded-lg border border-navy/15 hover:bg-gold/15 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-sm">Review Pending Fee Notices</span>
                    <span className="text-xs font-bold text-amber-800">
                      ₹{totalFeePending.toLocaleString("en-IN")}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("enquiries")}
                    className="w-full text-left p-3 rounded-lg border border-navy/15 hover:bg-gold/15 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-sm">Trial Bookings from Web</span>
                    <span className="text-xs font-bold text-[#b3202a]">
                      {enquiries.filter((e) => e.status === "new").length} New
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className="w-full text-left p-3 rounded-lg border border-navy/15 hover:bg-gold/15 transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold text-sm">Broadcast Notice to Parents</span>
                    <span className="text-xs font-bold text-navy">Publish</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-navy/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-navy text-gold flex items-center justify-center font-display font-bold text-lg">
                    JY
                  </div>
                  <div>
                    <p className="font-bold text-sm text-navy">Jay Singh Yadav</p>
                    <p className="text-xs text-navy/60">Head Coach &amp; Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === "students" && (
        <div className="mt-6 space-y-4">
          {/* Search & Batch Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-navy/15">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-navy/50" />
              <input
                type="text"
                placeholder="Search by name, ID or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-navy/20 focus:outline-none focus:border-navy"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-navy/60 hidden sm:inline" />
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border border-navy/20 focus:outline-none focus:border-navy bg-white w-full sm:w-auto"
              >
                <option value="all">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.sessionTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto rounded-xl border-2 border-navy/15 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-navy">
              <thead className="bg-[#f2f5fa] border-b border-navy/15 text-xs font-bold uppercase tracking-wider text-navy/70">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Age / Batch</th>
                  <th className="py-3 px-4">Role &amp; Discipline</th>
                  <th className="py-3 px-4">Parent Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {filteredPlayers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-navy/70">
                      {p.playerCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-navy">{p.fullName}</p>
                      <span className="text-[11px] text-navy/60">Joined: {p.joiningDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-xs bg-navy text-gold">
                        {p.batchName}
                      </span>
                      <span className="text-xs text-navy/60 ml-2">{p.age} yrs</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-xs text-navy">{p.primaryRole}</p>
                      <p className="text-[11px] text-navy/60">{p.bowlingStyle || p.battingStyle}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-xs">{p.parentName || "Parent"}</p>
                      {p.parentPhone ? (
                        <a
                          href={`tel:${p.parentPhone}`}
                          className="text-[11px] text-[#1e5a3c] font-semibold hover:underline"
                        >
                          {p.parentPhone}
                        </a>
                      ) : (
                        <span className="text-[11px] text-navy/40 italic">Pending collection</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          p.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.parentPhone ? (
                        <button
                          onClick={() => {
                            const text = `Hello ${p.parentName || "Parent"}, update regarding ${p.fullName} at YCA PACE Nagpur.`;
                            const clean = p.parentPhone!.replace(/[^0-9]/g, "");
                            window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, "_blank");
                          }}
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-700 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                          title="Chat with Parent on WhatsApp"
                        >
                          <Send className="h-3.5 w-3.5" /> WA
                        </button>
                      ) : (
                        <span className="text-xs text-navy/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BATCHES */}
      {activeTab === "batches" && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {batches.map((b) => (
            <div key={b.id} className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between border-b border-navy/10 pb-4">
                <div>
                  <h3 className="font-display text-4xl font-extrabold text-navy">{b.name} Batch</h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {b.sessionTime} Session
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-navy">{b.playerCount}</p>
                  <p className="text-xs text-navy/60">Players enrolled</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-navy/80">
                <div className="flex justify-between">
                  <span className="text-navy/60">Training Slot:</span>
                  <span className="font-semibold text-navy">{b.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/60">Lead Coach:</span>
                  <span className="font-semibold text-navy">{b.leadCoach}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/60">Facilities in use:</span>
                  <span className="font-semibold text-navy">Turf Nets 1-2 &amp; Cemented Pitch 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/60">Special Focus:</span>
                  <span className="font-semibold text-navy">Line &amp; Length Pace + Video Analysis</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: FEES */}
      {activeTab === "fees" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-navy/15">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
                Academy Monthly Fee Ledger
              </h2>
              <p className="text-xs text-navy/60">
                Track parent monthly payments, cash receipts, and automated WhatsApp reminders.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <span className="text-xs text-navy/60 block">Total Collected</span>
                <span className="font-display text-2xl font-bold text-emerald-700">
                  ₹{totalFeeCollected.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-right border-l pl-4 border-navy/15">
                <span className="text-xs text-navy/60 block">Pending / Due</span>
                <span className="font-display text-2xl font-bold text-amber-700">
                  ₹{totalFeePending.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border-2 border-navy/15 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-navy">
              <thead className="bg-[#f2f5fa] border-b border-navy/15 text-xs font-bold uppercase tracking-wider text-navy/70">
                <tr>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Month / Year</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {fees.map((fee) => {
                  const player = players.find((p) => p.id === fee.playerId) || players[0];
                  return (
                    <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-navy">{player.fullName}</p>
                        <p className="text-[11px] text-navy/60">{player.batchName} · {player.playerCode}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-xs">{fee.monthYear}</td>
                      <td className="py-3 px-4 font-display font-bold text-base">₹{fee.amount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            fee.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : fee.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-navy/70">
                        {fee.status === "paid" ? (
                          <div>
                            <span className="font-semibold text-navy">{fee.paymentMode}</span>
                            <span className="block text-[11px] text-navy/50">{fee.receiptNo}</span>
                          </div>
                        ) : (
                          <span className="text-navy/50">Due by {fee.dueDate}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {fee.status !== "paid" ? (
                          <>
                            <button
                              onClick={() => markFeePaid(fee.id)}
                              className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors"
                            >
                              Record Cash
                            </button>
                            <button
                              onClick={() => sendFeeReminder(player, fee)}
                              disabled={!player.parentPhone}
                              className="px-2.5 py-1 rounded bg-[#f5b700] text-navy font-semibold text-xs hover:brightness-95 transition-all inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={player.parentPhone ? "Send WhatsApp Fee Reminder" : "Parent phone pending collection"}
                            >
                              <Send className="w-3 h-3" /> Remind WA
                            </button>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                            </span>
                            <button
                              type="button"
                              onClick={() => openReceiptForAdmin(player, fee)}
                              className="px-2 py-0.5 rounded text-[11px] font-bold border border-navy/20 hover:bg-navy/5 text-navy inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="View & Print Official Receipt"
                            >
                              <Download className="w-3 h-3" /> Receipt
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ENQUIRIES */}
      {activeTab === "enquiries" && (
        <div className="mt-6 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-navy/15 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
                Website Trial Inquiries &amp; Admissions
              </h2>
              <p className="text-xs text-navy/60">
                Prospective young players requesting trial sessions from Nagpur.
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-navy text-gold text-xs font-bold uppercase">
              {enquiries.length} Inquiries Logged
            </span>
          </div>

          {enquiries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-navy/20 bg-white p-12 text-center text-navy/50">
              <PhoneCall className="w-8 h-8 mx-auto text-navy/30 mb-2" />
              <p className="font-semibold text-sm">No new trial inquiries yet</p>
              <p className="text-xs text-navy/40 mt-1">Website booking requests submitted by prospective students will appear here in real time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {enquiries.map((enq) => (
                <div key={enq.id} className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-navy">{enq.playerName}</h3>
                      <p className="text-xs text-navy/60 mt-0.5">
                        Age: <strong className="text-navy">{enq.age} yrs</strong> · Preferred Batch:{" "}
                        <strong className="text-navy">{enq.preferredBatch}</strong>
                      </p>
                    </div>
                    <select
                      value={enq.status}
                      onChange={(e) => handleEnquiryStatusChange(enq.id, e.target.value as any)}
                      className="text-xs font-bold uppercase px-2.5 py-1 rounded border border-navy/20 bg-slate-50 focus:outline-none"
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="trial_booked">Trial Booked</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {enq.notes && (
                    <p className="mt-3 text-xs bg-[#f2f5fa] p-2.5 rounded border border-navy/10 text-navy/80">
                      {enq.notes}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between">
                    <span className="text-[11px] text-navy/50">Logged on: {enq.createdAt}</span>
                    <a
                      href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello from Yadav Cricket Academy & Pace Foundation, Nagpur! Thank you for inquiring for ${enq.playerName}. When would you like to schedule the free trial session?`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> WhatsApp {enq.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* Post Form */}
          <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
              Broadcast New Notice
            </h2>
            <p className="text-xs text-navy/60 mt-1">
              Publishes instantly to Parent and Coach dashboards.
            </p>

            <form onSubmit={handlePostAnnouncement} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">Category</label>
                <select
                  value={newAnnCategory}
                  onChange={(e) => setNewAnnCategory(e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
                >
                  <option value="Notice">Notice</option>
                  <option value="Match Day">Match Day</option>
                  <option value="Holiday">Holiday Break</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Pace Camp on Sunday"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide schedule details, equipment to carry, reporting time..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-[#0a1a33] px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-gold hover:bg-[#06122a] transition-all"
              >
                Publish Broadcast
              </button>
            </form>
          </div>

          {/* Published Announcements List */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-navy">
              Published Circulars ({announcements.length})
            </h2>

            {announcements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-navy/20 bg-white p-12 text-center text-navy/50">
                <AlertCircle className="w-8 h-8 mx-auto text-navy/30 mb-2" />
                <p className="font-semibold text-sm">No announcements published yet</p>
                <p className="text-xs text-navy/40 mt-1">Use the broadcast form on the left to notify parents and coaches of upcoming events or camps.</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-navy text-gold">
                      {ann.category}
                    </span>
                    <span className="text-xs text-navy/50">{ann.date}</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-navy">{ann.title}</h3>
                  <p className="mt-1 text-sm text-navy/75">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ENROLL NEW PLAYER */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy/15 pb-3">
              <h2 className="font-display text-2xl font-bold uppercase text-navy">
                Enroll New Player
              </h2>
              <button
                onClick={() => setShowAddPlayer(false)}
                className="text-navy/50 hover:text-navy text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="mt-4 space-y-4 text-sm text-navy">
              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">
                  Player Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahil Deshpande"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy/70">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 14"
                    value={newPlayerAge}
                    onChange={(e) => setNewPlayerAge(e.target.value)}
                    className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-navy/70">Batch *</label>
                  <select
                    value={newPlayerBatch}
                    onChange={(e) => setNewPlayerBatch(e.target.value)}
                    className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy bg-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.sessionTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">
                  Primary Role &amp; Specialty
                </label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy bg-white"
                >
                  <option value="Fast Bowler">Fast Bowler (Pace Foundation)</option>
                  <option value="Batsman">Batsman</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Spinner">Spinner</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div className="border-t border-navy/10 pt-3">
                <p className="text-xs font-bold uppercase text-navy/80 mb-2">Parent / Guardian Contact</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-navy/70">Parent Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Deshpande"
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-navy/70">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98220 54321"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPlayer(false)}
                  className="flex-1 rounded-md border border-navy/20 py-2.5 font-bold uppercase text-xs text-navy hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-[#0a1a33] py-2.5 font-display text-base font-bold uppercase tracking-wide text-gold hover:bg-[#06122a]"
                >
                  Save &amp; Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Official Printable Receipt Modal */}
      {adminReceiptData && (
        <ReceiptModal
          isOpen={Boolean(adminReceiptData)}
          onClose={() => setAdminReceiptData(null)}
          receiptData={adminReceiptData}
        />
      )}
    </DashboardShell>
  );
}
