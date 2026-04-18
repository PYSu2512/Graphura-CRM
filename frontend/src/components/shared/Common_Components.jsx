import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// GRID HELPER
// Maps size prop (1–12) to a Tailwind col-span class
// ─────────────────────────────────────────────────────────────────────────────
const colSpan = (size = 12) => {
  const map = {
    1: "col-span-12 sm:col-span-1",
    2: "col-span-12 sm:col-span-2",
    3: "col-span-12 sm:col-span-3",
    4: "col-span-12 sm:col-span-4",
    5: "col-span-12 sm:col-span-5",
    6: "col-span-12 sm:col-span-6",
    7: "col-span-12 sm:col-span-7",
    8: "col-span-12 sm:col-span-8",
    9: "col-span-12 sm:col-span-9",
    10: "col-span-12 sm:col-span-10",
    11: "col-span-12 sm:col-span-11",
    12: "col-span-12",
  };
  return map[size] ?? "col-span-12";
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. INPUT FIELD
// Props: type, placeholder, autoFocus, id, size (1–12), value, onChange, disabled
// ─────────────────────────────────────────────────────────────────────────────
export const InputField = ({
  type = "text",
  placeholder = "",
  autoFocus = false,
  id,
  size = 12,
  value,
  onChange,
  disabled = false,
}) => (
  <div className={`${colSpan(size)}`}>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      autoFocus={autoFocus}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full rounded-2xl border border-slate-200 bg-slate-50/90
        py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
        disabled:opacity-50 disabled:cursor-not-allowed
        transition duration-200
      `}
    />
  </div>
);

/*
  ── HOW TO USE InputField ──────────────────────────────────────────────────

  <InputField
    type="email"
    placeholder="you@company.com"
    autoFocus={true}
    id="company_email"
    size={6}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  Props:
  • type        — "text" | "email" | "password" | "number" | "tel" | ...  (default: "text")
  • placeholder — placeholder string
  • autoFocus   — true | false  (default: false)
  • id          — html id attribute (used to link with <Label>)
  • size        — 1–12 grid columns  (default: 12)
  • value       — controlled value
  • onChange    — change handler (e) => void
  • disabled    — true | false  (default: false)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 2. LABEL
// Props: text, htmlFor, size (1–12)
// ─────────────────────────────────────────────────────────────────────────────
export const Label = ({ text, htmlFor, size = 12 }) => (
  <div className={`${colSpan(size)}`}>
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
    >
      {text}
    </label>
  </div>
);

/*
  ── HOW TO USE Label ────────────────────────────────────────────────────────

  <Label
    text="Work Email"
    htmlFor="company_email"
    size={6}
  />

  Props:
  • text    — label display text
  • htmlFor — matches the InputField's id (for accessibility)
  • size    — 1–12 grid columns  (default: 12)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 3. DATA FIELD  (Label + Input wrapped in a single slot)
// Props: label, id, type, placeholder, autoFocus, size, value, onChange, disabled
// ─────────────────────────────────────────────────────────────────────────────
export const DataField = ({
  label,
  id,
  type = "text",
  placeholder = "",
  autoFocus = false,
  size = 12,
  value,
  onChange,
  disabled = false,
}) => (
  <div className={`${colSpan(size)} flex flex-col gap-1.5`}>
    {label && (
      <label
        htmlFor={id}
        className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
      >
        {label}
      </label>
    )}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      autoFocus={autoFocus}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full rounded-2xl border border-slate-200 bg-slate-50/90
        py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
        disabled:opacity-50 disabled:cursor-not-allowed
        transition duration-200
      `}
    />
  </div>
);

