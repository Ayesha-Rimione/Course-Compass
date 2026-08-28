/**
 * GitHub API integration for importing student repositories into portfolio projects.
 */

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
}

const cache = new Map<string, { data: GitHubRepo[]; timestamp: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const cleanUser = username.trim().replace(/^@/, "");
  if (!cleanUser) {
    throw new Error("Please enter a valid GitHub username.");
  }

  const cached = cache.get(cleanUser.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=40`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (res.status === 404) {
      throw new Error(`GitHub user "${cleanUser}" not found. Please check the spelling.`);
    }

    if (res.status === 403) {
      throw new Error("GitHub API rate limit reached. Please wait a moment or add projects manually.");
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch repositories from GitHub (${res.status}).`);
    }

    const repos: any[] = await res.json();
    const formatted: GitHubRepo[] = repos
      .filter((r) => !r.fork) // Prioritize original projects
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || null,
        html_url: r.html_url,
        homepage: r.homepage || null,
        language: r.language || null,
        stargazers_count: r.stargazers_count || 0,
        forks_count: r.forks_count || 0,
        updated_at: r.updated_at,
        topics: r.topics || [],
      }));

    cache.set(cleanUser.toLowerCase(), { data: formatted, timestamp: Date.now() });
    return formatted;
  } catch (err: any) {
    throw new Error(err.message || "Unable to reach GitHub. Please try again.");
  }
}
