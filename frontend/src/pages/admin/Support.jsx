import { useMemo, useState } from "react";
import {
  ChevronDown,
  Flag,
  FolderTree,
  Paperclip,
  Plus,
  Rows3,
  X,
} from "lucide-react";

const initialTickets = [
  {
    id: "SUP-2104",
    user: "Riya Sharma",
    role: "Sales Executive",
    department: "Sales",
    category: "Lead Data Issue",
    issue: "Leads are not loading after the morning sync for west region accounts.",
    priority: "High",
    status: "Open",
    time: "19 Apr 2026, 10:15 AM",
    assignedTo: "Tech Team",
    attachment: "lead-loading-error.png",
  },
  {
    id: "SUP-2098",
    user: "Vikram Nair",
    role: "Finance Manager",
    department: "Finance",
    category: "Payment Issue",
    issue: "Invoice export is duplicating tax rows for April statements.",
    priority: "Medium",
    status: "In Progress",
    time: "19 Apr 2026, 09:05 AM",
    assignedTo: "Developer",
    attachment: "invoice-preview.pdf",
  },
  {
    id: "SUP-2089",
    user: "Ananya Patel",
    role: "Management Lead",
    department: "Mgmt",
    category: "Account/Login Issue",
    issue: "Team leaders are getting signed out after role switch from the approvals panel.",
    priority: "High",
    status: "Resolved",
    time: "18 Apr 2026, 06:40 PM",
    assignedTo: "Super Admin",
    attachment: "session-timeout.mp4",
  },
];

const filterConfig = [
  {
    key: "status",
    title: "Status",
    options: ["All", "Open", "In Progress", "Resolved"],
    icon: Rows3,
  },
  {
    key: "priority",
    title: "Priority",
    options: ["All", "Low", "Medium", "High"],
    icon: Flag,
  },
  {
    key: "department",
    title: "Department",
    options: ["All", "Sales", "Mgmt", "Finance"],
    icon: FolderTree,
  },
];

const statusOptions = ["Open", "In Progress", "Resolved"];
const priorityOptions = ["Low", "Medium", "High"];

const defaultForm = {
  user: "",
  role: "Sales Executive",
  department: "Sales",
  category: "Technical Issue",
  issue: "",
  priority: "Low",
  assignedTo: "Admin Queue",
  attachment: "",
};

function badgeClasses(value, type) {
  if (type === "priority") {
    if (value === "High") return "bg-[#fde7dd] text-[#b04b1c]";
    if (value === "Medium") return "bg-[#fff2d7] text-[#9a6a06]";
    return "bg-[#e8f4ec] text-[#246247]";
  }

  if (value === "Resolved") return "bg-[#e8f4ec] text-[#246247]";
  if (value === "In Progress") return "bg-[#e6f0f8] text-[#355872]";
  return "bg-[#fff2d7] text-[#9a6a06]";
}

