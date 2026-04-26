import { Building2, ShieldCheck, Users, Waypoints } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  DashCard,
  DataField,
  Grid,
  Heading,
} from "../../../components/shared/Common_Components";
import { LOCKED_RBAC_KEYS, RBAC_LABELS } from "./settings.constant";
import validate from "./settings.validation";
import { useCompanySettings } from "./useCompanySettings";
import FieldMeta from "./components/FieldMeta";
import LoadingSkeleton from "./components/LoadingSkeleton";
import TextAreaField from "./components/TextAreaField";
import Toast from "./components/Toast";

const DashGrid = ({ children, cols = 12, gap = 4 }) => {
  const colsMap = {
    12: "grid-cols-12",
    6: "grid-cols-6",
    4: "grid-cols-4",
    3: "grid-cols-3",
  };
  const gapMap = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
  };

  return (
    <div
      className={`grid ${colsMap[cols] ?? "grid-cols-12"} ${
        gapMap[gap] ?? "gap-4"
      }`}
    >
      {children}
    </div>
  );
};

const SectionCard = ({ title, subtitle, children }) => (
  <div className="col-span-12 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
      checked ? "bg-[#2a465a]" : "bg-slate-300"
    } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function CompanySettings() {
  const {
    settings,
    setSettings,
    loading,
    saving,
    isDirty,
    save,
    discard,
    uploadLogo,
  } = useCompanySettings();

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const enabledPermissions = Object.values(settings.rbac).filter(
    Boolean,
  ).length;
  const totalPermissions = Object.keys(settings.rbac).length;
  const activeLogo = logoPreview || settings.branding.logo_url;

  const updateBranding = (key, val) => {
    setSettings((current) => ({
      ...current,
      branding: { ...current.branding, [key]: val },
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const updateLimits = (key, val) => {
    setSettings((current) => ({
      ...current,
      limits: { ...current.limits, [key]: val },
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const updateRbac = (key, val) => {
    setSettings((current) => ({
      ...current,
      rbac: { ...current.rbac, [key]: val },
    }));
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "Logo must be under 2 MB", type: "error" });
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return previewUrl;
    });
    setLogoUploading(true);

    try {
      const { logo_url } = await uploadLogo(file);
      updateBranding("logo_url", logo_url);
      setLogoPreview((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return logo_url;
      });
      setToast({ message: "Logo uploaded successfully", type: "success" });
    } catch {
      setToast({ message: "Logo upload failed", type: "error" });
    } finally {
      setLogoUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    const nextErrors = validate(settings.branding, settings.limits);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setToast({ message: "Please fix the errors above", type: "error" });
      return;
    }

    try {
      await save();
      setErrors({});
      setToast({ message: "Settings saved successfully", type: "success" });
    } catch (error) {
      setToast({ message: error.message || "Save failed", type: "error" });
    }
  };

  const handleDiscard = () => {
    discard();
    setErrors({});
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <Grid cols={12} gap={4}>
        <div className="col-span-12 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Heading
                primaryText="Company"
                secondaryText="Settings"
                size={12}
              />
              <p className="mt-1 text-sm font-medium text-slate-500">
                Branding, user limits, and role permissions
              </p>
            </div>

            {isDirty && (
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <div className="w-full sm:w-40">
                  <Button
                    text="Discard"
                    variant="secondary"
                    size={12}
                    onClick={handleDiscard}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Button
                    text={saving ? "Saving..." : "Save Changes"}
                    variant="primary"
                    size={12}
                    disabled={saving}
                    onClick={handleSave}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            <DashCard
              title="Company Profile"
              value={settings.branding.company_name || "Not set"}
              icon={<Building2 size={22} />}
              accentColor="#3b82f6"
              size={4}
            />
            <DashCard
              title="Max Users"
              value={String(settings.limits.max_users)}
              icon={<Users size={22} />}
              accentColor="#14b8a6"
              size={4}
            />
            <DashCard
              title="Lead Capacity"
              value={settings.limits.total_lead_capacity.toLocaleString()}
              icon={<Waypoints size={22} />}
              accentColor="#f59e0b"
              size={4}
            />
            <DashCard
              title="RBAC Enabled"
              value={`${enabledPermissions}/${totalPermissions}`}
              icon={<ShieldCheck size={22} />}
              accentColor="#22c55e"
              size={4}
            />
          </DashGrid>
        </div>

        <SectionCard
          title="Company branding"
          subtitle="Appears on invoices, emails, and the client-facing portal"
        >
          <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt="Company logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 size={28} className="text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2a465a]">
                  Brand identity
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  PNG or JPG, maximum 2 MB
                </p>
              </div>
            </div>

            <div className="w-full sm:w-44">
              <Button
                text={logoUploading ? "Uploading..." : "Upload Logo"}
                variant="secondary"
                size={12}
                disabled={logoUploading}
                onClick={() => fileInputRef.current?.click()}
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <Grid cols={12} gap={4}>
            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Company Name *"
                id="company_name"
                size={12}
                value={settings.branding.company_name}
                placeholder="Graphura India Pvt Ltd"
                onChange={(event) =>
                  updateBranding("company_name", event.target.value)
                }
              />
              <FieldMeta error={errors.company_name} />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Contact Email *"
                id="company_email"
                type="email"
                size={12}
                value={settings.branding.email}
                placeholder="admin@company.com"
                onChange={(event) =>
                  updateBranding("email", event.target.value)
                }
              />
              <FieldMeta error={errors.email} />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Phone Number"
                id="company_phone"
                size={12}
                value={settings.branding.phone}
                placeholder="+91 98765 43210"
                onChange={(event) =>
                  updateBranding("phone", event.target.value)
                }
              />
              <FieldMeta error={errors.phone} />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Website URL"
                id="company_website"
                size={12}
                value={settings.branding.website_url}
                placeholder="https://company.com"
                onChange={(event) =>
                  updateBranding("website_url", event.target.value)
                }
              />
              <FieldMeta
                note="Used on invoice footer"
                error={errors.website_url}
              />
            </div>

            <TextAreaField
              label="Address"
              value={settings.branding.address}
              onChange={(value) => updateBranding("address", value)}
              placeholder="Street, City, State - PIN"
              error={errors.address}
            />
          </Grid>
        </SectionCard>

        <SectionCard
          title="Data & user limits"
          subtitle="Super Admin can override these. Changes apply to all users under this company instance."
        >
          <Grid cols={12} gap={4}>
            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Max Users"
                id="max_users"
                type="number"
                size={12}
                value={String(settings.limits.max_users)}
                onChange={(event) =>
                  updateLimits("max_users", Number(event.target.value))
                }
              />
              <FieldMeta
                note="Total user accounts for this company"
                error={errors.max_users}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Total Lead Capacity"
                id="total_lead_capacity"
                type="number"
                size={12}
                value={String(settings.limits.total_lead_capacity)}
                onChange={() => {}}
                disabled
              />
              <FieldMeta note="Fixed per instance - contact Super Admin to change" />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Sales Executive Lead Limit"
                id="exec_lead_limit"
                type="number"
                size={12}
                value={String(settings.limits.exec_lead_limit)}
                onChange={(event) =>
                  updateLimits("exec_lead_limit", Number(event.target.value))
                }
              />
              <FieldMeta
                note="Max leads assignable per executive"
                error={errors.exec_lead_limit}
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Sales TL Lead Limit"
                id="tl_lead_limit"
                type="number"
                size={12}
                value={String(settings.limits.tl_lead_limit)}
                onChange={(event) =>
                  updateLimits("tl_lead_limit", Number(event.target.value))
                }
              />
              <FieldMeta
                note="Must be greater than exec limit"
                error={errors.tl_lead_limit}
              />
            </div>
          </Grid>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-3xl bg-slate-50 p-4 md:grid-cols-4">
            {[
              {
                label: "Exec",
                value: settings.limits.exec_lead_limit.toLocaleString(),
              },
              {
                label: "TL",
                value: settings.limits.tl_lead_limit.toLocaleString(),
              },
              {
                label: "Capacity",
                value: settings.limits.total_lead_capacity.toLocaleString(),
              },
              {
                label: "Users",
                value: String(settings.limits.max_users),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-lg font-extrabold text-[#2a465a]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Role permissions (RBAC)"
          subtitle="Fine-grained permission toggles per role. Changes take effect immediately on save."
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            {RBAC_LABELS.map(({ key, label, note, pro }, index) => (
              <div
                key={key}
                className={`flex flex-col gap-3 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between ${
                  index !== RBAC_LABELS.length - 1
                    ? "border-b border-slate-200"
                    : ""
                }`}
              >
                <div className="flex-1 pr-0 md:pr-6">
                  <div className="text-sm font-semibold text-[#2a465a]">
                    {label}
                  </div>
                  {note && (
                    <div
                      className={`mt-1 text-xs ${
                        pro ? "text-amber-700" : "text-slate-400"
                      }`}
                    >
                      {note}
                    </div>
                  )}
                </div>
                <Toggle
                  checked={settings.rbac[key]}
                  onChange={(value) => updateRbac(key, value)}
                  disabled={LOCKED_RBAC_KEYS.includes(key)}
                />
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Note: Some permissions, such as Exec restore dump access, are hard
            rules from the system brief and remain locked. RBAC changes are
            audit-logged.
          </p>
        </SectionCard>

        {isDirty && (
          <div className="sticky bottom-0 z-10 col-span-12 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                You have unsaved changes in company settings.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <div className="w-full sm:w-44">
                  <Button
                    text="Discard Changes"
                    variant="secondary"
                    size={12}
                    onClick={handleDiscard}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Button
                    text={saving ? "Saving..." : "Save Changes"}
                    variant="primary"
                    size={12}
                    disabled={saving}
                    onClick={handleSave}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Grid>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