/*
  ── HOW TO USE DataField ────────────────────────────────────────────────────

  <DataField
    label="Company Name"
    id="company_name"
    type="text"
    placeholder="Acme Corp"
    size={6}
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
  />

  Props:
  • label       — label text shown above the input
  • id          — html id (links label + input)
  • type        — input type  (default: "text")
  • placeholder — placeholder string
  • autoFocus   — true | false  (default: false)
  • size        — 1–12 grid columns  (default: 12)
  • value       — controlled value
  • onChange    — change handler (e) => void
  • disabled    — true | false  (default: false)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 4. BUTTON
// Props: text, link, onClick, size (1–12), variant, type, disabled
// ─────────────────────────────────────────────────────────────────────────────
export const Button = ({
  text = "Submit",
  link,
  onClick,
  size = 12,
  variant = "primary", // "primary" | "secondary" | "danger" | "ghost"
  type = "button",
  disabled = false,
}) => {
  const variantCls = {
    primary:
      "bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20 hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5",
    secondary:
      "bg-white text-[#2a465a] border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5",
    danger:
      "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-0.5",
    ghost: "bg-transparent text-[#2a465a] hover:bg-slate-100",
  };

  const cls = `
    w-full py-3.5 px-6 rounded-2xl font-bold text-sm
    transition duration-200 ease-out active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variantCls[variant] ?? variantCls.primary}
  `;

  if (link) {
    return (
      <div className={`${colSpan(size)}`}>
        <a
          href={link}
          className={`${cls.trim().replace(/\n/g, " ")} inline-flex justify-center`}
        >
          {text}
        </a>
      </div>
    );
  }

  return (
    <div className={`${colSpan(size)}`}>
      <button type={type} onClick={onClick} disabled={disabled} className={cls}>
        {text}
      </button>
    </div>
  );
};

/*
  ── HOW TO USE Button ───────────────────────────────────────────────────────

  // Regular action button
  <Button
    text="Sign in →"
    size={12}
    variant="primary"
    onClick={() => handleLogin()}
  />

  // Link button (renders as <a>)
  <Button
    text="Go to Dashboard"
    link="/dashboard"
    size={6}
    variant="secondary"
  />

  // Submit button inside a form
  <Button
    text="Create Account →"
    type="submit"
    size={12}
    variant="primary"
  />

  Props:
  • text     — button label
  • link     — if provided, renders an <a> tag with this href
  • onClick  — click handler () => void
  • size     — 1–12 grid columns  (default: 12)
  • variant  — "primary" | "secondary" | "danger" | "ghost"  (default: "primary")
  • type     — "button" | "submit" | "reset"  (default: "button")
  • disabled — true | false  (default: false)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 5. SELECT
// Props: id, size, value, onChange, children (Option components), disabled, placeholder
// ─────────────────────────────────────────────────────────────────────────────
export const Select = ({
  id,
  size = 12,
  value,
  onChange,
  children,
  disabled = false,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const options = React.Children.toArray(children).filter(React.isValidElement);
  const selectedOption = options.find(
    (option) => String(option.props.value) === String(value),
  );
  const selectedLabel = selectedOption
    ? (selectedOption.props.label ?? selectedOption.props.children)
    : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: optionValue } });
    }
  };

  return (
    <div className={`${colSpan(size)} relative`} ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        className={`
          w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-8 text-sm font-medium text-[#0f172a] text-left
          focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
          disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-between gap-2
        `}
      >
        <span
          className={`${selectedLabel ? "text-[#0f172a]" : "text-slate-400"}`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`${isOpen ? "rotate-180" : ""} transition-transform duration-200`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const optionValue = option.props.value;
              const optionLabel = option.props.label ?? option.props.children;
              const disabledOption = option.props.disabled;
              const selected = String(optionValue) === String(value);

              return (
                <li
                  key={String(optionValue)}
                  onClick={() => !disabledOption && handleSelect(optionValue)}
                  className={`
                    cursor-pointer px-4 py-3 text-sm text-[#0f172a] transition-colors duration-150
                    ${disabledOption ? "cursor-not-allowed text-slate-400" : "hover:bg-slate-100"}
                    ${selected ? "bg-slate-100 font-semibold" : ""}
                  `}
                >
                  {optionLabel}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export const SelectField = ({
  label,
  id,
  size = 12,
  value,
  onChange,
  disabled = false,
  placeholder = "Select an option",
  children,
}) => (
  <div className={`${colSpan(size)} flex flex-col gap-1.5`}>
    {label && (
      <label
        htmlFor={id}
        className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
      >
        {label}
      </label>
    )}
    <Select
      id={id}
      size={12}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
    >
      {children}
    </Select>
  </div>
);

/*
  ── HOW TO USE Select ───────────────────────────────────────────────────────

  <Select
    id="country_select"
    placeholder="Choose a country"
    size={6}
    value={country}
    onChange={(e) => setCountry(e.target.value)}
  >
    <Option value="in" label="India" />
    <Option value="us" label="United States" />
    <Option value="uk" label="United Kingdom" />
  </Select>

  Props:
  • id          — html id
  • size        — 1–12 grid columns  (default: 12)
  • value       — controlled value
  • onChange    — change handler (e) => void
  • children    — <Option> components
  • disabled    — true | false  (default: false)
  • placeholder — placeholder text shown when no value selected
*/

// ─────────────────────────────────────────────────────────────────────────────
// 6. OPTION
// Props: value, label, disabled
// (Used as children inside <Select>)
// ─────────────────────────────────────────────────────────────────────────────
export const Option = ({ value, label, disabled = false }) => (
  <option value={value} disabled={disabled}>
    {label}
  </option>
);

