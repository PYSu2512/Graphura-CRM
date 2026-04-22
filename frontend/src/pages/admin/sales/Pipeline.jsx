import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Phone,
  Mail,
  GripVertical,
  IndianRupee,
  Clock,
  Filter,
  Calendar,
} from "lucide-react";
import {
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../components/shared/Common_Components";

// ── Pipeline stages ──
const stageConfig = [
  { key: "new", label: "New", color: "#3b82f6", borderColor: "#3b82f6" },
  { key: "contacted", label: "Contacted", color: "#7AAACE", borderColor: "#7AAACE" },
  { key: "interested", label: "Interested", color: "#f59e0b", borderColor: "#f59e0b" },
  { key: "proposal", label: "Proposal", color: "#8b5cf6", borderColor: "#8b5cf6" },
  { key: "won", label: "Won", color: "#22c55e", borderColor: "#22c55e" },
  { key: "lost", label: "Lost", color: "#ef4444", borderColor: "#ef4444" },
];

// ── Mock pipeline data ──
const initialPipeline = {
  new: [
    { id: 1, name: "Arun Kapoor", value: "₹2,50,000", owner: "Rahul S.", days: 2 },
    { id: 2, name: "Deepak Rao", value: "₹2,00,000", owner: "Neha S.", days: 1 },
    { id: 3, name: "Tarun Bhat", value: "₹1,50,000", owner: "Neha S.", days: 0 },
  ],
  contacted: [
    { id: 4, name: "Priya Mehta", value: "₹1,80,000", owner: "Neha S.", days: 3 },
    { id: 5, name: "Ananya Nair", value: "₹3,80,000", owner: "Deepika N.", days: 4 },
  ],
  interested: [
    { id: 6, name: "Vikash Sharma", value: "₹5,00,000", owner: "Rahul S.", days: 5 },
    { id: 7, name: "Rohan Gupta", value: "₹6,00,000", owner: "Anita B.", days: 7 },
  ],
  proposal: [
    { id: 8, name: "Ritu Desai", value: "₹3,20,000", owner: "Deepika N.", days: 8 },
    { id: 9, name: "Sanya Patel", value: "₹2,75,000", owner: "Rahul S.", days: 6 },
  ],
  won: [
    { id: 10, name: "Kabir Singh", value: "₹4,50,000", owner: "Anita B.", days: 12 },
    { id: 11, name: "Nisha Verma", value: "₹7,00,000", owner: "Deepika N.", days: 15 },
  ],
  lost: [
    { id: 12, name: "Meera Joshi", value: "₹1,20,000", owner: "Rahul S.", days: 20 },
  ],
};

export default function Pipeline() {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [dragItem, setDragItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [toast, setToast] = useState(null);
  
  const scrollRef = useRef(null);
  const scrollInterval = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDragStart = (e, item, sourceStage) => {
    setDragItem(item);
    setDragSource(sourceStage);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.id.toString());
    }
    // Add a slight delay before adding visually dragging classes
    setTimeout(() => {
      if (e.target && e.target.classList) {
        e.target.classList.add("opacity-50", "scale-105", "rotate-2", "shadow-2xl");
      }
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target && e.target.classList) {
      e.target.classList.remove("opacity-50", "scale-105", "rotate-2", "shadow-2xl");
    }
    setDragItem(null);
    setDragSource(null);
    stopAutoScroll();
  };

  const handleDrop = (targetStage) => {
    if (!dragItem || dragSource === targetStage) return;
    setPipeline((prev) => ({
      ...prev,
      [dragSource]: prev[dragSource].filter((i) => i.id !== dragItem.id),
      [targetStage]: [...prev[targetStage], dragItem],
    }));
    const targetLabel = stageConfig.find(s => s.key === targetStage)?.label || targetStage;
    showToast(`Deal moved to ${targetLabel}`);
  };
  
  const handleDragOverArea = (e) => {
    e.preventDefault();
    if (!scrollRef.current) return;
    const { left, right } = scrollRef.current.getBoundingClientRect();
    const threshold = 100;
    
    if (e.clientX < left + threshold) {
      startAutoScroll(-10);
    } else if (e.clientX > right - threshold) {
      startAutoScroll(10);
    } else {
      stopAutoScroll();
    }
  };

  const startAutoScroll = (amount) => {
    if (!scrollInterval.current && scrollRef.current) {
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += amount;
        }
      }, 16);
    }
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const getTotalValue = (deals) => {
    return deals.reduce((sum, d) => sum + parseInt(d.value.replace(/[₹,]/g, "")) || 0, 0);
  };

  const formatValue = (num) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Sales Pipeline</h2>
          <p className="text-sm text-slate-500 mt-0.5">Drag and drop deals between stages</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95">
            <Filter size={14} /> Filters
          </button>
          <button onClick={() => openModal("new-deal-modal")} className="flex items-center gap-2 rounded-xl bg-[#2a465a] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95">
            <Plus size={14} /> New Deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start min-h-[500px]"
        onDragOver={handleDragOverArea}
        onDragLeave={stopAutoScroll}
      >
        {stageConfig.map((stage) => {
          const deals = pipeline[stage.key] || [];
          const totalVal = getTotalValue(deals);
          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-[280px] rounded-2xl border border-slate-200/60 bg-slate-50/60 flex flex-col pt-3 px-2 pb-2 h-max"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleDrop(stage.key); }}
            >
              {/* Pill Column Header */}
              <div className="mb-3 px-2">
                <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100" style={{ borderLeft: `4px solid ${stage.color}` }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: stage.color }}>{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{formatValue(totalVal)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${stage.color}15`, color: stage.color }}>{deals.length}</span>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="p-1 flex-1 space-y-3 min-h-[150px] overflow-y-auto custom-scrollbar">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal, stage.key)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-2xl border border-slate-200/60 p-4 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${dragItem?.id === deal.id ? 'opacity-50 scale-105 rotate-2 shadow-2xl z-50' : ''}`}
                    style={{ 
                      backgroundColor: dragItem?.id === deal.id ? '#ffffff' : `${stage.color}08`,
                      borderLeft: `3px solid ${stage.color}`
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-bold text-[#2a465a]">{deal.name}</p>
                      <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                    </div>
                    <p className="text-lg font-black text-[#2a465a] flex items-center gap-1 mb-4">
                      <IndianRupee size={16} className="text-slate-400" /> {deal.value.replace("₹", "")}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2a465a] to-[#1e3a52] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {deal.owner.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                          <Clock size={12} /> {deal.days}d
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("open-global-call", { detail: { name: deal.name, mobile: "9876543210" } })); }} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-[#2a465a] hover:bg-[#2a465a] hover:text-white transition shadow-sm border border-slate-100"><Phone size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:contact@example.com`; }} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-[#2a465a] hover:bg-[#2a465a] hover:text-white transition shadow-sm border border-slate-100"><Mail size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar while dragging */}
      {createPortal(
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto transition-all duration-300 transform ${dragItem ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mr-2">Drop to Stage:</span>
            {stageConfig.map((stage) => (
              <div
                key={`dropzone-${stage.key}`}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("scale-110", "bg-white/10"); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove("scale-110", "bg-white/10"); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("scale-110", "bg-white/10");
                  handleDrop(stage.key);
                  handleDragEnd(e);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 border border-transparent hover:border-white/20 whitespace-nowrap"
                style={{ backgroundColor: stage.color }}
              >
                {stage.label}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[10000] flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      {/* New Deal Modal */}
      <Modal id="new-deal-modal" title="Add New Deal">
        <div className="space-y-4">
          <Grid cols={12} gap={4}>
            <DataField label="Deal Name" id="deal-name" size={12} placeholder="Enter deal name" />
            <DataField label="Value (₹)" id="deal-value" type="number" size={6} placeholder="e.g. 250000" />
            <SelectField label="Stage" id="deal-stage" size={6} placeholder="Select stage">
              {stageConfig.map(s => <Option key={s.key} value={s.key} label={s.label} />)}
            </SelectField>
            <SelectField label="Owner" id="deal-owner" size={12} placeholder="Assign owner">
              <Option value="rahul" label="Rahul S." />
              <Option value="neha" label="Neha S." />
              <Option value="deepika" label="Deepika N." />
              <Option value="anita" label="Anita B." />
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => closeModal("new-deal-modal")} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => { closeModal("new-deal-modal"); showToast("Deal added!"); }} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] hover:bg-[#1e3a52] transition active:scale-95 shadow-lg shadow-[#2a465a]/20">Add Deal</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
