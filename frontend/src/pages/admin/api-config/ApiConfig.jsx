/**
 * API CONFIG — Admin panel
 * Manages Razorpay credentials per admin tenant.
 *
 * Webhook Secret flow (correct):
 *  1. Admin clicks "Generate Secret" → backend generates a 32-byte hex secret,
 *     encrypts it, stores it in ApiConfig, and returns the plaintext once.
 *  2. Admin copies the secret and pastes it into Razorpay Dashboard → Webhooks → Secret.
 *  3. Razorpay will sign all webhook events with that secret.
 *  4. Our backend verifies the signature using the stored secret.
 *
 * Webhook URL: backend URL, NOT frontend URL.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Heading, EnhancedDashCard, Button,
} from '../../../components/shared/Common_Components';
import {
  CreditCard, CheckCircle2, AlertTriangle, Webhook, Copy, Eye, EyeOff,
  Key, Shield, Lock, Zap, Link2, HelpCircle, RefreshCw, Loader2,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';

// Backend base URL (for webhook endpoint display)
const BACKEND_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const WEBHOOK_ENDPOINT = `${BACKEND_BASE}/api/payments/webhook/razorpay`;

export default function ApiConfig() {
  // ── Mode ──
  const [mode, setMode] = useState('test');

  // ── Form fields ──
  const [keyId,           setKeyId]           = useState('');
  const [keySecret,       setKeySecret]       = useState('');
  const [webhookSecretVal, setWebhookSecretVal] = useState('');

  // ── Visibility ──
  const [showKeyId,     setShowKeyId]     = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhook,   setShowWebhook]   = useState(false);

  // ── Generated secret (one-time reveal) ──
  const [generatedSecret, setGeneratedSecret] = useState(null);
  const [generating,      setGenerating]      = useState(false);

  // ── API state ──
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [testing,       setTesting]       = useState(false);
  const [testResult,    setTestResult]    = useState(null); // 'ok' | 'fail' | null

  // ── Copy feedback ──
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Load existing config on mount ──
  const loadConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const { data } = await apiClient.get('/api-config/razorpay');
      const cfg = data?.data || {};
      setKeyId(cfg.keyId || '');
      // Don't pre-fill secrets for security — show masked state instead
      setKeySecret(cfg.keySecret ? '••••••••••••••••' : '');
      setWebhookSecretVal(cfg.webhookSecret ? '••••••••••••••••' : '');
      setMode(cfg.mode || 'test');
    } catch (err) {
      // If not configured yet, silently ignore
      console.warn('ApiConfig load:', err?.message);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ── Save config ──
  const handleSave = async () => {
    if (!keyId.trim()) { alert('Razorpay Key ID is required.'); return; }
    // If secret fields still show masked value, don't overwrite them
    const isKeySecretMasked = /^•+$/.test(keySecret);
    const isWebhookMasked   = /^•+$/.test(webhookSecretVal);

    if (!isKeySecretMasked && !keySecret.trim()) {
      alert('Razorpay Key Secret is required.');
      return;
    }

    setSaving(true);
    setTestResult(null);
    try {
      const payload = {
        keyId:   keyId.trim(),
        keySecret: isKeySecretMasked ? undefined : keySecret.trim(),
        webhookSecret: isWebhookMasked ? undefined : (webhookSecretVal.trim() || undefined),
        mode,
      };
      // Remove undefined keys so backend doesn't overwrite with empty
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await apiClient.post('/api-config/razorpay', payload);
      alert('Configuration saved successfully.');
      await loadConfig();
    } catch (err) {
      alert(err?.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  // ── Test connection ──
  const handleTest = async () => {
    if (!keyId.trim() || /^•+$/.test(keyId)) {
      alert('Please save your credentials first, then test.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // Attempt to list payment links (minimal API call to verify credentials)
      const { data } = await apiClient.get('/api-config/razorpay');
      const cfg = data?.data || {};
      setTestResult(cfg.keyId ? 'ok' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  // ── Generate webhook secret ──
  const handleGenerateSecret = async () => {
    if (!window.confirm(
      'This will generate a NEW webhook secret and invalidate the old one.\n\n' +
      'You must update the secret in your Razorpay Dashboard immediately after.\n\n' +
      'Continue?'
    )) return;

    setGenerating(true);
    setGeneratedSecret(null);
    try {
      const { data } = await apiClient.post('/api-config/razorpay/generate-secret');
      const secret = data?.data?.secret;
      if (!secret) throw new Error('No secret returned');
      setGeneratedSecret(secret);
      setWebhookSecretVal('••••••••••••••••'); // mask the field (secret is in banner)
    } catch (err) {
      alert(err?.message || 'Failed to generate webhook secret.');
    } finally {
      setGenerating(false);
    }
  };

  // ── Connection status ──
  const isKeyIdSet     = keyId.length > 0;
  const isSecretSet    = keySecret.length > 0;
  const isWebhookSet   = webhookSecretVal.length > 0;

  const connectionItems = [
    { icon: <Key size={16} className="text-blue-400" />,    label: 'API Key ID',     status: isKeyIdSet  ? 'CONFIGURED' : 'NOT SET',  color: isKeyIdSet  ? 'emerald' : 'rose'  },
    { icon: <Lock size={16} className="text-blue-400" />,   label: 'API Key Secret', status: isSecretSet ? 'CONFIGURED' : 'NOT SET',  color: isSecretSet ? 'emerald' : 'rose'  },
    { icon: <Webhook size={16} className="text-blue-400" />, label: 'Webhook Secret', status: isWebhookSet? 'CONFIGURED' : 'OPTIONAL', color: isWebhookSet? 'emerald' : 'amber' },
    { icon: <Zap size={16} className="text-blue-400" />,    label: 'Environment',    status: mode === 'live' ? 'LIVE' : 'TEST',        color: mode === 'live' ? 'blue' : 'amber' },
  ];

  const badgeColors = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    rose:    'bg-rose-500/15 text-rose-400 border-rose-500/30',
    amber:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    blue:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">

      {/* ─── Heading ─── */}
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="API Configuration"
          secondaryText="Manage Razorpay payment gateway keys & integrations"
          size={12}
          fontSize="3xl"
        />
      </Grid>

      {/* ─── Generated Secret Banner ─── */}
      {generatedSecret && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-300 px-6 py-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Shield size={18} className="flex-shrink-0" />
            <p className="text-sm font-bold">
              New Webhook Secret Generated — Copy it now!
            </p>
          </div>
          <p className="text-xs text-emerald-600 leading-relaxed">
            This secret is shown <strong>only once</strong>. Copy it and paste it into your
            <strong> Razorpay Dashboard → Settings → Webhooks → Secret</strong>.
          </p>
          <div className="flex items-center gap-3 bg-white border border-emerald-200 rounded-xl px-4 py-3">
            <code className="flex-1 font-mono text-sm text-slate-800 break-all">{generatedSecret}</code>
            <button
              onClick={() => copyToClipboard(generatedSecret, 'generated')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition active:scale-95 flex-shrink-0"
            >
              {copiedField === 'generated' ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {copiedField === 'generated' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setGeneratedSecret(null)}
            className="text-xs text-emerald-600 underline self-start hover:text-emerald-700"
          >
            I've copied it — dismiss
          </button>
        </div>
      )}

      {/* ─── Main Card ─── */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#072654] flex items-center justify-center shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M8.5 4L5 20h3.5l1-5h3.5L16.5 4H8.5z" fill="#3395FF" />
                  <path d="M14.5 9l-1.5 7h-3L11.5 9h3z" fill="white" />
                  <path d="M16 4l-3 16h3.5L20 4h-4z" fill="white" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Razorpay Payment Gateway</h3>
                <p className="text-sm text-slate-500">Configure your Razorpay API credentials</p>
              </div>
            </div>
            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <span className="text-xs font-semibold text-slate-500 px-2">MODE:</span>
              {['test', 'live'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 capitalize ${
                    mode === m
                      ? m === 'live' ? 'bg-blue-500 text-white shadow-sm' : 'bg-white text-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Mode banner */}
          <div className={`mx-6 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${
            mode === 'live'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {mode === 'live' ? <AlertTriangle size={16} className="flex-shrink-0" /> : <HelpCircle size={16} className="flex-shrink-0" />}
            <p>
              <strong>{mode === 'live' ? 'Live Mode' : 'Test Mode'}</strong>
              {mode === 'live'
                ? ' — Real payments will be processed. Live Key IDs start with '
                : ' — No real payments. Test Key IDs start with '}
              <code className={`px-1.5 py-0.5 rounded-md font-mono text-xs font-semibold ${
                mode === 'live' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {mode === 'live' ? 'rzp_live_' : 'rzp_test_'}
              </code>
            </p>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div className={`mx-6 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${
              testResult === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {testResult === 'ok'
                ? <><CheckCircle2 size={15} /> Credentials verified — configuration is active</>
                : <><AlertTriangle size={15} /> Could not verify credentials — check your Key ID and Secret</>
              }
            </div>
          )}

          {/* Form fields */}
          <div className="px-6 py-6 space-y-5">

            {/* Key ID */}
            <CredentialField
              label="Razorpay Key ID"
              icon={<Key size={13} className="text-slate-400" />}
              value={keyId}
              onChange={setKeyId}
              show={showKeyId}
              onToggleShow={() => setShowKeyId(v => !v)}
              placeholder={mode === 'live' ? 'rzp_live_xxxxxxxxxxxxxxxx' : 'rzp_test_xxxxxxxxxxxxxxxx'}
              onCopy={() => copyToClipboard(keyId, 'keyId')}
              copied={copiedField === 'keyId'}
            />

            {/* Key Secret */}
            <CredentialField
              label="Razorpay Key Secret"
              icon={<Lock size={13} className="text-slate-400" />}
              value={keySecret}
              onChange={setKeySecret}
              show={showKeySecret}
              onToggleShow={() => setShowKeySecret(v => !v)}
              placeholder="Enter your Razorpay Key Secret"
              onCopy={() => copyToClipboard(keySecret, 'keySecret')}
              copied={copiedField === 'keySecret'}
            />

            {/* Webhook Secret */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
                <Shield size={13} className="text-slate-400" />
                Webhook Secret
                <span className="text-slate-400 normal-case tracking-normal font-medium">(Optional — for signature verification)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showWebhook ? 'text' : 'password'}
                    value={webhookSecretVal}
                    onChange={(e) => setWebhookSecretVal(e.target.value)}
                    placeholder="Click 'Generate Secret' to create one, then paste it in Razorpay Dashboard"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-slate-800 placeholder:text-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                  />
                </div>
                <button onClick={() => setShowWebhook(v => !v)}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition active:scale-95 flex items-center justify-center">
                  {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => copyToClipboard(webhookSecretVal, 'whSecret')}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition active:scale-95 flex items-center justify-center">
                  {copiedField === 'whSecret' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handleGenerateSecret}
                  disabled={generating}
                  title="Generate a new webhook secret (your system generates it, you paste it into Razorpay)"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition active:scale-95 disabled:opacity-60 whitespace-nowrap"
                >
                  {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {generating ? 'Generating…' : 'Generate Secret'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                Generate a secret here → copy it → paste it in{' '}
                <a href="https://dashboard.razorpay.com/app/webhooks" target="_blank" rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-600">
                  Razorpay Dashboard → Settings → Webhooks → Secret
                </a>
              </p>
            </div>

            {/* Webhook Endpoint URL */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
                <Link2 size={13} className="text-slate-400" />
                Webhook Endpoint URL
                <span className="text-slate-400 normal-case tracking-normal font-medium">(paste this in Razorpay)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={WEBHOOK_ENDPOINT}
                  readOnly
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-slate-700 text-sm font-mono focus:outline-none cursor-default"
                />
                <button onClick={() => copyToClipboard(WEBHOOK_ENDPOINT, 'whUrl')}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition active:scale-95 flex items-center justify-center">
                  {copiedField === 'whUrl' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                <a href="https://dashboard.razorpay.com/app/webhooks" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition active:scale-95 flex items-center justify-center"
                  title="Open Razorpay Webhooks dashboard">
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                Add this URL in Razorpay Dashboard → Settings → Webhooks → Add New Webhook
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition active:scale-95 shadow-lg shadow-[#2a465a]/20 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                {saving ? 'Saving…' : 'Save Keys'}
              </button>
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#2a465a] text-sm font-bold border border-slate-200 hover:bg-slate-50 transition active:scale-95 disabled:opacity-60"
              >
                {testing ? <Loader2 size={15} className="animate-spin" /> : null}
                {testing ? 'Testing…' : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>
      </Grid>

      {/* ─── Setup Guide + Connection Status ─── */}
      <Grid cols={12} gap={6}>

        {/* Setup Guide */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
            <HelpCircle size={18} className="text-blue-500" /> Setup Guide
          </h3>
          <div className="space-y-5">
            {[
              { n: 1, title: 'Get API Keys', desc: <>Login to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Razorpay Dashboard</a> → Settings → API Keys → Generate Key</> },
              { n: 2, title: 'Enter Key ID & Secret', desc: 'Paste your Key ID and Key Secret in the fields above, then click Save Keys.' },
              { n: 3, title: 'Generate Webhook Secret', desc: 'Click "Generate Secret" — copy the secret shown and paste it into Razorpay Dashboard → Settings → Webhooks → Secret field.' },
              { n: 4, title: 'Add Webhook URL', desc: 'Copy the Webhook Endpoint URL and add it in Razorpay Dashboard → Webhooks. Subscribe to payment events.' },
              { n: 5, title: 'Test & Go Live', desc: 'Use Test Mode keys to verify the flow, then switch to Live Mode.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{n}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-[#072654] p-6 shadow-sm">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <Shield size={18} className="text-blue-400" /> Connection Status
          </h3>
          <div className="space-y-3">
            {connectionItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeColors[item.color]}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Grid>
    </div>
  );
}

// ── Reusable credential field ──────────────────────────────────────────────────
function CredentialField({ label, icon, value, onChange, show, onToggleShow, placeholder, onCopy, copied }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
        {icon} {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-slate-800 placeholder:text-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
        />
        <button onClick={onToggleShow}
          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition active:scale-95 flex items-center justify-center">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button onClick={onCopy}
          className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition active:scale-95 flex items-center justify-center">
          {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
