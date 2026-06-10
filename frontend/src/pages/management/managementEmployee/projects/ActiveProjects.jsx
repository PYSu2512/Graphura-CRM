import { useOutletContext } from "react-router-dom";
import AllAssigned from "./AllAssigned";

export default function ActiveProjects() {
  const { tasks, loading, onRefresh } = useOutletContext();
  // Active = In Progress + Review (employee is actively working)
  const active = tasks.filter((t) => ["In Progress", "Review"].includes(t.status));
  return (
    <AllAssigned
      tasks={active}
      loading={loading}
      onRefresh={onRefresh}
      title="Active Projects"
    />
  );
}
