import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Github, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types";
import { getProjects, addProject, deleteProject } from "@/api/projects";

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [projectType, setProjectType] = useState<Project["projectType"]>("Web App");
  const [duration, setDuration] = useState("1 Month");
  const [isTeam, setIsTeam] = useState(false);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);
    const newProj = await addProject({
      name: name.trim(),
      description: description.trim(),
      technologies: techArray,
      skillsDemonstrated: techArray,
      githubUrl: githubUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      projectType,
      isTeam,
      duration: duration.trim() || "1 Month",
    });
    setProjects((prev) => [...prev, newProj]);
    setName("");
    setDescription("");
    setTechnologies("");
    setGithubUrl("");
    setLiveUrl("");
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await deleteProject(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">Projects Portfolio</h3>
          <p className="text-xs text-ink-soft">Showcase your software engineering work, capstone projects, and team builds.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="rounded-xl gap-2">
          <Plus className="size-4" /> Add Project
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="card-soft p-5 space-y-4 animate-in fade-in duration-200">
          <h4 className="font-display text-sm font-bold">New Project Details</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-ink-soft">Project Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Distributed Task Queue"
                required
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Technologies (comma separated)</label>
              <Input
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="React, Node.js, PostgreSQL, Docker"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-soft">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of what this project does and key engineering decisions..."
              className="mt-1 rounded-xl h-20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-ink-soft">GitHub Repository URL</label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Live Demo / Deployment URL</label>
              <Input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://myproject.com"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button type="submit" className="rounded-xl">Save Project</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((proj) => (
          <div key={proj.id} className="card-soft p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="size-5 text-amber shrink-0" />
                  <h4 className="font-display text-base font-bold">{proj.name}</h4>
                </div>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="text-ink-soft hover:text-destructive transition-colors p-1"
                  title="Delete Project"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-soft leading-relaxed">{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proj.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded-md bg-secondary text-[0.68rem] font-medium text-ink-soft border border-border/50">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-ink-soft">
              <span>{proj.isTeam ? "Team Project" : "Individual"} · {proj.duration}</span>
              <div className="flex items-center gap-2">
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:text-ink flex items-center gap-1">
                    <Github className="size-3.5" /> Code
                  </a>
                )}
                {proj.liveUrl && (
                  <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="hover:text-ink flex items-center gap-1">
                    <ExternalLink className="size-3.5" /> Live
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-ink-soft col-span-2 py-6 text-center">No projects added yet.</p>
        )}
      </div>
    </div>
  );
}
