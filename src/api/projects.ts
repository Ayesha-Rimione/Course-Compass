import { apiFetch } from "./client";
import { Project } from "@/types";

let localCustomProjects: Project[] = [];

export async function getProjects(): Promise<Project[]> {
  try {
    const list = await apiFetch<any[]>("/students/me/projects");
    const backendProjs = list.map((p: any) => ({
      id: p.id,
      name: p.title,
      description: p.description,
      technologies: p.technologies || [],
      skillsDemonstrated: p.skills_demonstrated || [],
      githubUrl: p.github_starter_url || undefined,
      liveUrl: p.live_demo_url || undefined,
      projectType: p.project_type || "Web App",
      isTeam: p.is_team || false,
      duration: p.estimated_hours ? `${p.estimated_hours} hrs` : "3-4 weeks",
    }));
    return [...localCustomProjects, ...backendProjs];
  } catch {
    const catalog = await apiFetch<any[]>("/projects");
    const backendProjs = catalog.map((p: any) => ({
      id: p.id,
      name: p.title,
      description: p.description,
      technologies: p.technologies || [],
      skillsDemonstrated: p.skills_demonstrated || [],
      githubUrl: p.github_starter_url || undefined,
      liveUrl: p.live_demo_url || undefined,
      projectType: p.project_type || "Web App",
      isTeam: p.is_team || false,
      duration: p.estimated_hours ? `${p.estimated_hours} hrs` : "3-4 weeks",
    }));
    return [...localCustomProjects, ...backendProjs];
  }
}

export async function addProject(project: Omit<Project, "id">): Promise<Project> {
  const newProj: Project = {
    ...project,
    id: `proj-${Date.now()}`,
  };
  localCustomProjects.unshift(newProj);
  return newProj;
}

export async function deleteProject(id: string): Promise<void> {
  localCustomProjects = localCustomProjects.filter((p) => p.id !== id);
}
