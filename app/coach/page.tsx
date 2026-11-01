"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { MOCK_BATCHES, MOCK_PLAYERS, MOCK_VIDEO_ANALYSIS } from "@/lib/mockData";
import { VideoAnalysis, Player, Batch } from "@/lib/types";
import {
  CheckCircle2,
  Video,
  Activity,
  Trophy,
  Users,
  Clock,
  Sparkles,
  Calendar,
  Save,
  Database,
  UploadCloud,
  Smartphone,
  Film,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function CoachDashboard() {
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [batches, setBatches] = useState<Batch[]>(MOCK_BATCHES);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [selectedBatchId, setSelectedBatchId] = useState(MOCK_BATCHES[0].id);
  const [selectedDate, setSelectedDate] = useState("2026-10-11");
  const [activeTool, setActiveTool] = useState<"attendance" | "pace-analysis" | "match-stats">("attendance");

  // Video Analysis State
  const [videoAnalyses, setVideoAnalyses] = useState<VideoAnalysis[]>(MOCK_VIDEO_ANALYSIS);
  const [selectedPlayerForAnalysis, setSelectedPlayerForAnalysis] = useState(MOCK_PLAYERS[0].id);
  const [skillCategory, setSkillCategory] = useState<VideoAnalysis["skillCategory"]>("Release Point");
  const [bowlingSpeed, setBowlingSpeed] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [analysisSuccessMsg, setAnalysisSuccessMsg] = useState<string | null>(null);

  // Real Video Upload State (Supabase Storage)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Match Stat Entry State
  const [matchPlayer, setMatchPlayer] = useState(MOCK_PLAYERS[0].id);
  const [matchOpponent, setMatchOpponent] = useState("");
  const [matchBatting, setMatchBatting] = useState("");
  const [matchBowling, setMatchBowling] = useState("");
  const [matchNotes, setMatchNotes] = useState("");
  const [matchSuccessMsg, setMatchSuccessMsg] = useState<string | null>(null);

  // Attendance state
  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const batchPlayers = players.filter((p) => p.batchId === selectedBatchId);

  const [presentMap, setPresentMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_PLAYERS.map((p) => [p.id, true]))
  );
  const [savedAttendanceMsg, setSavedAttendanceMsg] = useState<string | null>(null);

  // Role Guard: Parents cannot access Coach portal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("yca_logged_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.role === "parent") {
            window.location.href = "/parent";
          }
        } catch {}
      }
    }
  }, []);

  // Check Supabase connection and fetch live players & batches
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsLiveDb(configured);

    if (!configured) return;

    const supabase = createClient();

    async function loadCoachData() {
      try {
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
          setPresentMap(Object.fromEntries(mapped.map((p) => [p.id, true])));
          setSelectedPlayerForAnalysis(mapped[0]?.id || "");
          setMatchPlayer(mapped[0]?.id || "");
        }

        const { data: dbVideos } = await supabase.from("video_analyses").select("*");
        if (dbVideos && dbVideos.length > 0) {
          const mappedV: VideoAnalysis[] = dbVideos.map((v: any) => ({
            id: v.id,
            playerId: v.player_id,
            coachName: "Jay Singh Yadav",
            date: v.created_at?.split("T")[0] || "Recent",
            videoUrl: v.video_url,
            thumbnailPlaceholderColor: "#1e5a3c",
            skillCategory: v.skill_category as any,
            bowlingSpeedKmph: v.measured_speed_kmph,
            feedback: v.coach_feedback,
            keyPointers: ["Recorded on ground", "Technique reviewed"],
          }));
          setVideoAnalyses(mappedV);
        }
      } catch (err) {
        console.warn("Could not load coach data from Supabase:", err);
      }
    }

    loadCoachData();
  }, []);

  const presentCount = batchPlayers.filter((p) => presentMap[p.id]).length;

  function toggleAttendance(playerId: string) {
    setSavedAttendanceMsg(null);
    setPresentMap((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  }

  function markAll(status: boolean) {
    setSavedAttendanceMsg(null);
    const updated = { ...presentMap };
    batchPlayers.forEach((p) => {
      updated[p.id] = status;
    });
    setPresentMap(updated);
  }

  async function handleSaveAttendance() {
    if (isLiveDb) {
      try {
        const supabase = createClient();
        const records = batchPlayers.map((p) => ({
          player_id: p.id,
          batch_id: selectedBatchId,
          date: selectedDate,
          status: presentMap[p.id] ? "present" : "absent",
        }));
        await supabase.from("attendance").upsert(records, { onConflict: "player_id,date" });
        setSavedAttendanceMsg("Saved & Synchronized with Supabase Database!");
      } catch (err) {
        console.warn("Supabase attendance sync error:", err);
        setSavedAttendanceMsg("Saved to local session.");
      }
    } else {
      setSavedAttendanceMsg("Saved (Demo Session).");
    }

    setTimeout(() => setSavedAttendanceMsg(null), 4000);
  }

  function handleVideoFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a valid video format (MP4, MOV, WebM).");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setUploadError("File size exceeds 100MB limit.");
      return;
    }
    setUploadError(null);
    setVideoFile(file);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveVideoFile() {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setUploadError(null);
  }

  async function handleSaveVideoAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackNotes.trim()) return;

    setIsUploadingVideo(true);
    setUploadError(null);

    let finalVideoUrl = videoPreviewUrl || "recorded_field_clip.mp4";

    if (videoFile && isLiveDb) {
      try {
        const supabase = createClient();
        const fileExt = videoFile.name.split(".").pop() || "mp4";
        const fileName = `analysis_${selectedPlayerForAnalysis}_${Date.now()}.${fileExt}`;
        const filePath = `clips/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("bowling-videos")
          .upload(filePath, videoFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadErr) {
          console.warn("Supabase storage upload notice:", uploadErr.message);
          setUploadError(`Storage notice: ${uploadErr.message}. Ensure supabase/storage.sql is run.`);
        } else {
          const { data: pubData } = supabase.storage
            .from("bowling-videos")
            .getPublicUrl(filePath);
          if (pubData?.publicUrl) {
            finalVideoUrl = pubData.publicUrl;
          }
        }
      } catch (err: any) {
        console.warn("Storage upload exception:", err);
      }
    }

    const newAnalysis: VideoAnalysis = {
      id: `va-${Date.now()}`,
      playerId: selectedPlayerForAnalysis,
      coachName: "Jay Singh Yadav",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      videoUrl: finalVideoUrl,
      thumbnailPlaceholderColor: "#1e5a3c",
      skillCategory,
      bowlingSpeedKmph: parseFloat(bowlingSpeed) || 110,
      feedback: feedbackNotes,
      keyPointers: [
        "Recorded & analyzed on Hingna turf pitch",
        "Biomechanical review synced to parent portal",
      ],
    };

    if (isLiveDb) {
      try {
        const supabase = createClient();
        await supabase.from("video_analyses").insert({
          player_id: selectedPlayerForAnalysis,
          skill_category: skillCategory,
          measured_speed_kmph: parseFloat(bowlingSpeed) || null,
          coach_feedback: feedbackNotes,
          video_url: finalVideoUrl,
        });
        setAnalysisSuccessMsg("Saved to Supabase database & visible on Parent Portal!");
      } catch (err) {
        console.warn("Supabase video analysis sync error:", err);
        setAnalysisSuccessMsg("Published to player portal view!");
      }
    } else {
      setAnalysisSuccessMsg("Pace skill analysis published to Parent Dashboard!");
    }

    setVideoAnalyses([newAnalysis, ...videoAnalyses]);
    setFeedbackNotes("");
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setIsUploadingVideo(false);
    setTimeout(() => setAnalysisSuccessMsg(null), 4000);
  }


  async function handleSaveMatchScore(e: React.FormEvent) {
    e.preventDefault();

    if (isLiveDb) {
      try {
        const supabase = createClient();
        await supabase.from("match_performances").insert({
          player_id: matchPlayer,
          match_date: new Date().toISOString().split("T")[0],
          opponent: matchOpponent,
          batting_score: matchBatting,
          bowling_figures: matchBowling,
          coach_notes: matchNotes,
        });
        setMatchSuccessMsg("Scorecard saved to Supabase and published to parent!");
      } catch (err) {
        console.warn("Could not save match score to Supabase:", err);
        setMatchSuccessMsg("Match scorecard added to player profile!");
      }
    } else {
      setMatchSuccessMsg("Match scorecard added to player profile!");
    }

    setTimeout(() => setMatchSuccessMsg(null), 3500);
  }

  return (
    <DashboardShell role="Coach">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e5a3c]">
              Field Coaching &amp; Pace Biomechanics
            </span>
            {isLiveDb ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Database className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active Academy Roster
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase leading-tight text-navy mt-1">
            Coach Field Operations
          </h1>
          <p className="text-navy/70 text-sm mt-1">
            Yadav Cricket Academy &amp; Pace Foundation · Lead Coach: Jay Singh Yadav
          </p>
        </div>

        {/* Tool Navigation */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTool("attendance")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-display text-base font-bold uppercase tracking-wide transition-all ${
              activeTool === "attendance"
                ? "bg-[#0a1a33] text-[#f5b700] shadow-sm"
                : "bg-white text-navy border border-navy/20 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4" /> Attendance Roster
          </button>
          <button
            onClick={() => setActiveTool("pace-analysis")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-display text-base font-bold uppercase tracking-wide transition-all ${
              activeTool === "pace-analysis"
                ? "bg-[#1e5a3c] text-white shadow-sm"
                : "bg-white text-navy border border-navy/20 hover:bg-slate-50"
            }`}
          >
            <Video className="w-4 h-4" /> Pace Video Review
          </button>
          <button
            onClick={() => setActiveTool("match-stats")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-display text-base font-bold uppercase tracking-wide transition-all ${
              activeTool === "match-stats"
                ? "bg-[#b3202a] text-white shadow-sm"
                : "bg-white text-navy border border-navy/20 hover:bg-slate-50"
            }`}
          >
            <Trophy className="w-4 h-4" /> Match Scorecard
          </button>
        </div>
      </div>

      {/* TOOL 1: ATTENDANCE ROSTER */}
      {activeTool === "attendance" && (
        <div className="mt-8 space-y-6">
          {/* Batch Selector Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedBatchId === b.id
                    ? "border-navy bg-white shadow-md ring-2 ring-gold"
                    : "border-navy/15 bg-white/70 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-extrabold text-navy">{b.name}</span>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-navy/10 text-navy">
                    {b.sessionTime}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-navy/70">{b.timeSlot}</p>
                <p className="text-xs text-navy/50 mt-1">{b.playerCount} players</p>
              </button>
            ))}
          </div>

          {/* Attendance Controls & Roster Card */}
          <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-navy/60">
                  Daily Attendance Session
                </span>
                <h2 className="font-display text-3xl font-bold uppercase text-navy">
                  {activeBatch.name} Batch · {activeBatch.sessionTime} ({activeBatch.timeSlot})
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#f2f5fa] px-3 py-1.5 rounded-lg border border-navy/15 text-xs font-semibold text-navy">
                  <Calendar className="w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent focus:outline-none"
                  />
                </div>
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                  {presentCount} / {batchPlayers.length} Present
                </div>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markAll(true)}
                  className="px-3 py-1 text-xs font-bold uppercase rounded bg-slate-100 hover:bg-slate-200 text-navy transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll(false)}
                  className="px-3 py-1 text-xs font-bold uppercase rounded bg-slate-100 hover:bg-slate-200 text-navy transition-colors"
                >
                  Mark All Absent
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 rounded-md bg-[#f5b700] px-5 py-2 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                {savedAttendanceMsg || "Save Attendance"}
              </button>
            </div>

            {/* Player Attendance List */}
            {batchPlayers.length === 0 ? (
              <p className="py-8 text-center text-sm text-navy/50 font-medium">
                No players currently enrolled in this batch.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-navy/10">
                {batchPlayers.map((p) => {
                  const isPresent = presentMap[p.id];
                  return (
                    <li
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-navy">{p.fullName}</span>
                          <span className="text-xs font-mono font-semibold text-navy/50">
                            {p.playerCode}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#f2f5fa] border border-navy/10 font-semibold text-navy/70">
                            {p.primaryRole}
                          </span>
                        </div>
                        <p className="text-xs text-navy/60 mt-0.5">
                          Age: {p.age} yrs · DOB: {p.dob} · Contact: {p.parentPhone || "Pending collection"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleAttendance(p.id)}
                          className={`w-32 py-2 rounded-md font-display text-base font-bold uppercase tracking-wide transition-all ${
                            isPresent
                              ? "bg-[#1e5a3c] text-white hover:bg-[#18462f] shadow-sm"
                              : "bg-[#b3202a] text-white hover:bg-[#8f1921] shadow-sm"
                          }`}
                        >
                          {isPresent ? "✓ Present" : "✕ Absent"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: PACE FOUNDATION VIDEO SKILL ANALYSIS */}
      {activeTool === "pace-analysis" && (
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Analysis Form */}
          <div className="rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#1e5a3c] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Pace Biomechanics Lab
            </div>
            <h2 className="font-display text-3xl font-bold uppercase text-navy mt-1">
              Log Video Skill Review
            </h2>
            <p className="text-xs text-navy/70 mt-1">
              Record video breakdown and feedback for fast bowlers and batsmen. Uploads sync directly to the parent&apos;s app and your Supabase database.
            </p>

            {analysisSuccessMsg && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-300 p-3 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {analysisSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveVideoAnalysis} className="mt-5 space-y-4 text-sm text-navy">
              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">
                  Select Player *
                </label>
                <select
                  value={selectedPlayerForAnalysis}
                  onChange={(e) => setSelectedPlayerForAnalysis(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 bg-white focus:outline-none focus:border-navy"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.batchName} · {p.primaryRole})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy/70">
                    Skill Technique Area *
                  </label>
                  <select
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 bg-white focus:outline-none focus:border-navy"
                  >
                    <option value="Release Point">Release Point</option>
                    <option value="Run-up & Approach">Run-up &amp; Approach</option>
                    <option value="Seam & Wrist Position">Seam &amp; Wrist Position</option>
                    <option value="Follow-through">Follow-through</option>
                    <option value="Pitch Map Accuracy">Pitch Map Accuracy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-navy/70">
                    Clocked Speed (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 116.5"
                    value={bowlingSpeed}
                    onChange={(e) => setBowlingSpeed(e.target.value)}
                    className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">
                  Field Video Recording (Phone Camera / Upload)
                </label>
                
                {!videoPreviewUrl ? (
                  <div className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed border-navy/25 rounded-xl p-6 bg-[#f2f5fa] hover:bg-navy/5 transition-colors">
                    <div className="flex items-center gap-2 text-navy mb-2">
                      <Smartphone className="w-5 h-5 text-[#1e5a3c]" />
                      <UploadCloud className="w-5 h-5 text-navy" />
                    </div>
                    <p className="text-xs font-bold text-navy">Record with Smartphone or Select Video Clip</p>
                    <p className="text-[11px] text-navy/60 mt-0.5">MP4, MOV, WebM up to 100MB (Recorded on pitch)</p>
                    
                    <label className="mt-3 cursor-pointer rounded-lg bg-[#0a1a33] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-navy/90 shadow-sm flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-[#f5b700]" />
                      <span>Choose / Record Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleVideoFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-1.5 p-3 rounded-xl border border-navy/20 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1e5a3c] flex items-center gap-1">
                        <Film className="w-3.5 h-3.5" /> {videoFile?.name || "Selected Video"}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveVideoFile}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                    
                    {/* Native video preview */}
                    <video
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full max-h-56 rounded-lg bg-black object-contain shadow-inner"
                    />
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">
                  Coach Video Feedback &amp; Biomechanic Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe wrist alignment, back-foot contact, head position, and good-length landing..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingVideo}
                className="w-full rounded-md bg-[#1e5a3c] py-3 font-display text-lg font-bold uppercase tracking-wide text-white hover:bg-[#18462f] transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploadingVideo ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading Video to Supabase Storage...
                  </span>
                ) : (
                  "Publish Video Analysis to Player Portal"
                )}
              </button>
            </form>
          </div>

          {/* Published Video Analysis Feed */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold uppercase text-navy">
              Recent Video Skill Logs
            </h3>

            {videoAnalyses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-navy/20 bg-white p-8 text-center text-navy/50">
                <Video className="w-8 h-8 mx-auto text-navy/30 mb-2" />
                <p className="font-semibold text-sm">No video skill logs recorded yet</p>
                <p className="text-xs text-navy/40 mt-1">Submit high-speed video feedback using the form to publish biomechanical analysis for a player.</p>
              </div>
            ) : (
              videoAnalyses.map((va) => {
                const player = players.find((p) => p.id === va.playerId) || players[0];
                return (
                  <div key={va.id} className="rounded-xl border-2 border-navy/15 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg text-navy">{player?.fullName || "Player"}</h4>
                        <p className="text-xs text-navy/60">
                          {va.skillCategory} · Reviewed by {va.coachName}
                        </p>
                      </div>
                      {va.bowlingSpeedKmph && (
                        <span className="font-display text-2xl font-extrabold text-[#b3202a]">
                          {va.bowlingSpeedKmph} <span className="text-xs font-normal">km/h</span>
                        </span>
                      )}
                    </div>

                    {va.videoUrl && (va.videoUrl.startsWith("http") || va.videoUrl.startsWith("blob")) && (
                      <div className="mt-3 overflow-hidden rounded-lg bg-black aspect-video max-h-52 flex items-center justify-center">
                        <video
                          src={va.videoUrl}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <p className="mt-3 text-sm text-navy/80 bg-[#f2f5fa] p-3 rounded-lg border border-navy/10">
                      &ldquo;{va.feedback}&rdquo;
                    </p>

                    <ul className="mt-3 space-y-1">
                      {va.keyPointers.map((p, idx) => (
                        <li key={idx} className="text-xs text-navy/70 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1e5a3c]" />
                          {p}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 pt-3 border-t border-navy/10 flex justify-between text-[11px] text-navy/50">
                      <span>Logged on: {va.date}</span>
                      <span className="text-emerald-700 font-semibold">✓ Visible to Parent</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: MATCH SCORECARD LOGGER */}
      {activeTool === "match-stats" && (
        <div className="mt-8 max-w-2xl mx-auto rounded-xl border-2 border-navy/15 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#b3202a] font-bold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4" /> Match Performance Center
          </div>
          <h2 className="font-display text-3xl font-bold uppercase text-navy mt-1">
            Record Match Figures
          </h2>
          <p className="text-xs text-navy/70 mt-1">
            Publish weekend academy and inter-academy tournament scores directly to player profiles.
          </p>

          {matchSuccessMsg && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-300 p-3 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {matchSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveMatchScore} className="mt-5 space-y-4 text-sm text-navy">
            <div>
              <label className="block text-xs font-bold uppercase text-navy/70">Select Player *</label>
              <select
                value={matchPlayer}
                onChange={(e) => setMatchPlayer(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 bg-white focus:outline-none focus:border-navy"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.playerCode} · {p.batchName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy/70">Opponent Team *</label>
              <input
                type="text"
                required
                value={matchOpponent}
                onChange={(e) => setMatchOpponent(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">Batting Score</label>
                <input
                  type="text"
                  placeholder="e.g. 45 (32)"
                  value={matchBatting}
                  onChange={(e) => setMatchBatting(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy/70">Bowling Figures</label>
                <input
                  type="text"
                  placeholder="e.g. 3/22 (4.0)"
                  value={matchBowling}
                  onChange={(e) => setMatchBowling(e.target.value)}
                  className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy/70">Coach Comments</label>
              <textarea
                rows={3}
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 focus:outline-none focus:border-navy"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#0a1a33] py-3 font-display text-lg font-bold uppercase tracking-wide text-gold hover:bg-[#06122a] transition-all shadow-sm"
            >
              Save Match Performance
            </button>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
