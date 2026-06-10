import { useOutletContext } from "react-router-dom";
import AllAssigned from "./AllAssigned";

export default function AllAssignedRoute() {
  const { tasks, loading, onRefresh } = useOutletContext();
  return (
    <AllAssigned
      tasks={tasks}
      loading={loading}
      onRefresh={onRefresh}
      title="My Projects"
    />
  );
}
