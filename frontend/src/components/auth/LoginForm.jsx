"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";
import {
  getRoleDashboardPath,
  loginAdmin,
  requestStaffOtp,
  verifyStaffOtp,
} from "@/lib/auth";
import { MOCK_OTP, STAFF_ROLES } from "@/data/mockUsers";
import {
  FaShieldAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaKey,
  FaUsers,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";

const MLA_PHOTO = "/Picsart_26-02-05_14-31-10-288 (1).png";
const TALUK_MAP = "/kudligi_3d_map_blue.png";

export default function LoginForm() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [mode, setMode] = useState("staff"); // "staff" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("development");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const isKn = lang === "kn";
  const mlaName = isKn ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ." : "DR. SRINIVAS N. T.";
  const mlaTitle = isKn ? "ಶಾಸಕರು - ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ" : "MLA - KUDLIGI CONSTITUENCY";

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const session = await loginAdmin(email.trim(), password);
      router.push(getRoleDashboardPath(session));
    } catch {
      setError(t.invalidCreds || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async ({ isResend = false } = {}) => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(t.invalidPhone || "Enter a valid 10-digit mobile number");
      return;
    }
    const selected = STAFF_ROLES.find((r) => r.id === role);
    if (!selected?.enabled) {
      setError(t.roleNotEnabled || "This role is not available yet");
      return;
    }
    if (isResend && resendIn > 0) return;
    setBusy(true);
    try {
      await requestStaffOtp(digits);
      setOtpSent(true);
      setOtp("");
      setResendIn(30);
    } catch (err) {
      const msg =
        err?.status === 429
          ? isKn
            ? "Too many OTP requests. Try again shortly."
            : "Too many OTP requests. Try again shortly."
          : err?.message ||
            (isKn ? "Could not send OTP" : "Could not send OTP");
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    await sendOtp({ isResend: false });
  };

  const handleResendOtp = async () => {
    await sendOtp({ isResend: true });
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(t.invalidPhone || "Enter a valid 10-digit mobile number");
      return;
    }
    const selected = STAFF_ROLES.find((r) => r.id === role);
    if (!selected?.enabled) {
      setError(t.roleNotEnabled || "This role is not available yet");
      return;
    }
    setBusy(true);
    try {
      const session = await verifyStaffOtp({
        phone: digits,
        otp: otp.trim(),
        role: selected.id,
      });
      router.push(getRoleDashboardPath(session));
    } catch {
      setError(t.invalidOtp || "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#F8FAFC] text-slate-900 flex overflow-hidden select-none">
      
      {/* Dynamic Background Kudligi Map - High Visibility & Clarity */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/kudligi_3d_map_blue.png"
            alt="Kudligi Constituency Map"
            fill
            priority
            className="object-cover filter brightness-110 contrast-125"
          />
        </div>

        {/* Ambient Soft Royal Blue Glows */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#0055C4]/30 via-[#002B7F]/20 to-transparent blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-[#FFD700]/30 via-[#001438]/20 to-transparent blur-[140px]" />
      </div>

      {/* Top Header Navigation Bar (Top-Left: INC Logo Icon Only, Top-Right: Language Switcher) */}
      <div className="absolute top-5 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        
        {/* Top-Left: INC Logo Icon Button Only -> Navigates to Landing Page */}
        <Link
          href="/"
          className="relative w-12 h-12 rounded-full bg-[#001438] border-2 border-[#FFD700] p-1.5 shadow-2xl hover:scale-110 hover:border-white transition-all flex items-center justify-center cursor-pointer group"
          title={isKn ? "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Return to Home Page"}
        >
          <div className="relative w-full h-full">
            <Image src="/party_logo_v2.png" alt="INC Logo" fill className="object-contain" />
          </div>
        </Link>

        {/* Top-Right: Clean Language Toggle */}
        <LanguageToggle className="bg-[#001438] text-white backdrop-blur-md shadow-lg border border-[#FFD700]/40 rounded-full" />

      </div>

      {/* MAIN 2-COLUMN SPLIT CONTAINER */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 sm:p-8 lg:p-12 items-center my-auto">
        
        {/* ================= LEFT SIDE: DIRECT FULL-HEIGHT MLA PORTRAIT SHOWCASE (NO BOXED FRAME) ================= */}
        <div className="hidden lg:flex lg:col-span-6 relative h-full min-h-[580px] flex-col justify-between p-6 xl:p-10 select-none">
          
          {/* MLA Full Height Portrait Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
            <Image
              src={MLA_PHOTO}
              alt={mlaName}
              fill
              priority
              sizes="50vw"
              className="object-cover object-[center_10%] brightness-110 contrast-105"
            />
            {/* Smooth Edge Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001438] via-[#001438]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001438]/40 via-transparent to-[#F8FAFC]" />
          </div>

          {/* Top Branding Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#001438]/90 border border-[#FFD700] backdrop-blur-md shadow-xl">
              <div className="relative w-6 h-6">
                <Image src="/party_logo_v2.png" alt="INC" fill className="object-contain" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD700]">
                {isKn ? "ಭಾರತೀಯ ರಾಷ್ಟ್ರೀಯ ಕಾಂಗ್ರೆಸ್ • ಕೂಡ್ಲಿಗಿ" : "INDIAN NATIONAL CONGRESS • KUDLIGI"}
              </span>
            </div>
          </div>

          {/* Bottom Trust Info with Kannada Name */}
          <div className="relative z-10 flex flex-col gap-2.5 bg-[#001438]/85 backdrop-blur-md p-5 rounded-2xl border border-[#FFD700]/40 shadow-2xl max-w-lg">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-wide drop-shadow-md">
                  {mlaName}
                </h3>
                <p className="text-xs font-black text-[#FFD700] tracking-widest uppercase mt-0.5 drop-shadow">
                  {mlaTitle} | ನಿಮ್ಮೊಂದಿಗೆ
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-slate-200 font-semibold">
              <span>© 2026 Dr. Srinivas N. T. MLA Office Kudligi</span>
              <span className="text-[#FFD700] font-black">● Government of Karnataka Portal</span>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDE: CLEAN WHITE GLASSMORPHIC LOGIN FORM CARD ================= */}
        <div className="lg:col-span-6 relative w-full flex flex-col items-center justify-center">
          
          {/* Crisp White Login Card */}
          <div className="w-full max-w-[460px] rounded-3xl border-2 border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl border-t-4 border-t-[#0055C4]">
            
            {/* Header inside Login Card */}
            <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#FFD700] bg-[#001438] p-1.5 shrink-0 shadow-md">
                  <Image src="/party_logo_v2.png" alt="INC" fill className="object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#001D56] tracking-wide">
                    {t.loginTitle || (isKn ? "ಶಾಸಕರ ಕಚೇರಿ ಲಾಗಿನ್" : "MLA Office Login")}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    {t.loginSubtitle || (isKn ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರ ಡಿಜಿಟಲ್ ಪೋರ್ಟಲ್" : "Kudligi Constituency Digital Portal")}
                  </p>
                </div>
              </div>

              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0055C4]/10 border border-[#0055C4]/30 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#0055C4] animate-ping" />
                <span className="text-[10px] font-black text-[#0055C4]">
                  {isKn ? "ಕೂಡ್ಲಿಗಿ" : "Kudligi"}
                </span>
              </span>
            </div>

            {/* Mode Switcher: Staff vs Admin */}
            <div className="flex p-1 mb-6 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode("staff");
                  setError("");
                }}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "staff"
                    ? "bg-[#001D56] text-[#FFD700] shadow-md border border-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaUsers className="w-3.5 h-3.5" />
                <span>{t.tabStaff || (isKn ? "ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್" : "Staff Login")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("admin");
                  setError("");
                }}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "admin"
                    ? "bg-[#001D56] text-[#FFD700] shadow-md border border-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaShieldAlt className="w-3.5 h-3.5" />
                <span>{t.tabAdmin || (isKn ? "ನಿರ್ವಾಹಕ ಲಾಗಿನ್" : "Admin Login")}</span>
              </button>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-center gap-2 font-bold"
                >
                  <FaExclamationTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* ADMIN FORM */}
            {mode === "admin" ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56] mb-1.5">
                    {t.email || "Email Address"}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-200 pl-10 pr-3.5 text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0055C4] focus:bg-white transition-all shadow-inner"
                      placeholder="admin@mla.local"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56] mb-1.5">
                    {t.password || "Password"}
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-200 pl-10 pr-3.5 text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0055C4] focus:bg-white transition-all shadow-inner"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Demo Admin Callout */}
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-[#0055C4] font-bold">
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="w-4 h-4 shrink-0" />
                    <span>Demo: <strong className="text-slate-900">admin@mla.local</strong> | Pass: <strong className="text-slate-900">admin123</strong></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-2xl bg-[#FFD700] hover:bg-slate-900 hover:text-white text-slate-950 text-sm font-black tracking-wide shadow-xl border-2 border-white transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  <span>{t.adminLogin || "Login to Admin Portal"}</span>
                  <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              /* STAFF FORM */
              <form
                onSubmit={otpSent ? handleStaffLogin : handleSendOtp}
                className="space-y-4"
              >
                {/* Staff Role Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56] mb-2">
                    {t.role || (isKn ? "ಇಲಾಖಾ ಪಾತ್ರ ಆಯ್ಕೆ" : "Select Staff Role")}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {STAFF_ROLES.map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          disabled={!r.enabled}
                          onClick={() => {
                            if (r.enabled) {
                              setRole(r.id);
                              setOtpSent(false);
                              setOtp("");
                            }
                          }}
                          className={`p-3 rounded-2xl border-2 text-left text-xs font-black transition-all relative cursor-pointer ${
                            !r.enabled
                              ? "opacity-50 border-slate-200 bg-slate-100 cursor-not-allowed text-slate-400"
                              : isSelected
                              ? "border-[#0055C4] bg-blue-50 text-[#001D56] shadow-md"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="truncate">{isKn ? r.labelKn : r.labelEn}</span>
                            {isSelected ? (
                              <FaCheckCircle className="w-3.5 h-3.5 text-[#0055C4] shrink-0" />
                            ) : null}
                          </div>
                          <span className="text-[10px] block font-bold text-slate-500">
                            {!r.enabled
                              ? (isKn ? "ಶೀಘ್ರದಲ್ಲೇ" : "Coming Soon")
                              : (isKn ? "ಸಕ್ರಿಯ" : "Active Module")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Number Input */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56] mb-1.5">
                    {t.phone || (isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "Mobile Number")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-600 text-xs font-black border-r border-slate-300 pr-2">
                      <FaPhoneAlt className="w-3 h-3 text-[#0055C4]" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-200 pl-16 pr-3.5 text-sm text-slate-900 font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0055C4] focus:bg-white transition-all shadow-inner"
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                {/* OTP Input Field */}
                <AnimatePresence>
                  {otpSent ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 pt-1"
                    >
                      <label className="block text-xs font-black uppercase tracking-wider text-[#001D56]">
                        {t.otp || (isKn ? "OTP ನಮೂದಿಸಿ" : "Enter Verification OTP")}
                      </label>
                      <div className="relative">
                        <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full h-12 rounded-xl bg-slate-50 border-2 border-[#0055C4] pl-10 pr-3.5 text-sm text-slate-900 font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
                          placeholder="123456"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={busy || resendIn > 0}
                          className="text-xs font-black text-[#0055C4] hover:underline disabled:opacity-40 disabled:no-underline"
                        >
                          {resendIn > 0
                            ? `Resend OTP in ${resendIn}s`
                            : "Resend OTP"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setResendIn(0);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                        >
                          <FaArrowLeft className="w-3 h-3" /> Change phone
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Demo OTP Helper Box */}
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-bold">
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Demo OTP: <strong className="text-slate-950 font-black">{MOCK_OTP}</strong></span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-2xl bg-[#FFD700] hover:bg-slate-900 hover:text-white text-slate-950 text-sm font-black tracking-wide shadow-xl border-2 border-white transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  <span>
                    {otpSent
                      ? (isKn ? "ಲಾಗಿನ್ ಮಾಡಿ" : "Verify & Login")
                      : (isKn ? "OTP ಕಳುಹಿಸಿ" : "Send OTP")}
                  </span>
                  <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
