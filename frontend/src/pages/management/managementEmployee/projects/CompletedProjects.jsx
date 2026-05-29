import { useOutletContext } from "react-router-dom";
import AllAssigned from "./AllAssigned";

export default function CompletedProjects() {
  const { projects, updateProject } = useOutletContext();
  const completed = projects.filter((p) => p.status === "Completed");
  return (
    <AllAssigned
      projects={completed}
      updateProject={updateProject}
      title="Completed Projects"
    />
  );
}
