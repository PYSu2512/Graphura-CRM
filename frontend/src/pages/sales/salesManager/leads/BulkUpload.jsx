import { useRef, useState } from "react";
import {
  Grid, Button, Modal, openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import {
  Upload, AlertTriangle, CheckCircle, Save, X, Loader2, Download
} from "lucide-react";
import { useLeads } from "./LeadsContext";
import apiClient from "../../../../services/apiClient";

export default function BulkUpload() {
  const {
    leads, fetchLeads,
    csvRows, setCsvRows, csvFileName, setCsvFileName,
    uploadId, setUploadId,
  } = useLeads();

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const fileRef = useRef();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCsvFileName(file.name);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/sales-manager/leads/bulk/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const { data } = response.data;
      setUploadId(data.uploadId);
      setSummary(data.summary);
      
      const normalizedRows = data.previewRows.map((row, idx) => ({
        ...row,
        _idx: idx,
        selected: row.validationStatus === "VALID"
      }));
      
      setCsvRows(normalizedRows);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to parse file. Ensure it's a valid CSV/Excel.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCsvRow = (idx) =>
    setCsvRows((prev) => prev.map((r) => (r._idx === idx ? { ...r, selected: !r.selected } : r)));

  const toggleAllValid = () => {
    const allSelected = validRows.every((r) => r.selected);
    setCsvRows((prev) => prev.map((r) => r.validationStatus === "VALID" ? { ...r, selected: !allSelected } : r));
  };

  const clearUpload = () => {
    setCsvRows([]);
    setCsvFileName("");
    setUploadId(null);
    setSummary(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const saveValidLeads = async () => {
    if (!uploadId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/sales-manager/leads/bulk/${uploadId}/commit`);
      const { data } = response.data;
      
      alert(`Successfully imported ${data.importedCount} leads!`);
      fetchLeads();
      clearUpload();
    } catch (err) {
      console.error("Commit failed:", err);
      setError(err.message || "Failed to commit leads.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVFormat = async () => {
    try {
      const response = await apiClient.get("/sales-manager/leads/bulk/template", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lead_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Template download failed:", err);
      alert("Failed to download template: " + (err.message || "Unknown error"));
    }
  };

  const validRows     = csvRows.filter((r) => r.validationStatus === "VALID");
  const selectedCount = csvRows.filter((r) => r.selected).length;

  return (
    <>
      <Grid cols={12} gap={4}>
        <div className="col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div>
            <p className="text-base font-bold text-[#2a465a]">Bulk Lead Upload (Production Flow)</p>
            <p className="text-sm text-slate-500 mt-1">
              Upload a CSV with columns:{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">NAME, MOBILE, EMAIL, COMPANY NAME</code>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              text="Download Template" 
              variant="secondary" 
              size={3} 
              icon={<Download size={14} />}
              onClick={downloadCSVFormat} 
            />
            <label className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-dashed border-[#2a465a]/40 bg-slate-50 text-sm font-bold text-[#2a465a] transition ${loading ? "opacity-50 cursor-wait" : "cursor-pointer hover:bg-slate-100"}`}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {csvFileName || "Choose CSV/Excel File"}
              <input 
                ref={fileRef} 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={loading}
              />
            </label>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

        {csvRows.length > 0 && (
          <div className="col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="font-bold text-[#2a465a]">Backend Preview Result</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="text-emerald-600 font-semibold">{summary?.validRows || 0} valid</span>
                  {" · "}
                  <span className="text-rose-500 font-semibold">{summary?.invalidRows || 0} invalid</span>
                  {" · "}
                  <span className="text-amber-500 font-semibold">{summary?.duplicateRows || 0} duplicates</span>
                  {" · "}
                  <span className="text-slate-500">{selectedCount} selected</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearUpload} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                  <X size={14} /> Cancel
                </button>
                <button 
                  onClick={saveValidLeads} 
                  disabled={loading || selectedCount === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Commit Upload {selectedCount > 0 ? `(${selectedCount})` : ""}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a]">
                    <th className="py-3.5 pl-5 pr-2 w-10">
                      <button type="button" onClick={toggleAllValid}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${validRows.length > 0 && validRows.every((r) => r.selected) ? "bg-white border-white" : "bg-transparent border-white/40 hover:border-white/80"}`}>
                        {validRows.length > 0 && validRows.every((r) => r.selected) && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#2a465a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </button>
                    </th>
                    {["Name", "Mobile", "Email", "Company", "Status", "Reason"].map((h) => (
                      <th key={h} className="py-3.5 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.map((row, i) => {
                    const isValid = row.validationStatus === "VALID";
                    return (
                      <tr key={row._idx} className={`border-b border-slate-100 transition ${row.selected ? "bg-blue-50/60" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${!isValid ? "opacity-70" : ""}`}>
                        <td className="py-3 pl-5 pr-2 w-10">
                          <button type="button" disabled={!isValid} onClick={() => toggleCsvRow(row._idx)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${row.selected ? "bg-[#2a465a] border-[#2a465a]" : isValid ? "bg-white border-slate-300 hover:border-[#2a465a]/60" : "bg-slate-100 border-slate-200 cursor-not-allowed"}`}>
                            {row.selected && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#2a465a]">{row.name || <span className="text-rose-400 italic text-xs">missing</span>}</td>
                        <td className="py-3 px-4 text-slate-600">{row.mobile || <span className="text-rose-400 italic text-xs">missing</span>}</td>
                        <td className="py-3 px-4 text-slate-600">{row.email || <span className="text-rose-400 italic text-xs">missing</span>}</td>
                        <td className="py-3 px-4 text-slate-600">{row.companyName || <span className="text-slate-400 italic text-xs">—</span>}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isValid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {isValid ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                            {row.validationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-rose-500 max-w-[200px]">{row.errorReason || <span className="text-slate-400">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Grid>
    </>
  );
}
