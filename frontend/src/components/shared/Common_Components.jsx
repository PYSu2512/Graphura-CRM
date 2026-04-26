/**
 * LineNumber Line
---------- ----
        // Priyanshu's Components
        93   ── HOW TO USE InputField ──────────────────────────────────────────────────
       132   ── HOW TO USE Label ────────────────────────────────────────────────────────
       190   ── HOW TO USE DataField ────────────────────────────────────────────────────
       267   ── HOW TO USE Button ───────────────────────────────────────────────────────
       433   ── HOW TO USE SelectField ──────────────────────────────────────────────────
       461   ── HOW TO USE Select ───────────────────────────────────────────────────────
       500   ── HOW TO USE Option ───────────────────────────────────────────────────────
      1416   ── HOW TO USE DataTable ────────────────────────────────────────────────────
      1568   ── HOW TO USE Heading ──────────────────────────────────────────────────────
      1618   ── HOW TO USE HeadingForDataTable ──────────────────────────────────────────
      1668   ── HOW TO USE Grid ─────────────────────────────────────────────────────────
      2056   ── HOW TO USE DashCard ─────────────────────────────────────────────────────
      2136   ── HOW TO USE GLineChart ─────────────────────────────────────────────────── 
      2228   ── HOW TO USE GBarChart ────────────────────────────────────────────────────
      2306   ── HOW TO USE GColumnChart ─────────────────────────────────────────────────
      2409   ── HOW TO USE GAreaChart ───────────────────────────────────────────────────
      2513   ── HOW TO USE GDoughnutChart ───────────────────────────────────────────────
      2586   ── HOW TO USE GPieChart ────────────────────────────────────────────────────
      2663   ── HOW TO USE GRadarChart (Spider / Radar) ─────────────────────────────────
      2723   ── HOW TO USE DashGrid ─────────────────────────────────────────────────────
      2911   ── HOW TO USE Modal ────────────────────────────────────────────────────────
      2975   ── HOW TO USE ModalData ────────────────────────────────────────────────────
      3028   ── HOW TO USE ModalProfile ─────────────────────────────────────────────────
      3089   ── HOW TO USE ModalGrid ────────────────────────────────────────────────────
      3134   ── HOW TO USE P ────────────────────────────────────────────────────────────
      3210   ── HOW TO USE ToggleButton ──────────────────────────────────────────────────

      // Kartik Yadav's Components
      3347   ── HOW TO USE EnhancedDashCard ─────────────────────────────────────────────
      3469   ── HOW TO USE EnhancedModal ────────────────────────────────────────────────
      3680   ── HOW TO USE EnhancedDataTable ────────────────────────────────────────────
      3774   ── HOW TO USE PanelModal ───────────────────────────────────────────────────
 */