/*
  ── HOW TO USE Option ───────────────────────────────────────────────────────

  // Always used inside a <Select> component
  <Select id="role" size={4} value={role} onChange={(e) => setRole(e.target.value)}>
    <Option value="admin"   label="Administrator" />
    <Option value="manager" label="Manager" />
    <Option value="staff"   label="Staff" />
    <Option value="viewer"  label="Viewer (read-only)" disabled />
  </Select>

  Props:
  • value    — the value submitted when this option is selected
  • label    — display text for the option
  • disabled — true | false  (default: false)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 7. DATA TABLE
// Props: columns (Th array), rows (TD array), actions, size (1–12),
//        pageSize, searchable
// ─────────────────────────────────────────────────────────────────────────────
export const DataTable = ({
  columns = [], // [{ key: "name", label: "Name" }, ...]
  rows = [], // [{ name: "Alice", email: "..." }, ...]
  actions = [], // [{ label: "Edit", icon, onClick: (row) => void, variant? }]
  title,
  size = 12,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = true,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(
    () => Number(pageSize) || 10,
  );
  const [sortConfig, setSortConfig] = useState({
    key: columns?.[0]?.key || null,
    direction: "asc",
  });

  useEffect(() => {
    setCurrentPageSize(Number(pageSize) || 10);
    setPage(1);
  }, [pageSize]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filtered = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal, undefined, { numeric: true })
            : bVal.localeCompare(aVal, undefined, { numeric: true });
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, search, columns, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const paginated = filtered.slice(
    (page - 1) * currentPageSize,
    page * currentPageSize,
  );

  const actionVariantCls = {
    primary: "bg-[#2a465a] text-white hover:bg-[#1e3a52]",
    danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
    ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };

  return (
    <div
      className={`${colSpan(size)} flex bg-[#efefefb1] rounded-xl p-3 flex-col gap-3`}
    >
      {title ? (
        <Heading primaryText={title} secondaryText="Data table" size={12} />
      ) : null}

      {/* Search + page size */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {searchable ? (
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3 pl-10 pr-4 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Show
          </span>
          <Select
            value={currentPageSize}
            onChange={(e) => {
              setCurrentPageSize(Number(e.target.value));
              setPage(1);
            }}
            size={3}
          >
            {pageSizeOptions.map((option) => (
              <Option key={option} value={option} label={String(option)} />
            ))}
          </Select>
          <span className="text-xs text-slate-400">rows</span>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="data-table-scroll overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a] border-b border-[#2a465a]/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="group py-4 px-5 text-left text-xs font-black text-white uppercase tracking-[0.2em] whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors select-none"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    <ArrowUpDown
                      size={14}
                      className={`transition-all duration-200 ${sortConfig.key === col.key ? "opacity-100 text-[#38bdf8]" : "opacity-40 group-hover:opacity-100"}`}
                    />
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="py-4 px-5 text-left text-xs font-black text-white uppercase tracking-[0.2em]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="py-10 text-center text-slate-400 text-sm"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-100 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                  } hover:bg-blue-50/40`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="py-3.5 px-5 text-[#2a465a] font-medium whitespace-nowrap"
                    >
                      {row[col.key] ?? "—"}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        {actions.map((action, ai) => (
                          <button
                            key={ai}
                            type="button"
                            onClick={() => action.onClick(row)}
                            className={`
                              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                              transition duration-150 active:scale-95
                              ${actionVariantCls[action.variant ?? "ghost"]}
                            `}
                          >
                            {action.icon && (
                              <span className="w-3.5 h-3.5">{action.icon}</span>
                            )}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-medium">
          Showing{" "}
          <span className="text-[#2a465a] font-bold">
            {filtered.length === 0 ? 0 : (page - 1) * currentPageSize + 1}–
            {Math.min(page * currentPageSize, filtered.length)}
          </span>{" "}
          of <span className="text-[#2a465a] font-bold">{filtered.length}</span>{" "}
          records
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
            )
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-slate-300 text-xs"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                    p === page
                      ? "bg-[#2a465a] text-white shadow"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/*
  ── HOW TO USE DataTable ────────────────────────────────────────────────────

  const columns = [
    { key: "name",    label: "Name" },
    { key: "email",   label: "Email" },
    { key: "role",    label: "Role" },
    { key: "status",  label: "Status" },
  ];

  const rows = [
    { name: "Alice Johnson", email: "alice@acme.com", role: "Admin",   status: "Active" },
    { name: "Bob Smith",     email: "bob@acme.com",   role: "Manager", status: "Active" },
    { name: "Carol White",   email: "carol@acme.com", role: "Staff",   status: "Inactive" },
  ];

  const actions = [
    {
      label: "Edit",
      variant: "primary",      // "primary" | "danger" | "ghost"
      onClick: (row) => console.log("Edit", row),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => console.log("Delete", row),
    },
  ];

  <DataTable
    columns={columns}
    rows={rows}
    actions={actions}
    size={12}
    pageSize={10}
    searchable={true}
  />

  Props:
  • columns    — array of { key, label } defining table headers & data keys
  • rows       — array of data objects (keys must match column keys)
  • actions    — array of { label, variant, onClick, icon? } action buttons per row
  • size       — 1–12 grid columns  (default: 12)
  • pageSize   — rows per page  (default: 10)
  • searchable — show search bar  (default: true)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 8. HEADING
// Props: primaryText, secondaryText, size (1–12)
// ─────────────────────────────────────────────────────────────────────────────
export const Heading = ({
  primaryText = "",
  secondaryText = "",
  size = 12,
}) => (
  <div className={`${colSpan(size)}`}>
    <h2 className="text-2xl font-black tracking-tight leading-tight">
      <span className="text-[#2a465a]">{primaryText}</span>
      {secondaryText && (
        <span className="text-slate-400 font-extrabold"> {secondaryText}</span>
      )}
    </h2>
  </div>
);

/*
  ── HOW TO USE Heading ──────────────────────────────────────────────────────

  // Two-color heading (primary word + secondary/muted word)
  <Heading
    primaryText="Manage Customers."
    secondaryText="Empower Teams."
    size={12}
  />

  // Single-color heading (leave secondaryText empty)
  <Heading
    primaryText="Dashboard Overview"
    size={8}
  />

  Props:
  • primaryText   — main text rendered in navy (#2a465a)
  • secondaryText — secondary text rendered in slate-400 (muted)
  • size          — 1–12 grid columns  (default: 12)
*/

// ─────────────────────────────────────────────────────────────────────────────
// GRID WRAPPER  (convenience wrapper — use this to wrap all components)
// Props: children, cols (default 12), gap
// ─────────────────────────────────────────────────────────────────────────────
export const Grid = ({ children, cols = 12, gap = 4 }) => {
  const colsMap = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    6: "sm:grid-cols-6",
    12: "sm:grid-cols-12",
  };
  const gapMap = {
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
  };
  return (
    <div
      className={`grid grid-cols-1 ${colsMap[cols] ?? "sm:grid-cols-12"} ${gapMap[gap] ?? "gap-4"}`}
    >
      {children}
    </div>
  );
};

/*
  ── HOW TO USE Grid ─────────────────────────────────────────────────────────

  // Always wrap your GComponents inside a <Grid> so col-span works correctly.

  <Grid cols={12} gap={4}>
    <Heading primaryText="Add New Employee" secondaryText="Fill all fields below" size={12} />

    <DataField label="Full Name"    id="name"    size={6}  value={name}    onChange={(e) => setName(e.target.value)}    />
    <DataField label="Work Email"   id="email"   type="email" size={6}  value={email}   onChange={(e) => setEmail(e.target.value)}   />
    <DataField label="Phone Number" id="phone"   type="tel"   size={4}  value={phone}   onChange={(e) => setPhone(e.target.value)}   />

    <div className="col-span-4">
      <Label text="Department" htmlFor="dept" />
      <Select id="dept" value={dept} onChange={(e) => setDept(e.target.value)}>
        <Option value="engineering" label="Engineering" />
        <Option value="sales"       label="Sales" />
        <Option value="hr"          label="Human Resources" />
      </Select>
    </div>

    <DataField label="Office Address" id="address" size={4} value={address} onChange={(e) => setAddress(e.target.value)} />

    <Button text="Save Employee →" type="submit" size={4} variant="primary" />
    <Button text="Cancel"          size={2}      variant="secondary" link="/employees" />

    <DataTable
      columns={[{ key:"name", label:"Name" }, { key:"dept", label:"Dept" }]}
      rows={employees}
      actions={[
        { label:"Edit",   variant:"primary", onClick:(row) => handleEdit(row) },
        { label:"Remove", variant:"danger",  onClick:(row) => handleDelete(row) },
      ]}
      size={12}
      pageSize={5}
    />
  </Grid>
*/

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOKENS  (Graphura CRM dark palette)
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#e7e7e7b1", // card background
  bgDeep: "#f8fafc", // deeper background / icon bg
  bgInner: "#f1f5f9", // inner elements
  border: "#aeb0b477", // subtle border
  navy: "#2a465a", // primary accent (login brand color)
  blue: "#3b82f6", // chart blue
  teal: "#14b8a6", // chart teal
  green: "#22c55e", // positive trend
  amber: "#f59e0b", // chart amber
  rose: "#f43f5e", // negative trend / danger
  violet: "#8b5cf6", // chart violet
  sky: "#38bdf8", // chart sky
  textPrimary: "#0f172a", // light theme text
  textSecondary: "#475569", // medium text
  textMuted: "#64748b", // muted text
};

// 8 chart colours cycling
export const CHART_COLORS = [
  T.navy,
  T.blue,
  T.teal,
  T.amber,
  T.rose,
  T.violet,
  T.sky,
  T.green,
];

// ─────────────────────────────────────────────────────────────────────────────
// GRID HELPER
// ─────────────────────────────────────────────────────────────────────────────
const dashColSpan = (size = 12) => {
  const map = {
    1: "col-span-12 md:col-span-6 lg:col-span-1",
    2: "col-span-12 md:col-span-6 lg:col-span-2",
    3: "col-span-12 md:col-span-6 lg:col-span-3",
    4: "col-span-12 md:col-span-6 lg:col-span-4",
    5: "col-span-12 md:col-span-6 lg:col-span-5",
    6: "col-span-12 md:col-span-6 lg:col-span-6",
    7: "col-span-12 md:col-span-6 lg:col-span-7",
    8: "col-span-12 md:col-span-6 lg:col-span-8",
    9: "col-span-12 md:col-span-6 lg:col-span-9",
    10: "col-span-12 md:col-span-6 lg:col-span-10",
    11: "col-span-12 md:col-span-6 lg:col-span-11",
    12: "col-span-12 md:col-span-12 lg:col-span-12",
  };
  return map[size] ?? "col-span-12 md:col-span-12 lg:col-span-12";
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TOOLTIP STYLE
// ─────────────────────────────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    backgroundColor: T.bgDeep,
    border: `1px solid ${T.border}`,
    borderRadius: "12px",
    color: T.textPrimary,
    fontSize: "12px",
    fontWeight: 600,
    padding: "8px 14px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  itemStyle: { color: T.textPrimary },
  labelStyle: { color: T.textSecondary, marginBottom: 4 },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CHART WRAPPER (title bar + responsive container)
// ─────────────────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, size, height = 260, children }) => (
  <div
    className={`${dashColSpan(size)} rounded-2xl p-5 flex flex-col gap-4`}
    style={{
      background: T.bg,
      border: `1px solid ${T.border}`,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
    }}
  >
    <div>
      <p style={{ color: T.textPrimary, fontWeight: 700, fontSize: 15 }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>
          {subtitle}
        </p>
      )}
    </div>
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASH CARD
// Props: title, value, trend (+10% / -3% / 0%), trendLabel, icon, size, accentColor
// ─────────────────────────────────────────────────────────────────────────────
export const DashCard = ({
  title = "Total Employees",
  value = "0",
  icon,
  size = 4, // This will now act as the "Desktop" size
  accentColor = "#1e293b",
}) => {
  return (
    <div
      // Mobile: col-span-12 (Full width)
      // Tablet: col-span-6 (Half width)
      // Desktop: col-span-{size} (Your custom size)
      className={`col-span-12 md:col-span-6 lg:col-span-${size} rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px]`}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* ... rest of your existing component code ... */}
      <div
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: accentColor }}
      />

      {icon && (
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "#f8fafc",
            border: "1px solid #f1f5f9",
            color: accentColor,
          }}
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col justify-center">
        <h3
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "2px",
          }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            style={{
              color: "#0f172a",
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              lineHeight: "1",
            }}
          >
            {value}
          </span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: accentColor, opacity: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
};
/*
  ── HOW TO USE DashCard ─────────────────────────────────────────────────────

  import { Users } from "lucide-react";

  <DashCard
    title="Total Employees"
    value="313"
    icon={<Users size={22} />}
    accentColor="#3b82f6"
    size={3}
  />

  // Negative trend example
  <DashCard
    title="Churn Rate"
    value="4.2%"
    icon={<TrendingDown size={22} />}
    accentColor="#f43f5e"
    size={3}
  />

  Props:
  • title        — card label text
  • value        — big number/text displayed
  • icon         — any React node (Lucide icon recommended)
  • accentColor  — hex color for icon + glow  (default: "#3b82f6")
  • size         — 1–12 grid columns  (default: 3)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 2. LINE CHART
// Props: title, subtitle, data, lines ([{key, color}]), size, height
// ─────────────────────────────────────────────────────────────────────────────
export const GLineChart = ({
  title = "Line Chart",
  subtitle,
  data = [], // [{ name: "Jan", revenue: 4000, cost: 2400 }, ...]
  lines = [], // [{ key: "revenue", color: "#3b82f6", label: "Revenue" }]
  size = 6,
  height = 260,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
      <XAxis
        dataKey="name"
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip {...tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12, color: T.textSecondary }} />
      {lines.map((l, i) => (
        <Line
          key={l.key}
          type="monotone"
          dataKey={l.key}
          name={l.label ?? l.key}
          stroke={l.color ?? CHART_COLORS[i % CHART_COLORS.length]}
          strokeWidth={2.5}
          dot={{
            r: 4,
            fill: l.color ?? CHART_COLORS[i % CHART_COLORS.length],
            strokeWidth: 0,
          }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  </ChartCard>
);

/*
  ── HOW TO USE GLineChart ───────────────────────────────────────────────────

  const data = [
    { name: "Jan", revenue: 4000, cost: 2400 },
    { name: "Feb", revenue: 3000, cost: 1398 },
    { name: "Mar", revenue: 5000, cost: 3200 },
  ];

  <GLineChart
    title="Revenue vs Cost"
    subtitle="Monthly breakdown"
    data={data}
    lines={[
      { key: "revenue", label: "Revenue", color: "#3b82f6" },
      { key: "cost",    label: "Cost",    color: "#f43f5e" },
    ]}
    size={6}
    height={260}
  />

  Props:
  • title     — card title
  • subtitle  — small muted text below title
  • data      — array of objects; "name" key used for X axis
  • lines     — array of { key, label?, color? } — one per line
  • size      — 1–12 grid columns  (default: 6)
  • height    — chart height in px  (default: 260)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 3. BAR CHART  (horizontal bars)
// ─────────────────────────────────────────────────────────────────────────────
export const GBarChart = ({
  title = "Bar Chart",
  subtitle,
  data = [],
  bars = [], // [{ key, color, label }]
  size = 6,
  height = 260,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={T.border}
        horizontal={false}
      />
      <XAxis
        type="number"
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        dataKey="name"
        type="category"
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={70}
      />
      <Tooltip {...tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12, color: T.textSecondary }} />
      {bars.map((b, i) => (
        <Bar
          key={b.key}
          dataKey={b.key}
          name={b.label ?? b.key}
          fill={b.color ?? CHART_COLORS[i % CHART_COLORS.length]}
          radius={[0, 6, 6, 0]}
          barSize={14}
        />
      ))}
    </BarChart>
  </ChartCard>
);

/*
  ── HOW TO USE GBarChart ────────────────────────────────────────────────────

  const data = [
    { name: "Sales",   target: 120, achieved: 95 },
    { name: "Support", target: 80,  achieved: 78 },
    { name: "HR",      target: 40,  achieved: 42 },
  ];

  <GBarChart
    title="Department Performance"
    subtitle="Target vs Achieved"
    data={data}
    bars={[
      { key: "target",   label: "Target",   color: "#64748b" },
      { key: "achieved", label: "Achieved", color: "#3b82f6" },
    ]}
    size={6}
    height={260}
  />

  Props: same structure as GLineChart; bars replaces lines
*/

