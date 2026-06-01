import React, { useState } from 'react';
import {
  Grid,
  Heading,
  EnhancedDashCard,
  Button,
  Modal,
  openModal,
  closeModal,
  DataTable
} from '../../../components/shared/Common_Components';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Webhook,
  Copy,
  Eye,
  EyeOff,
  Key,
  Shield,
  Lock,
  Zap,
  Link2,
  HelpCircle,
  CircleDot,
  ExternalLink,
  Trash2
} from 'lucide-react';

export default function ApiConfig() {
  // ── Mode toggle ──
  const [mode, setMode] = useState('live'); // 'test' | 'live'

  // ── Key fields ──
  const [keyId, setKeyId] = useState('rzp_live_xxxxxxxx');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecretVal, setWebhookSecretVal] = useState('');
  const webhookEndpointUrl = `${window.location.origin}/api/webhook/razorpay`;

  // ── Visibility toggles ──
  const [showKeyId, setShowKeyId] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // ── Copy feedback ──
  const [copiedField, setCopiedField] = useState(null);
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Stats ──
  const stats = [
    { title: 'Total Payments', value: '₹4.2L', icon: <CreditCard size={24} />, color: '#3b82f6' },
    { title: 'Success Rate', value: '97.8%', icon: <CheckCircle2 size={24} />, color: '#22c55e' },
    { title: 'Failed Payments', value: '12', icon: <AlertTriangle size={24} />, color: '#f59e0b' },
    { title: 'Webhooks Received', value: '342', icon: <Webhook size={24} />, color: '#8b5cf6' },
  ];

  // ── Connection Status items ──
  const connectionItems = [
    {
      icon: <Key size={16} className="text-blue-500" />,
      label: 'API Key ID',
      status: keyId ? 'CONFIGURED' : 'NOT SET',
      color: keyId ? 'emerald' : 'rose',
    },
    {
      icon: <Lock size={16} className="text-blue-500" />,
      label: 'API Key Secret',
      status: keySecret ? 'CONFIGURED' : 'NOT SET',
      color: keySecret ? 'emerald' : 'rose',
    },
    {
      icon: <Webhook size={16} className="text-blue-500" />,
      label: 'Webhook',
      status: webhookSecretVal ? 'CONFIGURED' : 'OPTIONAL',
      color: webhookSecretVal ? 'emerald' : 'amber',
    },
    {
      icon: <Zap size={16} className="text-blue-500" />,
      label: 'Environment',
      status: mode === 'live' ? 'LIVE' : 'TEST',
      color: mode === 'live' ? 'blue' : 'amber',
    },
  ];

  const badgeColors = {
    emerald: 'bg-emerald-500/15 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-500/15 text-rose-600 border-rose-200',
    amber: 'bg-amber-500/15 text-amber-600 border-amber-200',
    blue: 'bg-blue-500/15 text-blue-600 border-blue-200',
  };

  // ── Masked display ──
  const maskValue = (val) => {
    if (!val) return '';
    return '•'.repeat(Math.min(val.length, 20));
  };

  // ── Saved API Keys Data ──
  const [savedKeys, setSavedKeys] = useState([
    { id: 1, name: 'Production Key 1', keyId: 'rzp_live_1DP5mmOlF5G5ag', environment: 'Live', createdOn: '2025-05-10', status: 'Active' },
    { id: 2, name: 'Testing Env Key', keyId: 'rzp_test_9AksL1pQr6T5op', environment: 'Test', createdOn: '2025-05-15', status: 'Active' },
    { id: 3, name: 'Old Staging Key', keyId: 'rzp_test_3VbnM4lKi8J2wq', environment: 'Test', createdOn: '2024-11-20', status: 'Revoked' },
  ]);

  const handleDeleteKey = (id) => {
    setSavedKeys(savedKeys.filter(k => k.id !== id));
  };

  const savedKeysColumns = [
    { key: 'name', label: 'Key Name', width: '20%' },
    { key: 'keyId_val', label: 'Key ID', width: '25%' },
    { key: 'environment_val', label: 'Environment', width: '15%' },
    { key: 'createdOn', label: 'Created On', width: '15%' },
    { key: 'status_val', label: 'Status', width: '15%' },
    { key: 'actions', label: 'Actions', width: '10%' },
  ];

  const savedKeysRows = savedKeys.map(k => ({
    ...k,
    keyId_val: (
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs text-slate-600">{k.keyId}</span>
        <button
          onClick={() => copyToClipboard(k.keyId, `saved-${k.id}`)}
          className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-400 hover:bg-slate-200 transition duration-150 active:scale-95"
          title="Copy Key ID"
        >
          {copiedField === `saved-${k.id}` ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
        </button>
      </div>
    ),
    environment_val: (
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
        k.environment === 'Live' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}>
        {k.environment}
      </span>
    ),
    status_val: (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 ${
        k.status === 'Active' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
      }`}>
        {k.status}
      </span>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDeleteKey(k.id)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100 transition duration-150 active:scale-95"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )
  }));

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">

      {/* ─── 1. Header ─── */}
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="API Configuration"
          secondaryText="Manage Razorpay payment gateway keys & integrations"
          size={12}
          fontSize="3xl"
        />

        {/* ─── 2. Stats Row ─── */}
        {stats.map((stat, idx) => (
          <EnhancedDashCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            accentColor={stat.color}
            size={3}
          />
        ))}
      </Grid>

      {/* ─── 3. Razorpay Payment Gateway Card ─── */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white shadow-sm border border-[#e2e8f0] overflow-hidden">

          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Razorpay icon */}
              <div className="w-10 h-10 rounded-xl bg-[#072654] flex items-center justify-center shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M8.5 4L5 20h3.5l1-5h3.5L16.5 4H8.5z" fill="#3395FF" />
                  <path d="M14.5 9l-1.5 7h-3L11.5 9h3z" fill="white" />
                  <path d="M16 4l-3 16h3.5L20 4h-4z" fill="white" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">Razorpay Payment Gateway</h3>
                <p className="text-sm text-slate-500">Configure your Razorpay API credentials for payment processing</p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <span className="text-xs font-semibold text-slate-500 px-2 select-none">MODE:</span>
              <button
                onClick={() => setMode('test')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  mode === 'test'
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Test
              </button>
              <button
                onClick={() => setMode('live')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  mode === 'live'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Live
              </button>
            </div>
          </div>

          {/* Mode Warning Banner */}
          {mode === 'live' ? (
            <div className="mx-6 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <p className="text-sm">
                <span className="font-bold">Live Mode</span> — Real payments will be processed. Ensure your keys are correct. Live Key IDs start with{' '}
                <code className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono text-xs font-semibold">rzp_live_</code>
              </p>
            </div>
          ) : (
            <div className="mx-6 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <HelpCircle size={16} className="flex-shrink-0" />
              <p className="text-sm">
                <span className="font-bold">Test Mode</span> — No real payments will be processed. Test Key IDs start with{' '}
                <code className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-semibold">rzp_test_</code>
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="px-6 py-6 space-y-5">

            {/* Razorpay Key ID */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 select-none">
                <Key size={13} className="text-slate-400" />
                Razorpay Key ID
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKeyId ? 'text' : 'password'}
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    placeholder={mode === 'live' ? 'rzp_live_xxxxxxxxxxxxxxxx' : 'rzp_test_xxxxxxxxxxxxxxxx'}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200"
                  />
                </div>
                <button
                  onClick={() => setShowKeyId(!showKeyId)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title={showKeyId ? 'Hide' : 'Show'}
                >
                  {showKeyId ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(keyId, 'keyId')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title="Copy"
                >
                  {copiedField === 'keyId' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Razorpay Key Secret */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 select-none">
                <Lock size={13} className="text-slate-400" />
                Razorpay Key Secret
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type={showKeySecret ? 'text' : 'password'}
                    value={keySecret}
                    onChange={(e) => setKeySecret(e.target.value)}
                    placeholder="Enter your Razorpay Key Secret"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200"
                  />
                </div>
                <button
                  onClick={() => setShowKeySecret(!showKeySecret)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title={showKeySecret ? 'Hide' : 'Show'}
                >
                  {showKeySecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(keySecret, 'keySecret')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title="Copy"
                >
                  {copiedField === 'keySecret' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Webhook Secret (Optional) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 select-none">
                <Shield size={13} className="text-slate-400" />
                Webhook Secret <span className="text-slate-400 normal-case tracking-normal font-medium">(Optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={webhookSecretVal}
                    onChange={(e) => setWebhookSecretVal(e.target.value)}
                    placeholder="Webhook Secret from Razorpay Dashboard"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200"
                  />
                </div>
                <button
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title={showWebhookSecret ? 'Hide' : 'Show'}
                >
                  {showWebhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(webhookSecretVal, 'whSecret')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title="Copy"
                >
                  {copiedField === 'whSecret' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Webhook Endpoint URL */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 select-none">
                <Link2 size={13} className="text-slate-400" />
                Webhook Endpoint URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={webhookEndpointUrl}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 px-4 text-[#2a465a] text-sm font-mono font-medium focus:outline-none cursor-default transition duration-200"
                  />
                </div>
                <button
                  onClick={() => copyToClipboard(webhookEndpointUrl, 'whUrl')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition duration-150 active:scale-95"
                  title="Copy"
                >
                  {copiedField === 'whUrl' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                Add this URL in your Razorpay Dashboard → Settings → Webhooks
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition-all duration-200 active:scale-95 shadow-lg shadow-[#2a465a]/20">
                Save Keys
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#2a465a] text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all duration-200 active:scale-95">
                Test Connection
              </button>
            </div>
          </div>
        </div>
      </Grid>

      {/* ─── 4. Setup Guide + Connection Status ─── */}
      <Grid cols={12} gap={6}>

        {/* Setup Guide */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2 mb-6">
            <HelpCircle size={18} className="text-blue-500" /> Setup Guide
          </h3>

          <div className="space-y-5">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Get API Keys</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Login to{' '}
                  <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline underline-offset-2 hover:text-blue-600 transition-colors">
                    Razorpay Dashboard
                  </a>
                  {' '}→ Settings → API Keys → Generate Key
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Enter Key ID & Secret</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Paste your Key ID and Key Secret in the fields above
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Configure Webhook</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Copy the Webhook URL and add it in Razorpay Dashboard → Webhooks
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Test & Go Live</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Test with test keys first, then switch to Live Mode when ready
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-[#072654] p-6 shadow-sm border border-[#0f172a]">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6">
            <Shield size={18} className="text-blue-400" /> Connection Status
          </h3>

          <div className="space-y-3">
            {connectionItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-white/5 border border-white/10"
              >
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

      {/* ─── 5. Saved API Keys Table ─── */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <Key size={20} className="text-emerald-500" /> Saved API Keys
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Manage your existing Razorpay API keys and environments.</p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-semibold border border-slate-200 hover:bg-slate-100 transition-all duration-200 active:scale-95"
            >
              Add New Key
            </button>
          </div>

          <DataTable
            columns={savedKeysColumns}
            rows={savedKeysRows}
            size={12}
            pageSize={5}
            searchable={true}
            date="off"
          />
        </div>
      </Grid>
    </div>
  );
}
