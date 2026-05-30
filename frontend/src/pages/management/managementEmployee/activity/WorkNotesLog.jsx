import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Eye } from "lucide-react";
import { DataTable, openModal } from "../../../../components/shared/Common_Components.jsx";
import { myProjects } from "../managementEmployeeStore";
import ProjectActivityDrawer, { DRAWER_MODAL_ID } from "./components/ProjectActivityDrawer";

const COLS = [
  { key: "date",        label: "Date"        },
  { key: "projectId",   label: "Proj ID"     },
  { key: "projectName", label: "Project"     },
  { key: "body",        label: "Work Note"   },
  { key: "visibility",  label: "Visibility"  },
];

export default function WorkNotesLog() {
  const { activityState, setActivityState } = useOutletContext();
  const [selectedProject, setSelectedProject] = useState(null);

  const flatNotes = myProjects.flatMap((p) =>
    (activityState.workNotesByProject[p.id] ?? []).map((n) => ({
      ...n,
      projectId: p.id,
      projectName: p.name,
      body: n.body.length > 60 ? n.body.slice(0, 60) + "…" : n.body,
      visibility: n.isClientVisible ? "Client-visible" : "Internal",
    }))
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  const openDrawer = (row) => {
    const proj = myProjects.find((p) => p.id === row.projectId);
    if (proj) { setSelectedProject(proj); openModal(DRAWER_MODAL_ID); }
  };

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        title="Work Notes Log"
        columns={COLS}
        rows={flatNotes}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="work_notes_log"
        filters={[
          {
            title: "Visibility",
            type: "toggle",
            key: "visibility",
            options: ["Client-visible", "Internal"],
          },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Thread",
            variant: "ghost",
            onClick: openDrawer,
          },
        ]}
      />

      <ProjectActivityDrawer
        project={selectedProject}
        activityState={activityState}
        setActivityState={setActivityState}
      />
    </div>
  );
}
