import AllProjects from "./AllProjects";
import { ACTIVE_STATUSES } from "../managementManagerStore";

export default function ActiveProjects({ projects, updateProject }) {
  return (
    <AllProjects
      projects={projects}
      updateProject={updateProject}
      titleOverride="Active Projects"
      filterFn={(p) => ACTIVE_STATUSES.includes(p.status)}
    />
  );
}
