export const fetchSettings = async () => {
  const res = await fetch("/api/admin/company-settings");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
};

export const saveSettings = async (payload) => {
  const res = await fetch("/api/admin/company-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
};

export const uploadLogo = async (file) => {
  const form = new FormData();
  form.append("logo", file);

  const res = await fetch("/api/admin/company-settings/logo", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Failed to upload logo");
  return res.json();
};
