"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Users,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Database,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Calendar,
} from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { MOCK_PLAYERS } from "@/lib/mockData";
import { Player } from "@/lib/types";

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
    label: "Parent / Student",
    to: "/parent",
    hint: "Sign in using registered Player Name as ID and Date of Birth (DD-MM-YYYY) as Password.",
    icon: Trophy,
    demoEmail: "parent@gmail.com",
  },
} as const;

type Role = keyof typeof ROLES;

const field =
  "mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none text-sm transition-all";

function normalizeDob(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim();
  // Handle DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const parts = cleaned.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    if (parts[2].length === 4) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  // Handle 8 consecutive digits
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 8) {
    if (digits.startsWith("19") || digits.startsWith("20")) {
      // YYYYMMDD
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    // DDMMYYYY
    return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  }
  return cleaned;
}

function normalizeName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namesMatch(candidate: string, query: string): boolean {
  if (!candidate || !query) return false;
  const cNorm = normalizeName(candidate);
  const qNorm = normalizeName(query);
  if (cNorm === qNorm) return true;

  // Compare first name and last name
  const cWords = candidate.toLowerCase().split(/\s+/).filter(Boolean);
  const qWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (cWords.length >= 2 && qWords.length >= 2) {
    if (cWords[0] === qWords[0] && cWords[cWords.length - 1] === qWords[qWords.length - 1]) {
      return true;
    }
  }
  return false;
}

