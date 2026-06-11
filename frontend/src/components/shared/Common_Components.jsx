/**
 * Common_Components.jsx — Shared UI Component Library
 * ─────────────────────────────────────────────────────────────────────────────
 * All reusable components for the CRM project live here.
 * Import only what you need:
 *   import { Button, DataTable, Modal } from "../../components/shared/Common_Components";
 *
 * ── COMPONENT INDEX (Line Numbers) ───────────────────────────────────────────
 *
 *  // ── Priyanshu's Components ──────────────────────────────────────────────
 *
 *  Line  122  InputField          — Styled text input with label + icon support
 *  Line  186  Label               — Standalone form label
 *  Line  235  DataField           — Full input field (text/textarea/date/etc.) with label
 *  Line  388  Button              — Action button (primary/secondary/danger/success/ghost)
 *  Line  495  Select              — Styled native select dropdown
 *  Line  654  SelectField         — Select with label wrapper
 *  Line  760  Option              — Option item for Select/SelectField
 *  Line  914  DataTable           — Full-featured sortable/filterable/exportable table
 *  Line 1995  Heading             — Section heading with primary + secondary text
 *  Line 2082  HeadingForDataTable — Compact heading for use inside DashGrid
 *  Line 2120  Grid                — 12-column CSS grid layout wrapper
 *  Line 2386  DashCard            — Animated KPI stat card
 *  Line 2568  GLineChart          — Line chart (Recharts wrapper)
 *  Line 2655  GBarChart           — Horizontal bar chart (Recharts wrapper)
 *  Line 2744  GColumnChart        — Vertical column/bar chart (Recharts wrapper)
 *  Line 2823  GAreaChart          — Area chart (Recharts wrapper)
 *  Line 2954  GDoughnutChart      — Doughnut chart (Recharts wrapper)
 *  Line 3029  GPieChart           — Pie chart (Recharts wrapper)
 *  Line 3099  GRadarChart         — Spider/Radar chart (Recharts wrapper)
 *  Line 3182  DashGrid            — 12-column grid for dashboard layouts
 *  Line 3281  openModal           — Imperative: open a Modal by id
 *  Line 3285  closeModal          — Imperative: close a Modal by id
 *  Line 3289  Modal               — Animated overlay modal dialog
 *  Line 3441  ModalData           — Label + value row inside a modal
 *  Line 3469  ModalProfile        — Avatar + name/subtitle/meta header for modals
 *  Line 3527  ModalGrid           — Titled grid section inside a modal
 *  Line 3587  P                   — Paragraph text with size variants
 *  Line 3620  ToggleButton        — Animated on/off toggle switch
 *
 *  // ── Kartik Yadav's Components ────────────────────────────────────────────
 *
 *  Line 3736  EnhancedDashCard    — Animated KPI card with wave background
 *
 *  // ── Shared Utilities ─────────────────────────────────────────────────────
 *
 *  Line 4380  UserChat            — Self-contained chat widget (messages + reply + image attach)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO USE comments are placed directly above each component's export.
 * ─────────────────────────────────────────────────────────────────────────────
 */



