import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Layers3,
  Activity,
  BriefcaseBusiness,
  Mail,
  ShieldCheck,
  Zap,
  CalendarDays,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  KeyRound,
  BadgeCheck,
} from "lucide-react";
import GraphuraLogo from "../../assets/Logo/Graphura_Logo.webp";
import {
  sendOTP,
  verifyOTP,
  registerAdmin,
} from "../../services/authService";
// import GraphuraLogo from "../assets/Graphura_Logo.webp";

// ─── Floating Background (identical to Login) ────────────────────────────────
const FloatingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden opacity-5 pointer-events-none">
    <Layers3
      className="w-20 h-20 text-slate-900 absolute top-10 left-10 animate-[spin_25s_linear_infinite]"
      strokeWidth={1}
    />
    <Activity
      className="w-24 h-24 text-slate-900 absolute top-20 right-20 animate-[pulse_4s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <User
      className="w-16 h-16 text-slate-900 absolute bottom-32 left-40 animate-[spin_22s_linear_infinite]"
      strokeWidth={1}
    />
    <BriefcaseBusiness
      className="w-20 h-20 text-slate-900 absolute -bottom-10 right-40 animate-[pulse_5s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <Mail
      className="w-28 h-28 text-slate-900 absolute top-[40%] left-[20%] animate-[spin_18s_linear_infinite]"
      strokeWidth={1}
    />
    <ShieldCheck
      className="w-18 h-18 text-slate-900 absolute top-28 left-[45%] animate-[spin_30s_linear_infinite]"
      strokeWidth={1}
    />
    <Zap
      className="w-16 h-16 text-slate-900 absolute bottom-20 right-28 animate-[pulse_3s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <CalendarDays
      className="w-24 h-24 text-slate-900 absolute top-[55%] right-10 animate-[spin_28s_linear_infinite]"
      strokeWidth={1}
    />
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateCaptcha() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const steps = ["Company", "Owner", "Security"];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((label, i) => {
      const active = i === current;
      const done = i < current;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-[#2a465a] text-white"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                active
                  ? "text-[#2a465a]"
                  : done
                    ? "text-emerald-500"
                    : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-[2px] w-10 rounded-full mb-4 transition-all duration-500 ${
                done ? "bg-emerald-400" : "bg-slate-200"
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Reusable Input ───────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-rose-600">{error}</p>}
  </div>
);

const InputWrap = ({ icon: Icon, children, className = "" }) => (
  <div
    className={`relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 transition ${className}`}
  >
    {Icon && (
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
        <Icon size={18} />
      </div>
    )}
    {children}
  </div>
);

// ─── Register Component ───────────────────────────────────────────────────────
const AdminRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0 – Company info
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Step 1 – Owner info
  const [ownerName, setOwnerName] = useState("");

  // Step 2 – Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  // Errors
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── OTP countdown ──
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  // ── Status auto-clear ──
  useEffect(() => {
    if (!status.type) return;
    const t = setTimeout(() => setStatus({ type: "", message: "" }), 4000);
    return () => clearTimeout(t);
  }, [status]);

  // ── Validate email ──
  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  // ── Send OTP ──
  const handleSendOTP = async () => {
    if (!companyEmail.trim()) {
      setErrors((e) => ({ ...e, companyEmail: "Email is required." }));
      return;
    }
    if (!validateEmail(companyEmail)) {
      setErrors((e) => ({
        ...e,
        companyEmail: "Enter a valid email address.",
      }));
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOTP(companyEmail, ownerName || companyName || "Admin");
      setOtpSent(true);
      setOtpVerified(false);
      setOtpInput("");
      setOtpCooldown(120);
      setErrors((e) => ({ ...e, companyEmail: "", otpInput: "" }));
      setStatus({
        type: "info",
        message: `OTP sent to ${companyEmail}. Please check your inbox.`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async () => {
    if (!otpInput.trim()) {
      setErrors((e) => ({ ...e, otpInput: "Please enter the OTP." }));
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOTP(companyEmail, otpInput);
      setOtpVerified(true);
      setErrors((e) => ({ ...e, otpInput: "" }));
      setStatus({ type: "success", message: "Email verified successfully!" });
    } catch (err) {
      setErrors((e) => ({
        ...e,
        otpInput: err?.message || "Incorrect OTP. Please try again.",
      }));
      setOtpInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step navigation ──
  const nextStep = () => {
    const errs = {};
    if (step === 0) {
      if (!companyName.trim()) errs.companyName = "Company name is required.";
      if (!companyEmail.trim()) errs.companyEmail = "Email is required.";
      else if (!validateEmail(companyEmail))
        errs.companyEmail = "Enter a valid email address.";
      // else if (!otpVerified)
      //   errs.otpInput = "Please verify your email before continuing.";
      if (!companyAddress.trim())
        errs.companyAddress = "Company address is required.";
    }
    if (step === 1) {
      if (!ownerName.trim()) errs.ownerName = "Owner name is required.";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStatus({
        type: "alert",
        message: "Please fix the errors before continuing.",
      });
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  // ── Final submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard against accidental form submits (e.g. Enter key)
    // before reaching the final security step.
    if (step < 2) {
      nextStep();
      return;
    }

    const errs = {};
    if (!password.trim()) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (!confirmPassword.trim())
      errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    if (!captchaInput.trim())
      errs.captchaInput = "Please enter the CAPTCHA code.";
    else if (captchaInput !== captchaCode) {
      errs.captchaInput = "Incorrect CAPTCHA. Please try again.";
      setCaptchaCode(generateCaptcha());
      setCaptchaInput("");
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStatus({
        type: "error",
        message: "Please fix the errors and try again.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await registerAdmin({
        companyName,
        companyEmail,
        companyAddress,
        adminName: ownerName,
        ownerName,
        adminEmail: companyEmail,
        password,
        confirmPassword,
        securityCode: captchaInput,
      });

      setStatus({
        type: "success",
        message: "🎉 Account created! Redirecting to your dashboard…",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1200);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setErrors((e) => ({ ...e, captchaInput: "" }));
  };

  // ── Status colours ──
  const statusCls =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status.type === "alert"
        ? "border-yellow-200 bg-yellow-50 text-yellow-800"
        : status.type === "info"
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-red-200 bg-red-50 text-red-800";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingBackground />

      {/* Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 min-h-[600px]">
        {/* ── Left Panel ── */}
        <div className="hidden lg:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
          <div>
            <div className="mb-10">
              <img src={GraphuraLogo} alt="Graphura Logo" className="h-20" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#2a465a] leading-tight mb-4">
              Start Your Journey with Graphura.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Register your company and unlock a powerful CRM platform — built
              to manage leads, teams, and customers from day one.
            </p>

            {/* Feature pills */}
            <div className="mt-8 space-y-3">
              {[
                { icon: BadgeCheck, text: "Verified business accounts" },
                { icon: ShieldCheck, text: "Enterprise-grade security" },
                { icon: Zap, text: "Set up in under 5 minutes" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-slate-600 text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2a465a]/10 flex items-center justify-center">
                    <Icon size={14} className="text-[#2a465a]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="text-[11px] font-bold px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100">
              Terms of Service
            </button>
            <button className="text-[11px] font-bold px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100">
              Privacy Policy
            </button>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="w-full lg:w-7/12 p-8 md:p-14 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-3xl font-black text-[#2a465a] mb-2 text-center tracking-tight">
              Register your Company 🏢
            </h1>
            <p className="text-center text-slate-400 text-sm mb-6">
              Complete all 3 steps to create your account
            </p>

            <StepIndicator current={step} />

            {/* Status banner */}
            {status.message && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm mb-5 border ${statusCls}`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ════ STEP 0 – Company Info ════ */}
              {step === 0 && (
                <>
                  {/* Company Name */}
                  <Field label="Company Name" error={errors.companyName}>
                    <InputWrap icon={Building2}>
                      <input
                        type="text"
                        placeholder="Acme Corp"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (errors.companyName)
                            setErrors((er) => ({ ...er, companyName: "" }));
                        }}
                        className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-[#2a465a] placeholder:text-slate-400 focus:outline-none"
                      />
                    </InputWrap>
                  </Field>

                  {/* Company Email + Send OTP */}
                  <Field label="Company Email" error={errors.companyEmail}>
                    <div className="flex gap-2">
                      <InputWrap icon={Mail} className="flex-1">
                        <input
                          type="email"
                          placeholder="you@company.com"
                          value={companyEmail}
                          onChange={(e) => {
                            setCompanyEmail(e.target.value);
                            setOtpVerified(false);
                            setOtpSent(false);
                            if (errors.companyEmail)
                              setErrors((er) => ({ ...er, companyEmail: "" }));
                          }}
                          className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-[#2a465a] placeholder:text-slate-400 focus:outline-none"
                        />
                      </InputWrap>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isSubmitting || otpCooldown > 0 || otpVerified}
                        className={`whitespace-nowrap px-4 rounded-2xl text-xs font-bold transition ${
                          otpVerified
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default"
                            : otpCooldown > 0
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-[#2a465a] text-white hover:bg-[#1e3a52]"
                        }`}
                      >
                        {otpVerified
                          ? "✓ Verified"
                          : otpCooldown > 0
                            ? `Resend (${otpCooldown}s)`
                            : otpSent
                              ? "Resend OTP"
                              : "Send OTP"}
                      </button>
                    </div>
                  </Field>

                  {/* OTP Input */}
                  {otpSent && !otpVerified && (
                    <Field label="Enter OTP" error={errors.otpInput}>
                      <div className="flex gap-2">
                        <InputWrap icon={KeyRound} className="flex-1">
                          <input
                            type="text"
                            placeholder="6-digit OTP"
                            value={otpInput}
                            onChange={(e) => {
                              setOtpInput(e.target.value);
                              if (errors.otpInput)
                                setErrors((er) => ({ ...er, otpInput: "" }));
                            }}
                            maxLength={6}
                            className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-[#2a465a] placeholder:text-slate-400 focus:outline-none tracking-[0.3em] font-semibold"
                          />
                        </InputWrap>
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={isSubmitting}
                          className="px-4 rounded-2xl text-xs font-bold bg-[#2a465a] text-white hover:bg-[#1e3a52] transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Verify
                        </button>
                      </div>
                    </Field>
                  )}

                  {/* OTP pending but not yet sent */}
                  {!otpSent && errors.otpInput && (
                    <p className="text-xs text-rose-600">{errors.otpInput}</p>
                  )}

                  {/* Company Address */}
                  <Field label="Company Address" error={errors.companyAddress}>
                    <InputWrap icon={MapPin}>
                      <textarea
                        rows={2}
                        placeholder="123 Business Park, Ahmedabad, Gujarat"
                        value={companyAddress}
                        onChange={(e) => {
                          setCompanyAddress(e.target.value);
                          if (errors.companyAddress)
                            setErrors((er) => ({ ...er, companyAddress: "" }));
                        }}
                        className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-[#2a465a] placeholder:text-slate-400 focus:outline-none resize-none"
                      />
                    </InputWrap>
                  </Field>
                </>
              )}

              {/* ════ STEP 1 – Owner Info ════ */}
              {step === 1 && (
                <>
                  <Field label="Owner / Admin Name" error={errors.ownerName}>
                    <InputWrap icon={User}>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={ownerName}
                        onChange={(e) => {
                          setOwnerName(e.target.value);
                          if (errors.ownerName)
                            setErrors((er) => ({ ...er, ownerName: "" }));
                        }}
                        className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-[#2a465a] placeholder:text-slate-400 focus:outline-none"
                      />
                    </InputWrap>
                  </Field>

                  {/* Summary card */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2 text-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Company Summary
                    </p>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Company</span>
                      <span className="font-semibold text-[#2a465a]">
                        {companyName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-semibold text-[#2a465a]">
                        {companyEmail || "—"}{" "}
                        {otpVerified && (
                          <span className="text-emerald-500 text-xs">
                            ✓ verified
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Address</span>
                      <span className="font-semibold text-[#2a465a] text-right max-w-[55%]">
                        {companyAddress || "—"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* ════ STEP 2 – Security ════ */}
              {step === 2 && (
                <>
                  {/* Password */}
                  <Field label="Password" error={errors.password}>
                    <InputWrap icon={ShieldCheck}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password)
                            setErrors((er) => ({ ...er, password: "" }));
                        }}
                        className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a465a] transition"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </InputWrap>
                    {/* Strength bar */}
                    {password && (
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4].map((n) => {
                          const strength =
                            (password.length >= 8 ? 1 : 0) +
                            (/[A-Z]/.test(password) ? 1 : 0) +
                            (/[0-9]/.test(password) ? 1 : 0) +
                            (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                          return (
                            <div
                              key={n}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                n <= strength
                                  ? strength === 1
                                    ? "bg-red-400"
                                    : strength === 2
                                      ? "bg-yellow-400"
                                      : strength === 3
                                        ? "bg-blue-400"
                                        : "bg-emerald-400"
                                  : "bg-slate-200"
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </Field>

                  {/* Confirm Password */}
                  <Field
                    label="Confirm Password"
                    error={errors.confirmPassword}
                  >
                    <InputWrap icon={ShieldCheck}>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword)
                            setErrors((er) => ({ ...er, confirmPassword: "" }));
                        }}
                        className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a465a] transition"
                      >
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </InputWrap>
                  </Field>

                  {/* CAPTCHA */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
                      Security Verification
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-2 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-white py-2 text-center shadow-sm">
                          <p className="text-3xl font-black text-slate-800 tracking-[0.35em]">
                            {captchaCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="h-12 w-12 rounded-3xl border border-slate-200 bg-white text-slate-600 shadow-sm flex items-center justify-center hover:bg-slate-100 transition"
                          title="Refresh CAPTCHA"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <InputWrap>
                      <input
                        type="text"
                        placeholder="Enter the 4-digit number above"
                        value={captchaInput}
                        onChange={(e) => {
                          setCaptchaInput(e.target.value);
                          if (errors.captchaInput)
                            setErrors((er) => ({ ...er, captchaInput: "" }));
                        }}
                        maxLength={4}
                        className="w-full rounded-2xl bg-transparent py-4 px-4 text-[#2a465a] placeholder:text-slate-400 focus:outline-none text-center tracking-[0.25em] text-md font-semibold"
                      />
                    </InputWrap>
                    {errors.captchaInput && (
                      <p className="text-xs text-rose-600">
                        {errors.captchaInput}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      Enter the 4-digit number shown above
                    </p>
                  </div>
                </>
              )}

              {/* ── Navigation buttons ── */}
              <div
                className={`flex gap-3 pt-2 ${step > 0 ? "justify-between" : "justify-end"}`}
              >
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                  >
                    ← Back
                  </button>
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-[#2a465a] text-white font-bold rounded-2xl shadow-xl shadow-[#2a465a]/20 transition duration-300 ease-out hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-[#2a465a] text-white font-bold rounded-2xl shadow-xl shadow-[#2a465a]/20 transition duration-300 ease-out hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
                  >
                    {isSubmitting ? "Creating..." : "Create Account →"}
                  </button>
                )}
              </div>
            </form>

            <p className="mt-6 text-center text-slate-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#2a465a] font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
