import AllProjects from "./AllProjects";

export default function DeliveredProjects({ projects, updateProject }) {
  return (
    <AllProjects
      projects={projects}
      updateProject={updateProject}
      titleOverride="Delivered Projects"
      filterFn={(p) => p.status === "Delivered"}
    />
  );
}
