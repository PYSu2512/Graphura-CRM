import React, { useState } from 'react';
import { DollarSign, AlertCircle, Clock } from 'lucide-react';
import InvoiceManagement from './InvoiceManagement';
import ExpenseManagement from './ExpenseManagement';
import {
  DashGrid, EnhancedDashCard, Heading, P, Button,
  GColumnChart, GDoughnutChart, DataTable, PanelModal as Modal, openModal
} from '../../components/shared/Common_Components';

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const weeklyRevenue = [
    { name: 'Mon', revenue: 3500 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2800 },
    { name: 'Fri', revenue: 5000 },
    { name: 'Sat', revenue: 1000 },
    { name: 'Sun', revenue: 3490 },
  ];

  const revenueStreams = [
    { name: 'Services', value: 55 },
    { name: 'Products', value: 30 },
    { name: 'Subscriptions', value: 15 },
  ];

  const pendingList = [
    { idText: 'INV-012', client: 'Alpha Corp', product: 'Cloud Services', branch: 'NY-East', role: 'Admin', amount: 3200, date: 'Nov 01' },
    { idText: 'INV-013', client: 'Beta LLC', product: 'Consulting', branch: 'SF-West', role: 'Manager', amount: 1450, date: 'Nov 02' },
    { idText: 'INV-014', client: 'Gamma Inc', product: 'Software License', branch: 'LDN-Central', role: 'User', amount: 800, date: 'Nov 02' }
  ].map(i => ({...i, amountLabel: `$${i.amount.toLocaleString()}`, status: 'Pending'}));

  const failedList = [
    { idText: 'TRX-981', client: 'Delta Co', product: 'Cloud Services', branch: 'NY-East', role: 'Admin', amount: 2100, date: 'Oct 30' },
    { idText: 'TRX-982', client: 'Epsilon Ltd', product: 'Hardware', branch: 'TX-South', role: 'User', amount: 550, date: 'Oct 31' }
  ].map(i => ({...i, amountLabel: `$${i.amount.toLocaleString()}`, status: 'Failed'}));

  const pendingSum = pendingList.reduce((acc, curr) => acc + curr.amount, 0);
  const failedSum = failedList.reduce((acc, curr) => acc + curr.amount, 0);

  const tableColumns = [
    { key: "idText", label: "ID" },
    { key: "client", label: "Client" },
    { key: "product", label: "Product" },
    { key: "date", label: "Date" },
    { key: "amountLabel", label: "Amount" },
    { key: "status", label: "Status" }
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <Heading primaryText="Finance" secondaryText="Dashboard" size={12} />
          <P text="Overview of your revenue and transactions." size="sm" />
        </div>
        
        <div className="flex space-x-8 border-b border-slate-200 overflow-x-auto no-scrollbar pt-2">
          <button 
            className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === 'overview' ? 'text-[#355872]' : 'text-slate-400 hover:text-[#355872]'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#355872] rounded-t-full"></div>}
          </button>
          <button 
            className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === 'invoices' ? 'text-[#355872]' : 'text-slate-400 hover:text-[#355872]'}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoice Management
            {activeTab === 'invoices' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#355872] rounded-t-full"></div>}
          </button>
          <button 
            className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === 'expenses' ? 'text-[#355872]' : 'text-slate-400 hover:text-[#355872]'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expense Management
            {activeTab === 'expenses' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#355872] rounded-t-full"></div>}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <DashGrid cols={12} gap={6}>

          <EnhancedDashCard
            title="Total Revenue"
            value="$124,500"
            icon={<DollarSign size={22} />}
            accentColor="#38bdf8"
            size={3}
          />
          <EnhancedDashCard
            title="Today's Revenue"
            value="$3,450"
            icon={<DollarSign size={22} />}
            accentColor="#22c55e"
            size={3}
          />
          <EnhancedDashCard
            title="Pending Payments"
            value={`$${pendingSum.toLocaleString()}`}
            icon={<Clock size={22} />}
            accentColor="#eab308"
            size={3}
            onClick={() => openModal('pending-modal')}
          />
          <EnhancedDashCard
            title="Failed Payments"
            value={`$${failedSum.toLocaleString()}`}
            icon={<AlertCircle size={22} />}
            accentColor="#f43f5e"
            size={3}
            onClick={() => openModal('failed-modal')}
          />

          <GColumnChart
            title="Weekly Revenue"
            subtitle="Revenue across the week"
            data={weeklyRevenue}
            bars={[{ key: "revenue", label: "Revenue", color: "#3b82f6" }]}
            size={7}
            height={320}
          />
          <GDoughnutChart
             title="Revenue Streams"
             subtitle="Distribution by product type"
             data={revenueStreams}
             colors={["#8b5cf6", "#14b8a6", "#22c55e"]}
             size={5}
             height={320}
             innerRadius={70}
          />
        </DashGrid>
      )}

      {activeTab === 'invoices' && (
        <div className="mt-2">
          <InvoiceManagement isEmbedded={true} />
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="mt-2">
          <ExpenseManagement isEmbedded={true} />
        </div>
      )}

      <Modal id="pending-modal" title="Pending Payments Details" size="xl">
         <div className="mt-4">
           <DataTable
             columns={tableColumns}
             rows={pendingList}
             size={12}
             pageSize={5}
             searchable={false}
           />
         </div>
      </Modal>

      <Modal id="failed-modal" title="Failed Payments Details" size="xl">
         <div className="mt-4">
           <DataTable
             columns={tableColumns}
             rows={failedList}
             size={12}
             pageSize={5}
             searchable={false}
           />
         </div>
      </Modal>
      
    </div>
  );
}