// ─────────────────────────────────────────────────────────────────────────────
// 4. COLUMN CHART  (vertical bars)
// ─────────────────────────────────────────────────────────────────────────────
export const GColumnChart = ({
  title = "Column Chart",
  subtitle,
  data = [],
  bars = [],
  size = 6,
  height = 260,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
      <XAxis
        dataKey="name"
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip {...tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12, color: T.textSecondary }} />
      {bars.map((b, i) => (
        <Bar
          key={b.key}
          dataKey={b.key}
          name={b.label ?? b.key}
          fill={b.color ?? CHART_COLORS[i % CHART_COLORS.length]}
          radius={[6, 6, 0, 0]}
          barSize={20}
        />
      ))}
    </BarChart>
  </ChartCard>
);

/*
  ── HOW TO USE GColumnChart ─────────────────────────────────────────────────

  const data = [
    { name: "Q1", leads: 400, closed: 240 },
    { name: "Q2", leads: 300, closed: 198 },
    { name: "Q3", leads: 600, closed: 380 },
    { name: "Q4", leads: 800, closed: 520 },
  ];

  <GColumnChart
    title="Leads vs Closed Deals"
    subtitle="Quarterly"
    data={data}
    bars={[
      { key: "leads",  label: "Leads",  color: "#8b5cf6" },
      { key: "closed", label: "Closed", color: "#22c55e" },
    ]}
    size={6}
    height={260}
  />
*/

