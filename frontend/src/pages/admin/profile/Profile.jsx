import { Building2, ShieldCheck, Users, Waypoints } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  EnhancedDashCard,
  DashGrid,
  DataField,
  Grid,
  Heading,
  P,
  GAreaChart,
  GBarChart,
} from "../../../components/shared/Common_Components";
import validate from "./settings.validation";
import { useCompanySettings } from "./useCompanySettings";
import FieldMeta from "./components/FieldMeta";
import LoadingSkeleton from "./components/LoadingSkeleton";
import TextAreaField from "./components/TextAreaField";
import Toast from "./components/Toast";

const userGrowthData = [
  { name: "Jan", users: 12, active: 10 },
  { name: "Feb", users: 18, active: 15 },
  { name: "Mar", users: 22, active: 19 },
  { name: "Apr", users: 28, active: 24 },
  { name: "May", users: 34, active: 30 },
  { name: "Jun", users: 38, active: 33 },
];

const deptDistributionData = [
  { name: "Sales", users: 14, active: 12 },
  { name: "Management", users: 8, active: 7 },
  { name: "Finance", users: 6, active: 5 },
  { name: "Support", users: 4, active: 4 },
  { name: "HR", users: 3, active: 2 },
];

const SectionCard = ({ title, subtitle, children }) => (
  <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/60 mt-6">
    <div className="mb-6">
      <h2 className="text-lg font-bold text-[#1e3445]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>}
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
      checked ? "bg-[#355872]" : "bg-slate-300"
    } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function Profile() {
  const {
    settings,
    original,
    setSettings,
    loading,
    saving,
    isDirty,
    save,
    discard,
    uploadLogo,
  } = useCompanySettings();

  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Branding', 'Data Limits'];

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

  const activeLogo = logoPreview || settings?.branding?.logo_url;

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
      setToast({ message: "Please fix the validation errors in the Branding or Limits tab", type: "error" });
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

  if (loading || !settings) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 relative pb-20">
      
      <Heading primaryText="Company" secondaryText="Settings" size={12} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-2">
        <p className="text-sm font-semibold text-slate-400">Branding, user limits, and role permissions</p>
        {isDirty && (
          <div className="flex gap-3">
            <div className="w-36">
              <Button text="Discard" variant="secondary" size={12} onClick={handleDiscard} />
            </div>
            <div className="w-40">
              <Button text={saving ? "Saving..." : "Save Changes"} variant="primary" size={12} disabled={saving} onClick={handleSave} />
            </div>
          </div>
        )}
      </div>

        <div className="flex border-b border-slate-200 gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === tab ? 'text-[#355872]' : 'text-slate-400 hover:text-[#355872]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#355872] rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

      {activeTab === 'Overview' && (
        <>
        <DashGrid cols={12} gap={6}>
          <EnhancedDashCard
            title="Company Profile"
            value={original.branding.company_name || "Not set"}
            icon={<Building2 size={22} />}
            accentColor="#3b82f6"
            size={4}
          />
          <EnhancedDashCard
            title="Max Users"
            value={String(original.limits.max_users)}
            icon={<Users size={22} />}
            accentColor="#14b8a6"
            size={4}
          />
          <EnhancedDashCard
            title="Lead Capacity"
            value={original.limits.total_lead_capacity.toLocaleString()}
            icon={<Waypoints size={22} />}
            accentColor="#f59e0b"
            size={4}
          />
        </DashGrid>

        <DashGrid cols={12} gap={6}>
          <GAreaChart
            title="User Growth Trend"
            subtitle="Monthly new & active users"
            data={userGrowthData}
            areas={[
              { key: "users", label: "Total Users", color: "#3b82f6" },
              { key: "active", label: "Active Users", color: "#22c55e" },
            ]}
            size={7} height={260}
          />
          <GBarChart
            title="Department Distribution"
            subtitle="Users per department"
            data={deptDistributionData}
            bars={[
              { key: "users", label: "Total", color: "#94a3b8" },
              { key: "active", label: "Active", color: "#2a465a" },
            ]}
            size={5} height={260}
          />
        </DashGrid>
        </>
      )}

      {activeTab === 'Branding' && (
        <SectionCard
          title="Company branding"
          subtitle="Appears on invoices, emails, and the client-facing portal"
        >
          <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt="Company logo"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Building2 size={28} className="text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1e3445]">Brand Identity Logo</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">PNG or JPG, maximum 2 MB</p>
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
                onChange={(event) => updateBranding("company_name", event.target.value)}
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
                onChange={(event) => updateBranding("email", event.target.value)}
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
                onChange={(event) => updateBranding("phone", event.target.value)}
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
                onChange={(event) => updateBranding("website_url", event.target.value)}
              />
              <FieldMeta note="Used on invoice footer" error={errors.website_url} />
            </div>

            <div className="col-span-12">
              <TextAreaField
                label="Address"
                value={settings.branding.address}
                onChange={(value) => updateBranding("address", value)}
                placeholder="Street, City, State - PIN"
                error={errors.address}
              />
            </div>
          </Grid>
        </SectionCard>
      )}

      {activeTab === 'Data Limits' && (
        <SectionCard
          title="Data & user limits"
          subtitle="Super Admin can override these. Changes apply to all users under this company instance."
        >
          <Grid cols={12} gap={6}>
            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Max Users"
                id="max_users"
                type="number"
                size={12}
                value={String(settings.limits.max_users)}
                onChange={(event) => updateLimits("max_users", Number(event.target.value))}
              />
              <FieldMeta note="Total user accounts for this company" error={errors.max_users} />
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
                onChange={(event) => updateLimits("exec_lead_limit", Number(event.target.value))}
              />
              <FieldMeta note="Max leads assignable per executive" error={errors.exec_lead_limit} />
            </div>

            <div className="col-span-12 md:col-span-6">
              <DataField
                label="Sales TL Lead Limit"
                id="tl_lead_limit"
                type="number"
                size={12}
                value={String(settings.limits.tl_lead_limit)}
                onChange={(event) => updateLimits("tl_lead_limit", Number(event.target.value))}
              />
              <FieldMeta note="Must be greater than exec limit" error={errors.tl_lead_limit} />
            </div>
          </Grid>

          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-200/50 md:grid-cols-4">
            {[
              { label: "Exec", value: settings.limits.exec_lead_limit.toLocaleString() },
              { label: "TL", value: settings.limits.tl_lead_limit.toLocaleString() },
              { label: "Capacity", value: settings.limits.total_lead_capacity.toLocaleString() },
              { label: "Users", value: String(settings.limits.max_users) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white p-4 shadow-sm border border-slate-200/50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-1.5 text-xl font-black text-[#1e3445]">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}


      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl rounded-2xl border border-slate-200/60 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
               <p className="text-sm font-bold text-[#1e3445]">Unsaved changes detected</p>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Button text="Discard" variant="secondary" size={12} onClick={handleDiscard} />
              </div>
              <div className="flex-1 sm:flex-none">
                <Button text={saving ? "Saving..." : "Save Changes"} variant="primary" size={12} disabled={saving} onClick={handleSave} />
              </div>
            </div>
          </div>
        </div>
      )}

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
