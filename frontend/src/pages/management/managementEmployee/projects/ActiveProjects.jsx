import { useOutletContext } from "react-router-dom";
import AllAssigned from "./AllAssigned";

export default function ActiveProjects() {
  const { projects, updateProject } = useOutletContext();
  const active = projects.filter((p) => p.status === "In Progress");
  return (
    <AllAssigned
      projects={active}
      updateProject={updateProject}
      title="Active Projects"
    />
  );
}
