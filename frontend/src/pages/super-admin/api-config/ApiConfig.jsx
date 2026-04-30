import React, { useState } from 'react';
import {
  Grid,
  Heading,
  EnhancedDashCard,
  DataTable,
  Button,
  DataField,
  SelectField,
  Option,
  Modal,
  openModal,
  closeModal
} from '../../../components/shared/Common_Components';
import {
  Activity,
  Key,
  AlertTriangle,
  Webhook,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle2
} from 'lucide-react';

export default function ApiConfig() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [eventType, setEventType] = useState('Payment Success');
  const [visibleKeys, setVisibleKeys] = useState({});

  // Stats Data
  const stats = [
    { title: 'Total API Calls', value: '1.2M', icon: <Activity size={24} />, color: '#3b82f6' },
    { title: 'Active API Keys', value: '8', icon: <Key size={24} />, color: '#22c55e' },
    { title: 'Failed Requests', value: '342', icon: <AlertTriangle size={24} />, color: '#f43f5e' },
    { title: 'Total Webhooks', value: '5', icon: <Webhook size={24} />, color: '#8b5cf6' },
  ];

  // API Keys Data
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production Key', publicKey: 'pk_prod_12345', secretKey: 'sk_prod_abcde12345', status: 'Active', created: '2023-01-15' },
    { id: 2, name: 'Development Key', publicKey: 'pk_test_67890', secretKey: 'sk_test_fghij67890', status: 'Active', created: '2023-06-20' },
    { id: 3, name: 'Staging Key', publicKey: 'pk_test_11223', secretKey: 'sk_test_klmno11223', status: 'Revoked', created: '2023-08-05' },
  ]);

  const [newKeyName, setNewKeyName] = useState('');

  const handleConfirmGenerateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      publicKey: `pk_live_${Math.random().toString(36).substring(2, 10)}`,
      secretKey: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      status: 'Active',
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    closeModal('generate-api-modal');
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [copiedId, setCopiedId] = useState(null);
  const [keyToDelete, setKeyToDelete] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteKey = (row) => {
    setKeyToDelete(row);
    openModal('delete-key-modal');
  };

  const confirmDeleteKey = () => {
    if (keyToDelete) {
      setApiKeys(apiKeys.filter(k => k.id !== keyToDelete.id));
      closeModal('delete-key-modal');
      setKeyToDelete(null);
    }
  };

  const apiKeyColumns = [
    { key: 'name', label: 'Key Name', width: '20%' },
    { key: 'publicKey', label: 'Public Key', width: '25%' },
    { key: 'secretDisplay', label: 'Secret Key', width: '20%' },
    { key: 'status_val', label: 'Status', width: '12%' },
    { key: 'created', label: 'Created Date', width: '15%' },
    { key: 'actions', label: 'Actions', width: '8%' }
  ];

  const apiKeyRows = apiKeys.map(k => ({
    ...k,
    secretDisplay: (
      <div className="flex items-center gap-2">
        <span>{visibleKeys[k.id] ? k.secretKey : '••••••••'}</span>
        <button onClick={() => toggleKeyVisibility(k.id)} className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition duration-150 active:scale-95" title={visibleKeys[k.id] ? "Hide Secret Key" : "Show Secret Key"}>
          {visibleKeys[k.id] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button 
          onClick={() => copyToClipboard(k.secretKey, `sec-${k.id}`)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition duration-150 active:scale-95"
          title="Copy Secret Key"
        >
          {copiedId === `sec-${k.id}` ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Copy size={15} />}
        </button>
      </div>
    ),
    status_val: (
      <div className="flex items-center">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 ${
          k.status === 'Active' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
        }`}>
          {k.status}
        </span>
      </div>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => copyToClipboard(k.publicKey, `pub-${k.id}`)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition duration-150 active:scale-95"
          title="Copy Public Key"
        >
          {copiedId === `pub-${k.id}` ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Copy size={15} />}
        </button>
        <button
          onClick={() => handleDeleteKey(k)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition duration-150 active:scale-95"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    )
  }));

  // Webhooks Data
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: 'https://myapp.com/webhook/payment', event: 'Payment Success', status: 'Active', lastTriggered: '2023-10-25' },
    { id: 2, url: 'https://myapp.com/webhook/failed', event: 'Payment Failed', status: 'Active', lastTriggered: '2023-10-24' },
    { id: 3, url: 'https://myapp.com/webhook/sub', event: 'Subscription Created', status: 'Pending', lastTriggered: 'N/A' },
  ]);

  const handleAddWebhook = () => {
    if (webhookUrl.trim() === '') return;
    const newWebhook = {
      id: Date.now(),
      url: webhookUrl,
      event: eventType,
      status: 'Active',
      lastTriggered: 'N/A'
    };
    setWebhooks([...webhooks, newWebhook]);
    setWebhookUrl('');
  };

  const webhookColumns = [
    { key: 'url', label: 'Webhook URL', width: '40%' },
    { key: 'event', label: 'Event Type', width: '20%' },
    { key: 'status_val', label: 'Status', width: '15%' },
    { key: 'lastTriggered', label: 'Last Triggered', width: '25%' }
  ];

  const webhookRows = webhooks.map(w => ({
    ...w,
    url: (
      <div className="flex items-center gap-2">
        <span className="truncate">{w.url}</span>
        <button 
          onClick={() => copyToClipboard(w.url, `web-${w.id}`)}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition duration-150 active:scale-95 flex-shrink-0"
          title="Copy Webhook URL"
        >
          {copiedId === `web-${w.id}` ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
    ),
    status_val: (
      <div className="flex items-center">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 ${
          w.status === 'Active' ? 'bg-emerald-500/15 text-emerald-600' : 
          w.status === 'Pending' ? 'bg-amber-500/15 text-amber-600' : 
          'bg-rose-500/15 text-rose-600'
        }`}>
          {w.status}
        </span>
      </div>
    )
  }));

  // API Logs Data
  const apiLogs = [
    { id: 1, endpoint: '/v1/customers', method: 'GET', statusCode: 200, time: '45ms', date: '2023-10-26 10:14:02' },
    { id: 2, endpoint: '/v1/payments', method: 'POST', statusCode: 201, time: '120ms', date: '2023-10-26 10:12:45' },
    { id: 3, endpoint: '/v1/subscriptions/sub_123', method: 'PUT', statusCode: 400, time: '65ms', date: '2023-10-26 10:05:12' },
    { id: 4, endpoint: '/v1/users', method: 'GET', statusCode: 500, time: '340ms', date: '2023-10-26 09:55:00' },
    { id: 5, endpoint: '/v1/invoices', method: 'GET', statusCode: 200, time: '50ms', date: '2023-10-26 09:40:22' },
  ];

  const logColumns = [
    { key: 'endpoint', label: 'Endpoint' },
    { key: 'method', label: 'Method' },
    { key: 'statusCode', label: 'Status Code' },
    { key: 'time', label: 'Response Time' },
    { key: 'date', label: 'Date' }
  ];

  const logRows = apiLogs.map(log => ({
    ...log,
    method: (
      <span className={`font-mono text-xs font-bold ${log.method === 'GET' ? 'text-blue-600' :
          log.method === 'POST' ? 'text-green-600' :
            log.method === 'PUT' ? 'text-orange-600' : 'text-red-600'
        }`}>
        {log.method}
      </span>
    ),
    statusCode: (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-100 text-green-700' :
          log.statusCode >= 400 && log.statusCode < 500 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
        }`}>
        {log.statusCode}
      </span>
    )
  }));

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* 1. Header */}
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="API Configuration"
          secondaryText="Manage API keys and integrations"
          size={12}
          fontSize="3xl"
        />

        {/* 2. Dashboard Stats */}
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

      {/* 3. API Keys Management */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <Key size={20} className="text-blue-500" /> API Keys
              </h3>
              <p className="text-sm text-slate-500">Manage your active API keys and their permissions.</p>
            </div>
            <Button text="Generate New API Key" variant="primary" onClick={() => openModal('generate-api-modal')} />
          </div>

          <DataTable
            columns={apiKeyColumns}
            rows={apiKeyRows}
            size={12}
            pageSize={5}
            searchable={true}
            date="off"
          />
        </div>
      </Grid>

      {/* 4. Webhook Configuration */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Webhook size={20} className="text-purple-500" /> Webhook Configuration
            </h3>
            <p className="text-sm text-slate-500">Add and manage webhook endpoints for real-time events.</p>
          </div>
          <div className="bg-[#f8fafc] p-5 rounded-xl border border-slate-200 mb-8">
            <Grid cols={12} gap={4}>
              <DataField
                label="Webhook URL"
                id="webhookUrl"
                size={5}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/webhook"
              />
              <SelectField
                label="Event Type"
                id="eventType"
                size={5}
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <Option value="Payment Success" label="Payment Success" />
                <Option value="Payment Failed" label="Payment Failed" />
                <Option value="Subscription Created" label="Subscription Created" />
              </SelectField>
              <div className="col-span-12 md:col-span-2 flex items-end">
                <div className="w-full h-[46px]">
                  <Button text="Add Webhook" variant="primary" onClick={handleAddWebhook} />
                </div>
              </div>
            </Grid>
          </div>

          <DataTable
            columns={webhookColumns}
            rows={webhookRows}
            size={12}
            pageSize={5}
            searchable={false}
            date="off"
          />
        </div>
      </Grid>

      {/* 5. API Logs Section */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> API Logs
            </h3>
            <p className="text-sm text-slate-500">View recent API requests and their response statuses.</p>
          </div>

          <DataTable
            columns={logColumns}
            rows={logRows}
            size={12}
            pageSize={10}
            searchable={true}
            date="on"
          />
        </div>
      </Grid>

      {/* 6. Modals */}
      <Modal id="generate-api-modal" title="Generate New API Key">
        <div className="space-y-4">
          <DataField
            label="Key Name"
            id="newKeyName"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. Production Key 2"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button text="Cancel" variant="ghost" onClick={() => closeModal('generate-api-modal')} />
            <Button text="Generate" variant="primary" onClick={handleConfirmGenerateKey} />
          </div>
        </div>
      </Modal>

      <Modal id="delete-key-modal" title="Revoke API Key">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to revoke <strong>{keyToDelete?.name}</strong>? This action cannot be undone and any applications using this key will immediately lose access.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button text="Cancel" variant="ghost" onClick={() => {
              closeModal('delete-key-modal');
              setKeyToDelete(null);
            }} />
            <Button text="Revoke Key" variant="danger" onClick={confirmDeleteKey} />
          </div>
        </div>
      </Modal>
    </div>
  );
}