// ─────────────────────────────────────────────────────────────────────────────
// 5. AREA CHART
// ─────────────────────────────────────────────────────────────────────────────
export const GAreaChart = ({
  title = "Area Chart",
  subtitle,
  data = [],
  areas = [], // [{ key, color, label }]
  size = 6,
  height = 260,
  stacked = false,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
      <defs>
        {areas.map((a, i) => {
          const color = a.color ?? CHART_COLORS[i % CHART_COLORS.length];
          return (
            <linearGradient
              key={a.key}
              id={`grad_${a.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          );
        })}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
      <XAxis
        dataKey="name"
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip {...tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12, color: T.textSecondary }} />
      {areas.map((a, i) => {
        const color = a.color ?? CHART_COLORS[i % CHART_COLORS.length];
        return (
          <Area
            key={a.key}
            type="monotone"
            dataKey={a.key}
            name={a.label ?? a.key}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#grad_${a.key})`}
            stackId={stacked ? "stack" : undefined}
          />
        );
      })}
    </AreaChart>
  </ChartCard>
);

/*
  ── HOW TO USE GAreaChart ───────────────────────────────────────────────────

  const data = [
    { name: "Jan", visits: 2400, signups: 400 },
    { name: "Feb", visits: 1398, signups: 210 },
    { name: "Mar", visits: 5800, signups: 890 },
  ];

  <GAreaChart
    title="Website Traffic"
    subtitle="Visits & Signups"
    data={data}
    areas={[
      { key: "visits",  label: "Visits",  color: "#38bdf8" },
      { key: "signups", label: "Signups", color: "#22c55e" },
    ]}
    stacked={false}
    size={6}
    height={260}
  />
*/

// ─────────────────────────────────────────────────────────────────────────────
// 6. DOUGHNUT CHART
// ─────────────────────────────────────────────────────────────────────────────
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.04) return null;
  const rad = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + rad * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + rad * Math.sin(-midAngle * (Math.PI / 180));
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const GDoughnutChart = ({
  title = "Doughnut Chart",
  subtitle,
  data = [], // [{ name: "Category A", value: 400 }]
  colors = CHART_COLORS,
  size = 4,
  height = 260,
  innerRadius = 60,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={innerRadius + 50}
        dataKey="value"
        labelLine={false}
        label={renderCustomLabel}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={colors[i % colors.length]} />
        ))}
      </Pie>
      <Tooltip {...tooltipStyle} />
      <Legend
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: 12, color: T.textSecondary }}
      />
    </PieChart>
  </ChartCard>
);

