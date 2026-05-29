import { useState } from "react";
import {
  DataTable, openModal,
} from "../../../../components/shared/Common_Components.jsx";
import { allComments, commentsByProject, workNotesByProject } from "./activityStore";
import { addComment, addWorkNote } from "./activityStore";
import { myProjects } from "../managementEmployeeStore";
import ProjectActivityDrawer, { DRAWER_MODAL_ID } from "./components/ProjectActivityDrawer";

const COLS = [
  { key: "date",        label: "Date"    },
  { key: "projectId",   label: "Proj ID" },
  { key: "projectName", label: "Project" },
  { key: "author",      label: "Author"  },
  { key: "body",        label: "Comment" },
];

export default function CommentsLog() {
  const [activityState, setActivityState] = useState({
    commentsByProject,
    workNotesByProject,
    allComments,
    allWorkNotes: [],
  });

  const [selectedProject, setSelectedProject] = useState(null);

  const flatComments = myProjects.flatMap((p) =>
    (activityState.commentsByProject[p.id] ?? []).map((c) => ({
      ...c,
      projectId: p.id,
      projectName: p.name,
      body: c.body.length > 60 ? c.body.slice(0, 60) + "…" : c.body,
      _fullBody: c.body,
    }))
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  const openDrawer = (row) => {
    const proj = myProjects.find((p) => p.id === row.projectId);
    if (proj) { setSelectedProject(proj); openModal(DRAWER_MODAL_ID); }
  };

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        title="Comments Log"
        columns={COLS}
        rows={flatComments}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="comments_log"
        actions={[
          {
            label: "View Thread",
            variant: "primary",
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