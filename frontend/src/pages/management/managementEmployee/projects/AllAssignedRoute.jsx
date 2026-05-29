import { useOutletContext } from "react-router-dom";
import AllAssigned from "./AllAssigned";

// Thin wrapper for the index route — passes the lifted projects/mutator from
// ManagementEmployeeMyProjects layout through `useOutletContext()` so all three
// tabs share the same state.
export default function AllAssignedRoute() {
  const { projects, updateProject } = useOutletContext();
  return (
    <AllAssigned
      projects={projects}
      updateProject={updateProject}
      title="My Projects"
    />
  );
}
