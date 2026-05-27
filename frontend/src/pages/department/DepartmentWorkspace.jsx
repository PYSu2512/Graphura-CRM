import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  CreditCard,
  Hash,
  Building2,
  Users,
  Zap,
  BadgeCheck,
  Mail,
} from "lucide-react";
import GraphuraLogo from "../../assets/Logo/Graphura_Logo.webp";
import { DataField, Button } from "../../components/shared/Common_Components";
import { userService } from "../../services/userService";

// ─── Floating background ──────────────────────────────────────────────────────
const FloatingBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden opacity-5 pointer-events-none">
    <ShieldCheck
      className="w-20 h-20 text-slate-900 absolute top-10 left-10 animate-[spin_25s_linear_infinite]"
      strokeWidth={1}
    />
    <CreditCard
      className="w-24 h-24 text-slate-900 absolute top-20 right-20 animate-[pulse_4s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <Building2
      className="w-16 h-16 text-slate-900 absolute bottom-32 left-40 animate-[spin_22s_linear_infinite]"
      strokeWidth={1}
    />
    <Users
      className="w-20 h-20 text-slate-900 absolute -bottom-10 right-40 animate-[pulse_5s_ease-in-out_infinite]"
      strokeWidth={1}
    />
    <Zap
      className="w-28 h-28 text-slate-900 absolute top-[40%] left-[20%] animate-[spin_18s_linear_infinite]"
      strokeWidth={1}
    />
    <BadgeCheck
      className="w-16 h-16 text-slate-900 absolute bottom-20 right-28 animate-[pulse_3s_ease-in-out_infinite]"
      strokeWidth={1}
    />
  </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ["Password", "Bank Details", "Complete"];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {STEPS.map((label, i) => {
      const active = i === current;
      const done = i < current;
      return (
        <div key={label} className="flex items-center gap-2">
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
          {i < STEPS.length - 1 && (
            <div
              className={`h-[2px] w-10 rounded-full mb-4 transition-all duration-500 ${done ? "bg-emerald-400" : "bg-slate-200"}`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Password strength ────────────────────────────────────────────────────────
const strengthScore = (pw) =>
  (pw.length >= 8 ? 1 : 0) +
  (/[A-Z]/.test(pw) ? 1 : 0) +
  (/[0-9]/.test(pw) ? 1 : 0) +
  (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);

const strengthColor = (s) =>
  s === 1
    ? "bg-red-400"
    : s === 2
      ? "bg-yellow-400"
      : s === 3
        ? "bg-blue-400"
        : "bg-emerald-400";

// ─── Main component ───────────────────────────────────────────────────────────
export default function DepartmentWorkspace() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Step 0 — Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1 — Bank Details
  const [bankName, setBankName] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branch, setBranch] = useState("");
  const [upiId, setUpiId] = useState("");

  // Shared
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if already completed setup
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (user.isProfileComplete && !user.mustChangePassword) {
        // Find role-based route
        const role = user.role;
        let route = "/department";
        if (role === 'SALES_MANAGER') route = '/sales-manager';
        else if (role === 'SALES_TL') route = '/sales-team-leader';
        else if (role === 'SALES_EXECUTIVE') route = '/sales-executive';
        else if (role === 'FINANCE_MANAGER' || role === 'FINANCE_EXECUTIVE') route = '/finance';
        else if (role === 'MANAGEMENT_MANAGER') route = '/management-manager';
        else if (role === 'MANAGEMENT_TL') route = '/management-team-leader';
        else if (role === 'MANAGEMENT_EMPLOYEE') route = '/management-employee';
        
        navigate(route);
      }
    } catch (err) {
      console.error("Session parse error:", err);
    }
  }, [navigate]);

  useEffect(() => {
    if (!status.type) return;
    const t = setTimeout(() => setStatus({ type: "", message: "" }), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const statusCls =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status.type === "info"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : status.type === "alert"
          ? "border-yellow-200 bg-yellow-50 text-yellow-800"
          : "border-red-200 bg-red-50 text-red-800";

  const validatePassword = () => {
    const e = {};
    if (!password.trim()) e.password = "Password is required.";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (!confirmPassword.trim())
      e.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateBank = () => {
    const e = {};
    if (!beneficiaryName.trim())
      e.beneficiaryName = "Beneficiary name is required.";
    if (!bankName.trim()) e.bankName = "Bank name is required.";
    if (!/^\d{9,18}$/.test(accountNumber.trim()))
      e.accountNumber = "Enter a valid account number (9–18 digits).";
    if (accountNumber !== confirmAccountNumber)
      e.confirmAccountNumber = "Account numbers do not match.";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.trim().toUpperCase()))
      e.ifscCode = "Enter a valid IFSC code (e.g. SBIN0001234).";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const nextStep = async () => {
    if (step === 0) {
      if (!validatePassword()) {
        setStatus({ type: "alert", message: "Please fix the errors before continuing." });
        return;
      }
      try {
        setIsSubmitting(true);
        setStatus({ type: "info", message: "Updating password..." });
        await userService.setupAccount({ newPassword: password, confirmPassword });
        setStatus({ type: "success", message: "Password updated! Now provide your bank details." });
        setErrors({});
        setStep(1);
      } catch (err) {
        setStatus({ type: "error", message: err?.response?.data?.message || "Failed to update password." });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 1) {
      if (!validateBank()) {
        setStatus({ type: "alert", message: "Please fix the errors before continuing." });
        return;
      }
      setErrors({});
      setStatus({ type: "", message: "" });
      setStep(2);
      return;
    }

    setErrors({});
    setStatus({ type: "", message: "" });
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      nextStep();
      return;
    }
    try {
      setIsSubmitting(true);
      setStatus({ type: "info", message: "Saving your details…" });

      // 1. Update Password (redundant if already done in nextStep, but kept for safety)
      await userService.setupAccount({
        newPassword: password,
        confirmPassword,
      });

      // 2. Save Bank Details
      const response = await userService.saveBankDetails({
        beneficiaryName,
        bankName,
        accountNumber,
        ifscCode,
        branch,
        upiId,
      });

      // Update session storage with completed profile status
      if (response && response.data && response.data.user) {
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
      }

      setStatus({
        type: "success",
        message: "Setup complete! Redirecting to your dashboard…",
      });

      // Navigate to the next route based on role
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      const role = user.role;
      let dashboardRoute = "/department";
      
      if (role === 'SALES_MANAGER') dashboardRoute = '/sales-manager';
      else if (role === 'SALES_TL') dashboardRoute = '/sales-team-leader';
      else if (role === 'SALES_EXECUTIVE') dashboardRoute = '/sales-executive';
      else if (role === 'FINANCE_MANAGER' || role === 'FINANCE_EXECUTIVE') dashboardRoute = '/finance';
      else if (role === 'MANAGEMENT_MANAGER') dashboardRoute = '/management-manager';
      else if (role === 'MANAGEMENT_TL') dashboardRoute = '/management-team-leader';
      else if (role === 'MANAGEMENT_EMPLOYEE') dashboardRoute = '/management-employee';

      setTimeout(() => navigate(dashboardRoute), 1200);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = strengthScore(password);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingBackground />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden z-10 min-h-[600px]">
        {/* ── Left Panel ── */}
        <div className="hidden lg:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
          <div>
            <div className="mb-10">
              <img src={GraphuraLogo} alt="Graphura" className="h-20" />
            </div>
            <h2
              className="text-3xl font-extrabold text-[#2a465a] leading-tight mb-4"
              style={{ fontFamily: "'Gugi', cursive" }}
            >
              Complete Your Account Setup.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Secure your account and add your bank details to get started with
              the Graphura CRM platform.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: ShieldCheck, text: "Secure password protection" },
                { icon: CreditCard, text: "Bank details for payroll" },
                { icon: BadgeCheck, text: "One-time setup, always accessible" },
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

        {/* ── Right Panel ── */}
        <div className="w-full lg:w-7/12 p-8 md:p-14 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="lg:hidden mb-8">
              <img src={GraphuraLogo} alt="Graphura" className="h-14 mx-auto" />
            </div>

            <h1
              className="text-3xl font-black text-[#2a465a] mb-2 text-center tracking-tight"
              style={{ fontFamily: "'Gugi', cursive" }}
            >
              Account Setup
            </h1>
            <p className="text-center text-slate-400 text-sm mb-6">
              Complete {STEPS.length - 1} steps to finish your onboarding
            </p>

            <StepIndicator current={step} />

            {status.message && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm mb-5 border ${statusCls}`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ════ STEP 0 — Password ════ */}
              {step === 0 && (
                <>
                  {/* Disabled email — pre-filled from session, read-only */}
                  <DataField
                    label="Your Email"
                    id="dw-email"
                    type="email"
                    icon={Mail}
                    value={(() => {
                      try {
                        return (
                          JSON.parse(sessionStorage.getItem("user") || "{}")
                            ?.email || ""
                        );
                      } catch {
                        return "";
                      }
                    })()}
                    readOnly
                    disabled
                    size={12}
                  />
                  {/* Password with show/hide toggle */}
                  <div className="space-y-1">
                    <div className="relative">
                      <DataField
                        label="New Password"
                        id="dw-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        icon={ShieldCheck}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((er) => ({ ...er, password: "" }));
                        }}
                        size={12}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 bottom-3.5 text-slate-400 hover:text-[#2a465a] transition z-10"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password && (
                      <div className="flex gap-1 mt-1.5 px-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-all ${n <= strength ? strengthColor(strength) : "bg-slate-200"}`}
                          />
                        ))}
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <DataField
                        label="Confirm Password"
                        id="dw-confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        icon={ShieldCheck}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((er) => ({ ...er, confirmPassword: "" }));
                        }}
                        size={12}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 bottom-3.5 text-slate-400 hover:text-[#2a465a] transition z-10"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ════ STEP 1 — Bank Details ════ */}
              {step === 1 && (
                <>
                  <div className="space-y-1">
                    <DataField
                      label="Beneficiary Name"
                      id="dw-beneficiary-name"
                      placeholder="e.g. John Doe"
                      icon={Users}
                      value={beneficiaryName}
                      onChange={(e) => {
                        setBeneficiaryName(e.target.value);
                        setErrors((er) => ({ ...er, beneficiaryName: "" }));
                      }}
                      size={12}
                    />
                    {errors.beneficiaryName && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.beneficiaryName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <DataField
                      label="Bank Name"
                      id="dw-bank-name"
                      placeholder="e.g. State Bank of India"
                      icon={Building2}
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        setErrors((er) => ({ ...er, bankName: "" }));
                      }}
                      size={12}
                    />
                    {errors.bankName && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.bankName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <DataField
                      label="Account Number"
                      id="dw-account"
                      placeholder="Enter your account number"
                      icon={CreditCard}
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value.replace(/\D/g, ""));
                        setErrors((er) => ({ ...er, accountNumber: "" }));
                      }}
                      size={12}
                    />
                    {errors.accountNumber && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.accountNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <DataField
                      label="Confirm Account Number"
                      id="dw-confirm-account"
                      placeholder="Re-enter account number"
                      icon={CreditCard}
                      value={confirmAccountNumber}
                      onChange={(e) => {
                        setConfirmAccountNumber(
                          e.target.value.replace(/\D/g, ""),
                        );
                        setErrors((er) => ({
                          ...er,
                          confirmAccountNumber: "",
                        }));
                      }}
                      size={12}
                    />
                    {errors.confirmAccountNumber && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.confirmAccountNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <DataField
                      label="IFSC Code"
                      id="dw-ifsc"
                      placeholder="e.g. SBIN0001234"
                      icon={Hash}
                      value={ifscCode}
                      onChange={(e) => {
                        setIfscCode(e.target.value.toUpperCase());
                        setErrors((er) => ({ ...er, ifscCode: "" }));
                      }}
                      size={12}
                    />
                    {errors.ifscCode && (
                      <p className="text-xs text-rose-600 px-1">
                        {errors.ifscCode}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <DataField
                      label="Branch Name (Optional)"
                      id="dw-branch"
                      placeholder="e.g. Mumbai Main Branch"
                      icon={Building2}
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      size={12}
                    />
                  </div>

                  <div className="space-y-1">
                    <DataField
                      label="UPI ID (Optional)"
                      id="dw-upi"
                      placeholder="e.g. john@upi"
                      icon={Zap}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      size={12}
                    />
                  </div>
                </>
              )}

              {/* ════ STEP 2 — Complete ════ */}
              {step === 2 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <BadgeCheck size={28} className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold text-emerald-800">All set!</p>
                  <p className="text-sm text-emerald-700">
                    Your password and bank details have been saved. Click{" "}
                    <strong>Finish</strong> to go to your dashboard.
                  </p>
                  <div className="pt-2 text-left rounded-2xl border border-slate-100 bg-white p-4 space-y-2 text-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Summary
                    </p>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Password</span>
                      <span className="font-semibold text-emerald-600">
                        ✓ Set
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary Name</span>
                      <span className="font-semibold text-[#2a465a]">
                        {beneficiaryName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name</span>
                      <span className="font-semibold text-[#2a465a]">
                        {bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number</span>
                      <span className="font-semibold text-[#2a465a]">
                        {"•".repeat(Math.max(0, accountNumber.length - 4)) +
                          accountNumber.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code</span>
                      <span className="font-semibold text-[#2a465a]">
                        {ifscCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div
                className={`flex gap-3 pt-2 ${step < 2 ? "justify-between" : "justify-end"}`}
              >
                {/* Step 0: Back to Login link | Step 1: Back to previous step */}
                {step === 0 && (
                  <Button
                    text="← Back to Login"
                    variant="secondary"
                    size={5}
                    type="button"
                    onClick={() => navigate("/login")}
                  />
                )}
                {step > 0 && step < 2 && (
                  <Button
                    text="← Back"
                    variant="secondary"
                    size={4}
                    type="button"
                    onClick={prevStep}
                  />
                )}
                {step < 2 ? (
                  <Button
                    text="Continue →"
                    variant="primary"
                    size={step === 0 ? 7 : 8}
                    type="button"
                    onClick={nextStep}
                  />
                ) : (
                  <Button
                    text={
                      isSubmitting ? "Saving…" : "Finish & Go to Dashboard →"
                    }
                    variant="primary"
                    size={12}
                    type="submit"
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