const SAMPLE_STUDENT_LOGINS = [
  { name: "Aman Alam", dob: "29-11-2013", batch: "U14" },
  { name: "Nayan Chaudhari", dob: "25-05-2013", batch: "U16" },
  { name: "Pushkar Gadge", dob: "05-05-2009", batch: "U19" },
  { name: "Gaarvi Bhaisar", dob: "14-02-2018", batch: "U12" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("parent");
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("password");
  const [isSignUp, setIsSignUp] = useState(false);

  // Student Name + DOB Login states
  const [studentId, setStudentId] = useState("");
  const [dobPassword, setDobPassword] = useState("");
  const [showDob, setShowDob] = useState(false);
  const [useEmailForParent, setUseEmailForParent] = useState(false);

  // Form fields for Admin / Coach
  const [email, setEmail] = useState<string>(ROLES.parent.demoEmail);
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("password123");
  const [otpCode, setOtpCode] = useState<string>("");

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
  }, []);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleRoleChange(newRole: Role) {
    setRole(newRole);
    setEmail(ROLES[newRole].demoEmail);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpSent(false);
    setOtpCode("");
    setUseEmailForParent(false);
  }

  // 1. Student Name as ID & DOB as Password Auth
  async function handleStudentAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const inputName = studentId.trim();
      const inputDob = dobPassword.trim();

      if (!inputName) {
        throw new Error("Please enter student name or player code as ID.");
      }
      if (!inputDob) {
        throw new Error("Please enter Date of Birth as Password (DD-MM-YYYY).");
      }

      const normalizedInputDob = normalizeDob(inputDob);

      let matchedPlayer: Player | undefined;

      // Check live supabase if available
      if (isConfigured) {
        try {
          const supabase = createClient();
          const { data: dbPlayers } = await supabase.from("players").select("*");
          if (dbPlayers && dbPlayers.length > 0) {
            const found = dbPlayers.find((p: any) => {
              const nameMatch =
                namesMatch(p.full_name, inputName) ||
                p.player_code?.toLowerCase() === inputName.toLowerCase();
              const dobMatch = p.dob && normalizeDob(p.dob) === normalizedInputDob;
              return nameMatch && dobMatch;
            });
            if (found) {
              matchedPlayer = {
                id: found.id,
                playerCode: found.player_code,
                fullName: found.full_name,
                dob: found.dob,
                age: 14,
                gender: found.gender || "Boy",
                batchId: found.batch_id || "batch-u14",
                batchName: "U14",
                parentId: found.parent_id || undefined,
                parentName: found.parent_name || undefined,
                parentPhone: found.parent_phone || undefined,
                primaryRole: found.primary_role || "Fast Bowler",
                status: found.status || "active",
                joiningDate: found.created_at || "2026-10-10",
              };
            }
          }
        } catch (dbErr) {
          console.warn("Supabase lookup error, falling back to mockData:", dbErr);
        }
      }

      // Fallback to MOCK_PLAYERS
      if (!matchedPlayer) {
        const found = MOCK_PLAYERS.find((p) => {
          const nameMatch =
            namesMatch(p.fullName, inputName) ||
            p.playerCode.toLowerCase() === inputName.toLowerCase();
          const dobMatch = normalizeDob(p.dob) === normalizedInputDob;
          return nameMatch && dobMatch;
        });
        if (found) {
          matchedPlayer = found;
        }
      }

      // Diagnostic message if name was found but DOB differed
      if (!matchedPlayer) {
        const nameFound = MOCK_PLAYERS.find(
          (p) =>
            namesMatch(p.fullName, inputName) ||
            p.playerCode.toLowerCase() === inputName.toLowerCase()
        );

        if (nameFound) {
          throw new Error(
            `Found student "${nameFound.fullName}", but Date of Birth does not match. Please enter DOB in DD-MM-YYYY format (e.g. 29-11-2013).`
          );
        } else {
          throw new Error(
            `No player found with name "${inputName}". Please enter full name as in academy records (e.g. Aman Alam).`
          );
        }
      }

      // Save credentials in session/storage
      if (typeof window !== "undefined") {
        localStorage.setItem("yca_active_player", matchedPlayer.id);
        localStorage.setItem(
          "yca_logged_user",
          JSON.stringify({
            name: matchedPlayer.fullName,
            code: matchedPlayer.playerCode,
            role: "parent",
          })
        );
      }

      setSuccessMessage(`Welcome, ${matchedPlayer.fullName}! Logging in...`);
      setTimeout(() => {
        router.push(`/parent?playerId=${matchedPlayer!.id}`);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  // 2. Password Login / Signup (Admin / Coach)
  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        // Fallback to local routing
        router.push(ROLES[role].to);
        return;
      }

      const supabase = createClient();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              full_name: fullName || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        if (data.user?.identities?.length === 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        setSuccessMessage(
          "Account created successfully! Check your email to confirm, or sign in now."
        );
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If demo email, bypass gracefully
          if (email.endsWith("@ycapace.com") || email.endsWith("@gmail.com")) {
            router.push(ROLES[role].to);
            return;
          }
          throw error;
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
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Send Email OTP / Magic Link
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        router.push(ROLES[role].to);
        return;
      }

      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
          data: {
            role,
            full_name: fullName || email.split("@")[0],
          },
        },
      });

      if (error) throw error;

      setOtpSent(true);
      setResendCooldown(45);
      setSuccessMessage(
        `A 6-digit login code and magic link has been sent to ${email}!`
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send login code. Please check the email address.");
    } finally {
      setLoading(false);
    }
  }

  // 4. Verify 6-digit Email OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode.trim(),
        type: "email",
      });

      if (error) throw error;

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
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  }

  const ActiveIcon = ROLES[role].icon;

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-[#f2f5fa]">
      {/* Brand Hero Aside */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <Image
          src="/gallery/hero.jpg"
          alt="Coach Jay Singh and YCA squad"
          fill
          priority
          className="object-cover object-top opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/90" />

        <div className="relative z-10">
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
        </div>

        <div className="relative z-10 my-auto py-12">
          <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded border border-gold/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Nagpur&apos;s Premier Cricket Academy
          </span>
          <h1 className="mt-4 font-display text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Excellence In Fast Bowling &amp; Field Athletics
          </h1>
          <p className="mt-4 text-white/80 max-w-md text-sm leading-relaxed">
            State-of-the-art fast-bowling biomechanics, verified match analytics, online UPI fee
            clearances, and real-time attendance rosters under Head Coach Jay Singh Yadav.
          </p>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-4 text-xs text-white/60">
          <p>Yadav Cricket Academy &amp; Pace Foundation · Mahajanwadi, Hingna Road, Nagpur</p>
          <p className="mt-1">Founder &amp; Head Coach: Jay Singh Yadav (+91 77097 05181)</p>
        </div>
      </aside>

      {/* Auth Panel */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-navy/10">
          {/* Mobile Logo */}
          <div className="mb-6 lg:hidden flex items-center justify-between border-b border-navy/10 pb-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-light.png" alt="" width={32} height={36} className="h-auto w-8" />
              <span className="font-display text-xl font-bold text-navy">YCA PACE</span>
            </Link>
            <span className="text-[11px] font-bold uppercase text-navy/60">Nagpur</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b3202a]">
              Secure Access
            </span>
            {isConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600" /> Supabase Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Academy Portal
              </span>
            )}
          </div>

          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-navy">
            {role === "parent" && !useEmailForParent
              ? "Student / Parent Sign In"
              : `Sign In as ${ROLES[role].label}`}
          </h2>
          <p className="text-xs text-navy/60 mt-1">Select your role to access your dashboard:</p>

          {/* Role Tabs: Admin, Coach, Parent */}
          <div role="tablist" className="mt-4 grid grid-cols-3 rounded-lg border-2 border-navy p-1 gap-1">
            {(Object.keys(ROLES) as Role[]).map((r) => {
              const Icon = ROLES[r].icon;
              return (
                <button
                  key={r}
                  role="tab"
                  type="button"
                  aria-selected={role === r}
                  onClick={() => handleRoleChange(r)}
                  className={`rounded py-2 font-display text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    role === r
                      ? "bg-navy text-[#f5b700] shadow-sm"
                      : "text-navy hover:bg-navy/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {ROLES[r].label.split(" ")[0]}
                </button>
              );
            })}
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-[#f2f5fa] border border-navy/10 text-xs text-navy/80 flex items-start gap-2">
            <ActiveIcon className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            <span>{ROLES[role].hint}</span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* PARENT / STUDENT CREDENTIALS LOGIN (NAME AS ID, DOB AS PASSWORD) */}
          {role === "parent" && !useEmailForParent ? (
            <div className="mt-4">
              <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Parent info pending collection. Use Student Name as ID &amp; DOB as Password.</span>
              </div>

              <form onSubmit={handleStudentAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy/80">
                    Student Name (ID) *
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aman Alam or YCA-0041"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className={field}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-navy/60">
                    Enter the student&apos;s full name as registered in academy records.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-navy/80">
                      Date of Birth (Password) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowDob(!showDob)}
                      className="text-[11px] font-semibold text-navy/60 hover:text-navy flex items-center gap-1 cursor-pointer"
                    >
                      {showDob ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Show DOB
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <input
                      type={showDob ? "text" : "password"}
                      required
                      placeholder="DD-MM-YYYY (e.g. 29-11-2013)"
                      value={dobPassword}
                      onChange={(e) => setDobPassword(e.target.value)}
                      className={field}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-navy/60">
                    Format: <strong>DD-MM-YYYY</strong> (e.g. 29-11-2013)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In as Student / Parent <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                {/* Quick Fill Registered Player Chips */}
                <div className="mt-4 pt-3 border-t border-navy/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-navy/60 mb-2">
                    Registered student sample log-in:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_STUDENT_LOGINS.map((cred) => (
                      <button
                        key={cred.name}
                        type="button"
                        onClick={() => {
                          setStudentId(cred.name);
                          setDobPassword(cred.dob);
                          setErrorMessage(null);
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-[#f2f5fa] hover:bg-navy/10 border border-navy/15 text-[11px] text-navy transition-colors text-left flex flex-col cursor-pointer"
                      >
                        <span className="font-bold truncate">{cred.name}</span>
                        <span className="text-[10px] text-navy/60">
                          DOB: {cred.dob} · {cred.batch}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUseEmailForParent(true);
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-navy/60 hover:text-navy underline cursor-pointer"
                  >
                    Need email / password sign-in instead?
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Back to Name + DOB toggle if parent opted for email */}
              {role === "parent" && useEmailForParent && (
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUseEmailForParent(false);
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-[#b3202a] hover:underline cursor-pointer"
                  >
                    ← Switch back to Name &amp; DOB login
                  </button>
                </div>
              )}

              {/* Auth Method Toggle: Email OTP vs Password */}
              <div className="mt-4 flex rounded-md bg-[#f2f5fa] p-1 border border-navy/10 text-xs font-bold text-navy/70">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMethod === "otp"
                      ? "bg-white text-navy shadow-sm border border-navy/15 font-bold"
                      : "hover:text-navy"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email OTP (Passwordless)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMethod === "password"
                      ? "bg-white text-navy shadow-sm border border-navy/15 font-bold"
                      : "hover:text-navy"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Password
                </button>
              </div>

              {/* OTP METHOD FORM */}
              {authMethod === "otp" && (
                <div className="mt-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-navy/80">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={field}
                        />
                        <p className="mt-1 text-[11px] text-navy/60">
                          We will email you a 6-digit login code and instant login link.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Sending Code...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Send Login Code <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold uppercase text-navy/80">
                            Enter 6-Digit Code
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode("");
                            }}
                            className="text-[11px] font-semibold text-navy/60 hover:text-navy underline cursor-pointer"
                          >
                            Change email
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          required
                          placeholder="• • • • • •"
                          autoFocus
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-center text-2xl font-bold tracking-[0.5em] text-navy placeholder:text-navy/20 focus:border-navy focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                          </span>
                        ) : (
                          `Verify & Sign In as ${ROLES[role].label}`
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          disabled={resendCooldown > 0 || loading}
                          onClick={handleSendOtp}
                          className="text-xs font-semibold text-navy/70 hover:text-navy disabled:opacity-40 cursor-pointer"
                        >
                          {resendCooldown > 0
                            ? `Resend code in ${resendCooldown}s`
                            : "Didn't receive code? Resend"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* PASSWORD METHOD FORM */}
              {authMethod === "password" && (
                <form onSubmit={handlePasswordAuth} className="mt-4 space-y-3">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-navy/80">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={field}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase text-navy/80">
                      Email Address
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
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={field}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loading
                      ? "Processing..."
                      : isSignUp
                      ? `Create ${ROLES[role].label} Account`
                      : `Sign In as ${ROLES[role].label}`}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs font-semibold text-navy/70 hover:text-navy underline cursor-pointer"
                    >
                      {isSignUp
                        ? "Already registered? Sign in with password"
                        : "Need an account? Register with password"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
