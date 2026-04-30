import React, { useState } from "react";
import { Heading, DashGrid, Grid, DataField, Button, Select, Option } from "../../../../components/shared/Common_Components";
import { Paperclip } from "lucide-react";

const blank = { title: "", category: "", priority: "", assignedTo: "", description: "" };

export default function CreateTicket({ onTicketCreated }) {
  const [form, setForm] = useState(blank);
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      alert("Title and Description are required.");
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const ticket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      title: form.title,
      raisedBy: "Sales Manager",
      role: "Sales Manager",
      priority: form.priority || "Medium",
      status: "Open",
      createdDate: now,
      lastReply: now,
      description: form.description,
      conversation: [],
    };
    onTicketCreated(ticket);
    setForm(blank);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Create" secondaryText="New Ticket" size={12} />
      </DashGrid>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-emerald-700 font-bold text-sm">
          ✅ Ticket created successfully! You can view it in the All Tickets tab.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <Grid cols={12} gap={5}>
          <DataField label="Ticket Title *" id="tktTitle" size={12}
            value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Enter ticket title" />

          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Select Category" size={12}>
              <Option value="Client Data"     label="Client Data" />
              <Option value="Technical Issue" label="Technical Issue" />
              <Option value="Lead Issue"      label="Lead Issue" />
              <Option value="Payment Alert"   label="Payment Alert" />
              <Option value="Other"           label="Other" />
            </Select>
          </div>

          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Priority</label>
            <Select value={form.priority} onChange={(e) => set("priority", e.target.value)} placeholder="Select Priority" size={12}>
              <Option value="Low"    label="Low" />
              <Option value="Medium" label="Medium" />
              <Option value="High"   label="High" />
            </Select>
          </div>

          <DataField label="Assign To / Send To" id="assignTo" size={12}
            value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}
            placeholder="Team Leader / Executive name" />

          <DataField label="Description *" id="desc" type="textarea" rows={5} size={12}
            value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the issue in detail..." />

          {/* Attachment placeholder */}
          <div className="col-span-12">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] block mb-2">
              Attachment (optional)
            </label>
            <div className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 cursor-pointer hover:border-[#2a465a]/40 transition">
              <Paperclip size={20} className="text-slate-400" />
              <span className="text-sm text-slate-400">Click to upload file (PDF, JPG, PNG)</span>
            </div>
          </div>

          <div className="col-span-6">
            <Button text="Reset" variant="secondary" onClick={() => setForm(blank)} />
          </div>
          <div className="col-span-6">
            <Button text="Submit Ticket" variant="primary" onClick={handleSubmit} />
          </div>
        </Grid>
      </div>
    </div>
  );
}