import AllProjects from "./AllProjects";

export default function DelayedProjects({ projects, updateProject }) {
  return (
    <AllProjects
      projects={projects}
      updateProject={updateProject}
      titleOverride="Delayed Projects"
      filterFn={(p) => p.status === "Delayed"}
    />
  );
}
