import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound,
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Fingerprint,
  ShieldAlert,
  Timer,
} from "lucide-react";
import GraphuraLogo from "../../assets/Logo/Graphura_Logo.webp";
import { DataField, Button } from "../../components/shared/Common_Components";

/* ── Floating Background (same as login pages) ── */
const FloatingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "#063d66",
        opacity: "0.1",
        backgroundImage:
          "linear-gradient(#063d66 1.2px, transparent 1.2px), linear-gradient(90deg, #063d66 1.2px, transparent 1.2px), linear-gradient(#063d66 0.6px, transparent 0.6px), linear-gradient(90deg, #063d66 0.6px, #ffffff 0.6px)",
        backgroundSize: "30px 30px, 30px 30px, 6px 6px, 6px 6px",
        backgroundPosition:
          "-1.2px -1.2px, -1.2px -1.2px, -0.6px -0.6px, -0.6px -0.6px",
      }}
    />
    <div className="absolute inset-0 opacity-50">
      <KeyRound
        className="w-20 h-20 text-slate-900 absolute top-10 left-10 animate-[spin_25s_linear_infinite]"
        strokeWidth={1}
      />
      <ShieldAlert
        className="w-24 h-24 text-slate-900 absolute top-20 right-20 animate-[pulse_4s_ease-in-out_infinite]"
        strokeWidth={1}
      />
      <Fingerprint
        className="w-16 h-16 text-slate-900 absolute bottom-20 left-20 animate-[spin_22s_linear_infinite]"
        strokeWidth={1}
      />
      <Mail
        className="w-28 h-28 text-slate-900 absolute top-[40%] left-[20%] animate-[spin_18s_linear_infinite]"
        strokeWidth={1}
      />
      <Lock
        className="w-24 h-24 text-slate-900 absolute top-[45%] left-[5%] animate-[spin_30s_linear_infinite]"
        strokeWidth={1}
      />
      <ShieldCheck
        className="w-24 h-24 text-slate-900 absolute bottom-20 right-20 animate-[pulse_3s_ease-in-out_infinite]"
        strokeWidth={1}
      />
      <Timer
        className="w-24 h-24 text-slate-900 absolute top-[45%] right-10 animate-[spin_28s_linear_infinite]"
        strokeWidth={1}
      />
    </div>
  </div>
);

/* ── Status Banner ── */
const StatusBanner = ({ type, message }) => {
  if (!type) return null;
  const styles = {
    success: "border border-emerald-200 bg-emerald-50 text-emerald-800",
    alert: "border border-yellow-200 bg-yellow-50 text-yellow-800",
    info: "border border-blue-200 bg-blue-50 text-blue-800",
    error: "border border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={`rounded-2xl px-4 py-3 text-sm ${styles[type] || styles.error}`}>
      {message}
    </div>
  );
};

