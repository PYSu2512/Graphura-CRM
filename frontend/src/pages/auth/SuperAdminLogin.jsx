import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Globe,
  Server,
  Database,
  Lock,
  BarChart3,
  Users,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import GraphuraLogo from "../../assets/Logo/Graphura_Logo.webp";
import { loginSuperAdmin } from "../../services/authService";

const FloatingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden opacity-5 pointer-events-none">
    <Shield
      className="w-20 h-20 text-slate-900 absolute top-10 left-10 animate-[spin_25s_linear_infinite]"
      strokeWidth={1}
    />
    <Globe
      className="w-24 h-24 text-slate-900 absolute top-20 right-20 animate-[pulse_4s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <Server
      className="w-16 h-16 text-slate-900 absolute bottom-32 left-40 animate-[spin_22s_linear_infinite]"
      strokeWidth={1}
    />
    <Database
      className="w-20 h-20 text-slate-900 absolute -bottom-10 right-40 animate-[pulse_5s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <Lock
      className="w-28 h-28 text-slate-900 absolute top-[40%] left-[20%] animate-[spin_18s_linear_infinite]"
      strokeWidth={1}
    />
    <BarChart3
      className="w-18 h-18 text-slate-900 absolute top-28 left-[45%] animate-[spin_30s_linear_infinite]"
      strokeWidth={1}
    />
    <Users
      className="w-16 h-16 text-slate-900 absolute bottom-20 right-28 animate-[pulse_3s_ease-in-out_infinite]"
      strokeWidth={1}
    />
  </div>
);

function generateCaptcha() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [statusType, setStatusType] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  const validateEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

  useEffect(() => {
    if (!statusType) return;
    const timeout = setTimeout(() => {
      setStatusType("");
      setStatusMessage("");
    }, 4000);
    return () => clearTimeout(timeout);
  }, [statusType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else setEmailError("");

    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else setPasswordError("");

    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code.");
      valid = false;
    } else if (captchaInput !== captchaCode) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      setCaptchaCode(generateCaptcha());
      setCaptchaInput("");
      valid = false;
    } else setCaptchaError("");

    if (!valid) {
      setStatusType(
        email.trim() === "" ||
          password.trim() === "" ||
          captchaInput.trim() === ""
          ? "alert"
          : "error",
      );
      setStatusMessage(
        email.trim() === "" ||
          password.trim() === "" ||
          captchaInput.trim() === ""
          ? "Please fill in all fields before signing in."
          : "There are issues with your information. Please correct them and try again.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusType("info");
      setStatusMessage("Signing you in securely...");

      await loginSuperAdmin({ email, password });

      setStatusType("success");
      setStatusMessage("Sign in successful. Redirecting...");
      setTimeout(() => navigate("/super-admin"), 900);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error?.message || "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-crm-off-white flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingBackground />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 min-h-[600px]">
        {/* Left Panel */}
        <div className="hidden lg:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
          <div>
            <div className="mb-10">
              <img src={GraphuraLogo} alt="Graphura Logo" className="h-20" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500 text-[11px] font-bold tracking-widest mb-6">
              <Shield size={11} />
              SUPER ADMIN PORTAL
            </div>
            <h2 className="text-3xl font-extrabold text-[#2a465a] leading-tight mb-4" style={{ fontFamily: "'Gugi', cursive" }}>
              Platform Control. <br /> Global Oversight. <br />Full Authority.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Manage all companies, admins, and platform-wide settings from one
              centralized control panel. Access is restricted and fully audited.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Shield,   text: "Full platform authority" },
                { icon: Database, text: "Global data oversight" },
                { icon: Lock,     text: "Restricted & fully audited access" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-[#2a465a] text-sm">
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

        {/* Right Panel */}
        <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="lg:hidden mb-8 mx-auto">
              <img
                src={GraphuraLogo}
                alt="Graphura Logo"
                className="w-40 h-15 mx-auto"
              />
            </div>
            <h1 className="text-3xl font-black text-crm-navy mb-8 text-center tracking-tight" style={{ fontFamily: "'Gugi', cursive" }}>
              Super Admin Access 🛡️
            </h1>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {statusType ? (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    statusType === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : statusType === "alert"
                        ? "border border-yellow-200 bg-yellow-50 text-yellow-800"
                        : statusType === "info"
                          ? "border border-blue-200 bg-blue-50 text-blue-800"
                          : "border border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {statusMessage}
                </div>
              ) : null}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="sa_email"
                  className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]"
                >
                  Super Admin Email
                </label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-crm-blue/20 mt-1 transition">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    id="sa_email"
                    placeholder="superadmin@graphura.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-4 text-crm-navy placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                {emailError ? (
                  <p className="text-xs text-rose-600">{emailError}</p>
                ) : null}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="sa_password"
                  className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]"
                >
                  Master Password
                </label>
                <div className="relative mt-1 rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-crm-blue/20 transition">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="sa_password"
                    placeholder="Enter master password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className="w-full rounded-2xl bg-transparent py-4 pl-12 pr-14 text-crm-navy placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-crm-navy transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError ? (
                  <p className="text-xs text-rose-600">{passwordError}</p>
                ) : null}
              </div>

              {/* CAPTCHA */}
              <div className="space-y-3">
                <label
                  htmlFor="sa_captcha"
                  className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]"
                >
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
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-crm-blue/20 transition">
                  <input
                    type="text"
                    id="sa_captcha"
                    placeholder="Enter the 4-digit number above"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                      if (captchaError) setCaptchaError("");
                    }}
                    maxLength="4"
                    className="w-full rounded-2xl bg-transparent py-4 px-4 text-crm-navy placeholder:text-slate-400 focus:outline-none text-center tracking-[0.25em] text-md font-semibold"
                  />
                </div>
                {captchaError ? (
                  <p className="text-xs text-rose-600">{captchaError}</p>
                ) : null}
              </div>

              {/* Forgot */}
              <div className="flex justify-end text-xs font-bold pt-2">
                <a href="#" className="text-crm-navy hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-4 bg-[#2a465a] text-white font-bold rounded-2xl shadow-xl shadow-crm-navy/20 transition duration-300 ease-out transform hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              >
                {isSubmitting ? "Signing in..." : "Sign in →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