import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import UserAvatar from "./UserAvatar";
import DatePicker from "./DatePicker";
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
// 3. DATA FIELD  (Label + Input / Textarea wrapped in a single slot)
// Combines a label and input into one grid slot. Optionally displays a left icon.
// When type="textarea", renders a <textarea> instead of <input>.
//
// Props:
//   label       — label text shown above the input
//   id          — html id (links label + input)
//   type        — input type OR "textarea"  (default: "text")
//                 Any valid HTML input type works: "text" | "email" | "password" |
//                 "number" | "date" | "tel" | "url" | "textarea"
//   placeholder — placeholder string
//   autoFocus   — true | false  (default: false)
//   size        — 1–12 grid columns  (default: 12)
//   value       — controlled value
//   onChange    — change handler (e) => void
//   disabled    — true | false  (default: false)
//   readOnly    — true | false  (default: false)
//   className   — additional CSS classes for the input/textarea element
//   icon        — optional Lucide icon component (e.g., Mail, Lock) shown on the left
//                 Note: icon is not shown when type="textarea"
//   rows        — number of visible text rows for textarea  (default: 3)
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
  icon: Icon,
  rows = 3,
}) => {
  const sharedCls = `
    w-full rounded-2xl border border-slate-200 bg-slate-50/90
    text-[#2a465a] placeholder:text-slate-400 text-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
    disabled:opacity-50 disabled:cursor-not-allowed
    transition duration-200
    ${className}
  `;

  return (
    <div className={`${colSpan(size)} flex flex-col gap-1.5`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {/* Icon — only shown for non-textarea types */}
        {Icon && type !== "textarea" && (
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Icon size={18} />
          </div>
        )}

        {type === "textarea" ? (
          <textarea
            id={id}
            placeholder={placeholder}
            autoFocus={autoFocus}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={`${sharedCls} px-4 py-3.5 resize-y`}
          />
        ) : (
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            autoFocus={autoFocus}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            className={`${sharedCls} ${Icon ? "pl-12 pr-4" : "px-4"} py-3.5`}
          />
        )}
      </div>
    </div>
  );
};

/*
  ── HOW TO USE DataField ────────────────────────────────────────────────────

  Basic text input:
  <DataField
    label="Company Name"
    id="company_name"
    placeholder="Acme Corp"
    size={6}
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
  />

  With icon:
  import { Mail } from "lucide-react";
  <DataField
    label="Work Email"
    id="email"
    type="email"
    placeholder="you@company.com"
    icon={Mail}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    size={12}
  />

  Textarea (multi-line):
  <DataField
    label="Notes"
    id="notes"
    type="textarea"
    placeholder="Enter any additional notes..."
    rows={4}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    size={12}
  />

  Number input:
  <DataField
    label="Amount"
    id="amount"
    type="number"
    placeholder="0"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    size={6}
  />

  Read-only display field:
  <DataField
    label="Employee ID"
    id="emp_id"
    value="EMP-00123"
    readOnly
    size={6}
  />

  Props:
  • label       — label text shown above the input
  • id          — html id (links label + input)
  • type        — input type OR "textarea"  (default: "text")
                  Supports all HTML input types: "text" | "email" | "password" |
                  "number" | "date" | "tel" | "url" | "textarea"
  • placeholder — placeholder string
  • autoFocus   — true | false  (default: false)
  • size        — 1–12 grid columns  (default: 12)
  • value       — controlled value
  • onChange    — (e) => void
  • disabled    — true | false  (default: false)
  • readOnly    — true | false  (default: false)
  • className   — additional CSS classes for the input/textarea element
  • icon        — optional Lucide icon component (e.g., Mail, Lock, User)
                  Not shown when type="textarea"
  • rows        — visible row count for textarea  (default: 3)
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
  loading = false,
}) => {
  const variantCls = {
    primary:
      "bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20 hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] hover:shadow-xl hover:-translate-y-0.5 shiny-sweep",
    secondary:
      "bg-white text-[#2a465a] border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5",
    danger:
      "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-0.5",
    success:
      "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5",
    ghost: "bg-transparent text-[#2a465a] hover:bg-slate-100",
  };

  const cls = `
    w-full py-3.5 px-6 rounded-2xl font-bold text-sm
    transition duration-200 ease-out active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${variantCls[variant] ?? variantCls.primary}
    flex items-center justify-center gap-2
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
      <button 
        type={type} 
        onClick={(e) => {
          console.log(`[Button] Clicked: ${text}, Loading: ${loading}`);
          if (onClick) onClick(e);
        }} 
        disabled={disabled || loading} 
        className={cls}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
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
// A fully custom dropdown that replaces the native <select> element.
//
// Props:
//   id          — html id attribute on the trigger button
//   size        — 1–12 grid columns (default: 12)
//   value       — controlled selected value
//   onChange    — change handler called as (e) => void  where e.target.value is the chosen value
//   children    — one or more <Option> components
//   disabled    — disables the trigger button (default: false)
//   placeholder — text shown when no value is selected (default: "Select an option")
//   searchable  — shows a search input inside the dropdown to filter options (default: true)
//
// Notes:
//   • The dropdown list renders in-place (relative positioning). Wrap in a
//     container with overflow-visible if clipping is a concern.
//   • Keyboard: clicking outside or pressing Escape closes the dropdown.
//   • Search is case-insensitive and matches anywhere in the option label.
// ─────────────────────────────────────────────────────────────────────────────
export const Select = ({
  id,
  size = 12,
  value,
  onChange,
  children,
  disabled = false,
  placeholder = "Select an option",
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectRef = useRef(null);
  const searchRef = useRef(null);

  // Collect all valid <Option> children
  const options = React.Children.toArray(children).filter(React.isValidElement);

  // Derive the display label for the currently selected value
  const selectedOption = options.find(
    (opt) => String(opt.props.value) === String(value),
  );
  const selectedLabel = selectedOption
    ? (selectedOption.props.label ?? selectedOption.props.children)
    : "";

  // Filter options by the search query (only when searchable=true and query is non-empty)
  const visibleOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((opt) => {
      const label = String(opt.props.label ?? opt.props.children ?? "");
      return label.toLowerCase().includes(q);
    });
  }, [options, query, searchable]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus the search input when the dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (prev) setQuery(""); // clear search on close
      return !prev;
    });
  };

  const handleSelect = (optionValue) => {
    setIsOpen(false);
    setQuery("");
    if (onChange) onChange({ target: { value: optionValue } });
  };

  return (
    <div className={`${colSpan(size)} relative`} ref={selectRef}>

      {/* ── Trigger button ── */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`
          w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-4 text-sm font-medium
          text-left focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40
          disabled:opacity-50 disabled:cursor-not-allowed transition duration-200
          flex items-center justify-between gap-2
        `}
      >
        <span className={selectedLabel ? "text-[#0f172a]" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">

          {/* Search input — only rendered when searchable={true} */}
          {searchable && (
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
              <Search size={14} className="flex-shrink-0 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search options…"
                className="flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-slate-400 focus:outline-none"
              />
              {/* Clear search button — only visible when query is non-empty */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((opt) => {
                const optValue = opt.props.value;
                const optLabel = opt.props.label ?? opt.props.children;
                const optDisabled = opt.props.disabled;
                const isSelected = String(optValue) === String(value);

                return (
                  <li
                    key={String(optValue)}
                    onClick={() => !optDisabled && handleSelect(optValue)}
                    className={`
                      cursor-pointer px-4 py-2.5 text-sm text-[#0f172a] transition-colors duration-150
                      ${optDisabled ? "cursor-not-allowed text-slate-400" : "hover:bg-slate-50"}
                      ${isSelected ? "bg-slate-100 font-semibold" : ""}
                    `}
                  >
                    {optLabel}
                  </li>
                );
              })
            ) : (
              /* Empty state when search yields no results */
              <li className="px-4 py-4 text-center text-sm text-slate-400 select-none">
                No options found
              </li>
            )}
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
  searchable = true,
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
      searchable={searchable}
    >
      {children}
    </Select>
  </div>
);

/*
  ── HOW TO USE SelectField ──────────────────────────────────────────────────

  SelectField = Label + Select combined into a single grid slot.
  Identical to wrapping a <Select> inside a <DataField> but with less boilerplate.

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
  • onChange    — (e) => void
  • disabled    — true | false  (default: false)
  • placeholder — placeholder text when nothing is selected  (default: "Select an option")
  • searchable  — passed through to the inner <Select>  (default: true)
  • children    — <Option> components
*/

/*
  ── HOW TO USE Select ───────────────────────────────────────────────────────

  A fully custom styled dropdown. Renders an inline dropdown panel (not a
  native <select>) with an optional live-search input at the top.

  Basic usage:
  <Select
    id="country"
    size={6}
    placeholder="Choose a country"
    value={country}
    onChange={(e) => setCountry(e.target.value)}
  >
    <Option value="in" label="India" />
    <Option value="us" label="United States" />
    <Option value="uk" label="United Kingdom" />
  </Select>

  Disable search (e.g. for short lists):
  <Select searchable={false} value={val} onChange={...}>
    <Option value="yes" label="Yes" />
    <Option value="no"  label="No"  />
  </Select>

  Props:
  • id          — html id on the trigger button
  • size        — 1–12 grid columns  (default: 12)
  • value       — controlled selected value
  • onChange    — (e) => void  — e.target.value holds the chosen value
  • children    — <Option> components
  • disabled    — disables the entire control  (default: false)
  • placeholder — shown when nothing is selected  (default: "Select an option")
  • searchable  — shows a search input to filter options  (default: true)
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

// ── ActionButton — portal tooltip so it overlaps the table, never clipped ────
function ActionButton({ action, row, isIconOnly, actionVariantCls }) {
  const [tipPos, setTipPos] = useState(null);
  const btnRef = useRef(null);

  const isHidden = action.show && !action.show(row);
  const resolvedLabel = typeof action.label === "function" ? action.label(row) : action.label;
  const resolvedTooltip = typeof action.tooltip === "function" ? action.tooltip(row) : action.tooltip;

  if (isHidden) return null;

  const showTip = () => {
    if (!isIconOnly || !resolvedTooltip) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setTipPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
  };
  const hideTip = () => setTipPos(null);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => action.onClick(row)}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        className={`
          flex flex-nowrap items-center justify-center gap-1.5 flex-shrink-0
          transition duration-150 active:scale-95
          ${isIconOnly
            ? `w-8 h-8 rounded-xl ${actionVariantCls[action.variant ?? "ghost"]}`
            : `px-3 py-1.5 rounded-xl text-xs font-bold ${actionVariantCls[action.variant ?? "ghost"]}`
          }
        `}
      >
        {action.icon && <span className={isIconOnly ? "w-4 h-4" : "w-3.5 h-3.5"}>{action.icon}</span>}
        {resolvedLabel && <span className="text-xs font-bold">{resolvedLabel}</span>}
      </button>

      {/* Portal tooltip — fixed to viewport, never clipped by overflow */}
      {isIconOnly && resolvedTooltip && tipPos && createPortal(
        <div
          className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full"
          style={{ top: tipPos.top, left: tipPos.left }}
        >
          <div className="bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {resolvedTooltip}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
        </div>,
        document.body
      )}
    </div>
  );
}

