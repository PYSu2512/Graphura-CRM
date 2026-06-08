// ─────────────────────────────────────────────────────────────────────────────
// profileData.js — Dummy profile data for the CRM Profile Page
// ─────────────────────────────────────────────────────────────────────────────

export const defaultProfile = {
  // ── Identity ──────────────────────────────────────────────────────────────
  fullName: "Riya Sharma",
  phone: "9876543210",
  email: "riya.sharma@yourcrm.in",
  role: "Finance Manager",
  isActive: true,

  // ── Avatar ────────────────────────────────────────────────────────────────
  // Set to null to show generated initials avatar
  avatarUrl: null,

  // ── Bank Details ──────────────────────────────────────────────────────────
  bankDetails: {
    accountHolderName: "Riya Sharma",
    bankName: "HDFC Bank",
    accountNumber: "50100123456789",
    ifscCode: "HDFC0001234",
    branchName: "Andheri West, Mumbai",
    upiId: "riya.sharma@hdfcbank",
  },

  // ── Security ──────────────────────────────────────────────────────────────
  twoFactorEnabled: true,
  loginNotifications: true,

  // ── Meta ──────────────────────────────────────────────────────────────────
  joinedDate: "2023-03-15",
  department: "Finance",
  location: "Mumbai, Maharashtra",
};