/*
  ── HOW TO USE GDoughnutChart ───────────────────────────────────────────────

  const data = [
    { name: "New",      value: 400 },
    { name: "Active",   value: 300 },
    { name: "Inactive", value: 150 },
    { name: "Churned",  value: 80  },
  ];

  <GDoughnutChart
    title="Customer Segments"
    subtitle="By status"
    data={data}
    colors={["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"]}
    innerRadius={60}
    size={4}
    height={280}
  />
*/

// ─────────────────────────────────────────────────────────────────────────────
// 7. PIE CHART
// ─────────────────────────────────────────────────────────────────────────────
export const GPieChart = ({
  title = "Pie Chart",
  subtitle,
  data = [],
  colors = CHART_COLORS,
  size = 4,
  height = 260,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
        labelLine={false}
        label={renderCustomLabel}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={colors[i % colors.length]} />
        ))}
      </Pie>
      <Tooltip {...tooltipStyle} />
      <Legend
        iconType="circle"
        iconSize={8}
        wrapperStyle={{ fontSize: 12, color: T.textSecondary }}
      />
    </PieChart>
  </ChartCard>
);

/*
  ── HOW TO USE GPieChart ────────────────────────────────────────────────────

  const data = [
    { name: "Direct",  value: 540 },
    { name: "Organic", value: 320 },
    { name: "Paid",    value: 210 },
    { name: "Referral",value: 130 },
  ];

  <GPieChart
    title="Traffic Sources"
    data={data}
    colors={["#3b82f6", "#14b8a6", "#f59e0b", "#8b5cf6"]}
    size={4}
    height={260}
  />
*/

