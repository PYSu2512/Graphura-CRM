// ─────────────────────────────────────────────────────────────────────────────
// Profile.jsx  —  Reusable CRM Profile Page
//
// Usage:
//   <Profile photo="https://..." name="Riya Sharma" email="riya.sharma@crm.com" />
//
//   <Profile
//     photo="https://..."
//     name="Riya Sharma"
//     email="riya.sharma@crm.com"
//     phone="9876543210"
//     employeeId="EMP-1024"
//     role="Finance Executive"
//     department="Finance"
//     bankDetails={{
//       name: "Riya Sharma",
//       accountNumber: "50100123456789",
//       bankName: "Axis Bank",
//       ifscCode: "UTIB0001234",
//       branchName: "Juhu",
//       upiId: "riya@axis",
//     }}
//   />
//
//   <Profile
//     photo="https://..."
//     name="John Admin"
//     email="john@admin.crm"
//     employeeId="AD-1001"
//     role="Admin"
//     department="Administration"
//     companyInfo={{
//       companyName: "Graphura CRM",
//       ownerName: "John Doe",
//       companyEmail: "info@graphura.com",
//       industry: "SaaS",
//       foundedYear: "2020",
//     }}
//   />
//
// Notes:
//   - bankDetails is optional. If provided, the Bank Details section is shown.
//   - companyInfo is optional. If provided, the Company Details section is shown (typically for Admin).
//   - `name` maps to fullName and `photo` becomes the avatar image.
//   - Additional fields are optional and will use defaults when missing.
//
// Import path (adjust to your project structure):
//   import Profile from "../../pages/profile/Profile";
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Heading,
  Grid,
  Button,
  DataField,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  ToggleButton,
  P,
  openModal,
  closeModal,
} from "../../components/shared/Common_Components";

import { ProfileSection, SecurityRow } from "./ProfileLayout";
import { defaultProfile } from "./profileData";
import { changePassword, logout } from "../../services/authService";