function formatTimestamp() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = now.toLocaleString("en-US", { month: "short" });
  const year = now.getFullYear();
  const time = now.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year}, ${time}`;
}

function Support() {
  const [tickets, setTickets] = useState(initialTickets);
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    department: "All",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = filters.status === "All" || ticket.status === filters.status;
      const matchesPriority = filters.priority === "All" || ticket.priority === filters.priority;
      const matchesDepartment =
        filters.department === "All" || ticket.department === filters.department;

      return matchesStatus && matchesPriority && matchesDepartment;
    });
  }, [filters, tickets]);

  const tableTickets = useMemo(() => filteredTickets, [filteredTickets]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((ticket) => ticket.status === "Open").length;
    const inProgress = tickets.filter((ticket) => ticket.status === "In Progress").length;
    const resolved = tickets.filter((ticket) => ticket.status === "Resolved").length;

    return [
      {
        label: "Total Tickets",
        value: total,
        helper: "Across all departments",
        tone: "from-[#355872] to-[#4d7897] text-white",
      },
      {
        label: "In Progress",
        value: inProgress,
        helper: "Currently assigned",
        tone: "from-[#e6f0f8] to-[#d5e6f3] text-[#355872]",
      },
      {
        label: "Open",
        value: open,
        helper: "Waiting for action",
        tone: "from-[#fff1de] to-[#ffe2b9] text-[#8a4b08]",
      },
      {
        label: "Resolved",
        value: resolved,
        helper: "Closed successfully",
        tone: "from-[#e4f5ec] to-[#cbe8d8] text-[#1f6b4f]",
      },
    ];
  }, [tickets]);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleFormChange(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleCreateTicket(event) {
    event.preventDefault();

    if (!form.user.trim() || !form.issue.trim()) {
      return;
    }

    const nextTicket = {
      id: `SUP-${2110 + tickets.length}`,
      user: form.user.trim(),
      role: form.role,
      department: form.department,
      category: form.category,
      issue: form.issue.trim(),
      priority: form.priority,
      status: "Open",
      time: formatTimestamp(),
      assignedTo: form.assignedTo,
      attachment: form.attachment.trim() || "no-attachment",
    };

    setTickets((current) => [nextTicket, ...current]);
    setFilters({
      status: "All",
      priority: "All",
      department: "All",
    });
    setActiveTicket(nextTicket);
    setIsCreateOpen(false);
  }

  function updateActiveTicket(field, value) {
    if (!activeTicket) return;

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === activeTicket.id ? { ...ticket, [field]: value } : ticket
      )
    );
    setActiveTicket((current) => (current ? { ...current, [field]: value } : current));
  }

  return (
    <>
      <div className="space-y-6 text-[#2d3d4a]">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className={`rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-sm ${item.tone}`}
            >
              <p className="text-sm font-medium opacity-90">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm opacity-80">{item.helper}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[24px] border border-[#dfe9ef] bg-white/85 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
                Ticket Management System
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#355872]">
                Filter tickets and review details in table format
              </h2>
            </div>
            <button
              onClick={() => {
                setForm(defaultForm);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#355872] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4a60]"
            >
              <Plus size={16} />
              Create Ticket
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {filterConfig.map((filter) => (
              <div key={filter.key} className="rounded-2xl border border-[#e6edf2] bg-[#fdfefe] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#355872]">
                  <filter.icon size={15} />
                  {filter.title}
                </div>
                <div className="relative">
                  <select
                    value={filters[filter.key]}
                    onChange={(event) => handleFilterChange(filter.key, event.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#d5e3eb] bg-[#f5f9fb] px-4 py-3 text-sm font-medium text-[#355872] outline-none transition focus:border-[#7AAACE] focus:bg-white"
                  >
                    {filter.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#d9e6ef]">
            <div className="overflow-x-auto bg-white">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#355872] text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ticket ID</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Assigned To</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableTickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    tableTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-[#f8fbfd]"}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1e3445]">{ticket.id}</p>
                          <p className="text-xs text-slate-500">{ticket.issue}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1e3445]">{ticket.user}</p>
                          <p className="text-xs text-slate-500">{ticket.role}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800">
                            {ticket.department}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-800">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800">
                            {ticket.assignedTo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(ticket.priority, "priority")}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(ticket.status, "status")}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{ticket.time}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveTicket(ticket)}
                            className="rounded-lg border border-[#cedee8] px-3 py-2 text-sm font-semibold text-[#355872] transition hover:bg-[#f3f8fb]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172532]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#d9e6ef] bg-white p-6 shadow-[0_30px_80px_rgba(23,37,50,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
                  Create Ticket
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#355872]">
                  Add a new support request
                </h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full bg-[#f3f7fa] p-2 text-slate-500 transition hover:bg-[#e7eef3]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  User Name
                  <input
                    value={form.user}
                    onChange={(event) => handleFormChange("user", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                    placeholder="Enter user name"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Role
                  <select
                    value={form.role}
                    onChange={(event) => handleFormChange("role", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Sales Executive</option>
                    <option>Finance Manager</option>
                    <option>Management Lead</option>
                    <option>Team Leader</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Department
                  <select
                    value={form.department}
                    onChange={(event) => handleFormChange("department", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Sales</option>
                    <option>Mgmt</option>
                    <option>Finance</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) => handleFormChange("priority", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) => handleFormChange("category", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Technical Issue</option>
                    <option>Payment Issue</option>
                    <option>Lead Data Issue</option>
                    <option>Account/Login Issue</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Assign To
                  <select
                    value={form.assignedTo}
                    onChange={(event) => handleFormChange("assignedTo", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Admin Queue</option>
                    <option>Tech Team</option>
                    <option>Developer</option>
                    <option>Super Admin</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-[#355872]">
                Issue Description
                <textarea
                  value={form.issue}
                  onChange={(event) => handleFormChange("issue", event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  placeholder="Describe the issue clearly"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-[#355872]">
                Attachment
                <input
                  value={form.attachment}
                  onChange={(event) => handleFormChange("attachment", event.target.value)}
                  className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  placeholder="Optional file name or screenshot"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-[#d5e3eb] px-4 py-2 text-sm font-semibold text-[#355872] transition hover:bg-[#f5f9fb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#355872] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4a60]"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172532]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-[#d9e6ef] bg-white p-6 shadow-[0_30px_80px_rgba(23,37,50,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
                  Ticket Details
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#355872]">{activeTicket.id}</h2>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="rounded-full bg-[#f3f7fa] p-2 text-slate-500 transition hover:bg-[#e7eef3]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(activeTicket.priority, "priority")}`}
                >
                  {activeTicket.priority} Priority
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(activeTicket.status, "status")}`}
                >
                  {activeTicket.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Change Status
                  <select
                    value={activeTicket.status}
                    onChange={(event) => updateActiveTicket("status", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Change Priority
                  <select
                    value={activeTicket.priority}
                    onChange={(event) => updateActiveTicket("priority", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">User</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeTicket.user}</p>
                  <p className="text-sm text-slate-500">{activeTicket.role}</p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Department</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeTicket.department}</p>
                  <p className="text-sm text-slate-500">{activeTicket.category}</p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Assigned To</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeTicket.assignedTo}</p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date and Time</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeTicket.time}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e5edf3] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Issue Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{activeTicket.issue}</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-[#fef4eb] px-3 py-1 text-sm font-medium text-[#b7651c]">
                <Paperclip size={14} />
                {activeTicket.attachment}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Support;
