import React, { useState } from "react";
import {
  Heading, DashGrid, Grid, DataField, Button, Select, Option,
} from "../../../../components/shared/Common_Components";

const blank = { type: "", sendTo: "", teamLeader: "", employee: "", title: "", message: "" };

export default function Announcements({ onMessageSent }) {
  const [form, setForm] = useState(blank);
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSend = () => {
    if (!form.title.trim() || !form.message.trim()) {
      alert("Title and Message are required.");
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const msg = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      title: form.title,
      type: form.type || "Announcement",
      sentTo: form.sendTo || "Sales Department",
      sentDate: now,
      status: "Delivered",
      body: form.message,
    };
    onMessageSent(msg);
    setForm(blank);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Send" secondaryText="Announcement" size={12} />
      </DashGrid>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-emerald-700 font-bold text-sm">
          ✅ Message sent successfully! View it in Message History tab.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <Grid cols={12} gap={5}>
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Message Type</label>
            <Select value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="Select Type" size={12}>
              <Option value="Announcement"  label="Announcement" />
              <Option value="Warning"       label="Warning" />
              <Option value="Appreciation"  label="Appreciation" />
            </Select>
          </div>

          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Send To</label>
            <Select value={form.sendTo} onChange={(e) => set("sendTo", e.target.value)} placeholder="Select Audience" size={12}>
              <Option value="Sales Department"  label="Sales Department" />
              <Option value="Team-wise"         label="Team-wise" />
              <Option value="Role-wise"         label="Role-wise" />
              <Option value="Specific Employee" label="Specific Employee" />
            </Select>
          </div>

          {(form.sendTo === "Team-wise" || form.sendTo === "Specific Employee") && (
            <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Select Team Leader</label>
              <Select value={form.teamLeader} onChange={(e) => set("teamLeader", e.target.value)} placeholder="Select Team Leader" size={12}>
                <Option value="Ankit Verma" label="Ankit Verma" />
                <Option value="Sonal Gupta" label="Sonal Gupta" />
                <Option value="Nisha Patel" label="Nisha Patel" />
              </Select>
            </div>
          )}

          {form.sendTo === "Specific Employee" && (
            <DataField label="Select Employee" id="empName" size={6}
              value={form.employee} onChange={(e) => set("employee", e.target.value)}
              placeholder="Employee name..." />
          )}

          <DataField label="Title *" id="msgTitle" size={12}
            value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Message title..." />

          <DataField label="Message *" id="msgBody" type="textarea" rows={5} size={12}
            value={form.message} onChange={(e) => set("message", e.target.value)}
            placeholder="Write your message here..." />

          <div className="col-span-6">
            <Button text="Reset" variant="secondary" onClick={() => setForm(blank)} />
          </div>
          <div className="col-span-6">
            <Button text="Send Message" variant="primary" onClick={handleSend} />
          </div>
        </Grid>
      </div>
    </div>
  );
}