// ─────────────────────────────────────────────────────────────────────────────
// 8. SPIDER / RADAR CHART
// ─────────────────────────────────────────────────────────────────────────────
export const GRadarChart = ({
  title = "Radar Chart",
  subtitle,
  data = [], // [{ subject: "Sales", A: 80, B: 60 }]
  radars = [], // [{ key: "A", label: "Team A", color: "#3b82f6" }]
  size = 4,
  height = 280,
}) => (
  <ChartCard title={title} subtitle={subtitle} size={size} height={height}>
    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
      <PolarGrid stroke={T.border} />
      <PolarAngleAxis
        dataKey="subject"
        tick={{ fill: T.textMuted, fontSize: 11 }}
      />
      <PolarRadiusAxis
        angle={30}
        tick={{ fill: T.textMuted, fontSize: 9 }}
        axisLine={false}
      />
      <Tooltip {...tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 12, color: T.textSecondary }} />
      {radars.map((r, i) => {
        const color = r.color ?? CHART_COLORS[i % CHART_COLORS.length];
        return (
          <Radar
            key={r.key}
            name={r.label ?? r.key}
            dataKey={r.key}
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        );
      })}
    </RadarChart>
  </ChartCard>
);

/*
  ── HOW TO USE GRadarChart (Spider / Radar) ─────────────────────────────────

  const data = [
    { subject: "Sales",    teamA: 80, teamB: 65 },
    { subject: "Support",  teamA: 90, teamB: 72 },
    { subject: "Dev",      teamA: 70, teamB: 85 },
    { subject: "Design",   teamA: 60, teamB: 78 },
    { subject: "Marketing",teamA: 85, teamB: 55 },
    { subject: "Finance",  teamA: 75, teamB: 90 },
  ];

  <GRadarChart
    title="Team Performance"
    subtitle="Skill comparison"
    data={data}
    radars={[
      { key: "teamA", label: "Team A", color: "#3b82f6" },
      { key: "teamB", label: "Team B", color: "#f43f5e" },
    ]}
    size={4}
    height={280}
  />
*/

