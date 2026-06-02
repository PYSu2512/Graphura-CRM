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
  Users,
  TrendingUp,
} from "lucide-react";
import GraphuraLogo from "../../assets/Logo/Graphura_Logo.webp";
import { loginAdmin } from "../../services/authService";
import { DataField, Button } from "../../components/shared/Common_Components";

const FloatingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Grid Background */}
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
    {/* Floating Icons */}
    <div className="absolute inset-0 opacity-50">
      <Layers3
        className="w-20 h-20 text-slate-900 absolute top-10 left-10 animate-[spin_25s_linear_infinite]"
        strokeWidth={1}
      />
      <Activity
        className="w-24 h-24 text-slate-900 absolute top-20 right-20 animate-[pulse_4s_ease-in-out_infinite]"
        strokeWidth={1}
      />
      <User
        className="w-16 h-16 text-slate-900 absolute bottom-20 left-20 animate-[spin_22s_linear_infinite]"
        strokeWidth={1}
      />
      <Mail
        className="w-28 h-28 text-slate-900 absolute top-[40%] left-[20%] animate-[spin_18s_linear_infinite]"
        strokeWidth={1}
      />
      <ShieldCheck
        className="w-24 h-24 text-slate-900 absolute top-[45%] left-[5%] animate-[spin_30s_linear_infinite]"
        strokeWidth={1}
      />
      <Zap
        className="w-24 h-24 text-slate-900 absolute bottom-20 right-20 animate-[pulse_3s_ease-in-out_infinite]"
        strokeWidth={1}
      />
      <CalendarDays
        className="w-24 h-24 text-slate-900 absolute top-[45%] right-10 animate-[spin_28s_linear_infinite]"
        strokeWidth={1}
      />
    </div>
  </div>
);

const AdminLogin = () => {
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
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function generateCaptcha() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  const validateEmail = (value) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(value);
  };

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
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code.");
      valid = false;
    } else if (captchaInput !== captchaCode) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      setCaptchaCode(generateCaptcha());
      setCaptchaInput("");
      valid = false;
    } else {
      setCaptchaError("");
    }

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

    const getCurrentLocation = () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }

        let isSettled = false;
        const finish = (fn, payload) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(fallbackTimer);
          fn(payload);
        };

        const fallbackTimer = setTimeout(() => {
          finish(
            reject,
            new Error("Location request timed out. Please try again."),
          );
        }, 12000);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            finish(resolve, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            finish(
              reject,
              new Error("Location access is required to sign in."),
            );
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
        );
      });

    try {
      setIsSubmitting(true);
      setStatusType("info");
      setStatusMessage("Checking location permission...");

      const location = await getCurrentLocation();

      setStatusType("info");
      setStatusMessage("Signing you in securely...");

      await loginAdmin({
        email,
        password,
        latitude: location.latitude,
        longitude: location.longitude,
        rememberMe,
      });

      setStatusType("success");
      setStatusMessage("Sign in successful. Redirecting...");

      setTimeout(() => {
        navigate("/admin");
      }, 900);
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

      {/* Main Login Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 min-h-[600px]">
        {/* Left Panel */}
        <div className="hidden lg:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
          <div>
            <div className="mb-10">
              <img src={GraphuraLogo} alt="Graphura Logo" className="h-20" />
            </div>
            <h2
              className="text-3xl font-extrabold text-[#2a465a] leading-tight mb-4"
              style={{ fontFamily: "'Gugi', cursive" }}
            >
              Manage Customers. <br />
              Empower Teams. <br />
              Grow Faster.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Empower your business with one smart platform to manage leads,
              teams, tasks, and customer relationships effortlessly.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Users, text: "Manage leads & teams" },
                { icon: TrendingUp, text: "Track performance & growth" },
                { icon: ShieldCheck, text: "Enterprise-grade security" },
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
            <h1
              className="text-3xl font-black text-crm-navy mb-8 text-center tracking-tight"
              style={{ fontFamily: "'Gugi', cursive" }}
            >
              Admin Control Center 🏢
            </h1>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Status Banner */}
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
              <div>
                <DataField
                  label="Work Email"
                  id="email_login"
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

              {/* Password */}
              <div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password_login"
                    className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
                  >
                    Password
                  </label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition duration-200">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <ShieldCheck size={18} />
                    </div>
                    <input
                      id="password_login"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-crm-navy transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-600 mt-1 px-1">
                    {passwordError}
                  </p>
                )}
              </div>

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
                <div>
                  <DataField
                    id="captcha_login"
                    placeholder="Enter the 4-digit number above"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                      if (captchaError) setCaptchaError("");
                    }}
                    className="text-center tracking-[0.25em] font-semibold"
                  />
                  {captchaError && (
                    <p className="text-xs text-rose-600 mt-1 px-1">
                      {captchaError}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the 4-digit number shown above
                  </p>
                </div>
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between text-xs font-bold pt-2">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 accent-crm-navy"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-crm-navy hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                text={isSubmitting ? "Signing in..." : "Sign in →"}
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              />
            </form>

            <p className="mt-8 text-center text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/admin-register"
                className="text-crm-navy font-bold hover:underline"
              >
                Register your company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
