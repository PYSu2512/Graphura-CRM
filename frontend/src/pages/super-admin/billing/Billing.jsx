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
    { id: 'INV-1001', client: 'Acme Corp', amount: '$1,200', status: 'Completed', date: '2023-10-01' },
    { id: 'INV-1002', client: 'Globex', amount: '$3,400', status: 'Pending', date: '2023-10-02' },
    { id: 'INV-1003', client: 'Soylent', amount: '$500', status: 'Failed', date: '2023-10-03' },
    { id: 'INV-1004', client: 'Initech', amount: '$2,100', status: 'Completed', date: '2023-10-05' },
    { id: 'INV-1005', client: 'Umbrella Corp', amount: '$10,000', status: 'Pending', date: '2023-10-08' },
  ];

  const transactionColumns = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'client', label: 'Client Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
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
            rows={transactions}
            size={12}
            pageSize={5}
            searchable={true}
            date="off"
          />
        </div>
      </Grid>

      {/* ── 4. Invoice Creation & 5. Subscriptions ── */}
      <Grid cols={12} gap={6}>
        {/* Invoice Form */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <FileText size={20} className="text-blue-500" /> Create New Invoice
            </h3>
            <p className="text-sm text-slate-500">Quickly generate and send invoices to clients.</p>
          </div>

          <form onSubmit={handleCreateInvoice}>
            <Grid cols={12} gap={4}>
              <DataField
                label="Client Name"
                id="clientName"
                size={6}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
              <DataField
                label="Amount ($)"
                id="amount"
                type="number"
                size={6}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />

              <SelectField
                label="Billing Type"
                id="billingType"
                size={6}
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
                options={[
                  { value: 'one-time', label: 'One-time Payment' },
                  { value: 'subscription', label: 'Subscription' }
                ]}
              />

              <SelectField
                label="Payment Method"
                id="paymentMethod"
                size={6}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'credit-card', label: 'Credit Card' },
                  { value: 'bank-transfer', label: 'Bank Transfer' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'crypto', label: 'Crypto' }
                ]}
              />

              <DataField
                label="Due Date"
                id="dueDate"
                type="date"
                size={6}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <div className="col-span-12 mt-4 flex justify-end">
                <Button text="Generate Invoice" type="submit" variant="primary" />
              </div>
            </Grid>
          </form>
        </div>

        {/* Subscription Management */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white p-6 shadow-sm border border-[#e2e8f0] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Calendar size={20} className="text-purple-500" /> Active Subscriptions
            </h3>
            <p className="text-sm text-slate-500">Manage ongoing recurring plans.</p>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {subscriptions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    {sub.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{sub.plan}</h4>
                    <p className="text-xs text-slate-500">{sub.duration} • {sub.price}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {sub.status}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Button text="View All Plans" variant="secondary" className="w-full justify-center" />
          </div>
        </div>
      </Grid>
    </div>
  );
}