import { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  X,
  File,
  Clock,
  Sparkles,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  DashGrid,
  DataTable,
} from "../../../components/shared/Common_Components";

// ── Step labels ──
const steps = [
  { label: "Upload", icon: Upload },
  { label: "Map Columns", icon: FileText },
  { label: "Preview", icon: Eye },
  { label: "Import", icon: Sparkles },
];

// ── Mock import history ──
const importHistory = [
  { id: 1, fileName: "leads_april_batch1.csv", date: "Apr 18, 2026", rows: 142, success: 138, failed: 4, status: "Completed" },
  { id: 2, fileName: "website_leads.xlsx", date: "Apr 15, 2026", rows: 85, success: 85, failed: 0, status: "Completed" },
  { id: 3, fileName: "referral_leads.csv", date: "Apr 10, 2026", rows: 210, success: 198, failed: 12, status: "Completed" },
  { id: 4, fileName: "cold_calling_list.csv", date: "Apr 05, 2026", rows: 320, success: 310, failed: 10, status: "Completed" },
  { id: 5, fileName: "jan_leads_backup.xlsx", date: "Mar 28, 2026", rows: 95, success: 95, failed: 0, status: "Completed" },
];

// ── Mock CSV columns ──
const csvColumns = ["Name", "Phone", "Email Address", "Company", "Lead Source", "Deal Amount"];
const crmFields = ["Full Name", "Mobile", "Email", "Company Name", "Source", "Deal Value", "Status", "Owner", "— Skip —"];

// ── Mock preview rows ──
const previewRows = [
  { Name: "Amit Shah", Phone: "9812345678", "Email Address": "amit@corp.in", Company: "Corp Ltd", "Lead Source": "Website", "Deal Amount": "250000" },
  { Name: "Priya Rao", Phone: "9823456789", "Email Address": "priya@tech.io", Company: "TechIO", "Lead Source": "Referral", "Deal Amount": "180000" },
  { Name: "Raj Kumar", Phone: "9834567890", "Email Address": "raj@biz.com", Company: "BizCo", "Lead Source": "Ads", "Deal Amount": "320000" },
  { Name: "Sita Nair", Phone: "9845678901", "Email Address": "sita@firm.co", Company: "FirmCo", "Lead Source": "Social", "Deal Amount": "420000" },
  { Name: "Vijay Das", Phone: "9856789012", "Email Address": "vijay@net.in", Company: "NetIn", "Lead Source": "Cold Call", "Deal Amount": "150000" },
];

