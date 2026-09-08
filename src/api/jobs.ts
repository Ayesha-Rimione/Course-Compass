import { JobRecommendation } from "@/types";
import { apiFetch } from "./client";

export async function getJobRecommendations(): Promise<JobRecommendation[]> {
  try {
    const rawJobs = await apiFetch<any[]>("/jobs");
    if (Array.isArray(rawJobs) && rawJobs.length > 0) {
      return rawJobs.map((j) => ({
        id: j.id,
        role: j.role,
        company: `${j.company_name} (Sample Market Intelligence)`,
        location: j.location,
        salary: j.salary_formatted || (j.salary_min ? `৳${j.salary_min} – ৳${j.salary_max}` : "Competitive"),
        posted: j.posted_at ? new Date(j.posted_at).toLocaleDateString() : "Recent",
        matchPercentage: 85,
        requiredSkills: typeof j.required_skills === "string" ? JSON.parse(j.required_skills || "[]") : (j.required_skills || []),
        missingSkills: [],
        type: j.employment_type || "Full-time",
        experienceLevel: j.experience_level || "Junior",
        url: j.source_url || "#",
      }));
    }
  } catch {
    // API unavailable
  }

  return [];
}
