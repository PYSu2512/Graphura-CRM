import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  Users,
  Bell,
  TrendingUp,
  FileText,
  Briefcase,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Hash,
} from "lucide-react";
import GraphuraLogo from "../../assets/Logo/Graphura_Logo.webp";
import {
  DataField,
  Button,
} from "../../components/shared/Common_Components";
import { loginDepartment } from "../../services/authService";

// ── Floating background icons ─────────────────────────────────────────────────
const FloatingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden opacity-5 pointer-events-none">
    <Building2   className="w-20 h-20 text-slate-900 absolute top-10 left-10 animate-[spin_25s_linear_infinite]"   strokeWidth={1} />
    <ClipboardList className="w-24 h-24 text-slate-900 absolute top-20 right-20 animate-[pulse_4s_ease-in-out_infinite]" strokeWidth={1} />
    <Users       className="w-16 h-16 text-slate-900 absolute bottom-32 left-40 animate-[spin_22s_linear_infinite]"  strokeWidth={1} />
    <Bell        className="w-20 h-20 text-slate-900 absolute -bottom-10 right-40 animate-[pulse_5s_ease-in-out_infinite]" strokeWidth={1} />
    <TrendingUp  className="w-28 h-28 text-slate-900 absolute top-[40%] left-[20%] animate-[spin_18s_linear_infinite]" strokeWidth={1} />
    <FileText    className="w-18 h-18 text-slate-900 absolute top-28 left-[45%] animate-[spin_30s_linear_infinite]"  strokeWidth={1} />
    <Briefcase   className="w-16 h-16 text-slate-900 absolute bottom-20 right-28 animate-[pulse_3s_ease-in-out_infinite]" strokeWidth={1} />
  </div>
);

function generateCaptcha() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const DepartmentLogin = () => {
  const navigate = useNavigate();

  const [showPassword,  setShowPassword]  = useState(false);
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [emailError,    setEmailError]    = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [statusType,    setStatusType]    = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [captchaCode,   setCaptchaCode]   = useState(generateCaptcha());
  const [captchaInput,  setCaptchaInput]  = useState("");
  const [captchaError,  setCaptchaError]  = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [rememberMe,    setRememberMe]    = useState(false);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  const getCurrentLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    let settled = false;
    const finish = (fn, payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(payload);
    };

    const timer = setTimeout(() => {
      finish(reject, new Error("Location request timed out. Please try again."));
    }, 12000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        finish(resolve, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        finish(reject, new Error("Location access is required to sign in."));
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
  // Auto-clear status banner after 4 s
  useEffect(() => {
    if (!statusType) return;
    const t = setTimeout(() => { setStatusType(""); setStatusMessage(""); }, 4000);
    return () => clearTimeout(t);
  }, [statusType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required."); valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email address."); valid = false;
    } else setEmailError("");

    if (!password.trim()) {
      setPasswordError("Password is required."); valid = false;
    } else setPasswordError("");

    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code."); valid = false;
    } else if (captchaInput !== captchaCode) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      setCaptchaCode(generateCaptcha());
      setCaptchaInput("");
      valid = false;
    } else setCaptchaError("");

    if (!valid) {
      setStatusType("alert");
      setStatusMessage("Please fill in all fields correctly before signing in.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusType("info");
      setStatusMessage("Checking your location permission...");

      const location = await getCurrentLocation();

      setStatusType("info");
      setStatusMessage("Verifying your credentials...");

      const response = await loginDepartment({
        email,
        password,
        latitude: location.latitude,
        longitude: location.longitude,
        rememberMe,
      });

      setStatusType("success");
      setStatusMessage("Sign in successful. Loading your workspace...");
      setTimeout(() => navigate(response?.nextRoute || "/department"), 900);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-crm-off-white flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingBackground />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 min-h-[600px]">

        {/* ── Left Panel ── */}
        <div className="hidden lg:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
          <div>
            <div className="mb-10">
              <img src={GraphuraLogo} alt="Graphura Logo" className="h-20" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500 text-[11px] font-bold tracking-widest mb-6">
              <Building2 size={11} />
              DEPARTMENT PORTAL
            </div>
            <h2 className="text-3xl font-extrabold text-[#2a465a] leading-tight mb-4" style={{ fontFamily: "'Gugi', cursive" }}>
              Your Team. <br /> Your Tasks. <br />Your Workspace.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Sign in with your company-issued credentials to access your
              department's tools, tasks, reports, and team collaboration features.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Users,      text: "Collaborate with your team" },
                { icon: TrendingUp, text: "Track tasks & performance" },
                { icon: ShieldCheck,text: "Secure department access" },
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

        {/* ── Right Panel ── */}
        <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">

            {/* Mobile logo */}
            <div className="lg:hidden mb-8 mx-auto">
              <img src={GraphuraLogo} alt="Graphura Logo" className="w-40 mx-auto" />
            </div>

            <h1 className="text-3xl font-black text-crm-navy mb-8 text-center tracking-tight" style={{ fontFamily: "'Gugi', cursive" }}>
              Department Sign In 🏬
            </h1>

            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Status banner */}
              {statusType && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${
                  statusType === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : statusType === "alert"  ? "border border-yellow-200 bg-yellow-50 text-yellow-800"
                  : statusType === "info"   ? "border border-blue-200 bg-blue-50 text-blue-800"
                  : "border border-red-200 bg-red-50 text-red-800"
                }`}>
                  {statusMessage}
                </div>
              )}

              {/* Work Email */}
              <div className="space-y-1">
                <DataField
                  id="dept_email"
                  label="Work Email"
                  type="email"
                  placeholder="you@company.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                  size={12}
                />
                {emailError && <p className="text-xs text-rose-600 px-1">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative">
                  <DataField
                    id="dept_password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    icon={ShieldCheck}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                    size={12}
                  />
                  {/* Show / hide toggle — sits at the bottom-right of the input */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 bottom-3.5 text-slate-400 hover:text-crm-navy transition z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-rose-600 px-1">{passwordError}</p>}
              </div>

              {/* CAPTCHA */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Security Verification
                </label>

                {/* CAPTCHA display + refresh */}
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* CAPTCHA input */}
                <div className="space-y-1">
                  <DataField
                    id="dept_captcha"
                    label="Enter Code"
                    type="text"
                    placeholder="Enter the 4-digit number above"
                    icon={Hash}
                    value={captchaInput}
                    onChange={(e) => { setCaptchaInput(e.target.value); if (captchaError) setCaptchaError(""); }}
                    size={12}
                  />
                  {captchaError && <p className="text-xs text-rose-600 px-1">{captchaError}</p>}
                  <p className="text-xs text-slate-400 px-1">Enter the 4-digit number shown above</p>
                </div>

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
                  <span className="text-slate-400">Location is required for sign in</span>
                </div>
              </div>


              {/* Submit */}
              <Button
                type="submit"
                text={isSubmitting ? "Verifying credentials..." : "Access Your Dashboard →"}
                variant="primary"
                size={12}
                disabled={isSubmitting}
              />
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLogin;
