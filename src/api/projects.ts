import { Project } from "@/types";
import { apiFetch } from "./client";

export async function getProjects(): Promise<Project[]> {
  try {
    const raw = await apiFetch<any[]>("/students/me/projects");
    if (Array.isArray(raw)) {
      return raw.map((p) => ({
        id: p.id,
        name: p.title,
        description: p.description || "",
        technologies: p.tech_stack ? p.tech_stack.split(",").map((s: string) => s.trim()) : [],
        skillsDemonstrated: p.tech_stack ? p.tech_stack.split(",").map((s: string) => s.trim()) : [],
        githubUrl: p.github_url || undefined,
        liveUrl: p.live_url || undefined,
        projectType: "Web App",
        isTeam: false,
        duration: "1 Month",
      }));
    }
    return [];
  } catch (err: any) {
    return [];
  }
}

export async function addProject(project: Omit<Project, "id"> & { source?: "manual" | "github"; stars?: number; primary_language?: string }): Promise<Project> {
  const techStack = Array.isArray(project.technologies) 
    ? project.technologies.join(", ")
    : (project.primary_language || "");

  const payload = {
    title: project.name,
    description: project.description || "",
    tech_stack: techStack,
    github_url: project.githubUrl || "",
    live_url: project.liveUrl || "",
  };

  const created = await apiFetch("/students/me/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: created.id,
    name: created.title,
    description: created.description || "",
    technologies: created.tech_stack ? created.tech_stack.split(",").map((s: string) => s.trim()) : [],
    skillsDemonstrated: created.tech_stack ? created.tech_stack.split(",").map((s: string) => s.trim()) : [],
    githubUrl: created.github_url || undefined,
    liveUrl: created.live_url || undefined,
    projectType: "Web App",
    isTeam: false,
    duration: "1 Month",
  };
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/students/me/projects/${id}`, {
    method: "DELETE",
  });
}