export const DataTable = ({
  columns = [],        // [{ key: "name", label: "Name" }, ...]
  rows = [],           // [{ name: "Alice", email: "..." }, ...]
  actions = [],        // [{ label?, icon?, tooltip?, variant?, onClick: (row) => void }]
  title,
  size = 12,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = true,
  hideRecordSummary = false,
  hidePagination = false,
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
  // exportable — true | false (default false)
  // true → shows an Export CSV button in the toolbar.
  //        Exports ALL fields from every row in the `rows` prop (not just
  //        the columns shown in the table), so hidden fields are included.
  // exportFileName — custom filename for the downloaded CSV (default: "export")
  exportable = false,
  exportFileName = "export",
  // ellipse — optional word limit for cell text truncation (default: undefined = no truncation)
  // When set to a number, every non-status cell value is truncated to that many words
  // with "…" appended. Useful for long text columns like reason, description, notes.
  // Example: ellipse={3} → "Vacation trip with…"
  ellipse,
  // userProfile — key name of the column that should show a user avatar before the text.
  // The row must have a matching key for the name, and optionally a `photoUrl` field
  // for the actual photo. Clicking the avatar opens the photo in a new tab.
  // Example: userProfile="name"  → the "name" column gets an avatar prefix
  userProfile,
  onApplyFilters,      // (filters) => void
  defaultSortKey,
  defaultSortDir = "asc",
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(
    () => Number(pageSize) || 5,
  );
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey !== undefined ? defaultSortKey : (columns?.[0]?.key || null),
    direction: defaultSortDir,
  });

  // ── Filter modal state ──────────────────────────────────────────────────────
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterModalShow, setFilterModalShow] = useState(false);
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
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

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

    if (onApplyFilters) {
      const activeFilters = {};
      filters.forEach(f => {
        const val = filterValues[f.title];
        const isEmpty = Array.isArray(val) ? val.length === 0 : !val || val.trim() === "";
        if (!isEmpty) activeFilters[f.key || f.title] = val;
      });
      onApplyFilters({
        ...activeFilters,
        startDate: dateFrom,
        endDate: dateTo,
        search
      });
    }

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

    if (onApplyFilters) {
      onApplyFilters({ search }); // Reset but keep search
    }
  };

  useEffect(() => {
    setCurrentPageSize(Number(pageSize) || 10);
    setPage(1);
  }, [pageSize]);

  // Clear bulk selection whenever filters, search, or rows change
  useEffect(() => {
    setSelectedRows(new Set());
  }, [search, appliedFilters, appliedDateFrom, appliedDateTo, singleDate, rows]);

  const handleSort = (key) => {
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
        columns.some((col) => {
          const val = col.searchValue ? col.searchValue(row) : (row[col.key] ?? "");
          return String(val).toLowerCase().includes(q);
        }),
      );
    }

    // Custom filters (only applied ones, not live input values)
    resolvedFilters.forEach((f) => {
      const val = appliedFilters[f.title];
      const isEmpty = Array.isArray(val) ? val.length === 0 : !val || val.trim() === "";
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
      const sortCol = columns.find((c) => c.key === sortConfig.key);
      result = [...result].sort((a, b) => {
        const aVal = sortCol?.sortValue ? sortCol.sortValue(a) : (a[sortConfig.key] ?? "");
        const bVal = sortCol?.sortValue ? sortCol.sortValue(b) : (b[sortConfig.key] ?? "");

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

  const actionVariantCls = {
    primary: "bg-[#2a465a] text-white hover:bg-[#1e3a52]",
    danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    ghost: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };

  // ── CSV Export — exports only the currently filtered/visible rows
  const handleExport = () => {
    if (!filtered.length) return;

    // Collect every unique key across filtered rows (preserves insertion order)
    const allKeys = [...new Set(filtered.flatMap((r) => Object.keys(r)))];

    // Build header row using column labels where available, otherwise the raw key
    const keyToLabel = Object.fromEntries(columns.map((c) => [c.key, c.label]));
    const header = allKeys.map((k) => keyToLabel[k] ?? k);

    // Build data rows — stringify each cell, wrap in quotes if it contains comma/newline
    const escape = (val) => {
      let str = "";
      if (val == null) {
        str = "";
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === "object") {
          str = val.map(item => {
            if (item && item.title) {
              const costStr = item.cost ? ` (₹${Number(item.cost).toLocaleString("en-IN")})` : "";
              return `${item.title}${costStr}`;
            }
            return JSON.stringify(item);
          }).join(" | ");
        } else {
          str = val.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join(" | ");
        }
      } else if (typeof val === "object") {
        str = JSON.stringify(val);
      } else {
        str = String(val);
      }

      return str.includes(",") || str.includes("\n") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csvLines = [
      header.map(escape).join(","),
      ...filtered.map((row) => allKeys.map((k) => escape(row[k])).join(",")),
    ];

    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showFilterButton = filters.length > 0 || date === true;

  // ── Bulk selection helpers ────────────────────────────────────────────────
  // We key rows by their index in `filtered` so selection survives pagination.
  const paginatedIndices = paginated.map((_, i) => (page - 1) * currentPageSize + i);
  const allPageSelected = paginatedIndices.length > 0 && paginatedIndices.every((idx) => selectedRows.has(idx));
  const someSelected = selectedRows.size > 0;

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
      className={`${colSpan(size)} flex bg-[#efefefb1] rounded-xl p-3 flex-col gap-3`}
    >
      {title ? (
        <HeadingForDataTable primaryText={title} secondaryText="Data table" size={12} />
      ) : null}

      {/* Search + date picker + page size + filter button */}
      {/* Search + date picker + page size + filter button */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-between sm:gap-3">
        {/* Search — full width on mobile, flex-1 on desktop */}
        {searchable ? (
          <div className="relative w-full sm:flex-1">
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
          <div className="flex-1 min-w-0 sm:flex-none sm:w-48">
            <DatePicker
              value={singleDate}
              onChange={(val) => {
                setSingleDate(val);
                setPage(1);
                if (onApplyFilters) onApplyFilters({ startDate: val, endDate: val, search });
              }}
              placeholder="Filter by date"
            />
          </div>
        )}

        {/* Filter button + page size — flex-1 on mobile so it fills remaining space */}
        <div className="flex flex-1 items-center gap-2 whitespace-nowrap sm:flex-none">
          {/* Export CSV button — only shown when exportable={true} */}
          {exportable && (
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-[#2a465a] hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export all data as CSV"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          )}

          {/* Filter button — only shown when filters array is provided or date is "on" */}
          {showFilterButton && (
            <button
              type="button"
              onClick={openFilterModal}
              className="relative flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-[#2a465a] hover:bg-slate-50 transition"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
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

          {!hidePagination && (
            <>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Show
              </span>
              <Select
                value={currentPageSize}
                searchable={false}
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
            </>
          )}
        </div>
      </div>

      {/* ── Filter Modal — rendered via portal into document.body so it is
           always fixed to the true viewport and never moves with page scroll,
           regardless of any CSS transform or overflow on ancestor elements. ── */}
      {filterModalRender && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-260 ease-in-out ${filterModalShow ? "opacity-100" : "opacity-0"
              }`}
            onClick={closeFilterModal}
          />
          {/* Dialog */}
          <div
            className={`relative w-full ${{ sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl" }[filterSize] ?? "max-w-md"} bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-260 ease-out transform ${filterModalShow
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
                    <DatePicker
                      label="From"
                      value={dateFrom}
                      onChange={(val) => setDateFrom(val)}
                      placeholder="From date"
                      maxDate={dateTo || undefined}
                    />
                    <DatePicker
                      label="To"
                      value={dateTo}
                      onChange={(val) => setDateTo(val)}
                      placeholder="To date"
                      minDate={dateFrom || undefined}
                    />
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
                            className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 select-none ${selected
                              ? "border-[#2a465a] text-[#2a465a] bg-white"
                              : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                              }`}
                          >
                            {/* Circle indicator */}
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${selected
                              ? "bg-[#2a465a] border-[#2a465a]"
                              : "bg-white border-slate-300"
                              }`}>
                              {selected && (
                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
                    <Select
                      size={12}
                      value={filterValues[f.title] ?? ""}
                      onChange={(e) =>
                        setFilterValues((prev) => ({ ...prev, [f.title]: e.target.value }))
                      }
                      placeholder="All"
                    >
                      <Option value="" label="All" />
                      {f.options.map((opt) => (
                        <Option key={opt} value={opt} label={opt} />
                      ))}
                    </Select>
                  )}

                  {/* ── DATE: DatePicker ── */}
                  {f.type === "date" && (
                    <DatePicker
                      value={filterValues[f.title] ?? ""}
                      onChange={(val) =>
                        setFilterValues((prev) => ({ ...prev, [f.title]: val }))
                      }
                      placeholder={`Filter by ${f.title}…`}
                    />
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

      {/* Bulk action bar — shown above the table when rows are selected */}
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
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${allPageSelected
                      ? "bg-white border-white"
                      : "bg-transparent border-white/40 hover:border-white/80"
                      }`}
                  >
                    {allPageSelected && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#2a465a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {/* Indeterminate dash — some but not all on this page selected */}
                    {!allPageSelected && selectedRows.size > 0 && paginatedIndices.some(idx => selectedRows.has(idx)) && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6h7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : {}}
                  onClick={() => !col.headerNode && handleSort(col.key)}
                  className={`group py-4 px-4 text-[11px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap transition-colors select-none ${col.headerNode ? "" : "cursor-pointer hover:bg-white/5"} ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.headerNode ? (
                    col.headerNode
                  ) : (
                    <div className={`flex items-center gap-2 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start"}`}>
                      {col.label}
                      <ArrowUpDown
                        size={14}
                        className={`transition-all duration-200 ${sortConfig.key === col.key ? "opacity-100 text-[#38bdf8]" : "opacity-40 group-hover:opacity-100"}`}
                      />
                    </div>
                  )}
                </th>
              ))}
              {actions.length > 0 && (
                <th style={{ width: "1%", whiteSpace: "nowrap" }} className="py-4 px-4 text-left text-xs font-black text-white uppercase tracking-[0.1em]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
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
              paginated.map((row, i) => {
                const filteredIdx = (page - 1) * currentPageSize + i;
                const isSelected = selectedRows.has(filteredIdx);
                return (
                  <tr
                    key={i}
                    className={`border-b border-slate-100 transition ${isSelected
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
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${isSelected
                            ? "bg-[#2a465a] border-[#2a465a]"
                            : "bg-white border-slate-300 hover:border-[#2a465a]/60"
                            }`}
                        >
                          {isSelected && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => {
                      if (col.key === "status" || col.key === "priority" || col.key === "repeat" || col.key === "type") {
                        const val = row[col.key];
                        // ── Status → colour map ──────────────────────────────────────────
                        // Emerald — positive / completed / active / success
                        // Teal    — working / in-session / live
                        // Blue    — new / info / open / replied
                        // Purple  — prospect / qualified / interested
                        // Amber   — pending / in-progress / paused / warm / follow-up
                        // Slate   — neutral / not-respond / unassigned
                        // Rose    — failed / rejected / escalated / dump / overdue / inactive
                        const STATUS_MAP = {
                          // ── Emerald (positive / done / approved / won) ──
                          Completed: ["bg-emerald-100", "text-emerald-700"],
                          Converted: ["bg-emerald-100", "text-emerald-700"],
                          Done: ["bg-emerald-100", "text-emerald-700"],
                          done: ["bg-emerald-100", "text-emerald-700"],
                          Active: ["bg-emerald-100", "text-emerald-700"],
                          Approved: ["bg-emerald-100", "text-emerald-700"],
                          Won: ["bg-emerald-100", "text-emerald-700"],
                          Valid: ["bg-emerald-100", "text-emerald-700"],
                          Paid: ["bg-emerald-100", "text-emerald-700"],
                          Accepted: ["bg-emerald-100", "text-emerald-700"],
                          Resolved: ["bg-emerald-100", "text-emerald-700"],
                          Success: ["bg-emerald-100", "text-emerald-700"],
                          Successful: ["bg-emerald-100", "text-emerald-700"],
                          Closed: ["bg-emerald-100", "text-emerald-700"],
                          Present: ["bg-emerald-100", "text-emerald-700"],
                          Finalized: ["bg-emerald-100", "text-emerald-700"],
                          // ── Teal (live / working / clocked-in) ──
                          Working: ["bg-teal-100", "text-teal-700"],
                          "Clocked Out": ["bg-teal-100", "text-teal-700"],                          // ── Blue (new / info / open / replied / untouched / talk) ──
                          New: ["bg-blue-100", "text-blue-700"],
                          new: ["bg-blue-100", "text-blue-700"],
                          Cold: ["bg-blue-100", "text-blue-700"],
                          Open: ["bg-blue-100", "text-blue-700"],
                          Opened: ["bg-blue-100", "text-blue-700"],
                          Replied: ["bg-blue-100", "text-blue-700"],
                          Untouched: ["bg-blue-100", "text-blue-700"],
                          UNTOUCHED: ["bg-blue-100", "text-blue-700"],
                          Talk: ["bg-blue-100", "text-blue-700"],
                          Contacted: ["bg-blue-100", "text-blue-700"],
                          "Half Day": ["bg-blue-100", "text-blue-700"],
                          // ── Purple (prospect / qualified / interested) ──
                          Prospect: ["bg-purple-100", "text-purple-700"],
                          Qualified: ["bg-purple-100", "text-purple-700"],
                          Interested: ["bg-purple-100", "text-purple-700"],
                          // ── Amber (pending / in-progress / paused / warm / follow-up / late) ──
                          "In Progress": ["bg-amber-100", "text-amber-700"],
                          Pending: ["bg-amber-100", "text-amber-700"],
                          pending: ["bg-amber-100", "text-amber-700"],
                          "Follow-up": ["bg-amber-100", "text-amber-700"],
                          Warm: ["bg-amber-100", "text-amber-700"],
                          Proposal: ["bg-amber-100", "text-amber-700"],
                          Paused: ["bg-amber-100", "text-amber-700"],
                          "Not Working": ["bg-amber-100", "text-amber-700"],
                          Hot: ["bg-amber-100", "text-amber-700"],
                          Late: ["bg-amber-100", "text-amber-700"],
                          // ── Slate (neutral / no-response / leave / holiday / not-clocked-in) ──
                          "Not Respond": ["bg-slate-200", "text-slate-600"],
                          Unassigned: ["bg-slate-200", "text-slate-600"],
                          Leave: ["bg-slate-200", "text-slate-600"],
                          Holiday: ["bg-slate-200", "text-slate-600"],
                          Weekend: ["bg-slate-200", "text-slate-600"],
                          "Not Clocked In": ["bg-slate-200", "text-slate-600"],
                          "Not Talk": ["bg-slate-200", "text-slate-600"],
                          "Not Talk (Untouched)": ["bg-slate-200", "text-slate-600"],
                          // ── Rose (failed / rejected / escalated / inactive / absent / dump / not-interested / expired) ──
                          Expired: ["bg-rose-100", "text-rose-700"],
                          expired: ["bg-rose-100", "text-rose-700"],
                          Failed: ["bg-rose-100", "text-rose-700"],
                          Cancelled: ["bg-rose-100", "text-rose-700"],
                          Canceled: ["bg-rose-100", "text-rose-700"],
                          Dump: ["bg-rose-100", "text-rose-700"],
                          Dumped: ["bg-rose-100", "text-rose-700"],
                          Lost: ["bg-rose-100", "text-rose-700"],
                          Rejected: ["bg-rose-100", "text-rose-700"],
                          Inactive: ["bg-rose-100", "text-rose-700"],
                          Invalid: ["bg-rose-100", "text-rose-700"],
                          Unpaid: ["bg-rose-100", "text-rose-700"],
                          Absent: ["bg-rose-100", "text-rose-700"],
                          Escalated: ["bg-rose-100", "text-rose-700"],
                          "Not Interested": ["bg-rose-100", "text-rose-700"],
                          // ── Priority levels ──
                          High:   ["bg-rose-100",  "text-rose-700" ],
                          Medium: ["bg-amber-100", "text-amber-700"],
                          Low:    ["bg-blue-100",  "text-blue-700" ],
                          // ── Read / Unread ──
                          Unread: ["bg-blue-100",    "text-blue-700"    ],
                          Read:   ["bg-emerald-100", "text-emerald-700" ],
                          // ── Reminder frequency ──
                          Daily:   ["bg-emerald-100", "text-emerald-700"],
                          Weekly:  ["bg-blue-100",    "text-blue-700"   ],
                          Monthly: ["bg-purple-100",  "text-purple-700" ],
                          // ── Reminder type ──
                          Automatic: ["bg-amber-100",  "text-amber-700" ],
                          Scheduled: ["bg-indigo-100", "text-indigo-700"],
                          // ── Announcement types ──
                          Announcement: ["bg-blue-100",      "text-blue-700"   ],
                          Warning:      ["bg-amber-100",     "text-amber-700"  ],
                          Appreciation: ["bg-emerald-100",   "text-emerald-700"],
                        };
                        const [statusBg, statusText] = STATUS_MAP[val] ?? ["bg-slate-100", "text-slate-600"];
                        return (
                          <td key={col.key} style={col.width ? { width: col.width } : {}} className={`py-3 px-4 whitespace-nowrap ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBg} ${statusText}`}>
                              {val ?? "—"}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={col.key}
                          style={col.width ? { width: col.width } : {}}
                          className={`py-3 px-4 text-[#2a465a] font-medium whitespace-nowrap ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                        >
                          {(() => {
                            const rendered = col.render ? col.render(row[col.key], row) : row[col.key] ?? "—";
                            const raw = col.render ? rendered : row[col.key] ?? "—";
                            const text = (() => {
                              if (!ellipse || typeof raw !== "string") return raw;
                              const words = raw.trim().split(/\s+/);
                              return words.length > ellipse
                                ? words.slice(0, ellipse).join(" ") + "…"
                                : raw;
                            })();

                            // ── userProfile avatar prefix ──
                            if (userProfile && col.key === userProfile && !col.render) {
                              const photoUrl = row.photoUrl ?? null;
                              return (
                                <div className="flex items-center gap-2.5">
                                  <UserAvatar
                                    name={String(raw)}
                                    src={photoUrl}
                                    size={28}
                                    rounded="rounded-lg"
                                    onClick={photoUrl
                                      ? (e) => { e.stopPropagation(); window.open(photoUrl, "_blank"); }
                                      : undefined
                                    }
                                  />
                                  <span>{text}</span>
                                </div>
                              );
                            }

                            return rendered;
                          })()}
                        </td>
                      );
                    })}
                    {actions.length > 0 && (
                      <td style={{ width: "1%", whiteSpace: "nowrap" }} className="py-3 px-4 align-middle">
                        <div className="flex flex-nowrap items-center justify-start gap-2">
                          {actions.map((action, ai) => {
                            const isIconOnly = action.icon && !action.label;
                            return (
                              <ActionButton key={ai} action={action} row={row} isIconOnly={isIconOnly} actionVariantCls={actionVariantCls} />
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!(hideRecordSummary && hidePagination) && <div className="flex items-center justify-between px-1">
        {hideRecordSummary ? <div /> : <p className="text-xs text-slate-400 font-medium">
          Showing{" "}
          <span className="text-[#2a465a] font-bold">
            {filtered.length === 0 ? 0 : (page - 1) * currentPageSize + 1}–
            {Math.min(page * currentPageSize, filtered.length)}
          </span>{" "}
          of <span className="text-[#2a465a] font-bold">{filtered.length}</span>{" "}
          records
        </p>}
        {!hidePagination && <div className="flex items-center gap-1">
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
        </div>}
      </div>}
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

  // Icon-only actions with tooltips (recommended — compact, clean)
  const actions = [
    {
      icon: <Pencil size={14} />,
      tooltip: "Edit",
      variant: "ghost",                 // "primary" | "success" | "danger" | "ghost"
      onClick: (row) => handleEdit(row),
    },
    {
      icon: <Trash2 size={14} />,
      tooltip: "Delete",
      variant: "danger",
      onClick: (row) => handleDelete(row),
    },
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
  • actions          — array of { icon, tooltip, variant?, onClick }
                         icon:    React element (e.g. <Eye size={14} />) — required for icon-only buttons
                         tooltip: string shown on hover — required when using icon-only
                         variant: "primary" | "success" | "danger" | "ghost"  (default: "ghost")
                         onClick: (row) => void
                         show:    (row) => boolean — optional, hides the button for specific rows
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
  • exportable       — true | false  (default: false)
                         true → shows an "Export" button in the toolbar.
                         Exports ALL fields from every row in the `rows` prop as a CSV,
                         including fields not shown as table columns (hidden data is included).
  • exportFileName   — filename for the downloaded CSV without extension  (default: "export")
                         Example: exportFileName="leads-report" → downloads "leads-report.csv"
  • ellipse          — optional number. When set, every non-status cell value is word-truncated
                         to this many words with "…" appended.
                         Example: ellipse={3} → "Vacation trip with…"
                         Tip: only string values are truncated; numbers and "—" are left as-is.
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
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
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
            <span className={showAnimations ? "text-[#38bdf8] font-extrabold ml-1 opacity-90" : "text-slate-400 font-extrabold"}> {secondaryText}</span>
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
      {!showAnimations && <hr className="mt-3 border-slate-200/60 relative z-10" />}
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

// Helper to format large axis ticks (e.g. Lakhs, Crores, Thousands)
const formatAxisTick = (value) => {
  if (typeof value !== "number") return value;
  const absVal = Math.abs(value);
  let suffix = "";
  let formatted = absVal;
  
  if (absVal >= 10000000) {
    formatted = absVal / 10000000;
    suffix = "Cr";
  } else if (absVal >= 100000) {
    formatted = absVal / 100000;
    suffix = "L";
  } else if (absVal >= 1000) {
    formatted = absVal / 1000;
    suffix = "k";
  }
  
  const valStr = formatted.toFixed(1).replace(/\.0$/, '');
  return `${value < 0 ? '-' : ''}${valStr}${suffix}`;
};

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
          className={`shrink-0 px-3 py-1 text-[10px] sm:text-xs whitespace-nowrap font-bold rounded-lg transition-all duration-200 ${active === f.label
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
  const timerRef = useRef(null);
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
  const titleRef = useRef(null);
  const valueRef = useRef(null);
  const containerRef = useRef(null);
  const iconBoxRef = useRef(null);
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
        iconBoxRef.current.style.width = `${iconSz}px`;
        iconBoxRef.current.style.height = `${iconSz}px`;
        const svgSz = Math.round(Math.min(20, Math.max(12, (w / 240) * 20)));
        iconBoxRef.current.style.fontSize = `${svgSz}px`;
        const svgEl = iconBoxRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("width", svgSz);
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
      ref={containerRef}
      className={`col-span-12 md:col-span-6 lg:col-span-${size} rounded-2xl flex items-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-pointer`}
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
          ref={iconBoxRef}
          className="flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
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

      {/* Text */}
      <div className="flex flex-col justify-center min-w-0 w-full">
        <h3
          ref={titleRef}
          className="whitespace-nowrap"
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "2px",
            overflow: "visible",
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
        tickFormatter={formatAxisTick}
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
  yAxisWidth = 70,
}) => (
  // dataKey is derived from the data so ChartCard only animates when data actually changes.
  <ChartCard title={title} subtitle={subtitle} size={size} height={height} filters={filters} dataKey={JSON.stringify(data)}>
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
        tickFormatter={formatAxisTick}
      />
      <YAxis
        dataKey="name"
        type="category"
        tick={{ fill: T.textMuted, fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={yAxisWidth}
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
        tickFormatter={formatAxisTick}
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
        tickFormatter={formatAxisTick}
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
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
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
        className={`relative w-full ${maxW} bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out transform ${show
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

  ── EXAMPLE OF Modal ────────────────────────────────────────────────────────
  
  <Modal id="att-view-modal" title="Attendance Details" size="md">
    {selected && (
      <div className="flex flex-col gap-4">
        <ModalProfile
          name={selected.name}
          subtitle={`${selected.role} · ${selected.teamLeader}`}
          meta={`Date: ${selected.date}`}
        />
        <ModalGrid title="Attendance Info" cols={2}>
          <ModalData label="Clock In" value={selected.clockIn} />
          <ModalData label="Clock Out" value={selected.clockOut} />
          <ModalData label="Working Hours" value={selected.hours} />
          <ModalData label="Attendance %" value={selected.attendancePct} />
          <ModalData label="Status" value={selected.status} />
          <ModalData label="Team Leader" value={selected.teamLeader} />
          <ModalData label="Role" value={selected.role} />
        </ModalGrid>
        <div className="flex justify-end pt-2">
          <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("att-view-modal")} />
        </div>
      </div>
    )}
  </Modal>

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
  photoUrl,           // optional photo URL — passed to UserAvatar
}) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
    {/* Avatar — photo if available, else coloured initials */}
    <UserAvatar
      name={name}
      src={photoUrl}
      size={56}
      rounded="rounded-2xl"
      onClick={photoUrl ? () => window.open(photoUrl, "_blank") : undefined}
    />
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
    sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4", text: "text-xs" },
    md: { track: "w-11 h-6", thumb: "w-4 h-4", translate: "translate-x-5", text: "text-sm" },
    lg: { track: "w-14 h-7", thumb: "w-5 h-5", translate: "translate-x-7", text: "text-base" },
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
// PanelModal       — compact (max-w-lg) portal modal with spring animation
// PanelModal       — compact (max-w-lg) portal modal with spring animation
// ─────────────────────────────────────────────────────────────────────────────

export const EnhancedDashCard = ({
  title = "Total Employees",
  value = "0",
  icon,
  size = 4,
  accentColor = "#ffffff",
  onClick,
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
      onClick={onClick}
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
    const handleOpen = (e) => { if (e.detail.id === id) { setRender(true); } };
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



export const PanelModal = ({ id, title, children, isVisible, onClose, size = "lg" }) => {
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

  const sizeMap = {
    sm:  "max-w-sm",
    md:  "max-w-md",
    lg:  "max-w-lg",
    xl:  "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };
  const maxW = sizeMap[size] ?? "max-w-lg";

  if (!render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto px-4 py-6 sm:px-6">
      <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} onClick={close} />
      <div
        onTransitionEnd={handleAnimEnd}
        className={`relative w-full ${maxW} bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col max-h-[85vh] overflow-hidden transform transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) ${show ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
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


// ─────────────────────────────────────────────────────────────────────────────
// UserChat
// ─────────────────────────────────────────────────────────────────────────────
/*
  ── HOW TO USE UserChat ──────────────────────────────────────────────────────

  A fully self-contained chat widget with:
    • Scrollable message thread (text + image bubbles)
    • Initials avatars for each participant
    • Paperclip button to attach & send an image inline
    • Send button (icon-only) with tooltip
    • Enter to send, Shift+Enter for newline
    • Auto-smooth-scroll to the latest message on every update

  ── MINIMAL USAGE ────────────────────────────────────────────────────────────

    import { UserChat } from "./Common_Components";

    // 1. Keep messages in parent state:
    const [messages, setMessages] = useState([
      { sender: "Support", time: "2026-05-03 10:00", text: "How can I help you?" },
    ]);

    // 2. Render:
    <UserChat
      messages={messages}
      onSend={(msg) => setMessages((prev) => [...prev, msg])}
      currentUser="Sales Manager"
    />

  ── ALL PROPS ─────────────────────────────────────────────────────────────────

    messages      Message[]   Required. Array of message objects to display.
                              Each message must have:
                                sender    string  — display name of the sender
                                time      string  — timestamp string (any format)
                              And one of:
                                text      string  — plain text message
                                imageUrl  string  — URL of an image to display
                                imageName string  — (optional) filename caption

    onSend        function    Required. Called with a new message object when
                              the user sends a text or image:
                                { sender, time, text }        — for text
                                { sender, time, imageUrl, imageName } — for image

    currentUser   string      Required. The sender name that identifies "me"
                              (right-aligned navy bubbles). All other senders
                              appear on the left in grey.

    placeholder   string      Optional. Textarea placeholder text.
                              Default: "Type a message… (Enter to send)"

    maxHeight     string      Optional. Tailwind max-height class for the
                              scrollable message area.
                              Default: "max-h-80"

    showAttach    boolean     Optional. Show the paperclip attach-image button.
                              Default: true

  ── EXAMPLES ─────────────────────────────────────────────────────────────────

    // Basic ticket chat
    <UserChat
      messages={ticket.conversation}
      onSend={(msg) => updateTicket(ticket.id, msg)}
      currentUser="Sales Manager"
    />

    // Custom height, no attachment button
    <UserChat
      messages={chatLog}
      onSend={handleSend}
      currentUser="Admin"
      maxHeight="max-h-48"
      showAttach={false}
      placeholder="Reply to customer…"
    />

*/

export const UserChat = ({
  messages = [],
  onSend,
  currentUser = "Me",
  placeholder = "Type a message… (Enter to send)",
  maxHeight = "max-h-80",
  showAttach = true,
  readOnly = false,
}) => {
  const [text, setText] = React.useState("");
  const chatEndRef = React.useRef(null);
  const imgInputRef = React.useRef(null);

  // ── Auto-scroll to bottom on every new message ──
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Build a timestamped message object ──
  const makeMsg = (payload) => ({
    sender: currentUser,
    time: new Date().toISOString().slice(0, 16).replace("T", " "),
    ...payload,
  });

  // ── Send text message ──
  const handleSendText = () => {
    if (!text.trim() || !onSend) return;
    onSend(makeMsg({ text }));
    setText("");
  };

  // ── Send image message from file picker ──
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onSend) return;
    onSend(makeMsg({ imageUrl: URL.createObjectURL(file), imageName: file.name }));
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2">

      {/* ── Message thread ── */}
      <div className={`flex flex-col gap-3 ${maxHeight} overflow-y-auto px-2 py-2 custom-scrollbar rounded-2xl bg-slate-50 border border-slate-100`}>
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs text-slate-400 font-medium">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === currentUser;
            // Generate 2-letter initials from sender name
            const initials = msg.sender.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div key={i} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>

                {/* ── Avatar ── */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${isMe ? "bg-[#2a465a] text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                  {initials}
                </div>

                {/* ── Bubble ── */}
                <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                  {/* Sender + timestamp */}
                  <span className="text-[10px] font-semibold text-slate-400 px-1">
                    {msg.sender} · {msg.time}
                  </span>

                  {msg.imageUrl ? (
                    /* Image bubble — click to open full-size */
                    <div className={`rounded-2xl overflow-hidden shadow-sm border ${isMe ? "border-[#2a465a]/20 rounded-br-sm" : "border-slate-200 rounded-bl-sm"
                      }`}>
                      <img
                        src={msg.imageUrl}
                        alt={msg.imageName || "attachment"}
                        className="max-w-[180px] max-h-[180px] object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(msg.imageUrl, "_blank")}
                      />
                      {msg.imageName && (
                        <div className={`px-2 py-1 text-[10px] font-medium truncate max-w-[180px] ${isMe ? "bg-[#2a465a] text-white/70" : "bg-slate-50 text-slate-400"
                          }`}>
                          {msg.imageName}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Text bubble */
                    <div className={`px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${isMe
                      ? "bg-[#2a465a] text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-[#2a465a] rounded-bl-sm"
                      }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {/* Invisible sentinel — scrolled into view on new message */}
        <div ref={chatEndRef} />
      </div>

      {/* ── Reply input row — hidden in readOnly mode or when onSend is null ── */}
      {!readOnly && onSend && (
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#2a465a]/20 focus-within:border-[#2a465a]/40 transition">

        {/* Attach image button (hidden file input + paperclip icon) */}
        {showAttach && (
          <>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-[#2a465a] transition"
              >
                {/* Paperclip SVG */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-[#1e293b] text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  Attach Image
                </div>
                <div className="absolute top-full left-3 border-4 border-transparent border-t-[#1e293b]" />
              </div>
            </div>
          </>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none resize-none leading-5 py-0.5"
        />

        {/* Send button */}
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={handleSendText}
            disabled={!text.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#2a465a] text-white hover:bg-[#1e3a52] transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#2a465a]/20"
          >
            {/* Send icon */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="bg-[#1e293b] text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
              Send Reply
            </div>
            <div className="absolute top-full right-3 border-4 border-transparent border-t-[#1e293b]" />
          </div>
        </div>

      </div>
      )}
    </div>
  );
};