import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  X,
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
  readOnly = false,
  className = "",
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
      readOnly={readOnly}
      className={`
        w-full rounded-2xl border border-slate-200 bg-slate-50/90
        py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
        disabled:opacity-50 disabled:cursor-not-allowed
        transition duration-200
        ${className}
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
  • readOnly    — true | false  (default: false)
  • className   — custom classes
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
  readOnly = false,
  className = "",
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
      readOnly={readOnly}
      className={`
        w-full rounded-2xl border border-slate-200 bg-slate-50/90
        py-3.5 px-4 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
        disabled:opacity-50 disabled:cursor-not-allowed
        transition duration-200
        ${className}
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
      "bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20 hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 shiny-sweep",
    secondary:
      "bg-white text-[#355872] border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5",
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
// Note: The dropdown list renders via createPortal into document.body so it is
//       never clipped by ancestor overflow or CSS transform contexts.
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
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        className={`
          w-full min-h-[52px] rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-4 text-sm font-medium text-[#0f172a] text-left
          focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
          disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-between gap-2
        `}
      >
        <span
          className={`min-w-0 flex-1 truncate ${selectedLabel ? "text-[#0f172a]" : "text-slate-400"}`}
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
  ── HOW TO USE SelectField ──────────────────────────────────────────────────

  // SelectField = Label + Select in a single slot (same as DataField but for dropdowns)
  <SelectField
    label="Department"
    id="dept"
    size={6}
    placeholder="Choose a department"
    value={dept}
    onChange={(e) => setDept(e.target.value)}
  >
    <Option value="engineering" label="Engineering" />
    <Option value="sales"       label="Sales" />
    <Option value="hr"          label="Human Resources" />
  </SelectField>

  Props:
  • label       — label text shown above the select
  • id          — html id (links label + select)
  • size        — 1–12 grid columns  (default: 12)
  • value       — controlled value
  • onChange    — change handler (e) => void
  • disabled    — true | false  (default: false)
  • placeholder — placeholder text when no value selected  (default: "Select an option")
  • children    — <Option> components
*/

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
  • placeholder — placeholder text shown when no value selected  (default: "Select an option")

  Note: The dropdown list renders via createPortal into document.body so it is
        never clipped by ancestor overflow or CSS transform contexts.
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
// Props: columns, rows, actions, title, size (1–12), pageSize, pageSizeOptions,
//        searchable, filters, date, filterSize, onDateFilter, bulkAction, bulkActions
//
// filters — array of filter definition objects shown in the Filter modal:
//   { title, type?, key?, options?, fn? }
//   type: "text" (default) | "toggle" | "select"
//   key:  row field to filter on (used when fn is omitted)
//   options: required for "toggle" and "select" types — array of string values
//   fn:  (row, value) => boolean — custom filter function (overrides key+type)
//
// date — true | false  (default: false)
//   true  → shows From / To date pickers in the Filter modal
//           Filters rows where row.date falls within the selected range.
//   false → hides date range pickers entirely
//
// onDateFilter — true | false  (default: false)
//   true  → shows a single date picker in the toolbar (between search bar and
//            filter button). Filters rows where row.date matches the selected
//            date (YYYY-MM-DD comparison, time is ignored).
//
// filterSize — controls the max-width of the Filter modal
//   "sm" | "md" | "lg" | "xl" (default) | "2xl"
//
// bulkAction — true | false  (default: false)
//   true → adds a checkbox column; when rows are selected a bulk action bar
//           appears below the table.
//
// bulkActions — array of { title, icon?, onClick: (selectedRows) => void }
//   Buttons shown in the bulk action bar when bulkAction={true} and rows are selected.
//
// actions — array of { label?, icon?, tooltip?, variant?, onClick: (row) => void }
//   Per-row action buttons in the Actions column.
//   If icon is provided and label is omitted → renders as a square icon-only button
//   with an optional tooltip on hover.
// ─────────────────────────────────────────────────────────────────────────────
// 7. DATA TABLE
// Props: columns, rows, actions, title, size (1–12), pageSize, pageSizeOptions,
//        searchable, filters, date, filterSize, onDateFilter, bulkAction, bulkActions
//
// filters — array of filter definition objects shown in the Filter modal:
//   { title, type?, key?, options?, fn? }
//   type: "text" (default) | "toggle" | "select"
//   key:  row field to filter on (used when fn is omitted)
//   options: required for "toggle" and "select" types — array of string values
//   fn:  (row, value) => boolean — custom filter function (overrides key+type)
//
// date — true | false  (default: false)
//   true  → shows From / To date pickers in the Filter modal
//           Filters rows where row.date falls within the selected range.
//   false → hides date range pickers entirely
//
// onDateFilter — true | false  (default: false)
//   true  → shows a single date picker in the toolbar (between search bar and
//            filter button). Filters rows where row.date matches the selected
//            date (YYYY-MM-DD comparison, time is ignored).
//
// filterSize — controls the max-width of the Filter modal
//   "sm" | "md" | "lg" | "xl" (default) | "2xl"
//
// bulkAction — true | false  (default: false)
//   true → adds a checkbox column; when rows are selected a bulk action bar
//           appears below the table.
//
// bulkActions — array of { title, icon?, onClick: (selectedRows) => void }
//   Buttons shown in the bulk action bar when bulkAction={true} and rows are selected.
//
// actions — array of { label?, icon?, tooltip?, variant?, onClick: (row) => void }
//   Per-row action buttons in the Actions column.
//   If icon is provided and label is omitted → renders as a square icon-only button
//   with an optional tooltip on hover.
// ─────────────────────────────────────────────────────────────────────────────
export const DataTable = ({
  columns = [],        // [{ key: "name", label: "Name" }, ...]
  rows = [],           // [{ name: "Alice", email: "..." }, ...]
  actions = [],        // [{ label?, icon?, tooltip?, variant?, onClick: (row) => void }]
  title,
  size = 12,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = true,
  // filters — pass an array of filter definitions; each filter shows as a
  // labeled text input inside the Filter modal. Example:
  //   filters={[
  //     { title: "Status", fn: (row, value) => row.status === value },
  //     { title: "Role",   fn: (row, value) => row.role.toLowerCase().includes(value.toLowerCase()) },
  //   ]}
  filters = [],
  // date — true | false  (default false)
  // true  → shows From / To date pickers in the filter modal
  // false → hides date range pickers
  date = false,
  // filterSize — controls the width of the filter modal
  // "sm" | "md" (default) | "lg" | "xl" | "2xl"
  filterSize = "xl",
  // onDateFilter — true | false (default false)
  // true → shows a single date picker between the search bar and filter button
  //        Filters rows where row.date matches the selected date (YYYY-MM-DD)
  onDateFilter = false,
  // bulkAction — true | false (default false)
  // true → adds a checkbox column; when rows are selected a bulk action bar
  //         appears below the table.
  // bulkActions — array of { title, icon, onClick: (selectedRows) => void }
  bulkAction = false,
  bulkActions = [],
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(
    () => Number(pageSize) || 5,
  );
  const [sortConfig, setSortConfig] = useState({
    key: columns?.[0]?.key || null,
    direction: "asc",
  });

  // ── Filter modal state ──────────────────────────────────────────────────────
  const [filterModalOpen, setFilterModalOpen]   = useState(false);
  const [filterModalShow, setFilterModalShow]   = useState(false);
  const [filterModalRender, setFilterModalRender] = useState(false);
  const filterCloseTimerRef = useRef(null);

  // filterValues holds the current live input value per filter title
  // For "toggle" type: value is an array of selected labels []
  // For "select" type: value is a single string ""
  // For "text"   type: value is a single string ""
  const [filterValues, setFilterValues] = useState(
    () => Object.fromEntries(
      filters.map((f) => [f.title, f.type === "toggle" ? [] : ""])
    ),
  );
  const [appliedFilters, setAppliedFilters] = useState(
    () => Object.fromEntries(
      filters.map((f) => [f.title, f.type === "toggle" ? [] : ""])
    ),
  );

  // Resolve fn: if caller omits fn, auto-generate from key + type
  const resolvedFilters = useMemo(() =>
    filters.map((f) => {
      if (f.fn) return f;
      const key = f.key;
      if (f.type === "toggle") {
        return { ...f, fn: (row, selected) => selected.includes(row[key]) };
      }
      if (f.type === "select") {
        return { ...f, fn: (row, value) => row[key] === value };
      }
      // text (default)
      return { ...f, fn: (row, value) => String(row[key] ?? "").toLowerCase().includes(value.toLowerCase()) };
    }),
  [filters]);

  // Date range state (only used when date !== "off")
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo,   setAppliedDateTo]   = useState("");

  // Single date filter (toolbar date picker — onDateFilter={true})
  const [singleDate, setSingleDate] = useState("");

  // Bulk selection state — stores indices into `filtered` (not `paginated`)
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Count how many filters are currently active (non-empty)
  const activeFilterCount = useMemo(() => {
    const customActive = Object.values(appliedFilters).filter((v) =>
      Array.isArray(v) ? v.length > 0 : v.trim() !== ""
    ).length;
    const dateActive =
      date === true ? (appliedDateFrom ? 1 : 0) + (appliedDateTo ? 1 : 0) : 0;
    return customActive + dateActive;
  }, [appliedFilters, appliedDateFrom, appliedDateTo, date]);

  // Open / close filter modal with animation
  const openFilterModal = () => {
    if (filterCloseTimerRef.current) clearTimeout(filterCloseTimerRef.current);
    setFilterModalRender(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setFilterModalShow(true)));
    setFilterModalOpen(true);
  };
  const closeFilterModal = () => {
    setFilterModalShow(false);
    filterCloseTimerRef.current = setTimeout(() => {
      setFilterModalRender(false);
      setFilterModalOpen(false);
    }, 260);
  };

  // Cancel any pending filter-close timer on unmount
  useEffect(() => () => {
    if (filterCloseTimerRef.current) clearTimeout(filterCloseTimerRef.current);
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterValues });
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setPage(1);
    closeFilterModal();
  };

  const handleClearFilters = () => {
    const cleared = Object.fromEntries(
      filters.map((f) => [f.title, f.type === "toggle" ? [] : ""])
    );
    setFilterValues(cleared);
    setAppliedFilters(cleared);
    setDateFrom("");
    setDateTo("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setPage(1);
  };

  useEffect(() => {
    setCurrentPageSize(Number(pageSize) || 10);
    setPage(1);
  }, [pageSize]);

  const handleSort = (key) => {
    const column = columns.find((col) => col.key === key);
    if (column?.sortable === false) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filtered = useMemo(() => {
    let result = rows;

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(getSearchValue(row, col) ?? "")
            .toLowerCase()
            .includes(q),
        ),
      );
    }

    // Custom filters (only applied ones, not live input values)
    resolvedFilters.forEach((f) => {
      const val = appliedFilters[f.title];
      const isEmpty = Array.isArray(val) ? val.length === 0 : val.trim() === "";
      if (!isEmpty) {
        result = result.filter((row) => f.fn(row, val));
      }
    });

    // Date range filter (only when date={true})
    if (date === true) {
      if (appliedDateFrom) {
        const from = new Date(appliedDateFrom);
        result = result.filter((row) => {
          const rowDate = row.date ? new Date(row.date) : null;
          return rowDate && rowDate >= from;
        });
      }
      if (appliedDateTo) {
        // Include the full "To" day by setting time to end of day
        const to = new Date(appliedDateTo);
        to.setHours(23, 59, 59, 999);
        result = result.filter((row) => {
          const rowDate = row.date ? new Date(row.date) : null;
          return rowDate && rowDate <= to;
        });
      }
    }

    // Single date toolbar filter (onDateFilter={true})
    if (onDateFilter && singleDate) {
      result = result.filter((row) => {
        if (!row.date) return false;
        // Compare only the date part (YYYY-MM-DD) so time doesn't matter
        return String(row.date).slice(0, 10) === singleDate;
      });
    }

    if (sortConfig.key) {
      const activeColumn = columns.find((col) => col.key === sortConfig.key);
      if (!activeColumn) return result;

      result = [...result].sort((a, b) => {
        const aVal = getSortValue(a, activeColumn) ?? "";
        const bVal = getSortValue(b, activeColumn) ?? "";

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
  }, [rows, search, columns, sortConfig, appliedFilters, appliedDateFrom, appliedDateTo, resolvedFilters, date, singleDate, onDateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const paginated = filtered.slice(
    (page - 1) * currentPageSize,
    page * currentPageSize,
  );
  const missingRows =
    paginated.length > 0 ? Math.max(0, currentPageSize - paginated.length) : 0;
  const fillerRowHeight = 57;

  const actionVariantCls = {
    primary: "bg-[#2a465a] text-white hover:bg-[#1e3a52]",
    danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
    ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };

  const showFilterButton = filters.length > 0 || date === true;

  // ── Bulk selection helpers ────────────────────────────────────────────────
  // We key rows by their index in `filtered` so selection survives pagination.
  const paginatedIndices = paginated.map((_, i) => (page - 1) * currentPageSize + i);
  const allPageSelected  = paginatedIndices.length > 0 && paginatedIndices.every((idx) => selectedRows.has(idx));
  const someSelected     = selectedRows.size > 0;

  const toggleRow = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAllPage = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginatedIndices.forEach((idx) => next.delete(idx));
      } else {
        paginatedIndices.forEach((idx) => next.add(idx));
      }
      return next;
    });
  };

  const selectedRowData = [...selectedRows].map((idx) => filtered[idx]).filter(Boolean);

  return (
    <div
      className={`${colSpan(size)} flex bg-[#efefefb1] rounded-xl p-5 flex-col gap-3`}
    >
      {title ? (
        <HeadingForDataTable primaryText={title} secondaryText="Data table" size={12} />
      ) : null}

      {/* Search + date picker + page size + filter button */}
      {!hideTopBar && (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Single date picker — shown only when onDateFilter={true} */}
        {onDateFilter && (
          <div className="relative flex items-center gap-1.5">
            <input
              type="date"
              value={singleDate}
              onChange={(e) => { setSingleDate(e.target.value); setPage(1); }}
              className="rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition cursor-pointer"
            />
          </div>
        )}

        <div className="flex items-center gap-2 whitespace-nowrap">
          {/* Filter button — only shown when filters array is provided or date is "on" */}
          {showFilterButton && (
            <button
              type="button"
              onClick={openFilterModal}
              className="relative flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-[#2a465a] hover:bg-slate-50 transition"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
              {/* Badge showing count of active filters */}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#2a465a] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

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
      )}

      {/* ── Filter Modal — rendered via portal into document.body so it is
           always fixed to the true viewport and never moves with page scroll,
           regardless of any CSS transform or overflow on ancestor elements. ── */}
      {filterModalRender && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-260 ease-in-out ${
              filterModalShow ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeFilterModal}
          />
          {/* Dialog */}
          <div
            className={`relative w-full ${{ sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl" }[filterSize] ?? "max-w-md"} bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-260 ease-out transform ${
              filterModalShow
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#2a465a]">Filters</h3>
              <button
                onClick={closeFilterModal}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-5">
              {/* Date Range — shown only when date={true} */}
              {date === true && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
                    Date Range
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        From
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        To
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        min={dateFrom || undefined}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom filters — toggle chips, select dropdown, or text input */}
              {filters.map((f) => (
                <div key={f.title} className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">
                    {f.title}
                  </label>

                  {/* ── TOGGLE: pill chips with circle checkbox ── */}
                  {f.type === "toggle" && (
                    <div className="flex flex-wrap gap-2">
                      {f.options.map((opt) => {
                        const selected = (filterValues[f.title] ?? []).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setFilterValues((prev) => {
                                const cur = prev[f.title] ?? [];
                                return {
                                  ...prev,
                                  [f.title]: selected
                                    ? cur.filter((v) => v !== opt)
                                    : [...cur, opt],
                                };
                              })
                            }
                            className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 select-none ${
                              selected
                                ? "border-[#2a465a] text-[#2a465a] bg-white"
                                : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                            }`}
                          >
                            {/* Circle indicator */}
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                              selected
                                ? "bg-[#2a465a] border-[#2a465a]"
                                : "bg-white border-slate-300"
                            }`}>
                              {selected && (
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ── SELECT: dropdown ── */}
                  {f.type === "select" && (
                    <select
                      value={filterValues[f.title] ?? ""}
                      onChange={(e) =>
                        setFilterValues((prev) => ({ ...prev, [f.title]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                    >
                      <option value="">All</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* ── TEXT: plain input (default) ── */}
                  {(!f.type || f.type === "text") && (
                    <input
                      type="text"
                      placeholder={`Filter by ${f.title}…`}
                      value={filterValues[f.title] ?? ""}
                      onChange={(e) =>
                        setFilterValues((prev) => ({ ...prev, [f.title]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 px-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear all
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeFilterModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-[#2a465a] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-4 py-2 rounded-xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Table wrapper */}
      <div className="data-table-scroll overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a] border-b border-[#2a465a]/10">
              {/* Bulk select — header checkbox */}
              {bulkAction && (
                <th className="py-4 pl-5 pr-2 w-10">
                  <button
                    type="button"
                    onClick={toggleAllPage}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                      allPageSelected
                        ? "bg-white border-white"
                        : "bg-transparent border-white/40 hover:border-white/80"
                    }`}
                  >
                    {allPageSelected && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#2a465a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {/* Indeterminate dash — some but not all on this page selected */}
                    {!allPageSelected && selectedRows.size > 0 && paginatedIndices.some(idx => selectedRows.has(idx)) && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6h7" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </th>
              )}
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
                <th style={{ width: "25%", minWidth: "25%", maxWidth: "25%" }} className="py-4 px-4 text-left text-xs font-black text-white uppercase tracking-[0.1em]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (bulkAction ? 1 : 0)}
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
                    isSelected
                      ? "bg-blue-50/70"
                      : i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                  } hover:bg-blue-50/40`}
                >
                  {/* Row checkbox */}
                  {bulkAction && (
                    <td className="py-3.5 pl-5 pr-2 w-10">
                      <button
                        type="button"
                        onClick={() => toggleRow(filteredIdx)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                          isSelected
                            ? "bg-[#2a465a] border-[#2a465a]"
                            : "bg-white border-slate-300 hover:border-[#2a465a]/60"
                        }`}
                      >
                        {isSelected && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((col) => {
                    if (col.key === "status") {
                      const val = row[col.key];
                      let statusBg = "bg-slate-100";
                      let statusText = "text-slate-600";
                      if (val === "Completed") {
                        statusBg = "bg-emerald-100";
                        statusText = "text-emerald-700";
                      } else if (val === "Pending" || val === "In Progress") {
                        statusBg = "bg-amber-100";
                        statusText = "text-amber-700";
                      } else if (val === "Failed" || val === "Cancelled") {
                        statusBg = "bg-rose-100";
                        statusText = "text-rose-700";
                      }
                      return (
                        <td
                          key={col.key}
                          className="py-3.5 px-5 whitespace-nowrap"
                        >
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${statusBg} ${statusText}`}
                          >
                            {val ?? "—"}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={col.key}
                        className="py-3.5 px-5 text-[#2a465a] font-medium whitespace-nowrap"
                      >
                        {row[col.key] ?? "—"}
                      </td>
                    );
                  })}
                  {actions.length > 0 && (
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-1.5">
                        {actions.map((action, ai) => {
                          const isIconOnly = action.icon && !action.label;
                          return (
                            <div key={ai} className="relative group/tip">
                              <button
                                type="button"
                                onClick={() => action.onClick(row)}
                                className={`
                                  flex items-center justify-center gap-1.5
                                  transition duration-150 active:scale-95
                                  ${isIconOnly
                                    ? `w-8 h-8 rounded-xl ${actionVariantCls[action.variant ?? "ghost"]}`
                                    : `px-3 py-1.5 rounded-xl text-xs font-bold ${actionVariantCls[action.variant ?? "ghost"]}`
                                  }
                                `}
                              >
                                {action.icon && (
                                  <span className={isIconOnly ? "w-4 h-4" : "w-3.5 h-3.5"}>
                                    {action.icon}
                                  </span>
                                )}
                                {action.label && (
                                  <span className="text-xs font-bold">{action.label}</span>
                                )}
                              </button>

                              {/* Tooltip — only shown when icon-only */}
                              {isIconOnly && action.tooltip && (
                                <div className="
                                  pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                  opacity-0 group-hover/tip:opacity-100
                                  translate-y-1 group-hover/tip:translate-y-0
                                  transition-all duration-150 ease-out
                                  z-50 whitespace-nowrap
                                ">
                                  <div className="bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg">
                                    {action.tooltip}
                                  </div>
                                  {/* Arrow */}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar — slides up when rows are selected */}
      {bulkAction && someSelected && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#2a465a] text-white shadow-lg">
          <span className="text-sm font-semibold whitespace-nowrap">
            {selectedRows.size} row{selectedRows.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {bulkActions.map((ba, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => ba.onClick(selectedRowData)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors duration-150 active:scale-95"
              >
                {ba.icon && <span className="w-3.5 h-3.5 flex-shrink-0">{ba.icon}</span>}
                {ba.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedRows(new Set())}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-semibold transition-colors duration-150"
            >
              <X size={13} />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!hidePagination && (
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
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${p === page
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
      )}
    </div>
  );
};

/*
  ── HOW TO USE DataTable ────────────────────────────────────────────────────

  const columns = [
    { key: "name",   label: "Name" },
    { key: "email",  label: "Email" },
    { key: "role",   label: "Role" },
    { key: "status", label: "Status" }, // 'status' key renders as a colored badge
    { key: "date",   label: "Date" },   // 'date' field used by date range / toolbar filters
  ];

  const rows = [
    { name: "Alice Johnson", email: "alice@acme.com", role: "Admin",   status: "Completed",  date: "2024-03-15" },
    { name: "Bob Smith",     email: "bob@acme.com",   role: "Manager", status: "In Progress", date: "2024-04-01" },
    { name: "Carol White",   email: "carol@acme.com", role: "Staff",   status: "Failed",      date: "2024-04-10" },
  ];

  // Icon-only actions with tooltips
  const actions = [
    {
      icon: <Pencil size={14} />,
      tooltip: "Edit",
      variant: "ghost",                 // "primary" | "danger" | "ghost"
      onClick: (row) => handleEdit(row),
    },
    {
      icon: <Trash2 size={14} />,
      tooltip: "Delete",
      variant: "danger",
      onClick: (row) => handleDelete(row),
    },
  ];

  // Label + icon actions (no tooltip needed)
  const actions = [
    { label: "Edit",   icon: <Pencil size={14} />, variant: "primary", onClick: (row) => handleEdit(row) },
    { label: "Delete",                              variant: "danger",  onClick: (row) => handleDelete(row) },
  ];

  // Full example with all filter types, date range, bulk actions, and toolbar date picker
  <DataTable
    columns={columns}
    rows={rows}
    actions={actions}
    title="All Users"
    size={12}
    pageSize={10}
    pageSizeOptions={[5, 10, 20, 50]}
    searchable={true}
    date={true}
    onDateFilter={true}
    filterSize="xl"
    filters={[
      // text filter (default) — uses key + substring match
      { title: "Role",   type: "text",   key: "role" },
      // toggle filter — renders pill chips; matches rows where row.status is in selected set
      { title: "Status", type: "toggle", key: "status", options: ["Completed", "In Progress", "Failed", "Cancelled"] },
      // select filter — renders a dropdown; exact match on row.role
      { title: "Dept",   type: "select", key: "dept",   options: ["Engineering", "Sales", "HR"] },
      // custom fn — overrides key+type entirely
      { title: "Senior", fn: (row, value) => value ? row.yearsExp >= 5 : true },
    ]}
    bulkAction={true}
    bulkActions={[
      { title: "Export",  icon: <Download size={13} />, onClick: (rows) => exportCSV(rows) },
      { title: "Archive", icon: <Archive size={13} />,  onClick: (rows) => archiveAll(rows) },
    ]}
  />

  Props:
  • columns          — array of { key, label }; key "status" renders a colored badge
  • rows             — array of data objects (keys must match column keys)
  • actions          — array of { label?, icon?, tooltip?, variant?, onClick }
                         label + icon → labeled button; icon only → square icon button with tooltip
                         variant: "primary" | "danger" | "ghost"  (default: "ghost")
  • title            — optional heading shown above the table
  • size             — 1–12 grid columns  (default: 12)
  • pageSize         — rows per page  (default: 5)
  • pageSizeOptions  — array of page-size choices  (default: [5, 10, 20, 50])
  • searchable       — show search bar  (default: true)
  • filters          — array of filter definitions shown in the Filter modal:
                         { title, type?, key?, options?, fn? }
                         type: "text" (default) | "toggle" | "select"
                         key:  row field to auto-filter on (used when fn is omitted)
                         options: required for "toggle" and "select" types
                         fn: (row, value) => boolean — custom filter (overrides key+type)
  • date             — true | false  (default: false)
                         true  → shows From / To date pickers in the Filter modal
                         false → hides date range pickers
  • onDateFilter     — true | false  (default: false)
                         true  → shows a single date picker in the toolbar
  • filterSize       — max-width of the Filter modal: "sm"|"md"|"lg"|"xl"|"2xl"  (default: "xl")
  • bulkAction       — true | false  (default: false) — enables row checkboxes + bulk bar
  • bulkActions      — array of { title, icon?, onClick: (selectedRows) => void }
*/

// ─────────────────────────────────────────────────────────────────────────────
// 8. HEADING
// Props: primaryText, secondaryText, size (1–12), fontSize, showAnimations
// ─────────────────────────────────────────────────────────────────────────────
export const Heading = ({
  primaryText = "",
  secondaryText = "",
  size = 12,
  fontSize = "2xl", // "sm" | "md" | "lg" | "xl" | "2xl" (default) | "3xl" | "4xl"
  showAnimations = true, // Added to toggle floating squares and wave drops
}) => {
  const fontSizeMap = {
    sm:  "text-sm",
    md:  "text-base",
    lg:  "text-lg",
    xl:  "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };
  const cls = fontSizeMap[fontSize] ?? "text-2xl";
  return (
    <div className={`${colSpan(size)} relative overflow-hidden rounded-2xl p-6 ${showAnimations ? 'bg-[#1e3445] shadow-md border border-[#152532]' : 'bg-transparent'}`}>
      {/* Optional Background 3D Wave Drops & Half Square */}
      {showAnimations && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Half Square / Polygon movement */}
          <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-gradient-to-br from-white to-transparent opacity-10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', animation: "halfSquareMove 12s ease-in-out infinite" }} />
          
          <div className="absolute top-[10%] left-[5%] w-40 h-40 bg-gradient-to-br from-[#3e8ca7] to-transparent blur-[40px] opacity-40" style={{ animation: "dropRipple1 8s ease-in-out infinite" }} />
          <div className="absolute top-[40%] left-[50%] w-56 h-56 bg-gradient-to-tr from-[#2a455a] to-[#3e8ca7] blur-[50px] opacity-30" style={{ animation: "dropRipple2 10s ease-in-out infinite" }} />
          <div className="absolute -top-[20%] right-[10%] w-32 h-32 bg-gradient-to-bl from-[#38bdf8] to-transparent blur-[30px] opacity-20" style={{ animation: "dropRipple3 7s ease-in-out infinite" }} />
        </div>
      )}

      <h2 className={`${cls} font-black tracking-tight leading-tight relative z-10 flex justify-between items-center`}>
        <div>
          <span className={showAnimations ? "text-white drop-shadow-sm" : "text-[#2a465a] drop-shadow-sm"}>{primaryText}</span>
          {secondaryText && (
            <span className={showAnimations ? "text-[#38bdf8] font-extrabold ml-2 opacity-90" : "text-slate-400 font-extrabold"}> {secondaryText}</span>
          )}
        </div>

        {/* Optional Top-Right Floating Squares */}
        {showAnimations && (
          <div className="relative w-10 h-10 mr-2">
            <div className="absolute inset-0 border-2 border-white/20 rounded-[8px] backdrop-blur-sm" style={{ animation: "squareOrbit1 6s linear infinite" }} />
            <div className="absolute inset-1 border-2 border-[#38bdf8]/40 rounded-[6px]" style={{ animation: "squareOrbit2 8s linear infinite" }} />
          </div>
        )}
      </h2>
      {!showAnimations && <hr className="mt-3 border-slate-200/60 relative z-10"/>}
    </div>
  );
};

/*
  ── HOW TO USE Heading ──────────────────────────────────────────────────────

  // Animated dark banner (default — showAnimations=true)
  <Heading
    primaryText="Manage Customers."
    secondaryText="Empower Teams."
    size={12}
  />

  // Plain heading without animations (transparent background, navy text)
  <Heading
    primaryText="Dashboard Overview"
    size={8}
    showAnimations={false}
  />

  // Smaller font size
  <Heading
    primaryText="Section Title"
    secondaryText="Details"
    size={12}
    fontSize="lg"
  />

  Props:
  • primaryText     — main text; white when showAnimations=true, navy (#2a465a) when false
  • secondaryText   — accent text; sky-blue (#38bdf8) when animated, slate-400 when not
  • size            — 1–12 grid columns  (default: 12)
  • fontSize        — "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"  (default: "2xl")
  • showAnimations  — true | false  (default: true)
                        true  → dark navy card with floating squares and wave-drop background
                        false → transparent background with a bottom border rule
*/

export const HeadingForDataTable = ({
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
  ── HOW TO USE HeadingForDataTable ──────────────────────────────────────────

  // Used internally by DataTable when a title prop is provided.
  // You can also use it standalone as a plain two-color heading without the
  // animated background that Heading uses.

  <HeadingForDataTable
    primaryText="All Users"
    secondaryText="Data table"
    size={12}
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
  bg: "#F7F8F0", // card background
  bgDeep: "#ffffff", // deeper background / icon bg
  bgInner: "#f1f5f9", // inner elements
  border: "#e2e8f0", // subtle border
  navy: "#355872", // primary accent (from palette)
  blue: "#7AAACE", // secondary blue (from palette)
  sky: "#9CD5FF", // light blue (from palette)
  teal: "#14b8a6", // chart teal
  green: "#10b981", // positive trend
  amber: "#f59e0b", // chart amber
  rose: "#f43f5e", // negative trend / danger
  violet: "#8b5cf6", // chart violet
  textPrimary: "#355872", // light theme text
  textSecondary: "#64748b", // medium text
  textMuted: "#94a3b8", // muted text
};

// 8 chart colours cycling
const CHART_COLORS = [
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
// ─────────────────────────────────────────────────────────────────────────────
// SHARED CHART WRAPPER (title bar + responsive container)
// ─────────────────────────────────────────────────────────────────────────────

// ChartFilter — renders a row of toggle buttons from a filters array
// filters: [{ label: "This Week", onClick: fn }, ...]
const ChartFilter = ({ filters }) => {
  const [active, setActive] = useState(filters?.[0]?.label ?? null);

  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {filters.map((f) => (
        <button
          key={f.label}
          type="button"
          onClick={() => {
            setActive(f.label);
            if (f.onClick) f.onClick(f.label);
          }}
          className={`shrink-0 px-3 py-1 text-[10px] sm:text-xs whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${
            active === f.label
              ? "bg-[#2a465a] text-white shadow-sm"
              : "bg-[#dde8ee] text-[#475569] hover:bg-[#c8d8e2]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

const ChartCard = ({
  title,
  subtitle,
  size,
  height = 260,
  filters,   // [{ label, onClick }] — omit or pass [] to hide filter bar
  // dataKey is a stable string/number that represents the current data slice.
  // ChartCard uses it to know WHEN the data actually changed so it can run
  // the fade-swap transition. Passing the raw `children` object as a dep
  // would fire on every parent render (new JSX object reference each time),
  // causing all charts to flash whenever any unrelated state updates.
  dataKey,
  children,
}) => {
  const [visible, setVisible] = useState(true);
  const [displayed, setDisplayed] = useState(children);
  const pendingRef = useRef(null);
  const timerRef  = useRef(null);
  // Track the previously rendered dataKey so we only animate on real changes.
  const prevDataKeyRef = useRef(dataKey);

  useEffect(() => {
    // Skip the transition if dataKey hasn't changed — this prevents all charts
    // from re-animating when an unrelated parent state update causes a re-render.
    if (prevDataKeyRef.current === dataKey) {
      // Data is the same; just keep the displayed content in sync without animation.
      setDisplayed(children);
      return;
    }
    prevDataKeyRef.current = dataKey;

    // Cancel any in-flight transition
    if (timerRef.current) clearTimeout(timerRef.current);

    // Fade out
    setVisible(false);
    pendingRef.current = children;

    timerRef.current = setTimeout(() => {
      // Swap data and fade back in
      setDisplayed(pendingRef.current);
      setVisible(true);
    }, 180);

    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]); // Only animate when dataKey changes, NOT on every children re-render

  return (
    <div
      className={`${dashColSpan(size)} rounded-2xl p-5 flex flex-col gap-4`}
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
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
        </div>
        {filters && filters.length > 0 && <ChartFilter filters={filters} />}
      </div>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 180ms ease, transform 180ms ease",
        }}
      >
        <ResponsiveContainer width="100%" height={height}>
          {displayed}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASH CARD
// Props: title, value, icon, size, accentColor
// Uses a ResizeObserver to auto-scale text and icon to fit the card width.
// Internal refs: titleRef, valueRef, containerRef, iconBoxRef, isRunningRef
// ─────────────────────────────────────────────────────────────────────────────
export const DashCard = ({
  title = "Total Employees",
  value = "0",
  icon,
  size = 4,
  accentColor = "#1e293b",
}) => {
  const titleRef     = useRef(null);
  const valueRef     = useRef(null);
  const containerRef = useRef(null);
  const iconBoxRef   = useRef(null);
  // Guard against ResizeObserver re-entrancy: our own DOM writes (padding, gap,
  // icon size) change the observed element's layout, which would re-fire the
  // observer and create an infinite loop. The flag breaks the cycle.
  const isRunningRef = useRef(false);

  const fitText = useCallback((el, maxPx, minPx) => {
    if (!el) return;
    el.style.fontSize = `${maxPx}px`;
    let fs = maxPx;
    while (el.scrollWidth > el.offsetWidth + 1 && fs > minPx) {
      fs -= 0.5;
      el.style.fontSize = `${fs}px`;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const run = () => {
      // Skip if we triggered this observation ourselves
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      const w = container.offsetWidth;

      // ── Responsive padding: 8px at 80px wide → 20px at 240px+ ──
      const pad = Math.round(Math.min(20, Math.max(8, (w / 240) * 20)));
      container.style.padding = `${pad}px`;

      // ── Responsive gap between icon and text ──
      const gap = Math.round(Math.min(16, Math.max(6, (w / 240) * 16)));
      container.style.gap = `${gap}px`;

      // ── Responsive icon box: 32px at 80px → 48px at 240px+ ──
      if (iconBoxRef.current) {
        const iconSz = Math.round(Math.min(48, Math.max(28, (w / 240) * 48)));
        iconBoxRef.current.style.width  = `${iconSz}px`;
        iconBoxRef.current.style.height = `${iconSz}px`;
        const svgSz = Math.round(Math.min(20, Math.max(12, (w / 240) * 20)));
        iconBoxRef.current.style.fontSize = `${svgSz}px`;
        const svgEl = iconBoxRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("width",  svgSz);
          svgEl.setAttribute("height", svgSz);
        }
      }

      // ── Fit title text ──
      fitText(titleRef.current, 12, 7);

      // ── Fit value text ──
      const vStr = String(value);
      const maxV = vStr.length > 12 ? 18 : vStr.length > 8 ? 22 : vStr.length > 6 ? 24 : 28;
      fitText(valueRef.current, maxV, 10);

      // Release the guard after the current microtask queue drains so any
      // layout recalculation triggered by our writes is already settled.
      Promise.resolve().then(() => { isRunningRef.current = false; });
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(container);
    return () => ro.disconnect();
  }, [value, fitText]);
  return (
    <div
      // Mobile: col-span-12 (Full width)
      // Tablet: col-span-6 (Half width)
      // Desktop: col-span-{size} (Your custom size)
      className={`col-span-12 md:col-span-6 lg:col-span-${size} rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px]`}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        padding: "20px",
        gap: "16px",
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-20"
        style={{ background: accentColor }}
      />

      {/* Icon box */}
      {icon && (
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
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
        <span
          ref={valueRef}
          className="whitespace-nowrap"
          style={{
            color: "#0f172a",
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.01em",
            lineHeight: "1",
            overflow: "visible",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};;
/*
  ── HOW TO USE DashCard ─────────────────────────────────────────────────────

  import { Users, TrendingDown } from "lucide-react";

  <DashCard
    title="Total Employees"
    value="313"
    icon={<Users size={22} />}
    accentColor="#3b82f6"
    size={3}
  />

  <DashCard
    title="Churn Rate"
    value="4.2%"
    icon={<TrendingDown size={22} />}
    accentColor="#f43f5e"
    size={3}
  />

  Props:
  • title       — card label text (auto-shrinks to fit via ResizeObserver)
  • value       — big number/text displayed (auto-shrinks to fit)
  • icon        — any React node (Lucide icon recommended)
  • accentColor — hex color for icon tint + background glow  (default: "#1e293b")
  • size        — 1–12 grid columns  (default: 4)
                    Responsive: always full-width on mobile, half-width on md, size cols on lg+
*/

// ─────────────────────────────────────────────────────────────────────────────
// 2. LINE CHART
// Props: title, subtitle, data, lines ([{key, color}]), size, height
// ─────────────────────────────────────────────────────────────────────────────
export const GLineChart = ({
  title = "Line Chart",
  subtitle,
  data = [],
  lines = [],
  size = 6,
  height = 260,
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
    <LineChart data={data} margin={{ top: 15, right: 30, left: 0, bottom: 10 }}>
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
    filters={[
      { label: "This Week",  onClick: (label) => loadWeekData() },
      { label: "This Month", onClick: (label) => loadMonthData() },
      { label: "This Year",  onClick: (label) => loadYearData() },
    ]}
  />

  Props:
  • title    — card title
  • subtitle — small muted text below title
  • data     — array of objects; "name" key used for X axis
  • lines    — array of { key, label?, color? } — one per line series
  • size     — 1–12 grid columns  (default: 6)
  • height   — chart height in px  (default: 260)
  • filters  — array of { label, onClick } filter toggle buttons shown above the chart
                 The first item is active by default. onClick receives the label string.
                 Omit or pass [] to hide the filter bar.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 3. BAR CHART  (horizontal bars)
// ─────────────────────────────────────────────────────────────────────────────
export const GBarChart = ({
  title = "Bar Chart",
  subtitle,
  data = [],
  bars = [],
  size = 6,
  height = 260,
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 15, right: 30, left: 10, bottom: 10 }}
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
    filters={[
      { label: "This Month", onClick: (label) => loadMonth() },
      { label: "This Year",  onClick: (label) => loadYear() },
    ]}
  />

  Props:
  • title    — card title
  • subtitle — small muted text below title
  • data     — array of objects; "name" key used for Y axis (category)
  • bars     — array of { key, label?, color? } — one per bar series
  • size     — 1–12 grid columns  (default: 6)
  • height   — chart height in px  (default: 260)
  • filters  — array of { label, onClick } filter toggle buttons  (omit to hide)
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
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
    <BarChart data={data} margin={{ top: 15, right: 30, left: 0, bottom: 10 }}>
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
    filters={[
      { label: "This Quarter", onClick: (label) => loadQuarter() },
      { label: "This Year",    onClick: (label) => loadYear() },
    ]}
  />

  Props:
  • title    — card title
  • subtitle — small muted text below title
  • data     — array of objects; "name" key used for X axis
  • bars     — array of { key, label?, color? } — one per bar series
  • size     — 1–12 grid columns  (default: 6)
  • height   — chart height in px  (default: 260)
  • filters  — array of { label, onClick } filter toggle buttons  (omit to hide)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 5. AREA CHART
// ─────────────────────────────────────────────────────────────────────────────
export const GAreaChart = ({
  title = "Area Chart",
  subtitle,
  data = [],
  areas = [],
  size = 6,
  height = 260,
  stacked = false,
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
    <AreaChart data={data} margin={{ top: 15, right: 30, left: 0, bottom: 10 }}>
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
    filters={[
      { label: "This Week",  onClick: (label) => loadWeek() },
      { label: "This Month", onClick: (label) => loadMonth() },
    ]}
  />

  Props:
  • title    — card title
  • subtitle — small muted text below title
  • data     — array of objects; "name" key used for X axis
  • areas    — array of { key, label?, color? } — one per area series
  • stacked  — true | false  (default: false) — stack areas on top of each other
  • size     — 1–12 grid columns  (default: 6)
  • height   — chart height in px  (default: 260)
  • filters  — array of { label, onClick } filter toggle buttons  (omit to hide)
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
  data = [],
  colors = CHART_COLORS,
  size = 4,
  height = 260,
  innerRadius = 60,
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
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
    filters={[
      { label: "This Month", onClick: (label) => loadMonth() },
      { label: "This Year",  onClick: (label) => loadYear() },
    ]}
  />

  Props:
  • title       — card title
  • subtitle    — small muted text below title
  • data        — array of { name, value }
  • colors      — array of hex color strings  (default: CHART_COLORS)
  • innerRadius — inner hole radius in px  (default: 60)
  • size        — 1–12 grid columns  (default: 4)
  • height      — chart height in px  (default: 260)
  • filters     — array of { label, onClick } filter toggle buttons  (omit to hide)
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
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
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
    { name: "Direct",   value: 540 },
    { name: "Organic",  value: 320 },
    { name: "Paid",     value: 210 },
    { name: "Referral", value: 130 },
  ];

  <GPieChart
    title="Traffic Sources"
    data={data}
    colors={["#3b82f6", "#14b8a6", "#f59e0b", "#8b5cf6"]}
    size={4}
    height={260}
    filters={[
      { label: "This Month", onClick: (label) => loadMonth() },
      { label: "This Year",  onClick: (label) => loadYear() },
    ]}
  />

  Props:
  • title    — card title
  • subtitle — small muted text below title
  • data     — array of { name, value }
  • colors   — array of hex color strings  (default: CHART_COLORS)
  • size     — 1–12 grid columns  (default: 4)
  • height   — chart height in px  (default: 260)
  • filters  — array of { label, onClick } filter toggle buttons  (omit to hide)
*/

// ─────────────────────────────────────────────────────────────────────────────
// 8. SPIDER / RADAR CHART
// ─────────────────────────────────────────────────────────────────────────────
export const GRadarChart = ({
  title = "Radar Chart",
  subtitle,
  data = [],
  radars = [],
  size = 4,
  height = 280,
  filters,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
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
    { subject: "Sales",     teamA: 80, teamB: 65 },
    { subject: "Support",   teamA: 90, teamB: 72 },
    { subject: "Dev",       teamA: 70, teamB: 85 },
    { subject: "Design",    teamA: 60, teamB: 78 },
    { subject: "Marketing", teamA: 85, teamB: 55 },
    { subject: "Finance",   teamA: 75, teamB: 90 },
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
    filters={[
      { label: "This Quarter", onClick: (label) => loadQuarter() },
      { label: "This Year",    onClick: (label) => loadYear() },
    ]}
  />

  Props:
  • title    — card title
  • subtitle — small muted text below title
  • data     — array of objects; "subject" key used for axis labels
  • radars   — array of { key, label?, color? } — one per radar series
  • size     — 1–12 grid columns  (default: 4)
  • height   — chart height in px  (default: 280)
  • filters  — array of { label, onClick } filter toggle buttons  (omit to hide)
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
  ── HOW TO USE DashGrid ─────────────────────────────────────────────────────

  // Always wrap DashCard and chart components inside a <DashGrid>.
  // Unlike <Grid>, DashGrid does NOT add sm: breakpoint prefixes — it uses
  // plain grid-cols-N so the layout is always active (not mobile-first).

  <DashGrid cols={12} gap={4}>
    <DashCard title="Total Employees" value="313" icon={<Users size={22}/>} size={3} />
    <DashCard title="Open Deals"      value="87"  icon={<Briefcase size={22}/>} size={3} />
    <GLineChart title="Revenue" data={data} lines={[{key:"revenue",color:"#3b82f6"}]} size={6} />
    <GDoughnutChart title="Segments" data={segData} size={6} />
  </DashGrid>

  Props:
  • children — DashCard, GLineChart, GBarChart, etc.
  • cols     — total grid columns: 1 | 2 | 3 | 4 | 6 | 12  (default: 12)
  • gap      — gap between cells: 2 | 3 | 4 | 5 | 6  (default: 4)
*/

/*
  ── FULL DASHBOARD EXAMPLE ──────────────────────────────────────────────────

  import {
    Users, Briefcase, TrendingUp, DollarSign
  } from "lucide-react";

  // Import from the actual file — NOT from "./GDashComponents" (old/incorrect name)
  import {
    DashGrid, DashCard,
    GLineChart, GColumnChart, GBarChart,
    GAreaChart, GDoughnutChart, GPieChart, GRadarChart,
  } from "./Common_Components";

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

          // ── Stat Cards — DashCard has no trend prop; use icon + accentColor only ──
          <DashCard title="Total Employees" value="313"  icon={<Users size={22}/>}       accentColor="#3b82f6" size={3} />
          <DashCard title="Open Deals"      value="87"   icon={<Briefcase size={22}/>}   accentColor="#14b8a6" size={3} />
          <DashCard title="Revenue"         value="$92K" icon={<DollarSign size={22}/>}  accentColor="#22c55e" size={3} />
          <DashCard title="Churn Rate"      value="3.1%" icon={<TrendingUp size={22}/>}  accentColor="#f43f5e" size={3} />

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

// ─────────────────────────────────────────────────────────────────────────────
// 19. MODAL
// Props: id, title, children, size
// Note: Modal is rendered via React Portal into document.body — it is always
//       fixed to the true viewport and will never move with page scroll.
//       Use openModal(id) / closeModal(id) helper functions to show/hide it.
// ─────────────────────────────────────────────────────────────────────────────
export const openModal = (id) => {
  window.dispatchEvent(new CustomEvent("open-modal", { detail: { id } }));
};

export const closeModal = (id) => {
  window.dispatchEvent(new CustomEvent("close-modal", { detail: { id } }));
};

export const Modal = ({ id, title, children, size = "xl" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);

  // Size → max-width mapping
  // sm: 384px  md: 512px  lg: 672px  xl: 896px  2xl: 1152px (max)
  const sizeMap = {
    sm:  "max-w-sm",
    md:  "max-w-lg",
    lg:  "max-w-2xl",
    xl:  "max-w-4xl",
    "2xl": "max-w-5xl",
  };
  const maxW = sizeMap[size] ?? sizeMap.md;

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail.id === id) {
        setIsOpen(true);
      }
    };
    const handleClose = (e) => {
      if (!e.detail.id || e.detail.id === id) {
        setIsOpen(false);
      }
    };

    window.addEventListener("open-modal", handleOpen);
    window.addEventListener("close-modal", handleClose);

    return () => {
      window.removeEventListener("open-modal", handleOpen);
      window.removeEventListener("close-modal", handleClose);
    };
  }, [id]);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      // Double-rAF to ensure the element is painted before we trigger the
      // enter transition. We track the IDs so we can cancel on cleanup.
      let raf1, raf2;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShow(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setShow(false);
      const timer = setTimeout(() => setRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCloseClick = () => {
    setIsOpen(false);
  };

  if (!render) return null;

  // Rendered via portal into document.body so the modal is always anchored
  // to the true viewport — it will never scroll, shift, or be clipped by any
  // ancestor's overflow, transform, or position context.
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop — covers the entire screen regardless of scroll position */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${show ? "opacity-100" : "opacity-0"
          }`}
        onClick={handleCloseClick}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxW} bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out transform ${
          show
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
          }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#2a465a]">{title}</h3>
          <button
            onClick={handleCloseClick}
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>,
    document.body
  );
};

/*
  ── HOW TO USE Modal ────────────────────────────────────────────────────────

  import { Modal, Button, openModal, closeModal } from "./Common_Components";

  export default function MyPage() {
    return (
      <div>
        <Button text="Open Modal" onClick={() => openModal("new-user-modal")} />

        {/*
          The Modal renders via a React Portal directly into document.body,
          so it is ALWAYS fixed to the viewport — it will never scroll, shift,
          or be clipped by any ancestor's overflow or CSS transform.
          Place <Modal> anywhere in your JSX tree; position doesn't matter.
        *\/}
        <Modal id="new-user-modal" title="Create New User" size="md">
          <div className="space-y-4">
            <p className="text-slate-600">
              Please fill out the form below to add a new user to the system.
            </p>
            {"Your form or content here"}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost"   text="Cancel" onClick={() => closeModal("new-user-modal")} />
              <Button variant="primary" text="Save"   onClick={() => { alert("Saved"); closeModal("new-user-modal"); }} />
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  Props:
  • id       — unique string used to open/close this specific modal
  • title    — string shown in the modal header
  • children — any React content rendered in the scrollable modal body
  • size     — controls the max-width of the dialog  (default: "xl")
                 "sm"  → max-w-sm  (~384px)   — compact confirmations
                 "md"  → max-w-lg  (~512px)   — forms & info panels
                 "lg"  → max-w-2xl (~672px)   — wider forms
                 "xl"  → max-w-4xl (~896px)   — dashboards / rich content  (default)
                 "2xl" → max-w-5xl (~1152px)  — maximum width

  Functions:
  • openModal(id)  — dispatch a custom event to open the modal with the given id
  • closeModal(id) — dispatch a custom event to close the modal with the given id
*/

// ─────────────────────────────────────────────────────────────────────────────
// 20. MODAL DATA
// Props: label, value
// ─────────────────────────────────────────────────────────────────────────────
export const ModalData = ({ label, value }) => (
  <div>
    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
      {label}
    </span>
    <span className="text-[#2a465a] font-medium bg-slate-50 px-3 py-2 rounded-xl block border border-slate-100">
      {value}
    </span>
  </div>
);

/*
  ── HOW TO USE ModalData ────────────────────────────────────────────────────

  <ModalData label="Customer Name" value="Alice Johnson" />
*/

// ─────────────────────────────────────────────────────────────────────────────
// MODAL PROFILE
// Renders a styled profile card inside a modal.
// Initials are auto-generated from the first two words of name.
//
// Props:
//   name        — full name (required) — initials are auto-generated from first two words
//   subtitle    — e.g. "Senior Executive · Mumbai"
//   meta        — e.g. "Joined 2023-03-15"
//   avatarColor — background color of the initials circle  (default: "#2a465a")
// ─────────────────────────────────────────────────────────────────────────────
export const ModalProfile = ({
  name = "",
  subtitle = "",
  meta = "",
  avatarColor = "#2a465a",
}) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 select-none"
        style={{ background: avatarColor }}
      >
        {initials}
      </div>
      {/* Info */}
      <div className="min-w-0">
        <p className="text-lg font-bold text-[#2a465a] leading-tight truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
        )}
        {meta && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{meta}</p>
        )}
      </div>
    </div>
  );
};

/*
  ── HOW TO USE ModalProfile ─────────────────────────────────────────────────

  <ModalProfile
    name="Riya Sharma"
    subtitle="Senior Executive · Mumbai"
    meta="Joined 2023-03-15"
    avatarColor="#3b82f6"
  />

  Props:
  • name        — full name; initials are auto-generated from the first two words
  • subtitle    — secondary line (role, location, etc.)  (optional)
  • meta        — tertiary line (join date, ID, etc.)  (optional)
  • avatarColor — background color of the initials circle  (default: "#2a465a")
*/

// ─────────────────────────────────────────────────────────────────────────────
// MODAL GRID
// Groups a set of ModalData fields under a labelled section inside a modal.
// Visually separates sections with a title bar and a subtle card background.
// On mobile the grid always collapses to 1 column regardless of the cols prop.
//
// Props:
//   title    — section heading (e.g. "Contact", "Lead Stats")
//   cols     — number of columns in the inner grid: 1 | 2 | 3 (default: 2)
//              Mobile always uses 1 column; sm+ uses the requested cols value.
//   children — <ModalData> items
// ─────────────────────────────────────────────────────────────────────────────
export const ModalGrid = ({ title = "", cols = 2, children }) => {
  // Mobile always 1 col; sm+ uses the requested cols value
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
  };
  const gridCls = colsMap[cols] ?? "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      {/* Section title bar */}
      {title && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2a465a]/5 border-b border-slate-100">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3e8ca7] flex-shrink-0" />
          <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">
            {title}
          </p>
        </div>
      )}
      {/* Fields grid */}
      <div className={`grid ${gridCls} gap-px bg-slate-100`}>
        {React.Children.map(children, (child) =>
          child ? (
            <div className="bg-white p-3">{child}</div>
          ) : null
        )}
      </div>
    </div>
  );
};

/*
  ── HOW TO USE ModalGrid ────────────────────────────────────────────────────

  <ModalGrid title="Contact" cols={2}>
    <ModalData label="Phone" value="+91 98101 11001" />
    <ModalData label="Email" value="riya@crm.in" />
  </ModalGrid>

  <ModalGrid title="Lead Stats" cols={3}>
    <ModalData label="Total Leads"       value="148" />
    <ModalData label="Conversions"       value="42" />
    <ModalData label="Conv. Rate"        value="28.4%" />
    <ModalData label="Open Leads"        value="12" />
    <ModalData label="Follow-ups Done"   value="61" />
    <ModalData label="Follow-ups Missed" value="4" />
  </ModalGrid>

  Props:
  • title    — section label shown in the header bar (omit to hide the header)
  • cols     — 1 | 2 | 3  (default: 2)
                 Mobile always collapses to 1 column; sm+ uses the requested value.
  • children — <ModalData> components
*/

// ─────────────────────────────────────────────────────────────────────────────
// 21. PARAGRAPH
// Props: text, size
// ─────────────────────────────────────────────────────────────────────────────
export const P = ({ text, size = "sm" }) => {
  const sizeMap = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
  return (
    <p
      className={`text-slate-500 font-medium mt-1 ${sizeMap[size] || "text-sm"}`}
    >
      {text}
    </p>
  );
};

/*
  ── HOW TO USE P ────────────────────────────────────────────────────────────

  <P text="This is a muted paragraph used for descriptions or helper text." />

  <P text="Smaller helper text." size="xs" />

  Props:
  • text — the paragraph text to display
  • size — "xs" | "sm" | "base" | "lg" | "xl"  (default: "sm")
*/

// ─────────────────────────────────────────────────────────────────────────────
// 22. TOGGLE BUTTON  (ON / OFF switch)
// Props: checked, onChange, label, labelOff, size, disabled
// ─────────────────────────────────────────────────────────────────────────────
export const ToggleButton = ({
  // checked — boolean controlling whether the toggle is ON (true) or OFF (false)
  checked = false,
  // onChange — called with the new boolean value when the user clicks
  //   (newValue) => void
  onChange,
  // label — text shown next to the toggle when it is ON
  //   Leave empty to show no label text.
  label = "",
  // labelOff — text shown next to the toggle when it is OFF (falls back to label)
  labelOff,
  // size — "sm" | "md" | "lg"  (default: "md")
  size = "md",
  // disabled — when true the toggle is greyed out and non-interactive
  disabled = false,
}) => {
  const sizeMap = {
    sm: { track: "w-8 h-4",  thumb: "w-3 h-3",  translate: "translate-x-4",  text: "text-xs" },
    md: { track: "w-11 h-6", thumb: "w-4 h-4",  translate: "translate-x-5",  text: "text-sm" },
    lg: { track: "w-14 h-7", thumb: "w-5 h-5",  translate: "translate-x-7",  text: "text-base" },
  };
  const s = sizeMap[size] ?? sizeMap.md;
  const currentLabel = checked ? label : (labelOff ?? label);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`inline-flex items-center gap-2.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2a465a]/40 rounded-full
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Track */}
      <span
        className={`relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out
          ${s.track}
          ${checked ? "bg-[#2a465a]" : "bg-slate-300"}`}
      >
        {/* Thumb */}
        <span
          className={`inline-block rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-in-out
            absolute top-[2px] left-[2px]
            ${s.thumb}
            ${checked ? s.translate : "translate-x-0"}`}
        />
      </span>

      {/* Label */}
      {currentLabel && (
        <span className={`font-semibold ${s.text} ${checked ? "text-[#2a465a]" : "text-slate-400"} transition-colors duration-200`}>
          {currentLabel}
        </span>
      )}
    </button>
  );
};

/*
  ── HOW TO USE ToggleButton ──────────────────────────────────────────────────

  import { ToggleButton } from "./Common_Components";
  import { useState } from "react";

  // Basic controlled toggle
  const [isEnabled, setIsEnabled] = useState(false);

  <ToggleButton
    checked={isEnabled}
    onChange={(newValue) => setIsEnabled(newValue)}
    label="Enabled"
  />

  // Different ON and OFF labels
  <ToggleButton
    checked={isEnabled}
    onChange={setIsEnabled}
    label="Active"
    labelOff="Inactive"
  />

  // Small size, no label
  <ToggleButton
    checked={isEnabled}
    onChange={setIsEnabled}
    size="sm"
  />

  // Large, disabled
  <ToggleButton
    checked={true}
    onChange={setIsEnabled}
    label="Always On"
    size="lg"
    disabled={true}
  />

  Props:
  • checked   — boolean; true = ON, false = OFF  (controlled)
  • onChange  — (newValue: boolean) => void  — called with the toggled value on click
  • label     — text shown beside the toggle when ON (also used for OFF if labelOff omitted)
  • labelOff  — text shown beside the toggle when OFF (optional; falls back to label)
  • size      — "sm" | "md" | "lg"  (default: "md")
  • disabled  — true | false  (default: false) — greys out and blocks interaction
*/

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED COMPONENTS (V2)
// EnhancedDashCard — dark animated stat card with wave layers and mouse parallax
// EnhancedModal    — full-width (max-w-7xl) portal modal; event + prop control
// EnhancedDataTable — styled table with compact view + "Show More" expanded modal
// PanelModal       — compact (max-w-lg) portal modal with spring animation
// ─────────────────────────────────────────────────────────────────────────────

export const EnhancedDashCard = ({
  title = "Total Employees",
  value = "0",
  icon,
  size = 4,
  accentColor = "#ffffff",
}) => {
  const valueStr = String(value);
  let fontSize = "28px";
  if (valueStr.length > 12) fontSize = "18px";
  else if (valueStr.length > 8) fontSize = "22px";
  else if (valueStr.length > 6) fontSize = "24px";

  const map = { 1: "col-span-12 md:col-span-6 lg:col-span-1", 2: "col-span-12 md:col-span-6 lg:col-span-2", 3: "col-span-12 md:col-span-6 lg:col-span-3", 4: "col-span-12 md:col-span-6 lg:col-span-4", 5: "col-span-12 md:col-span-6 lg:col-span-5", 6: "col-span-12 md:col-span-6 lg:col-span-6", 12: "col-span-12" };
  const dashSpan = map[size] || "col-span-12 md:col-span-6 lg:col-span-4";

  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    el.style.setProperty("--wx1", `calc(-30% + ${mx * 0.3}%)`);
    el.style.setProperty("--wy1", `calc(-40% + ${my * 0.3}%)`);
    el.style.setProperty("--wx2", `calc(-20% + ${mx * 0.5}%)`);
    el.style.setProperty("--wy2", `calc(-30% + ${my * 0.5}%)`);
    el.style.setProperty("--wx3", `calc(-40% + ${mx * 0.7}%)`);
    el.style.setProperty("--wy3", `calc(-25% + ${my * 0.7}%)`);
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.removeProperty("--wx1");
    el.style.removeProperty("--wy1");
    el.style.removeProperty("--wx2");
    el.style.removeProperty("--wy2");
    el.style.removeProperty("--wx3");
    el.style.removeProperty("--wy3");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${dashSpan} wave-card silver-shiny-border rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.25)] group cursor-pointer bg-gradient-to-br from-[#243f55] to-[#32526b] text-white overflow-hidden relative`}
    >
      {/* 3 visible wave layers */}
      <div className="wave-layer wave-l1" />
      <div className="wave-layer wave-l2" />
      <div className="wave-layer wave-l3" />

      {icon && (
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg bg-white/10 border border-white/10 backdrop-blur-md z-10"
          style={{ color: accentColor }}
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col justify-center overflow-hidden w-full z-10 relative">
        <h3 className="truncate text-xs font-bold uppercase tracking-widest text-slate-300/80 mb-1" title={title}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="truncate drop-shadow-md font-black tracking-tighter transition-all duration-300 group-hover:text-white"
            style={{ fontSize, lineHeight: "1" }}
          >
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};

/*
  ── HOW TO USE EnhancedDashCard ─────────────────────────────────────────────

  // Dark-themed animated card with wave layers and mouse-parallax effect.
  // Use inside a <DashGrid> for dashboard stat rows.

  import { Users } from "lucide-react";

  <EnhancedDashCard
    title="Total Employees"
    value="313"
    icon={<Users size={22} />}
    accentColor="#38bdf8"
    size={3}
  />

  Props:
  • title       — card label text
  • value       — big number/text displayed
  • icon        — any React node (Lucide icon recommended)
  • accentColor — hex color for icon tint  (default: "#ffffff")
  • size        — 1–12 grid columns  (default: 4)
                    Responsive: full-width on mobile, half-width on md, size cols on lg+
*/

export const EnhancedModal = ({ id, title, children, isVisible, onClose }) => {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);

  const closeTimerRef = useRef(null);

  useEffect(() => {
    const handleOpen  = (e) => { if (e.detail.id === id) { setRender(true); } };
    const handleClose = (e) => {
      if (!e.detail.id || e.detail.id === id) {
        setShow(false);
        // Track timer so it can be cancelled on unmount
        closeTimerRef.current = setTimeout(() => setRender(false), 300);
      }
    };

    window.addEventListener("open-modal", handleOpen);
    window.addEventListener("close-modal", handleClose);

    if (isVisible !== undefined) {
      if (isVisible) {
        setRender(true);
      } else {
        setShow(false);
        closeTimerRef.current = setTimeout(() => setRender(false), 300);
      }
    }

    return () => {
      window.removeEventListener("open-modal", handleOpen);
      window.removeEventListener("close-modal", handleClose);
      // Cancel any pending close animation on cleanup
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [id, isVisible]);

  useEffect(() => {
    if (render) {
      document.body.style.overflow = "hidden";
      let raf1, raf2;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShow(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [render]);

  const handleCloseClick = () => {
    setShow(false);
    // Track so it can be cancelled if component unmounts before it fires
    closeTimerRef.current = setTimeout(() => {
      setRender(false);
      if (onClose) onClose();
      else closeModal(id);
    }, 300);
  };

  if (!render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${show ? "opacity-100" : "opacity-0"}`}
        onClick={handleCloseClick}
      />

      {/* Modal Content — centered, capped at 85vh so it never overflows */}
      <div
        className={`relative w-full max-w-7xl bg-white border border-slate-200/50 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out transform ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex-shrink-0">
          <h3 className="text-lg font-bold text-[#2a465a]">{title}</h3>
          <button
            onClick={handleCloseClick}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-rose-500 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

/*
  ── HOW TO USE EnhancedModal ────────────────────────────────────────────────

  // Full-width (max-w-7xl) modal with portal rendering and smooth animation.
  // Supports both event-based control (openModal/closeModal) and prop-based
  // control (isVisible + onClose).

  // Event-based (same as Modal):
  <Button text="Open" onClick={() => openModal("my-modal")} />
  <EnhancedModal id="my-modal" title="Details">
    <p>Content here</p>
  </EnhancedModal>

  // Prop-based (controlled):
  const [open, setOpen] = useState(false);
  <EnhancedModal isVisible={open} onClose={() => setOpen(false)} title="Details">
    <p>Content here</p>
  </EnhancedModal>

  Props:
  • id         — unique string for event-based open/close via openModal(id) / closeModal(id)
  • title      — string shown in the modal header
  • children   — any React content rendered in the scrollable modal body
  • isVisible  — boolean for prop-based control (optional; overrides event system)
  • onClose    — callback fired when the modal closes (optional)
*/

export const EnhancedDataTable = ({
  columns = [],
  rows = [],
  actions = [],
  title,
  size = 12,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = true,
  importantColumnsCount = 4,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(() => Number(pageSize) || 5);
  const [sortConfig, setSortConfig] = useState({ key: columns?.[0]?.key || null, direction: "asc" });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => { setCurrentPageSize(Number(pageSize) || 10); setPage(1); }, [pageSize]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const filtered = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(row => columns.some(col => String(row[col.key] ?? "").toLowerCase().includes(q)));
    }
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";
        if (typeof aVal === "string" && typeof bVal === "string") return sortConfig.direction === "asc" ? aVal.localeCompare(bVal, undefined, { numeric: true }) : bVal.localeCompare(aVal, undefined, { numeric: true });
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [rows, search, columns, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const paginated = filtered.slice((page - 1) * currentPageSize, page * currentPageSize);
  const colSpanClass = (s) => (s === 12 ? "col-span-12" : `col-span-12 sm:col-span-${s}`);

  const actionVariantCls = {
    primary: "bg-[#2a465a] text-white hover:bg-[#1e3a52] shiny-sweep",
    danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
    ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };

  const renderTableContent = (displayColumns) => (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm w-full table-trapezoid-corners relative z-10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a] border-b border-[#2a465a]/10">
            {displayColumns.map((col) => (
              <th key={col.key} onClick={() => handleSort(col.key)} className="group py-4 px-5 text-left text-xs font-black text-white uppercase tracking-[0.2em] whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors select-none">
                <div className="flex items-center gap-2">
                  {col.label}
                  <ArrowUpDown size={14} className={`transition-all duration-200 ${sortConfig.key === col.key ? "opacity-100 text-[#38bdf8]" : "opacity-40 group-hover:opacity-100"}`} />
                </div>
              </th>
            ))}
            {actions.length > 0 && <th className="py-4 px-5 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan={displayColumns.length + (actions.length > 0 ? 1 : 0)} className="py-10 text-center text-slate-400 text-sm">No records found.</td></tr>
          ) : (
            paginated.map((row, i) => (
              <tr key={i} className={`border-b border-slate-100 transition duration-300 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-[#38bdf8]/10`}>
                {displayColumns.map((col) => {
                  if (col.key === "status") {
                    const val = row[col.key];
                    let statusBg = "bg-slate-100 text-slate-600";
                    if (val === "Completed" || val === "Approved" || val === "Active" || val === "Won") statusBg = "bg-emerald-100 text-emerald-800";
                    else if (val === "Pending" || val === "In Progress" || val === "Interested" || val === "Proposal") statusBg = "bg-amber-100 text-amber-800";
                    else if (val === "Failed" || val === "Cancelled" || val === "Inactive" || val === "Lost" || val === "Rejected") statusBg = "bg-rose-100 text-rose-800";
                    return <td key={col.key} className="py-3.5 px-5 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBg}`}>{val ?? "—"}</span></td>;
                  }
                  return <td key={col.key} className={`py-3.5 px-5 text-[#1e3445] font-semibold ${isExpanded ? "whitespace-normal text-xs min-w-[120px]" : "whitespace-nowrap"}`}>{row[col.key] ?? "—"}</td>;
                })}
                {actions.length > 0 && (
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      {actions.map((action, ai) => (
                        <button key={ai} type="button" onClick={() => action.onClick(row)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition duration-150 active:scale-95 ${actionVariantCls[action.variant ?? "ghost"]}`}>
                          {action.icon && <span className="w-3.5 h-3.5">{action.icon}</span>}
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
  );

  return (
    <div className={`${colSpanClass(size)} flex bg-[#efefefb1] rounded-2xl p-4 flex-col gap-4 shadow-sm border border-slate-200/50 relative overflow-hidden`}>
      
      {/* Blue/Green Rotating Polygons Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
        {/* Top Right (near Show More) */}
        <div className="absolute -top-[50px] right-[5%] w-80 h-80 bg-gradient-to-br from-[#0ea5e9]/40 to-[#10b981]/20 blur-2xl" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', animation: 'trapezoidFloat1 20s linear infinite' }} />
        
        {/* Bottom Middle */}
        <div className="absolute -bottom-[80px] left-[35%] w-96 h-96 bg-gradient-to-bl from-[#34d399]/30 to-[#3b82f6]/20 blur-3xl" style={{ clipPath: 'polygon(0% 20%, 100% 0%, 80% 100%, 20% 100%)', animation: 'trapezoidFloat2 25s linear infinite reverse' }} />
      </div>

      {searchable && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <div className="flex-1 w-full max-w-xl mx-auto relative group flex items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-[#2a465a] transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-full border border-slate-200 bg-white shadow-sm py-3 pl-10 pr-4 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/30 focus:border-[#2a465a] transition duration-300"
              />
            </div>
            <button
              onClick={() => { setIsExpanded(true); window.dispatchEvent(new CustomEvent("expand-table")); }}
              className="flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-lg overflow-hidden relative group active:scale-95 transition-transform duration-200 bg-[#2a465a]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a52] to-[#2a465a]" />
              <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] rounded-[40%] bg-white/10 group-hover:rotate-[180deg] transition-all duration-[3000ms] pointer-events-none ease-linear" />
              <span className="relative z-10">Show More</span>
            </button>
          </div>
        </div>
      )}

      {renderTableContent(columns.slice(0, importantColumnsCount > 0 ? importantColumnsCount : columns.length))}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 mt-1">
        <p className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
          Showing <span className="text-[#2a465a] font-bold">{filtered.length === 0 ? 0 : (page - 1) * currentPageSize + 1}–{Math.min(page * currentPageSize, filtered.length)}</span> of <span className="text-[#2a465a] font-bold">{filtered.length}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-500 px-2">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#2a465a] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <EnhancedModal isVisible={isExpanded} onClose={() => { setIsExpanded(false); window.dispatchEvent(new CustomEvent("collapse-table")); }} id={`expanded-table-${title}`} title={title ? `${title} (Full Dataset)` : "Full Dataset"}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
            <div className="relative flex-1 w-full max-w-sm">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search across all fields..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20" />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">Total: {filtered.length}</span>
              <select value={currentPageSize} onChange={(e) => { setCurrentPageSize(Number(e.target.value)); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 cursor-pointer shadow-sm">
                {pageSizeOptions.map(opt => <option key={opt} value={opt}>Show {opt}</option>)}
              </select>
            </div>
          </div>
          {renderTableContent(columns)}
        </div>
      </EnhancedModal>
    </div>
  );
};

/*
  ── HOW TO USE EnhancedDataTable ────────────────────────────────────────────

  // A styled data table with a "Show More" button that opens an EnhancedModal
  // with the full dataset. By default only the first importantColumnsCount
  // columns are shown in the compact view; the modal shows all columns.

  const columns = [
    { key: "name",   label: "Name" },
    { key: "email",  label: "Email" },
    { key: "role",   label: "Role" },
    { key: "status", label: "Status" },
  ];

  const rows = [
    { name: "Alice", email: "alice@acme.com", role: "Admin",   status: "Active" },
    { name: "Bob",   email: "bob@acme.com",   role: "Manager", status: "Inactive" },
  ];

  <EnhancedDataTable
    title="Team Members"
    columns={columns}
    rows={rows}
    actions={[
      { label: "Edit",   variant: "primary", onClick: (row) => handleEdit(row) },
      { label: "Delete", variant: "danger",  onClick: (row) => handleDelete(row) },
    ]}
    size={12}
    pageSize={5}
    pageSizeOptions={[5, 10, 20, 50]}
    searchable={true}
    importantColumnsCount={4}
  />

  Props:
  • columns               — array of { key, label }; key "status" renders a colored badge
  • rows                  — array of data objects
  • actions               — array of { label?, icon?, variant?, onClick } per-row buttons
  • title                 — optional heading; also used as the expanded modal title
  • size                  — 1–12 grid columns  (default: 12)
  • pageSize              — rows per page  (default: 5)
  • pageSizeOptions       — page-size choices  (default: [5, 10, 20, 50])
  • searchable            — show search bar + "Show More" button  (default: true)
  • importantColumnsCount — number of columns shown in compact view  (default: 4)
                             0 or negative → show all columns in compact view
*/

export const PanelModal = ({ id, title, children, isVisible, onClose }) => {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => { if (e.detail.id === id) { setShow(true); setRender(true); } };
    const handleClose = (e) => { if (e.detail.id === id) { setShow(false); } };
    window.addEventListener("open-modal", handleOpen);
    window.addEventListener("close-modal", handleClose);
    return () => {
      window.removeEventListener("open-modal", handleOpen);
      window.removeEventListener("close-modal", handleClose);
    };
  }, [id]);

  useEffect(() => {
    if (isVisible) { setShow(true); setRender(true); }
    else { setShow(false); }
  }, [isVisible]);

  const handleAnimEnd = () => { if (!show) setRender(false); };
  const close = () => { setShow(false); if (onClose) onClose(); };

  if (!render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto px-4 py-6 sm:px-6">
      <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} onClick={close} />
      <div 
        onTransitionEnd={handleAnimEnd} 
        className={`relative w-full max-w-lg bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col max-h-[85vh] overflow-hidden transform transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) ${show ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-black text-[#2a465a] tracking-tight">{title}</h3>
          <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

/*
  ── HOW TO USE PanelModal ───────────────────────────────────────────────────

  // Compact centered panel modal (max-w-lg) with a spring-style open animation.
  // Supports both event-based control (openModal/closeModal) and prop-based
  // control (isVisible + onClose).

  // Event-based:
  <Button text="Open Panel" onClick={() => openModal("detail-panel")} />
  <PanelModal id="detail-panel" title="Quick Details">
    <p>Content here</p>
  </PanelModal>

  // Prop-based (controlled):
  const [open, setOpen] = useState(false);
  <PanelModal isVisible={open} onClose={() => setOpen(false)} title="Quick Details">
    <p>Content here</p>
  </PanelModal>

  Props:
  • id        — unique string for event-based open/close via openModal(id) / closeModal(id)
  • title     — string shown in the modal header
  • children  — any React content rendered in the scrollable modal body
  • isVisible — boolean for prop-based control (optional; overrides event system)
  • onClose   — callback fired when the modal closes (optional)
*/
