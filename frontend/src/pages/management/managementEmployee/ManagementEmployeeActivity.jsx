import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Grid, Heading } from "../../../components/shared/Common_Components.jsx";
import { MessageSquare, FileText } from "lucide-react";
import {
  commentsByProject,
  workNotesByProject,
  allComments,
  allWorkNotes,
} from "./activity/activityStore";

const TABS = [
  { label: "Comments",   path: "comments",   icon: MessageSquare },
  { label: "Work Notes", path: "work-notes", icon: FileText      },
];

export default function ManagementEmployeeActivity() {
  // Lifted state so adding a comment in the Comments tab is also visible from
  // the Work Notes tab (and vice versa) — children read via useOutletContext().
  const [activityState, setActivityState] = useState(() => ({
    commentsByProject,
    workNotesByProject,
    allComments,
    allWorkNotes,
  }));

  return (
    <div>
      <Grid cols={12} gap={6}>

        <Heading
          primaryText="My"
          secondaryText="Activity"
          size={12}
          fontSize="2xl"
        />

        {/* ── Tab nav ───────────────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {TABS.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#2a465a] text-white shadow"
                      : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
                  }`
                }
              >
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ── Sub-page ──────────────────────────────────────────────────── */}
        <div className="col-span-12">
          <Outlet context={{ activityState, setActivityState }} />
        </div>

      </Grid>
    </div>
  );
}
