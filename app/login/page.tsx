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
} from "lucide-react";
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
  "mt-1 w-full rounded-md border-2 border-navy/20 bg-white px-3 py-2.5 text-navy placeholder:text-navy/40 focus:border-navy focus:outline-none text-sm transition-all";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [email, setEmail] = useState<string>(ROLES.admin.demoEmail);
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
  }

  // 1. Password Login / Signup
  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        // Fallback to demo mode
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

  // 2. Send Email OTP / Magic Link
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        // Fallback demo mode
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

  // 3. Verify 6-digit Email OTP
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
        // Check profile role
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

  // 4. Quick Demo Bypass
  function handleQuickDemo() {
    router.push(ROLES[role].to);
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
          <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 px-3 py-1 rounded border border-gold/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Nagpur&apos;s Premier Cricket Academy
          </span>
          <p className="mt-4 font-display text-7xl font-extrabold uppercase leading-[0.9]">
            Train.<br />Perform.<br />Progress.
          </p>
          <p className="mt-4 text-white/80 max-w-md text-base leading-relaxed">
            Fast-bowling biomechanics video analyses, turf &amp; cemented pitches, floodlight night sessions,
            and complete parent updates on Hingna Road.
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

          <div className="mt-3 p-2.5 rounded-lg bg-[#f2f5fa] border border-navy/10 text-xs text-navy/80 flex items-start gap-2">
            <ActiveIcon className="w-4 h-4 text-navy shrink-0 mt-0.5" />
            <span>{ROLES[role].hint}</span>
          </div>

          {/* Auth Method Toggle: Email OTP vs Password */}
          <div className="mt-4 flex rounded-md bg-[#f2f5fa] p-1 border border-navy/10 text-xs font-bold text-navy/70">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("otp");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded text-center transition-all flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-1.5 rounded text-center transition-all flex items-center justify-center gap-1.5 ${
                authMethod === "password"
                  ? "bg-white text-navy shadow-sm border border-navy/15 font-bold"
                  : "hover:text-navy"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> Password
            </button>
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
                    className="w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
                        className="text-[11px] font-semibold text-navy/60 hover:text-navy underline"
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
                    className="w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
                      className="text-xs font-semibold text-navy/70 hover:text-navy disabled:opacity-40"
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
                className="mt-1 w-full rounded-md bg-[#f5b700] px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-navy hover:brightness-95 transition-all shadow-sm disabled:opacity-50"
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
                  className="text-xs font-semibold text-navy/70 hover:text-navy underline"
                >
                  {isSignUp
                    ? "Already registered? Sign in with password"
                    : "Need an account? Register with password"}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Bypass */}
          <div className="mt-5 pt-4 border-t border-navy/10">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-navy/30 bg-[#f2f5fa] hover:bg-navy/5 text-navy font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>⚡ Explore {ROLES[role].label} Demo Dashboard (1-Click Instant)</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
