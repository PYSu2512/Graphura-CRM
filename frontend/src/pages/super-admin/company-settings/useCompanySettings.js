import { useEffect, useState } from "react";
import { fetchSettings, saveSettings, uploadLogo } from "./settings.api";
import { DEFAULT_SETTINGS } from "./settings.constant";

export const useCompanySettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [original, setOriginal] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        const merged = {
          branding: { ...DEFAULT_SETTINGS.branding, ...data.branding },
          limits: { ...DEFAULT_SETTINGS.limits, ...data.limits },
          rbac: { ...DEFAULT_SETTINGS.rbac, ...data.rbac },
        };

        setSettings(merged);
        setOriginal(merged);
      })
      .catch(() => {
        setSettings(DEFAULT_SETTINGS);
        setOriginal(DEFAULT_SETTINGS);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      setOriginal(settings);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setSettings(original);
  };

  return {
    settings,
    setSettings,
    loading,
    saving,
    isDirty,
    save,
    discard,
    uploadLogo,
  };
};