import {
  Camera,
  Upload,
  Trash2,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Bell,
  LogOut,
  User,
  Phone,
  Mail,
  BadgeCheck,
  Briefcase,
  Building2,
  CreditCard,
  Landmark,
  Hash,
  GitBranch,
  Smartphone,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR  — shows photo if available, otherwise coloured initials
// ─────────────────────────────────────────────────────────────────────────────
function Avatar({ name, src, size = 96 }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-2xl object-cover border-4 border-white shadow-lg"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.33 }}
      className="rounded-2xl bg-[#2a465a] text-white font-black flex items-center justify-center border-4 border-white shadow-lg select-none"
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
const calculatePasswordStrength = (password) => {
  const hasLength = password.length >= 8 ? 1 : 0;
  const hasUpperCase = /[A-Z]/.test(password) ? 1 : 0;
  const hasNumbers = /[0-9]/.test(password) ? 1 : 0;
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password) ? 1 : 0;
  return hasLength + hasUpperCase + hasNumbers + hasSpecialChars;
};

const getStrengthColor = (strength) => {
  if (strength === 1) return "bg-red-400";
  if (strength === 2) return "bg-yellow-400";
  if (strength === 3) return "bg-blue-400";
  if (strength === 4) return "bg-emerald-400";
  return "bg-slate-200";
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const validatePhone = (v) =>
  /^\d{10}$/.test(v) ? "" : "Phone number must be exactly 10 digits";

const validatePasswords = ({ current, next, confirm }) => {
  const errs = {};
  if (!current.trim()) errs.current = "Current password is required";
  if (next.length < 8) errs.next = "New password must be at least 8 characters";
  if (confirm && next !== confirm) errs.confirm = "Passwords do not match";
  return errs;
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE ERROR HINT  — rendered beneath a field when there is an error
// ─────────────────────────────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-xs text-rose-600 font-bold mt-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg">
      {msg}
    </p>
  ) : null;

// ─────────────────────────────────────────────────────────────────────────────
// TOAST  — transient success / error banner at the top of the page
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, variant = "success", onDismiss }) {
  if (!message) return null;
  const colors =
    variant === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-rose-50 border-rose-200 text-rose-700";
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${colors}`}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="opacity-60 hover:opacity-100 transition text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE  — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function Profile({
  photo,
  name,
  email,
  phone,
  employeeId,
  clientId,
  role,
  department,
  isActive = true,
  bankDetails = null,
  companyInfo = null,
}) {
  const initialProfile = useMemo(
    () => ({
      ...defaultProfile,
      avatarUrl: photo !== undefined ? photo : defaultProfile.avatarUrl,
      fullName: name !== undefined ? name : defaultProfile.fullName,
      email: email !== undefined ? email : defaultProfile.email,
      phone: phone !== undefined ? phone : defaultProfile.phone,
      employeeId: employeeId !== undefined ? employeeId : null,
      clientId: clientId !== undefined ? clientId : null,
      role: role !== undefined ? role : null,
      department: department !== undefined ? department : null,
      isActive,
      bankDetails: {
        accountHolderName:
          bankDetails?.name ?? defaultProfile.bankDetails.accountHolderName,
        accountNumber:
          bankDetails?.accountNumber ??
          defaultProfile.bankDetails.accountNumber,
        bankName: bankDetails?.bankName ?? defaultProfile.bankDetails.bankName,
        ifscCode: bankDetails?.ifscCode ?? defaultProfile.bankDetails.ifscCode,
        branchName:
          bankDetails?.branchName ?? defaultProfile.bankDetails.branchName,
        upiId: bankDetails?.upiId ?? defaultProfile.bankDetails.upiId,
      },
    }),
    [
      photo,
      name,
      email,
      phone,
      employeeId,
      clientId,
      role,
      department,
      isActive,
      bankDetails,
    ],
  );

  const showBank = Boolean(bankDetails);
  const showCompany = Boolean(companyInfo);

  // ── Master data (reflects saved state) ────────────────────────────────────
  const [saved, setSaved] = useState(initialProfile);

  // ── Live form state (reflects current edits, may differ from saved) ────────
  const [form, setForm] = useState({ ...initialProfile });

  // ── Avatar preview (before save) ──────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatarUrl);
  const [pendingAvatar, setPendingAvatar] = useState(initialProfile.avatarUrl);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [photoSource, setPhotoSource] = useState(null); // "camera" | "upload" | null

  // ── Stream effect — ensures stream is connected to video element ─────────
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch((err) => console.error("Error playing video:", err));
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraActive]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  const isDirty = useMemo(() => {
    const profileFieldsChanged = JSON.stringify(form) !== JSON.stringify(saved);
    const avatarChanged = pendingAvatar !== saved.avatarUrl;
    return profileFieldsChanged || avatarChanged;
  }, [form, saved, pendingAvatar]);

  // ── Security toggles ──────────────────────────────────────────────────────
  const [twoFa, setTwoFa] = useState(defaultProfile.twoFactorEnabled);
  const [loginNotif, setLoginNotif] = useState(
    defaultProfile.loginNotifications,
  );

  // ── Change-password modal state ───────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Field-level validation errors ─────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: "", variant: "success" });
  const showToast = (msg, variant = "success") => {
    setToast({ msg, variant });
    setTimeout(() => setToast({ msg: "", variant: "success" }), 3500);
  };

  // ── Generic form field setter ──────────────────────────────────────────────
  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setBankField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [key]: value },
    }));

  // ── Save Changes ──────────────────────────────────────────────────────────
  const handleSave = () => {
    const errs = {};
    if (validatePhone(form.phone)) errs.phone = validatePhone(form.phone);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setSaved({ ...form, avatarUrl: pendingAvatar });
    setAvatarPreview(pendingAvatar);
    showToast("✅ Profile saved successfully!");
  };

  // ── Reset Changes ─────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm({ ...saved });
    setPendingAvatar(saved.avatarUrl);
    setAvatarPreview(saved.avatarUrl);
    setFieldErrors({});
    showToast("↩️ Changes reset to last saved state.", "info");
  };

  // ── Avatar handlers ───────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingAvatar(url);
    setPhotoSource("upload");
    setAvatarPreview(url);
    closeModal("photo-modal");
    showToast("📸 Profile photo updated!");
  };

  const handleStartCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      setCameraError(
        "Unable to access camera. Please check permissions or try uploading a photo instead.",
      );
      console.error("Camera error:", err);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const photoUrl = canvas.toDataURL("image/jpeg");
    setPendingAvatar(photoUrl);
    setPhotoSource("camera");
    handleStopCamera();
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleRemovePhoto = () => {
    setPendingAvatar(null);
    setAvatarPreview(null);
    setSaved({ ...saved, avatarUrl: null });
    setPhotoSource(null);
    closeModal("photo-modal");
    showToast("📷 Profile photo removed!");
  };

  const handleCancelPhoto = () => {
    handleStopCamera();
    setPendingAvatar(avatarPreview);
    setPhotoSource(null);
    closeModal("photo-modal");
  };

  const handleRetakePhoto = () => {
    setPendingAvatar(avatarPreview);
    setPhotoSource(null);
    handleStartCamera();
  };

  const handleSavePhoto = () => {
    handleStopCamera();
    setAvatarPreview(pendingAvatar);
    setPhotoSource(null);
    closeModal("photo-modal");
    showToast("📸 Profile photo updated!");
  };

  // ── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (isChangingPassword) return;

    const errs = validatePasswords(pwForm);
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    if (!pwForm.next || !pwForm.confirm) {
      setPwErrors({ confirm: "Both password fields are required" });
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
        confirmPassword: pwForm.confirm,
      });

      setPwSuccess(true);
      setTimeout(() => {
        setPwForm({ current: "", next: "", confirm: "" });
        setPwSuccess(false);
        closeModal("pw-modal");
        showToast("🔒 Password changed successfully! Please login again.");
        if (response?.data?.forceLogout || response?.forceLogout) {
          logout();
          window.location.href = "/login";
        }
      }, 1500);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to change password.";
      if (errorMsg.toLowerCase().includes("current password")) {
        setPwErrors((prev) => ({ ...prev, current: errorMsg }));
      } else if (
        errorMsg.toLowerCase().includes("new password") ||
        errorMsg.toLowerCase().includes("reuse")
      ) {
        setPwErrors((prev) => ({ ...prev, next: errorMsg }));
      } else {
        showToast(errorMsg, "error");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    closeModal("logout-modal");
    // In a real app: dispatch logout action / redirect
    showToast("👋 You have been logged out.", "info");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* ── Toast ── */}
      <Toast
        message={toast.msg}
        variant={toast.variant}
        onDismiss={() => setToast({ msg: "", variant: "success" })}
      />

      {/* ── Page Heading ── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="My Profile"
          secondaryText="Account Settings"
          size={12}
          fontSize="2xl"
        />
      </Grid>

      {/* ════════════════════════════════════════════════════════════════════
          1. PROFILE HEADER CARD
      ════════════════════════════════════════════════════════════════════ */}
      <ProfileSection
        title="Profile Overview"
        subtitle="Your identity and quick actions"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar name={saved.fullName} src={avatarPreview} size={96} />
            {/* Active dot */}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                saved.isActive ? "bg-emerald-400" : "bg-slate-300"
              }`}
            />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-[#2a465a] leading-tight">
              {saved.fullName}
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {saved.role}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {saved.email}
            </p>
            <span
              className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                saved.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {saved.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Header action buttons */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Grid cols={12} gap={3}>
              <Button
                text="Logout"
                variant="danger"
                size={12}
                onClick={() => openModal("logout-modal")}
              />
            </Grid>
          </div>
        </div>
      </ProfileSection>

      {/* ════════════════════════════════════════════════════════════════════
          2. PERSONAL INFORMATION
      ════════════════════════════════════════════════════════════════════ */}
      <ProfileSection
        title="Personal Information"
        subtitle="Update your name and contact details"
      >
        <Grid cols={12} gap={4}>
          {/* Full Name */}
          <DataField
            label="Full Name"
            id="fullName"
            placeholder="Enter your full name"
            size={6}
            icon={User}
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
          />

          {/* Phone */}
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
            <DataField
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="10-digit mobile number"
              size={12}
              icon={Phone}
              value={form.phone}
              onChange={(e) => {
                setField("phone", e.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  phone: validatePhone(e.target.value),
                }));
              }}
            />
            <FieldError msg={fieldErrors.phone} />
          </div>

          {/* Email — read-only */}
          <DataField
            label="Email Address"
            id="email"
            type="email"
            size={6}
            icon={Mail}
            value={form.email}
            readOnly
            disabled
          />

          {/* Role — read-only */}
          {form.role ? (
            <DataField
              label="Role"
              id="role"
              size={6}
              icon={Briefcase}
              value={form.role}
              readOnly
              disabled
            />
          ) : null}

          {/* Department — read-only */}
          {form.department ? (
            <DataField
              label="Department"
              id="dept"
              size={6}
              icon={Building2}
              value={form.department}
              readOnly
              disabled
            />
          ) : null}
        </Grid>
      </ProfileSection>

      {/* ════════════════════════════════════════════════════════════════════
          3. COMPANY DETAILS  (conditional on companyInfo prop)
      ════════════════════════════════════════════════════════════════════ */}
      {showCompany && (
        <ProfileSection
          title="Company Details"
          subtitle="Organization & corporate information"
        >
          <Grid cols={12} gap={4}>
            <DataField
              label="Company Name"
              id="companyName"
              size={6}
              icon={Building2}
              value={companyInfo?.companyName ?? ""}
              readOnly
              disabled
            />

            <DataField
              label="Company Email"
              id="companyEmail"
              type="email"
              size={6}
              icon={Mail}
              value={companyInfo?.companyEmail ?? ""}
              readOnly
              disabled
            />

            <DataField
              label="Owner Name"
              id="ownerName"
              size={6}
              icon={User}
              value={companyInfo?.ownerName ?? ""}
              readOnly
              disabled
            />

            <DataField
              label="Industry"
              id="industry"
              size={6}
              icon={Briefcase}
              value={companyInfo?.industry ?? ""}
              readOnly
              disabled
            />

            <DataField
              label="Founded Year"
              id="foundedYear"
              size={6}
              icon={BadgeCheck}
              value={companyInfo?.foundedYear ?? ""}
              readOnly
              disabled
            />

            <DataField
              label="Website"
              id="website"
              size={6}
              value={companyInfo?.website ?? ""}
              readOnly
              disabled
            />
          </Grid>
        </ProfileSection>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          4. BANK DETAILS  (conditional on bankDetails prop)
      ════════════════════════════════════════════════════════════════════ */}
      {showBank && (
        <ProfileSection
          title="Bank Details"
          subtitle="Your payment & banking information"
        >
          <Grid cols={12} gap={4}>
            <DataField
              label="Account Holder Name"
              id="acHolder"
              size={6}
              icon={User}
              value={form.bankDetails.accountHolderName}
              onChange={(e) =>
                setBankField("accountHolderName", e.target.value)
              }
            />

            <DataField
              label="Bank Name"
              id="bankName"
              size={6}
              icon={Landmark}
              value={form.bankDetails.bankName}
              onChange={(e) => setBankField("bankName", e.target.value)}
            />

            <DataField
              label="Account Number"
              id="acNumber"
              size={6}
              icon={CreditCard}
              value={form.bankDetails.accountNumber}
              onChange={(e) => setBankField("accountNumber", e.target.value)}
            />

            <DataField
              label="IFSC Code"
              id="ifsc"
              size={6}
              icon={Hash}
              value={form.bankDetails.ifscCode}
              onChange={(e) => setBankField("ifscCode", e.target.value)}
            />

            <DataField
              label="Branch Name"
              id="branch"
              size={6}
              icon={GitBranch}
              value={form.bankDetails.branchName}
              onChange={(e) => setBankField("branchName", e.target.value)}
            />

            <DataField
              label="UPI ID"
              id="upi"
              size={6}
              icon={Smartphone}
              value={form.bankDetails.upiId}
              onChange={(e) => setBankField("upiId", e.target.value)}
            />
          </Grid>
        </ProfileSection>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          5. SECURITY SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <ProfileSection
        title="Security"
        subtitle="Manage your password and account security settings"
      >
        <div className="flex flex-col">
          {/* Change Password row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 border border-slate-200 bg-white rounded-3xl shadow-sm">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#2a465a]">Password</p>
              <P
                text="Last changed 30 days ago. Keep your password strong and unique."
                size="xs"
              />
            </div>
            <div className="flex-shrink-0">
              <Button
                text="🗝️ Change Password"
                onClick={() => {
                  setPwForm({ current: "", next: "", confirm: "" });
                  setPwErrors({});
                  setPwSuccess(false);
                  openModal("pw-modal");
                }}
              />
            </div>
          </div>
        </div>
      </ProfileSection>

      {/* ════════════════════════════════════════════════════════════════════
          6. SAVE / RESET
      ════════════════════════════════════════════════════════════════════ */}
      {isDirty && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
          <Grid cols={12} gap={3}>
            <Button
              text="Save Changes →"
              variant="primary"
              size={4}
              onClick={handleSave}
            />
            <Button
              text="Reset Changes"
              variant="secondary"
              size={3}
              onClick={handleReset}
            />
          </Grid>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Change Photo
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="photo-modal" title="Update Profile" size="sm">
        <div className="flex flex-col gap-5">
          {cameraActive ? (
            <div className="flex flex-col gap-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-2xl border-2 border-slate-300 bg-slate-900 object-cover"
                style={{
                  maxHeight: "400px",
                  minHeight: "300px",
                  width: "100%",
                  display: "block",
                }}
              />
              <canvas ref={canvasRef} className="hidden" />

              <Grid cols={12} gap={3}>
                <Button
                  text="📸 Capture Photo"
                  variant="primary"
                  size={12}
                  onClick={handleCapturePhoto}
                />
                <Button
                  text="Cancel"
                  variant="ghost"
                  size={12}
                  onClick={handleCancelPhoto}
                />
              </Grid>
            </div>
          ) : photoSource === "camera" && pendingAvatar !== avatarPreview ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <Avatar name={saved.fullName} src={pendingAvatar} size={120} />
              </div>

              <Grid cols={12} gap={3}>
                <Button
                  text="Accept Photo"
                  variant="primary"
                  size={12}
                  onClick={handleSavePhoto}
                />
                <Button
                  text="Retake Photo"
                  variant="secondary"
                  size={6}
                  onClick={handleRetakePhoto}
                />
                <Button
                  text="Cancel"
                  variant="ghost"
                  size={6}
                  onClick={handleCancelPhoto}
                />
              </Grid>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar
                    name={saved.fullName}
                    src={pendingAvatar}
                    size={100}
                  />
                </div>
              </div>

              <P
                text="Use your camera or upload an image, then accept or retake it before updating your profile picture."
                size="xs"
              />

              {cameraError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {cameraError}
                </p>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left"
                >
                  <Camera size={18} className="text-[#2a465a] flex-shrink-0" />
                  <span className="text-sm font-bold text-[#2a465a]">
                    Take Photo
                  </span>
                </button>

                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-left">
                  <Upload size={18} className="text-[#2a465a] flex-shrink-0" />
                  <span className="text-sm font-bold text-[#2a465a]">
                    Upload Photo
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition text-left"
                >
                  <Trash2 size={18} className="text-rose-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-rose-600">
                    Remove Photo
                  </span>
                </button>

                <div className="flex justify-end pt-1">
                  <Button
                    text="Cancel"
                    variant="ghost"
                    size={12}
                    onClick={handleCancelPhoto}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Change Password
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="pw-modal" title="Change Password" size="sm">
        <div className="flex flex-col gap-4">
          {/* Success state */}
          {pwSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <ShieldCheck size={40} className="text-emerald-500" />
              <p className="text-sm font-bold text-emerald-600">
                Password changed successfully!
              </p>
            </div>
          ) : (
            <Grid cols={12} gap={4}>
              {/* Current Password */}
              <div className="col-span-12">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="pw-current"
                    className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
                  >
                    Current Password
                  </label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition duration-200">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="pw-current"
                      type={showCurrentPw ? "text" : "password"}
                      placeholder="Enter current password"
                      value={pwForm.current}
                      onChange={(e) => {
                        setPwForm((p) => ({ ...p, current: e.target.value }));
                        if (pwErrors.current)
                          setPwErrors((er) => ({ ...er, current: "" }));
                      }}
                      className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a465a] transition"
                    >
                      {showCurrentPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <FieldError msg={pwErrors.current} />
              </div>

              {/* New Password */}
              <div className="col-span-12">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="pw-new"
                    className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
                  >
                    New Password
                  </label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition duration-200">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="pw-new"
                      type={showNewPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={pwForm.next}
                      onChange={(e) => {
                        setPwForm((p) => ({ ...p, next: e.target.value }));
                        if (pwErrors.next)
                          setPwErrors((er) => ({ ...er, next: "" }));
                      }}
                      className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a465a] transition"
                    >
                      {showNewPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {pwForm.next && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((n) => {
                      const strength = calculatePasswordStrength(pwForm.next);
                      return (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            n <= strength
                              ? getStrengthColor(strength)
                              : "bg-slate-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
                <FieldError msg={pwErrors.next} />
              </div>

              {/* Confirm Password */}
              <div className="col-span-12">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="pw-confirm"
                    className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/90 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition duration-200">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="pw-confirm"
                      type={showConfirmPw ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={pwForm.confirm}
                      onChange={(e) => {
                        setPwForm((p) => ({ ...p, confirm: e.target.value }));
                        if (pwErrors.confirm)
                          setPwErrors((er) => ({ ...er, confirm: "" }));
                      }}
                      className="w-full rounded-2xl bg-transparent py-3.5 pl-12 pr-14 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2a465a] transition"
                    >
                      {showConfirmPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <FieldError msg={pwErrors.confirm} />
              </div>
            </Grid>
          )}

          {/* Footer buttons */}
          {!pwSuccess && (
            <div className="flex gap-3 pt-1">
              <Grid cols={12} gap={3}>
                <Button
                  text={isChangingPassword ? "Updating..." : "Update Password"}
                  variant="primary"
                  size={7}
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                />
                <Button
                  text="Cancel"
                  variant="ghost"
                  size={5}
                  onClick={() => closeModal("pw-modal")}
                />
              </Grid>
            </div>
          )}
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Logout Confirmation
      ════════════════════════════════════════════════════════════════════ */}
      <Modal id="logout-modal" title="Confirm Logout" size="sm">
        <div className="flex flex-col gap-5">
          {/* Icon + message */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
              <LogOut size={26} className="text-rose-500" />
            </div>
            <p className="text-sm font-bold text-[#2a465a] text-center">
              Are you sure you want to logout?
            </p>
            <P
              text="You will be signed out of your current session and redirected to the login page."
              size="xs"
              center
            />
          </div>

          {/* Buttons */}
          <Grid cols={12} gap={3}>
            <Button
              text="Logout"
              variant="danger"
              size={6}
              onClick={handleLogout}
            />
            <Button
              text="Cancel"
              variant="secondary"
              size={6}
              onClick={() => closeModal("logout-modal")}
            />
          </Grid>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile component usage
//
// Props:
//   photo: string - URL to the profile image
//   name: string - user full name
//   email: string - user email address
//   phone: string - phone number
//   employeeId: string - employee or user ID
//   role: string - user role label
//   department: string - department name
//   isActive: boolean - active status badge (default: true)
//   bankDetails: object - when provided, the Bank Details section is shown
//     bankDetails = {
//       name: string,
//       accountNumber: string,
//       bankName?: string,
//       ifscCode?: string,
//       branchName?: string,
//       upiId?: string,
//     }
//   companyInfo: object - when provided, the Company Details section is shown (typically for Admin)
//     companyInfo = {
//       companyName: string,
//       ownerName: string,
//       companyEmail: string,
//       industry?: string,
//       foundedYear?: string,
//       website?: string,
//     }
//
// Examples:
//   // Sales Executive with Bank Details
//   <Profile
//     photo="https://example.com/avatar.jpg"
//     name="Riya Sharma"
//     email="riya.sharma@example.com"
//     phone="9876543210"
//     employeeId="EMP-1001"
//     role="Sales Executive"
//     department="Sales"
//     bankDetails={{ name: "Riya Sharma", accountNumber: "50100123456789", bankName: "Axis Bank" }}
//   />
//
//   // Admin with Company Info
//   <Profile
//     photo="https://example.com/avatar.jpg"
//     name="John Admin"
//     email="john@admin.com"
//     employeeId="AD-1001"
//     role="Admin"
//     department="Administration"
//     companyInfo={{
//       companyName: "Graphura CRM",
//       ownerName: "John Doe",
//       companyEmail: "info@graphura.com",
//       industry: "SaaS",
//       foundedYear: "2020",
//     }}
//   />
// ─────────────────────────────────────────────────────────────────────────────
