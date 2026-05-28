import React, { useState } from "react";
import DailyCoordination  from "./DailyCoordination";
import AssignReassignTeam from "./AssignReassignTeam";
import TrackTeamActivity  from "./TrackTeamActivity";

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  {
    id: "coordination",
    label: "Daily Coordination",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: "assign",
    label: "Assign / Reassign",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="M7 23l-4-4 4-4"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
  {
    id: "activity",
    label: "Track Activity",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("coordination");

  const renderTab = () => {
    switch (activeTab) {
      case "coordination": return <DailyCoordination />;
      case "assign":       return <AssignReassignTeam />;
      case "activity":     return <TrackTeamActivity />;
      default:             return <DailyCoordination />;
    }
  };

  return (
    <div>
      {/* ── Pill Tab Bar — matches project page design ── */}
      <div
        style={{
          display: "flex",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "5px 6px",
          marginBottom: "24px",
          width: "fit-content",
          gap: "2px",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
                transition: "all 0.2s ease",
                // Active = navy fill; inactive = transparent
                background: isActive ? "#2a465a" : "transparent",
                color:      isActive ? "#ffffff"  : "#94a3b8",
                boxShadow:  isActive ? "0 4px 14px rgba(42,70,90,0.30)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#475569";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              {/* Icon — white when active, muted when not */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  transition: "color 0.2s",
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Content ── */}
      {renderTab()}
    </div>
  );
}
