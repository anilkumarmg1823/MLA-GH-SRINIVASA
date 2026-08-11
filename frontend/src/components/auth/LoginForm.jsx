"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";
import {
  beginStaffLogin,
  getRoleDashboardPath,
  loginAdmin,
  verifyStaffTotp,
} from "@/lib/auth";
import { STAFF_ROLES } from "@/data/mockUsers";
import {
  FaShieldAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaKey,
  FaUsers,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import KudligiLoader from "@/components/ui/KudligiLoader";

const MLA_PHOTO = "/Picsart_26-02-05_14-31-10-288 (1).png";
const KN = {
  mlaName: "DR. SRINIVAS N. T.",
  mlaTitle: "MLA - KUDLIGI CONSTITUENCY",
  home: "Return to Home Page",
  withYou: "MBBS, MD, AIIMS Delhi",
  congress: "INDIAN NATIONAL CONGRESS - KUDLIGI",
  loginTitle: "MLA Office Login",
  loginSub: "Kudligi Constituency Digital Portal",
  kudligi: "Kudligi",
  staffTab: "Staff Login",
  adminTab: "Admin Login",
  role: "Select Staff Role",
  phone: "Mobile Number",
  continue: "Continue",
  changePhone: "Change phone",
  staff: "Staff",
  scanQr: "Scan Authenticator QR",
  login: "Verify and Login",
  soon: "Coming Soon",
  active: "Active Module",
  notReg: "Phone not registered. Admin must add this staff in Access first.",
  notRegShort: "Staff phone not registered",
  enterCode: "Enter the 6-digit code from your Authenticator app",
  badCode: "Invalid authenticator code",
  fail: "Could not continue",
  hint: "Only staff added by admin in Access can login. Next: scan QR (first time).",
  scanHelp: "After admin enroll/reset, scan this QR in Google / Microsoft Authenticator, then enter the 6-digit code. QR stays until first successful login.",
  already: "Authenticator already set up. Enter the code from your app.",
  authCode: "Authenticator code",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();
  const [mode, setMode] = useState("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("development");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [staffStep, setStaffStep] = useState(null);

  const isKn = lang === "kn";
  const mlaName = KN.mlaName;
  const mlaTitle = KN.mlaTitle;

  useEffect(() => {
    if (searchParams.get("reason") === "session_replaced") {
      setInfo(
        isKn
          ? "ಬೇರೆ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಹೊಸ ಲಾಗಿನ್ ಆಯಿತು — ಈ ಸೆಷನ್ ಮುಚ್ಚಲಾಗಿದೆ. ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ."
          : "You signed in from another tab — this session was closed. Please log in again."
      );
    }
  }, [searchParams, isKn]);

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

  const resetStaffStep = () => {
    setStaffStep(null);
    setOtp("");
    setError("");
  };

  const handleStaffBegin = async (e) => {
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
      const data = await beginStaffLogin(digits);
      setStaffStep({
        phone: data.phone || digits,
        name: data.name || "",
        needsScan: Boolean(data.needsScan),
        qrDataUrl: data.qrDataUrl || null,
        secret: data.secret || null,
      });
      setOtp("");
    } catch (err) {
      if (err?.status === 404) {
        setError(KN.notReg);
      } else {
        setError(err?.message || KN.fail);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError("");
    const digits = String(staffStep?.phone || phone).replace(/\D/g, "");
    const selected = STAFF_ROLES.find((r) => r.id === role);
    if (!selected?.enabled) {
      setError(t.roleNotEnabled || "This role is not available yet");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError(KN.enterCode);
      return;
    }
    setBusy(true);
    try {
      const session = await verifyStaffTotp({
        phone: digits,
        otp: otp.trim(),
        role: selected.id,
      });
      router.push(getRoleDashboardPath(session));
    } catch (err) {
      if (err?.status === 404) {
        setError(KN.notRegShort);
      } else {
        setError(t.invalidOtp || KN.badCode);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] text-slate-900 flex overflow-x-hidden overflow-y-auto select-none">
      {/* Fantastic White-Shaded Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle Map Overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-multiply">
          <Image
            src="/kudligi_3d_map_blue.png"
            alt="Kudligi Constituency Map"
            fill
            priority
            className="object-cover filter brightness-110 contrast-125"
          />
        </div>

        {/* Soft Glowing Aura Accents */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#0055C4]/20 via-[#3B82F6]/15 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-[#FFD700]/30 via-[#F59E0B]/15 to-transparent blur-[130px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[750px] rounded-full bg-radial from-amber-200/25 via-blue-100/20 to-transparent blur-[150px]" />
      </div>

      {/* Top Header Buttons */}
      <div className="absolute top-5 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className="relative w-12 h-12 rounded-full bg-[#001438] border-2 border-[#FFD700] p-1.5 shadow-2xl hover:scale-110 hover:border-white transition-all flex items-center justify-center cursor-pointer group"
          title={KN.home}
        >
          <div className="relative w-full h-full">
            <Image src="/party_logo_v2.png" alt="INC Logo" fill className="object-contain" />
          </div>
        </Link>
        <LanguageToggle className="bg-[#001438] text-white backdrop-blur-md shadow-lg border border-[#FFD700]/40 rounded-full" />
      </div>

      {/* 2-Column Main Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 sm:p-8 lg:p-12 items-center py-20 sm:py-16 lg:my-auto">
        {/* Left Column: MLA Official Photo & Info Banner (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 relative h-[580px] flex-col justify-between p-6 xl:p-10 select-none overflow-hidden rounded-3xl">
          <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
            <Image
              src={MLA_PHOTO}
              alt={mlaName}
              fill
              priority
              sizes="50vw"
              className="object-cover object-[center_10%] brightness-110 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001438] via-[#001438]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001438]/40 via-transparent to-[#F8FAFC]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#001438]/90 border border-[#FFD700] backdrop-blur-md shadow-xl">
              <div className="relative w-6 h-6">
                <Image src="/party_logo_v2.png" alt="INC" fill className="object-contain" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD700]">
                {KN.congress}
              </span>
            </div>
          </div>
          <div className="relative z-10 flex flex-col gap-2.5 bg-[#001438]/85 backdrop-blur-md p-5 rounded-2xl border border-[#FFD700]/40 shadow-2xl max-w-lg">
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide drop-shadow-md">{mlaName}</h3>
              <p className="text-xs font-black text-[#FFD700] tracking-widest uppercase mt-0.5 drop-shadow">
                {mlaTitle} | {KN.withYou}
              </p>
            </div>
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-slate-200 font-semibold">
              <span>&copy; 2026 Dr. Srinivas N. T. MLA Office Kudligi</span>
              <span className="text-[#FFD700] font-black">Government of Karnataka Portal</span>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card Container */}
        <div className="lg:col-span-6 relative w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-[460px] rounded-3xl border-2 border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl border-t-4 border-t-[#0055C4]">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#FFD700] bg-[#001438] p-1.5 shrink-0 shadow-md">
                  <Image src="/party_logo_v2.png" alt="INC" fill className="object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-[#001D56] tracking-wide">
                    {t.loginTitle || KN.loginTitle}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    {t.loginSubtitle || KN.loginSub}
                  </p>
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0055C4]/10 border border-[#0055C4]/30 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#0055C4] animate-ping" />
                <span className="text-[10px] font-black text-[#0055C4]">{KN.kudligi}</span>
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 mb-6 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode("staff");
                  setError("");
                  setStaffStep(null);
                  setOtp("");
                }}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === "staff"
                    ? "bg-[#001D56] text-[#FFD700] shadow-md border border-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaUsers className="w-3.5 h-3.5" />
                <span>{t.tabStaff || KN.staffTab}</span>
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
                <span>{t.tabAdmin || KN.adminTab}</span>
              </button>
            </div>

            {/* Feedback Notifications */}
            <AnimatePresence>
              {info ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 flex items-center gap-2 font-bold"
                >
                  <FaInfoCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{info}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

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

            {/* Admin Form */}
            {mode === "admin" ? (
              <form onSubmit={handleAdminLogin} className="flex-1 flex flex-col justify-between space-y-4 pt-2">
                <div className="space-y-4">
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
                        placeholder="admin@example.com"
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
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-200 pl-10 pr-10 text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#0055C4] focus:bg-white transition-all shadow-inner"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-2xl bg-[#FFD700] hover:bg-slate-900 hover:text-white text-slate-950 text-sm font-black tracking-wide shadow-xl border-2 border-white transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 mt-auto"
                >
                  <span>{t.adminLogin || "Login to Admin Portal"}</span>
                  <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : !staffStep ? (
              /* Staff Step 1 Form */
              <form onSubmit={handleStaffBegin} className="flex-1 flex flex-col justify-between space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56] mb-1.5">
                    {t.role || KN.role}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 rounded-xl bg-slate-50 border-2 border-slate-200 px-3.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#0055C4] focus:bg-white transition-all shadow-inner cursor-pointer"
                  >
                    {STAFF_ROLES.map((r) => (
                      <option key={r.id} value={r.id} disabled={!r.enabled}>
                        {isKn ? r.labelKn : r.labelEn} {!r.enabled ? ` (${KN.soon})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56] mb-1.5">
                    {t.phone || KN.phone}
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
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0055C4] font-bold flex items-start gap-2">
                  <FaInfoCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{KN.hint}</span>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-2xl bg-[#FFD700] hover:bg-slate-900 hover:text-white text-slate-950 text-sm font-black tracking-wide shadow-xl border-2 border-white transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 mt-auto"
                >
                  <span>{KN.continue}</span>
                  <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              /* Staff Step 2 Authenticator Form */
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <button
                  type="button"
                  onClick={resetStaffStep}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                >
                  <FaArrowLeft className="w-3 h-3" />
                  {KN.changePhone}
                </button>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-black text-[#001D56]">
                    {staffStep.name || KN.staff}
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">
                    +91 {staffStep.phone}
                  </p>
                </div>

                {staffStep.needsScan && staffStep.qrDataUrl ? (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-[#001D56]">
                      {KN.scanQr}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {KN.scanHelp}
                    </p>
                    <div className="flex justify-center bg-white rounded-xl border border-slate-200 p-3">
                      <img
                        src={staffStep.qrDataUrl}
                        alt="Authenticator QR"
                        className="w-52 h-52"
                      />
                    </div>
                    {staffStep.secret ? (
                      <p className="font-mono text-[10px] text-slate-500 break-all text-center">
                        {staffStep.secret}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{KN.already}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#001D56]">
                    {KN.authCode}
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full h-12 rounded-xl bg-slate-50 border-2 border-[#0055C4] pl-10 pr-3.5 text-sm text-slate-900 font-mono font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-2xl bg-[#FFD700] hover:bg-slate-900 hover:text-white text-slate-950 text-sm font-black tracking-wide shadow-xl border-2 border-white transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                >
                  <span>{KN.login}</span>
                  <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {busy ? (
        <KudligiLoader
          variant="overlay"
          subKn="ಪ್ರವೇಶ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…"
          subEn="Signing you in…"
        />
      ) : null}
    </div>
  );
}
