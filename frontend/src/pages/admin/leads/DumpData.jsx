import { useState } from "react";
import {
  Trash2,
  RefreshCw,
  AlertCircle,
  PhoneOff,
  History
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  DataTable,
} from "../../../components/shared/Common_Components";

// ── Mock Dumped Leads ──
const mockDumped = [
  { id: 1, name: "Deepak Verma", mobile: "9876543216", email: "deepak@example.com", reason: "3x Not Talk", dumped: "3 days ago", source: "Facebook", avatar: "DV" },
  { id: 2, name: "Rohan Mehta", mobile: "9876543217", email: "rohan@x.com", reason: "Not interested", dumped: "1 week ago", source: "Cold Call", avatar: "RM" },
  { id: 3, name: "Sapna Iyer", mobile: "9876543218", email: "sapna@y.com", reason: "Out of budget", dumped: "2 weeks ago", source: "Website", avatar: "SI" },
  { id: 4, name: "Kunal Jain", mobile: "9876543219", email: "kunal@jain.com", reason: "Wrong number", dumped: "1 month ago", source: "Referral", avatar: "KJ" },
  { id: 5, name: "Anil Kapoor", mobile: "9876543220", email: "anil@kapoor.in", reason: "3x Not Talk", dumped: "1 month ago", source: "Facebook", avatar: "AK" },
];

export default function DumpData() {
  const [leads, setLeads] = useState(mockDumped);

  const totalDumped = leads.length;
  const notTalk = leads.filter(l => l.reason === "3x Not Talk").length;

  const columns = [
    { key: "name", label: "Lead" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "reason", label: "Reason" },
    { key: "dumped", label: "Dumped" },
    { key: "source", label: "Source" },
  ];

  const actions = [
    {
      tooltip: "Restore",
      icon: <RefreshCw size={14} />,
      variant: "primary",
      onClick: (row) => alert(`Restoring ${row.name}`)
    },
    {
      tooltip: "Delete",
      icon: <Trash2 size={14} />,
      variant: "danger",
      onClick: (row) => {
        if (window.confirm(`Are you sure you want to permanently delete lead ${row.name}?`)) {
          setLeads((prev) => prev.filter((lead) => lead.id !== row.id));
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between relative">
        <div className="relative z-10">
          <h2 className="text-xl font-black text-[#2a465a]">Dump Data Vault</h2>
          <p className="text-sm font-bold text-slate-500 mt-0.5 tracking-tight">Recoverable lead repository for re-engagement</p>
        </div>

        {/* Gap Animation: Floating Garbage / Data Shards */}
        <div className="hidden sm:flex flex-1 relative items-center justify-center h-16 mx-4 overflow-hidden mask-fade-edges pointer-events-none">
           {/* Data stream trail */}
           <div className="w-full border-t-[1.5px] border-dashed border-slate-200/80 absolute top-1/2 -translate-y-1/2" />
           
           {/* Floating fragments */}
           <div className="absolute top-[15%] left-[25%] w-5 h-5 border-[1.5px] border-rose-300 rounded-[4px] opacity-80" style={{ animation: "squareOrbit1 5s linear infinite" }} />
           <div className="absolute top-[40%] left-[45%] w-3 h-6 bg-amber-200/70 rounded-sm" style={{ animation: "dropRipple1 4s ease-in-out infinite" }} />
           <div className="absolute top-[65%] left-[65%] w-6 h-3 border-[1.5px] border-slate-300/90 rounded-[3px]" style={{ animation: "squareOrbit2 7s linear infinite" }} />
           <div className="absolute top-[25%] left-[85%] w-4 h-4 rounded-full bg-rose-400/70" style={{ animation: "dropRipple2 3s ease-in-out infinite" }} />
           
           {/* Center decorative trash icon */}
           <div className="bg-slate-50 p-3 rounded-full z-10 shadow-sm border border-slate-100/60">
             <Trash2 className="text-slate-400" size={18} />
           </div>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 flex gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-inner">
           <AlertCircle size={20} />
        </div>
        <div>
           <h4 className="text-sm font-black text-amber-800">Operational Notice</h4>
           <p className="text-xs font-bold text-amber-700/80 mt-1 leading-relaxed">Leads here are kept for future re-engagement. After 90 days, you can run a bulk restore campaign or export for cold-outreach tools. No data is ever permanently deleted here.</p>
        </div>
      </div>

      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Dumped" value={String(totalDumped)} icon={<Trash2 size={22} />} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="3× Not Talk" value={String(notTalk)} icon={<PhoneOff size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Vault Restore" value="12" icon={<RefreshCw size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Archived Index" value="48" icon={<History size={22} />} accentColor="#38bdf8" size={3} />
      </DashGrid>

      <DataTable 
        title="Dumped Lead Records"
        columns={columns} 
        rows={leads} 
        actions={actions} 
        pageSize={5} 
        searchable
        size={12}
        bulkAction={true}
        bulkActions={[
          {
            title: "Delete Selected",
            icon: <Trash2 size={14} />,
            onClick: (selectedRows) => {
              if (window.confirm(`Are you sure you want to permanently delete the ${selectedRows.length} selected leads?`)) {
                const selectedIds = new Set(selectedRows.map((r) => r.id));
                setLeads((prev) => prev.filter((lead) => !selectedIds.has(lead.id)));
              }
            }
          }
        ]}
        filters={[
          {
            title: "Reason",
            key: "reason",
            type: "toggle",
            options: ["3x Not Talk", "Not interested", "Out of budget", "Wrong number"],
          },
          {
            title: "Source",
            key: "source",
            type: "toggle",
            options: ["Facebook", "Cold Call", "Website", "Referral"],
          },
        ]}
        exportable={true}
        exportFileName="dumped_leads"
      />
    </div>
  );
}