/* ── Step Indicator ── */
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Email" },
    { num: 2, label: "Verify" },
    { num: 3, label: "Reset" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map(({ num, label }, idx) => (
        <React.Fragment key={num}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${currentStep > num
                ? "bg-emerald-500 text-white scale-100"
                : currentStep === num
                  ? "bg-[#2a465a] text-white scale-110 shadow-lg shadow-[#2a465a]/30"
                  : "bg-slate-100 text-slate-400 scale-100"
                }`}
            >
              {currentStep > num ? <CheckCircle2 size={18} /> : num}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= num ? "text-[#2a465a]" : "text-slate-400"
                }`}
            >
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 w-10 rounded-full transition-all duration-500 mb-5 ${currentStep > num ? "bg-emerald-500" : "bg-slate-200"
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── OTP Input ── */
const OTPInput = ({ otp, setOtp, otpError }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none">
        Verification Code
      </label>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={idx === 0 ? handlePaste : undefined}
            className={`w-12 h-14 rounded-2xl border text-center text-xl font-black text-[#2a465a] bg-slate-50/90 
              focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200
              ${otpError ? "border-rose-300 bg-rose-50/50" : "border-slate-200"}
              ${digit ? "border-[#2a465a]/40 bg-white" : ""}
            `}
            id={`otp_input_${idx}`}
          />
        ))}
      </div>
      {otpError && (
        <p className="text-xs text-rose-600 mt-1 px-1 text-center">{otpError}</p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   FORGOT PASSWORD — Main Component
   3-step flow: Email → OTP Verification → New Password
   ══════════════════════════════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  // Step 1 — Email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Step 2 — OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Step 3 — New Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Shared
  const [statusType, setStatusType] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

  // Auto-clear status banner
  useEffect(() => {
    if (!statusType) return;
    const t = setTimeout(() => {
      setStatusType("");
      setStatusMessage("");
    }, 4000);
    return () => clearTimeout(t);
  }, [statusType]);

  // OTP resend countdown
  useEffect(() => {
    if (step !== 2) return;
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: score, label: "Weak", color: "bg-rose-500" };
    if (score <= 3) return { level: score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { level: score, label: "Good", color: "bg-blue-500" };
    return { level: score, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  /* ── Step 1: Submit Email ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!valid) {
      setStatusType("alert");
      setStatusMessage("Please enter a valid email address to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusType("info");
      setStatusMessage("Sending verification code to your email...");

      // Simulate API call — replace with actual API later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatusType("success");
      setStatusMessage(`Verification code sent to ${email}`);
      setResendTimer(60);
      setCanResend(false);

      setTimeout(() => {
        setStep(2);
        setStatusType("");
        setStatusMessage("");
      }, 800);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error?.message || "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      setStatusType("alert");
      setStatusMessage("Incomplete verification code.");
      return;
    }

    setOtpError("");

    try {
      setIsSubmitting(true);
      setStatusType("info");
      setStatusMessage("Verifying your code...");

      // Simulate API verification — replace with actual API later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatusType("success");
      setStatusMessage("Email verified successfully!");

      setTimeout(() => {
        setStep(3);
        setStatusType("");
        setStatusMessage("");
      }, 800);
    } catch (error) {
      setOtpError("Invalid verification code. Please try again.");
      setStatusType("error");
      setStatusMessage(
        error?.message || "Verification failed. Please check your code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Step 2: Resend OTP ── */
  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setStatusType("info");
      setStatusMessage("Resending verification code...");

      // Simulate API — replace with actual API later
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setResendTimer(60);
      setCanResend(false);

      setStatusType("success");
      setStatusMessage("A new verification code has been sent to your email.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Failed to resend code. Please try again.");
    }
  };

  /* ── Step 3: Reset Password ── */
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!newPassword.trim()) {
      setPasswordError("New password is required.");
      valid = false;
    } else if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else if (passwordStrength.level < 3) {
      setPasswordError("Password is too weak. Add uppercase, numbers, or symbols.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your new password.");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!valid) {
      setStatusType("alert");
      setStatusMessage("Please fix the errors below to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusType("info");
      setStatusMessage("Resetting your password...");

      // Simulate API — replace with actual API later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatusType("success");
      setStatusMessage(
        "Password reset successfully! You can now sign in with your new password.",
      );
      setStep(4); // Success step
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error?.message || "Failed to reset password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-crm-off-white flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingBackground />

      {/* Main Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 min-h-[600px]">
        {/* ── Left Panel ── */}
        <div className="hidden lg:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
          <div>
            <div className="mb-10">
              <img src={GraphuraLogo} alt="Graphura Logo" className="h-20" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500 text-[11px] font-bold tracking-widest mb-6">
              <KeyRound size={11} />
              PASSWORD RECOVERY
            </div>
            <h2
              className="text-3xl font-extrabold text-[#2a465a] leading-tight mb-4"
              style={{ fontFamily: "'Gugi', cursive" }}
            >
              Secure Recovery. <br />
              Quick Access. <br />
              Stay Protected.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Reset your password securely with email verification. We'll send a
              one-time code to your registered email to verify your identity
              before allowing a password change.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { icon: Mail, text: "Email-based verification" },
                { icon: ShieldCheck, text: "Secure password reset" },
                { icon: Lock, text: "Encrypted end-to-end" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-[#2a465a] text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2a465a]/10 flex items-center justify-center">
                    <Icon size={14} className="text-[#2a465a]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-auto pt-8">
            <button className="text-[11px] font-bold px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100">
              Terms of Service
            </button>
            <button className="text-[11px] font-bold px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100">
              Privacy Policy
            </button>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full -mt-6">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 mx-auto">
              <img
                src={GraphuraLogo}
                alt="Graphura Logo"
                className="w-40 h-15 mx-auto"
              />
            </div>

            {step < 4 && (
              <h1
                className="text-3xl font-black text-crm-navy mb-4 text-center tracking-tight"
                style={{ fontFamily: "'Gugi', cursive" }}
              >
                {step === 1 && "Forgot Password? 🔑"}
                {step === 2 && "Verify Your Email 📧"}
                {step === 3 && "Create New Password 🔒"}
              </h1>
            )}

            {step < 4 && (
              <p className="text-slate-400 text-sm text-center mb-5">
                {step === 1 &&
                  "Enter your email and we'll send you a verification code."}
                {step === 2 &&
                  `Enter the 6-digit code sent to ${email}`}
                {step === 3 && "Choose a strong password for your account."}
              </p>
            )}

            {/* Step Indicator */}
            {step < 4 && <StepIndicator currentStep={step} />}

            {/* Status Banner */}
            <StatusBanner type={statusType} message={statusMessage} />
            {statusType && <div className="h-4" />}

            {/* ═══════════════ STEP 1: Email ═══════════════ */}
            {step === 1 && (
              <form className="space-y-5" onSubmit={handleEmailSubmit}>
                <div>
                  <DataField
                    label="Registered Email"
                    id="forgot_email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    icon={Mail}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                  />
                  {emailError && (
                    <p className="text-xs text-rose-600 mt-1 px-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <Button
                  text={isSubmitting ? "Sending code..." : "Send Verification Code →"}
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                />

                <p className="text-center text-slate-500 text-sm mt-4">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-crm-navy font-bold hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </form>
            )}

            {/* ═══════════════ STEP 2: OTP ═══════════════ */}
            {step === 2 && (
              <form className="space-y-5" onSubmit={handleOtpSubmit}>
                {/* OTP notification card */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Check your inbox
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        We've sent a 6-digit verification code to{" "}
                        <span className="font-bold">{email}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* OTP Input */}
                <OTPInput otp={otp} setOtp={setOtp} otpError={otpError} />

                {/* Resend Timer */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-crm-navy font-bold hover:underline flex items-center gap-1.5 transition"
                    >
                      <RefreshCw size={13} />
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Timer size={13} />
                      Resend code in{" "}
                      <span className="text-[#2a465a] font-bold">
                        {resendTimer}s
                      </span>
                    </span>
                  )}
                </div>

                <Button
                  text={isSubmitting ? "Verifying..." : "Verify Email →"}
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", "", "", ""]);
                    setOtpError("");
                    setStatusType("");
                    setStatusMessage("");
                  }}
                  className="w-full text-center text-slate-500 text-sm hover:text-crm-navy transition flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  Change email address
                </button>
              </form>
            )}

            {/* ═══════════════ STEP 3: New Password ═══════════════ */}
            {step === 3 && (
              <form className="space-y-5" onSubmit={handlePasswordReset}>
                {/* New Password */}
                <div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="new_password"
                      className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
                    >
                      New Password
                    </label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition duration-200">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        id="new_password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-crm-navy transition"
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-rose-600 mt-1 px-1">
                      {passwordError}
                    </p>
                  )}

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level
                              ? passwordStrength.color
                              : "bg-slate-200"
                              }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-semibold ${passwordStrength.level <= 2
                          ? "text-rose-600"
                          : passwordStrength.level <= 3
                            ? "text-yellow-600"
                            : passwordStrength.level <= 4
                              ? "text-blue-600"
                              : "text-emerald-600"
                          }`}
                      >
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirm_password"
                      className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
                    >
                      Confirm Password
                    </label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition duration-200">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <ShieldCheck size={18} />
                      </div>
                      <input
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (confirmPasswordError) setConfirmPasswordError("");
                        }}
                        className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-crm-navy transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs text-rose-600 mt-1 px-1">
                      {confirmPasswordError}
                    </p>
                  )}
                  {/* Match indicator */}
                  {confirmPassword && !confirmPasswordError && newPassword === confirmPassword && (
                    <p className="text-xs text-emerald-600 mt-1 px-1 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Password requirements */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Password Requirements
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { text: "8+ characters", met: newPassword.length >= 8 },
                      { text: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
                      { text: "Lowercase letter", met: /[a-z]/.test(newPassword) },
                      { text: "Number", met: /\d/.test(newPassword) },
                      { text: "Special character", met: /[^A-Za-z0-9]/.test(newPassword) },
                    ].map(({ text, met }) => (
                      <div
                        key={text}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${met ? "text-emerald-600" : "text-slate-400"
                          }`}
                      >
                        <CheckCircle2 size={12} className={met ? "opacity-100" : "opacity-30"} />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  text={
                    isSubmitting ? "Resetting password..." : "Reset Password →"
                  }
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                />
              </form>
            )}

            {/* ═══════════════ STEP 4: Success ═══════════════ */}
            {step === 4 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto animate-[pulse_2s_ease-in-out_infinite]">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-black text-crm-navy tracking-tight mb-2"
                    style={{ fontFamily: "'Gugi', cursive" }}
                  >
                    Password Reset! 🎉
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Your password has been updated successfully. You can now sign
                    in with your new password.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20 hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease-out active:scale-95"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