export default function BulkUpload() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [columnMapping, setColumnMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file) {
      setFileName(file.name);
      setCurrentStep(1);
    }
  };

  const handleStartImport = () => {
    setImporting(true);
    setImportProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setImporting(false);
        setImportDone(true);
      }
      setImportProgress(Math.min(progress, 100));
    }, 400);
  };

  const resetUpload = () => {
    setCurrentStep(0);
    setFileName("");
    setColumnMapping({});
    setImporting(false);
    setImportProgress(0);
    setImportDone(false);
  };

  const columns = [
    { key: "fileName", label: "File Name" },
    { key: "date", label: "Import Date" },
    { key: "rows", label: "Total Rows" },
    { key: "success", label: "Success" },
    { key: "failed", label: "Failed" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#2a465a] flex items-center gap-2">
            Bulk Lead Import <Sparkles className="text-amber-500" size={20} />
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Onboard thousands of leads in seconds with intelligent mapping</p>
        </div>
        <button onClick={() => alert("Downloading sample CSV...")} className="group flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-xs font-black text-emerald-700 border-2 border-emerald-100 transition hover:bg-emerald-100 hover:border-emerald-200 active:scale-95 shadow-sm">
          <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> DOWNLOAD SAMPLE STRUCTURE
        </button>
      </div>

      {/* Modern Step Indicator */}
      <div className="relative mx-auto max-w-4xl px-4 py-6">
         <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2" />
         <div className="absolute top-1/2 left-0 h-1 bg-[#2a465a] -translate-y-1/2 transition-all duration-700 ease-in-out" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
         
         <div className="relative flex items-center justify-between">
            {steps.map((step, i) => {
               const StepIcon = step.icon;
               const isCompleted = i < currentStep;
               const isActive = i === currentStep;
               
               return (
                  <div key={step.label} className="flex flex-col items-center group">
                     <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                        isCompleted ? "bg-[#2a465a] text-white scale-90" : 
                        isActive ? "bg-white text-[#2a465a] border-4 border-[#21d4fd] scale-110 shadow-[#21d4fd]/30" : 
                        "bg-white text-slate-400 border-2 border-slate-100"
                     }`}>
                        {isCompleted ? <CheckCircle2 size={24} /> : <StepIcon size={22} strokeWidth={isActive ? 2.5 : 2} />}
                     </div>
                     <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                        isActive ? "text-[#2a465a] opacity-100 translate-y-0" : "text-slate-400 opacity-60 translate-y-1"
                     }`}>{step.label}</span>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Container with extra margin for absolute step labels */}
      <div className="mt-10 lg:mt-12">
        <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm min-h-[400px] relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-slate-50 to-transparent pointer-events-none opacity-50" />
          
          <div className="relative z-10 h-full">
            {/* Step 0: Upload */}
            {currentStep === 0 && (
              <div className="flex flex-col items-center justify-center py-10 h-full">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="group w-full max-w-3xl border-3 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center hover:border-[#2a465a]/40 hover:bg-[#2a465a]/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2a465a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <input id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileDrop} />
                  
                  <div className="relative flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#2a465a] mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                       <Upload size={36} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-[#2a465a] mb-3">Begin Your Import</h3>
                    <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
                      Drop your customer database here or <span className="text-[#21d4fd] underline decoration-2 underline-offset-4">browse local files</span>. 
                      Supports high-volume CSV or Excel records.
                    </p>
                    
                    <div className="mt-8 flex gap-3">
                       {["CSV", "XLSX", "XLS"].map(ext => (
                          <span key={ext} className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-[10px] font-black text-slate-400 tracking-tighter">{ext}</span>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Column Mapping */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-[#2a465a]">Configure Field Mapping</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Source File: <span className="text-[#21d4fd]">{fileName}</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto px-2 custom-scrollbar">
                  {csvColumns.map((col) => (
                    <div key={col} className="flex items-center gap-4 rounded-3xl bg-slate-50/50 p-4 border border-slate-100 shadow-sm hover:border-[#2a465a]/20 transition-all">
                      <div className="flex-1 min-w-0">
                         <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">CSV Header</span>
                         <span className="text-sm font-black text-[#2a465a] truncate block">{col}</span>
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <ArrowRight size={14} className="text-[#2a465a]" />
                      </div>
                      <div className="flex-1">
                         <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">CRM Property</span>
                         <select
                           value={columnMapping[col] || ""}
                           onChange={(e) => setColumnMapping((prev) => ({ ...prev, [col]: e.target.value }))}
                           className="w-full rounded-2xl border-2 border-white bg-white px-3 py-2 text-xs font-black text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 cursor-pointer shadow-inner"
                         >
                           <option value="">-- MAPPING --</option>
                           {crmFields.map((f) => <option key={f} value={f}>{f}</option>)}
                         </select>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3 mt-10">
                  <button onClick={resetUpload} className="px-6 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition">ABORT</button>
                  <button onClick={() => setCurrentStep(2)} className="px-8 py-3 rounded-2xl text-sm font-black text-white bg-[#2a465a] hover:bg-[#1e3a52] transition shadow-xl shadow-[#2a465a]/20 active:scale-95 uppercase tracking-wider">VALIDATE DATA</button>
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {currentStep === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                      <Eye size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-[#2a465a]">Data Validation Preview</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top 5 Sample Rows</p>
                    </div>
                  </div>
                  <div className="px-5 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-xs font-black text-emerald-700 tracking-tight uppercase">Structure Passed</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-[2rem] border-2 border-slate-50 shadow-inner">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#2a465a] text-white">
                        {csvColumns.map((col) => (
                          <th key={col} className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className={`group hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                          {csvColumns.map((col) => (
                            <td key={col} className="py-5 px-6 text-[#2a465a] font-bold border-b border-slate-50">{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end gap-3 mt-10">
                  <button onClick={() => setCurrentStep(1)} className="px-6 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition">BACK</button>
                  <button onClick={() => setCurrentStep(3)} className="px-8 py-3 rounded-2xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xl shadow-emerald-600/20 active:scale-95 uppercase tracking-wider">EXECUTE IMPORT</button>
                </div>
              </div>
            )}

            {/* Step 3: Import Processing */}
            {currentStep === 3 && (
              <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-700">
                {importDone ? (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-white mx-auto mb-8 animate-bounce">
                       <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl font-black text-[#2a465a] mb-3">Sync Completed!</h3>
                    <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10 leading-relaxed">System has successfully integrated the new leads into your pipeline. Live monitoring is active.</p>
                    <button onClick={resetUpload} className="px-10 py-4 rounded-3xl text-sm font-black text-white bg-[#2a465a] shadow-2xl shadow-[#2a465a]/40 hover:bg-[#1e3a52] transition active:scale-95 flex items-center gap-3">
                       <RefreshCw size={18} /> IMPORT ANOTHER BATCH
                    </button>
                  </div>
                ) : importing ? (
                  <div className="text-center w-full max-w-xl">
                    <div className="relative w-32 h-32 mx-auto mb-10">
                       <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
                       <div className="absolute inset-0 rounded-full border-8 border-[#21d4fd] border-t-transparent animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-[#2a465a]">{Math.round(importProgress)}%</span>
                       </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-[#2a465a] mb-8 uppercase tracking-widest">Injecting Intelligence...</h3>
                    
                    <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden shadow-inner p-1">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#21d4fd] to-[#2a465a] transition-all duration-500 shadow-md" 
                        style={{ width: `${importProgress}%` }} 
                      />
                    </div>
                    
                    <div className="mt-8 flex items-center justify-center gap-6">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Records Processed</span>
                          <span className="text-lg font-black text-[#2a465a]">{(importProgress * 50).toFixed(0)}</span>
                       </div>
                       <div className="w-px h-10 bg-slate-100" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Est. Time Remaining</span>
                          <span className="text-lg font-black text-[#2a465a]">{Math.max(0, (10 - (importProgress/10)).toFixed(1))}s</span>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-[#2a465a] shadow-2xl shadow-[#2a465a]/30 flex items-center justify-center text-white mx-auto mb-8">
                       <Zap size={48} strokeWidth={2.5} fill="currentColor" />
                    </div>
                    <h3 className="text-3xl font-black text-[#2a465a] mb-3">Final Authorization</h3>
                    <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10 leading-relaxed">Verified 142 records ready for injection. All mappings confirmed against core database.</p>
                    <button onClick={handleStartImport} className="px-12 py-5 rounded-[2.5rem] text-sm font-black text-white bg-emerald-600 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition active:scale-95 flex items-center gap-4">
                       AUTHORIZE SYSTEM UPLOAD <ArrowRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import History */}
      <DataTable 
        title="Import Log History" 
        columns={columns} 
        rows={importHistory} 
        pageSize={5} 
        searchable
        size={12}
      />
    </div>
  );
}

