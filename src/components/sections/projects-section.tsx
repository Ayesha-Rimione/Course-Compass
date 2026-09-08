import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Github,
  FolderGit2,
  Sparkles,
  Download,
  Loader2,
  Check,
  Code2,
  Star,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types";
import { getProjects, addProject, deleteProject } from "@/api/projects";
import { fetchGitHubRepos, GitHubRepo } from "@/api/github";
import { getStudentProfile } from "@/api/students";

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  // Manual Add Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [projectType, setProjectType] = useState<Project["projectType"]>("Web App");
  const [duration, setDuration] = useState("1 Month");
  const [isTeam, setIsTeam] = useState(false);

  // GitHub Import State
  const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [fetchedRepos, setFetchedRepos] = useState<GitHubRepo[]>([]);
  const [importingRepoId, setImportingRepoId] = useState<number | null>(null);
  const [importedRepoIds, setImportedRepoIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [list, prof] = await Promise.all([getProjects(), getStudentProfile()]);
      setProjects(list);
      if (prof?.links?.github) {
        const clean = prof.links.github.replace("https://github.com/", "").replace("/", "");
        setGithubUsername(clean);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleManualCreate = async (e: React.FormEvent) => {
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
      source: "manual",
    });
    setProjects((prev) => [newProj, ...prev]);
    setName("");
    setDescription("");
    setTechnologies("");
    setGithubUrl("");
    setLiveUrl("");
    setShowAddModal(false);
  };

  const handleFetchGitHubRepos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;
    setGithubLoading(true);
    setGithubError(null);
    try {
      const repos = await fetchGitHubRepos(githubUsername);
      setFetchedRepos(repos);
    } catch (err: any) {
      setGithubError(err.message || "Failed to fetch repositories.");
    } finally {
      setGithubLoading(false);
    }
  };

  const handleImportSingleRepo = async (repo: GitHubRepo) => {
    setImportingRepoId(repo.id);
    const tech: string[] = [];
    if (repo.language) tech.push(repo.language);
    if (repo.topics) tech.push(...repo.topics);

    const newProj = await addProject({
      name: repo.name,
      description: repo.description || `Repository imported from GitHub (${repo.language || 'Codebase'}).`,
      technologies: tech,
      skillsDemonstrated: tech,
      githubUrl: repo.html_url,
      liveUrl: repo.homepage || undefined,
      projectType: "Open Source / Web",
      isTeam: false,
      duration: "Repository",
      source: "github",
      stars: repo.stargazers_count,
      primary_language: repo.language || undefined,
    });

    setProjects((prev) => [newProj, ...prev]);
    setImportedRepoIds((prev) => new Set([...prev, repo.id]));
    setImportingRepoId(null);
  };

  const handleDelete = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await deleteProject(id);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Projects Portfolio</h3>
          <p className="text-xs text-ink-soft">
            Showcase your software engineering work, capstone builds, and GitHub repositories.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setShowGitHubModal(true)}
            className="rounded-xl gap-2 text-xs font-display"
          >
            <Github className="size-4" /> Import from GitHub
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl gap-2 text-xs font-display bg-amber hover:bg-amber-hover text-ink"
          >
            <Plus className="size-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Manual Add Modal / Form */}
      {showAddModal && (
        <form onSubmit={handleManualCreate} className="card-soft p-6 space-y-4 animate-in fade-in duration-200 border-2 border-amber/30">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-bold">Add Project Manually</h4>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-ink-soft hover:text-ink font-semibold"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-ink-soft">Project Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Distributed Task Queue"
                required
                className="mt-1 rounded-xl"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-soft">Technologies (comma separated)</label>
              <Input
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="React, FastAPI, PostgreSQL, Docker"
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
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" className="rounded-xl font-display">Save Project</Button>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      {/* GitHub Import Modal */}
      {showGitHubModal && (
        <div className="card-soft p-6 space-y-5 animate-in fade-in duration-200 border-2 border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="size-5 text-amber" />
              <h4 className="font-display text-base font-bold">Import from GitHub</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowGitHubModal(false)}
              className="text-xs text-ink-soft hover:text-ink font-semibold"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleFetchGitHubRepos} className="flex gap-2">
            <Input
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. torvalds)"
              className="rounded-xl"
              autoFocus
            />
            <Button type="submit" disabled={githubLoading || !githubUsername.trim()} className="rounded-xl shrink-0 font-display">
              {githubLoading ? <Loader2 className="size-4 animate-spin" /> : "Fetch Repos"}
            </Button>
          </form>

          {githubError && (
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-xl">
              {githubError}
            </p>
          )}

          {fetchedRepos.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <p className="text-xs text-ink-soft font-semibold">
                Found {fetchedRepos.length} public repositories:
              </p>
              {fetchedRepos.map((repo) => {
                const isImported = importedRepoIds.has(repo.id);
                return (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface border border-border/70 hover:border-amber/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-ink truncate">
                          {repo.name}
                        </span>
                        {repo.language && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary font-mono text-ink-soft">
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber font-semibold">
                            <Star className="size-3 fill-amber" /> {repo.stargazers_count}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-ink-soft truncate mt-0.5">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isImported ? "outline" : "default"}
                      disabled={isImported || importingRepoId === repo.id}
                      onClick={() => handleImportSingleRepo(repo)}
                      className="rounded-lg text-xs shrink-0 font-display"
                    >
                      {isImported ? (
                        <span className="flex items-center gap-1 text-emerald-600"><Check className="size-3.5" /> Added</span>
                      ) : importingRepoId === repo.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1"><Plus className="size-3.5" /> Import</span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Projects List or Genuine Empty State */}
      {projects.length > 0 ? (
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
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-ink-soft border border-border/50"
                      >
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
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink flex items-center gap-1 font-semibold"
                    >
                      <Github className="size-3.5" /> Code
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="size-3.5" /> Live
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Genuine Empty State (Senior Bhai Tone) */
        <div className="card-soft p-10 text-center space-y-4 border-dashed border-2 border-border/80">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-soft text-amber-800">
            <Code2 className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-display text-lg font-bold text-ink">
              Portfolio's looking a little empty, bhai!
            </h4>
            <p className="mx-auto max-w-md text-xs text-ink-soft leading-relaxed">
              Time to flex what you've built during semester labs or personal hacks. Import your GitHub repositories in one click or add a manual project.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowGitHubModal(true)}
              className="rounded-xl gap-2 font-display text-xs"
            >
              <Github className="size-4" /> Import from GitHub
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-xl gap-2 font-display text-xs bg-amber hover:bg-amber-hover text-ink"
            >
              <Plus className="size-4" /> Add First Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
