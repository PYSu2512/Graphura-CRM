import { useOutletContext } from "react-router-dom";
import AllAssigned from "./AllAssigned";

export default function CompletedProjects() {
  const { tasks, loading, onRefresh } = useOutletContext();
  const completed = tasks.filter((t) => t.status === "Completed");
  return (
    <AllAssigned
      tasks={completed}
      loading={loading}
      onRefresh={onRefresh}
      title="Completed Projects"
    />
  );
}
