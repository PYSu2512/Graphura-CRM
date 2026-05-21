import { useState } from "react";
import { Eye, Pencil, Link as LinkIcon } from "lucide-react";
import {
  Heading,
  Grid,
  DataTable,
  DataField,
  Button,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components";
import { clients as initialClients } from "./clientsStore";
import { projects } from "./managementManagerStore";

const BLANK_FORM = { id: null, name: "", mobile: "", email: "", driveLink: "" };

// Brief Section 12 / 22: mobile is the primary identifier; 10-digit India format.
const isValidMobile = (v) => {
  const digits = v.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 12; // accept 10 raw or "+91" + 10
};

export default function ManagementManagerClients() {
  const [clients,        setClients]        = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState(null);
  const [form,           setForm]           = useState(BLANK_FORM);
  const [formErr,        setFormErr]        = useState({});
  const [isEdit,         setIsEdit]         = useState(false);

  const handleViewClient = (client) => {
    setSelectedClient(client);
    openModal("mm-client-view");
  };

  const openCreate = () => {
    setIsEdit(false);
    setForm(BLANK_FORM);
    setFormErr({});
    openModal("mm-client-form");
  };

  const openEdit = (row) => {
    const full = clients.find((c) => c.id === row.id);
    setIsEdit(true);
    setForm({
      id:        full.id,
      name:      full.name,
      mobile:    full.mobile,
      email:     full.email,
      driveLink: full.driveLink ?? "",
    });
    setFormErr({});
    openModal("mm-client-form");
  };

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name      = "Client name is required.";
    if (!form.mobile.trim())              e.mobile    = "Mobile is required.";
    else if (!isValidMobile(form.mobile)) e.mobile    = "Mobile must be 10 digits (India format).";
    if (!form.driveLink.trim())           e.driveLink = "Drive link is required (Brief Section 9.c).";
    // Mobile-uniqueness check — Brief Section 12 / 22 says mobile is primary key per tenant.
    const dupe = clients.find(
      (c) => c.mobile === form.mobile.trim() && c.id !== form.id,
    );
    if (dupe) e.mobile = `Mobile already used by ${dupe.name}.`;
    return e;
  };

  const submit = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    if (isEdit) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === form.id
            ? {
                ...c,
                name:      form.name.trim(),
                mobile:    form.mobile.trim(),
                email:     form.email.trim(),
                driveLink: form.driveLink.trim(),
              }
            : c,
        ),
      );
    } else {
      const nextId = `CL-${String(clients.length + 1).padStart(3, "0")}`;
      setClients((prev) => [
        {
          id:        nextId,
          name:      form.name.trim(),
          mobile:    form.mobile.trim(),
          email:     form.email.trim(),
          driveLink: form.driveLink.trim(),
        },
        ...prev,
      ]);
    }

    setForm(BLANK_FORM);
    setFormErr({});
    closeModal("mm-client-form");
  };

  const rows = clients.map((c) => ({
    ...c,
    projectCount: projects.filter((p) => p.clientId === c.id).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Client" secondaryText="Directory" size={12} />

      {/* ── + Add Client button ───────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button text="+ Add Client" variant="primary" onClick={openCreate} />
      </div>

      <Grid cols={12} gap={4}>
        <DataTable
          title="All Clients"
          columns={[
            { key: "id",           label: "ID"              },
            { key: "name",         label: "Client Name"     },
            { key: "mobile",       label: "Mobile"          },
            { key: "email",        label: "Email"           },
            { key: "projectCount", label: "Projects"        },
          ]}
          rows={rows}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="clients_export"
          actions={[
            { icon: <Eye    size={15} />, tooltip: "View Projects", variant: "ghost", onClick: handleViewClient },
            { icon: <Pencil size={15} />, tooltip: "Edit Client",   variant: "ghost", onClick: openEdit },
          ]}
        />
      </Grid>

      {/* ── Create / Edit Client modal ──────────────────────────────────── */}
      <Modal id="mm-client-form" title={isEdit ? "Edit Client" : "Add New Client"} size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={3}>
            <div className="col-span-12">
              <DataField
                label="Client Name *"
                id="mm-client-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Acme Corp"
                size={12}
              />
              {formErr.name && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.name}</p>}
            </div>

            <div className="col-span-6">
              <DataField
                label="Mobile * (primary key)"
                id="mm-client-mobile"
                value={form.mobile}
                onChange={(e) => setField("mobile", e.target.value)}
                placeholder="+91 99999 99999"
                size={12}
              />
              {formErr.mobile && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.mobile}</p>}
            </div>

            <div className="col-span-6">
              <DataField
                label="Email"
                id="mm-client-email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="contact@client.com"
                size={12}
              />
            </div>

            <div className="col-span-12">
              <DataField
                label="Drive Link *"
                id="mm-client-drive"
                value={form.driveLink}
                onChange={(e) => setField("driveLink", e.target.value)}
                placeholder="https://drive.google.com/folder/..."
                size={12}
              />
              {formErr.driveLink && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.driveLink}</p>}
            </div>
          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="secondary"
              onClick={() => { setForm(BLANK_FORM); setFormErr({}); closeModal("mm-client-form"); }}
            />
            <Button
              text={isEdit ? "Save Changes" : "Add Client"}
              variant="primary"
              onClick={submit}
            />
          </div>
        </div>
      </Modal>

      {/* ── View Client modal ───────────────────────────────────────────── */}
      <Modal id="mm-client-view" title="Client Details" size="lg">
        {selectedClient && (
          <>
            <ModalProfile
              name={selectedClient.name}
              subtitle={selectedClient.id}
              meta={`Mobile · ${selectedClient.mobile}`}
            />
            <ModalGrid title="Contact Information" cols={2}>
              <ModalData label="Mobile" value={selectedClient.mobile} />
              <ModalData label="Email"  value={selectedClient.email || "—"} />
              <ModalData
                label="Drive Link"
                value={
                  selectedClient.driveLink ? (
                    <a
                      href={selectedClient.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon size={14} /> Open Drive
                    </a>
                  ) : "—"
                }
              />
            </ModalGrid>

            <ModalGrid title="Associated Projects" cols={1}>
              <div className="space-y-3">
                {projects.filter((p) => p.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-slate-500 text-sm">No projects found.</p>
                ) : (
                  projects
                    .filter((p) => p.clientId === selectedClient.id)
                    .map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{proj.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              proj.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : proj.status === "Delayed"
                                ? "bg-red-100 text-red-700"
                                : proj.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          {proj.driveLink && (
                            <a
                              href={proj.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              📁 Drive
                            </a>
                          )}
                          {proj.handoverLink && (
                            <a
                              href={proj.handoverLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              ✅ Handover
                            </a>
                          )}
                          {!proj.handoverLink && proj.status === "Completed" && (
                            <span className="text-amber-500">
                              ⚠️ Handover link missing
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </ModalGrid>

            <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-client-view")} />
          </>
        )}
      </Modal>
    </div>
  );
}
