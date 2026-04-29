import React, { useState } from 'react';
import {
  Grid,
  Heading,
  DashCard,
  GLineChart,
  GPieChart,
  DataTable,
  DataField,
  SelectField,
  Button
} from '../../../components/shared/Common_Components';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  FileText,
  CreditCard,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function Billing() {
  // ── State for Invoice Form ──
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingType, setBillingType] = useState('one-time');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [dueDate, setDueDate] = useState('');

  // ── Handlers ──
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    console.log('Invoice Created:', { clientName, amount, billingType, paymentMethod, dueDate });
    // Reset form or show success message
    setClientName('');
    setAmount('');
    setBillingType('one-time');
    setPaymentMethod('credit-card');
    setDueDate('');
  };

  // ── Data ──
  const lineChartData = [
    { name: 'Jan', revenue: 4000, expense: 2400 },
    { name: 'Feb', revenue: 3000, expense: 1398 },
    { name: 'Mar', revenue: 2000, expense: 9800 },
    { name: 'Apr', revenue: 2780, expense: 3908 },
    { name: 'May', revenue: 1890, expense: 4800 },
    { name: 'Jun', revenue: 2390, expense: 3800 },
    { name: 'Jul', revenue: 3490, expense: 4300 },
  ];

  const pieChartData = [
    { name: 'Credit Card', value: 400 },
    { name: 'Bank Transfer', value: 300 },
    { name: 'PayPal', value: 300 },
    { name: 'Crypto', value: 200 },
  ];

  const transactions = [
    { id: 'INV-1001', client: 'Acme Corp', amount: '$1,200', status_val: 'Completed', date: '2023-10-01' },
    { id: 'INV-1002', client: 'Globex', amount: '$3,400', status_val: 'Pending', date: '2023-10-02' },
    { id: 'INV-1003', client: 'Soylent', amount: '$500', status_val: 'Failed', date: '2023-10-03' },
    { id: 'INV-1004', client: 'Initech', amount: '$2,100', status_val: 'Completed', date: '2023-10-05' },
    { id: 'INV-1005', client: 'Umbrella Corp', amount: '$10,000', status_val: 'Pending', date: '2023-10-08' },
  ];

  const transactionColumns = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'client', label: 'Client Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'status_val', label: 'Status' },
    { key: 'date', label: 'Date' },
  ];

  const subscriptions = [
    { plan: 'Pro Tier', price: '$99/mo', duration: 'Monthly', status: 'Active', icon: <Layers size={20} className="text-blue-500" /> },
    { plan: 'Enterprise', price: '$999/yr', duration: 'Annual', status: 'Active', icon: <ShieldCheck size={20} className="text-emerald-500" /> },
    { plan: 'Basic', price: '$29/mo', duration: 'Monthly', status: 'Canceled', icon: <CreditCard size={20} className="text-slate-400" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col p-6 lg:p-8 font-sans bg-[#f8fafc] min-h-screen space-y-8">
      {/* ── 1. Top Section (Dashboard Stats) ── */}
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="Billing &"
          secondaryText="Finance"
          size={12}
          fontSize="3xl"
        />

        <DashCard
          title="Total Revenue"
          value="$124,500"
          icon={<DollarSign size={24} />}
          accentColor="#22c55e"
          size={4}
        />
        <DashCard
          title="Total Expenses"
          value="$45,200"
          icon={<TrendingDown size={24} />}
          accentColor="#f43f5e"
          size={4}
        />
        <DashCard
          title="Net Profit"
          value="$79,300"
          icon={<TrendingUp size={24} />}
          accentColor="#3b82f6"
          size={4}
        />
        <DashCard
          title="Pending Payments"
          value="$12,400"
          icon={<Clock size={24} />}
          accentColor="#f59e0b"
          size={4}
        />
        <DashCard
          title="Active Subscriptions"
          value="342"
          icon={<CheckCircle size={24} />}
          accentColor="#8b5cf6"
          size={4}
        />
        <DashCard
          title="Failed Transactions"
          value="$408"
          icon={<Clock size={24} />}
          accentColor="#f59e0b"
          size={4}
        />
      </Grid>

      {/* ── 2. Charts Section ── */}
      <Grid cols={12} gap={6}>
        <GLineChart
          title="Revenue vs Expense"
          subtitle="Monthly breakdown"
          data={lineChartData}
          lines={[
            { key: 'revenue', label: 'Revenue', color: '#22c55e' },
            { key: 'expense', label: 'Expense', color: '#f43f5e' },
          ]}
          size={8}
          height={320}
        />
        <GPieChart
          title="Payment Distribution"
          subtitle="By payment method"
          data={pieChartData}
          colors={['#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6']}
          size={4}
          height={320}
        />
      </Grid>

      {/* ── 3. Transactions Table ── */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0f172a]">Recent Transactions</h3>
              <p className="text-sm text-slate-500">Monitor all inbound and outbound payments</p>
            </div>
            <Button text="Export CSV" variant="secondary" />
          </div>
          <DataTable
            columns={transactionColumns}
            rows={transactions.map(t => ({
              ...t,
              status_val: (
                <div className="flex items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 ${
                    t.status_val === 'Completed' ? 'bg-emerald-500/15 text-emerald-600' : 
                    t.status_val === 'Pending' ? 'bg-amber-500/15 text-amber-600' : 
                    'bg-rose-500/15 text-rose-600'
                  }`}>
                    {t.status_val}
                  </span>
                </div>
              )
            }))}
            size={12}
            pageSize={5}
            searchable={true}
            date="off"
          />
        </div>
      </Grid>

      {/* 4. Subscriptions */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Calendar size={20} className="text-purple-500" /> Active Subscriptions
            </h3>
            <p className="text-sm text-slate-500">Manage ongoing recurring plans.</p>
          </div>

          <DataTable
            columns={[
              { key: 'plan_node', label: 'Plan Details' },
              { key: 'price', label: 'Price' },
              { key: 'duration', label: 'Duration' },
              { key: 'status_val', label: 'Status' }
            ]}
            rows={subscriptions.map(sub => ({
              ...sub,
              plan_node: (
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-[#2a465a] border border-slate-100">
                    {sub.icon}
                  </div>
                  <span className="font-bold text-[#2a465a]">{sub.plan}</span>
                </div>
              ),
              status_val: (
                <div className="flex items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 ${
                    sub.status === 'Active' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 text-slate-600'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              )
            }))}
            size={12}
            pageSize={5}
          />
        </div>
      </Grid>
    </div>
  );
}