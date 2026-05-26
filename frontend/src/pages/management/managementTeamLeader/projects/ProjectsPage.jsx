/**
 * ProjectsPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main Projects Management page.
 * Renders the Heading banner + a tab bar that switches between:
 *   1. AssignProjects
 *   2. ReassignProjects
 *   3. UpdateProjectProgress
 *
 * ── What is imported from Common_Components ──────────────────────────────────
 *   Heading  — animated dark navy banner (primaryText + secondaryText)
 *   Grid     — 12-column layout wrapper (wraps the whole page)
 *
 * Tab routing is internal (useState) — no router needed.
 * All shared project data lives in projectsStore (Zustand).
 */

import React, { useState } from "react";
import { Heading, Grid } from "../../../../components/shared/Common_Components";
import AssignProjects from "./AssignProjects";
import ReassignProjects from "./ReassignProjects";
import UpdateProjectProgress from "./UpdateProjectProgress";

// ── Tab config — component is a reference (not JSX), rendered inside render ──
const TABS = [
  {
    id: "assign",
    label: "Assign Projects",
    Component: AssignProjects,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    id: "reassign",
    label: "Reassign Projects",
    Component: ReassignProjects,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
  },
  {
    id: "progress",
    label: "Update Progress",
    Component: UpdateProjectProgress,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("assign");

  // Find the active tab's Component constructor — render it fresh inside JSX
  const { Component: ActiveComponent } = TABS.find((t) => t.id === activeTab);

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/*
        Grid (from Common_Components) — 12-column wrapper for the whole page.
        Every direct child must have a size / col-span prop or className.
        Heading already accepts size={12}.
        The tab bar and content panel each sit in col-span-12 divs.
      */}
      <Grid cols={12} gap={5}>

        {/* ── Animated heading banner (Common_Components) ── */}
        <Heading
          primaryText="Projects"
          secondaryText="Management"
          size={12}
          showAnimations={true}
        />

        {/* ── Tab bar — col-span-12, white pill container ── */}
        <div className="col-span-12">
          <div
            className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-[14px] p-1.5 w-fit"
            role="tablist"
            aria-label="Projects navigation"
          >
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-[10px]
                    text-[13px] font-bold whitespace-nowrap select-none
                    transition-all duration-200
                    ${isActive
                      ? "bg-[#2a465a] text-white shadow-[0_4px_14px_rgba(42,70,90,0.30)]"
                      : "bg-transparent text-slate-400 hover:text-[#475569] hover:bg-slate-100"
                    }
                  `}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active tab content — col-span-12, fresh mount on tab change ── */}
        <div className="col-span-12" key={activeTab} style={{ animation: "pgFadeIn 0.22s ease both" }}>
          <ActiveComponent />
        </div>

      </Grid>

      <style>{`
        @keyframes pgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