// ─────────────────────────────────────────────────────────────────────────────
// GRID WRAPPER  (same as GComponents.jsx — include here for standalone use)
// ─────────────────────────────────────────────────────────────────────────────
export const DashGrid = ({ children, cols = 12, gap = 4 }) => {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
    12: "grid-cols-12",
  };
  const gapMap = { 2: "gap-2", 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6" };
  return (
    <div
      className={`grid ${colsMap[cols] ?? "grid-cols-12"} ${gapMap[gap] ?? "gap-4"}`}
    >
      {children}
    </div>
  );
};

/*
  ── FULL DASHBOARD EXAMPLE ──────────────────────────────────────────────────

  import {
    Users, Briefcase, TrendingUp, DollarSign
  } from "lucide-react";

  import {
    DashGrid, DashCard,
    GLineChart, GColumnChart, GBarChart,
    GAreaChart, GDoughnutChart, GPieChart, GRadarChart,
  } from "./GDashComponents";

  export default function Dashboard() {
    const monthlyData = [
      { name: "Jan", revenue: 4200, cost: 2100 },
      { name: "Feb", revenue: 3800, cost: 1900 },
      { name: "Mar", revenue: 5100, cost: 2600 },
      { name: "Apr", revenue: 4700, cost: 2300 },
    ];

    const segmentData = [
      { name: "New",      value: 400 },
      { name: "Active",   value: 300 },
      { name: "Inactive", value: 150 },
    ];

    return (
      <div className="p-6 bg-[#141c28] min-h-screen">
        <DashGrid cols={12} gap={4}>

          // ── Stat Cards ──
          <DashCard title="Total Employees" value="313"  trend="+10%" icon={<Users size={22}/>}       accentColor="#3b82f6" size={3} />
          <DashCard title="Open Deals"      value="87"   trend="+5%"  icon={<Briefcase size={22}/>}   accentColor="#14b8a6" size={3} />
          <DashCard title="Revenue"         value="$92K" trend="+18%" icon={<DollarSign size={22}/>}  accentColor="#22c55e" size={3} />
          <DashCard title="Churn Rate"      value="3.1%" trend="-1%"  icon={<TrendingUp size={22}/>}  accentColor="#f43f5e" size={3} />

          // ── Charts ──
          <GLineChart   title="Revenue vs Cost"     data={monthlyData} lines={[{key:"revenue",color:"#3b82f6"},{key:"cost",color:"#f43f5e"}]} size={6} />
          <GColumnChart title="Leads by Quarter"    data={monthlyData} bars={[{key:"revenue",color:"#8b5cf6"}]} size={6} />
          <GAreaChart   title="Traffic Overview"    data={monthlyData} areas={[{key:"revenue",color:"#38bdf8"}]} size={6} />
          <GBarChart    title="Dept. Performance"   data={monthlyData} bars={[{key:"revenue",color:"#f59e0b"},{key:"cost",color:"#3b82f6"}]} size={6} />
          <GDoughnutChart title="Customer Segments" data={segmentData} size={4} />
          <GPieChart      title="Traffic Sources"   data={segmentData} size={4} />
          <GRadarChart    title="Team Skills"       data={[{subject:"Sales",a:80,b:60}]} radars={[{key:"a",color:"#3b82f6"},{key:"b",color:"#f43f5e"}]} size={4} />

        </DashGrid>
      </div>
    );
  }
*/
