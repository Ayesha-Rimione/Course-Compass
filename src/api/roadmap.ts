import { apiFetch } from "./client";
import { Roadmap as RoadmapType } from "@/types";

export async function getRoadmap(): Promise<RoadmapType> {
  const data = await apiFetch<any>("/students/me/roadmap");
  return {
    targetRole: data.target_role || "Career Path Exploring",
    percent: data.overall_readiness_percentage ?? data.percent ?? 0,
    summary: data.summary || "",
    currentLevel: data.current_level || "Exploring",
    strongestSkills: data.strongest_skills || [],
    weakestSkills: data.weakest_skills || [],
    criticalGaps: data.critical_gaps || [],
    nextPriority: data.next_priority || "",
    gaps: (data.gaps || []).map((g: any) => ({
      id: g.id || g.skill_id,
      skill: g.skill,
      currentLevel: g.currentLevel ?? g.current_rating ?? 0,
      requiredLevel: g.requiredLevel ?? g.required_rating ?? 3,
      gap: g.gap ?? 0,
      priority: (g.priority === "CRITICAL" || g.priority === "HIGH") ? "High" : (g.priority === "MEDIUM" ? "Medium" : "Low"),
      importanceLevel: g.importance_level || "IMPORTANT",
      status: g.status || "DEVELOPING",
      evidenceSource: g.evidence_source || "NONE",
    })),
    radar: (data.radar || []).map((r: any) => ({
      axis: r.axis,
      current: r.current ?? 0,
      required: r.required ?? 0,
    })),
    semesterGuidance: data.semester_guidance || [],
  };
}

export async function getPlanningRecommendations(): Promise<{
  targetRole: string;
  currentSemester: number;
  weekly: any[];
  monthly: any[];
  semester: any[];
}> {
  const res = await apiFetch<any>("/students/me/planning");
  return {
    targetRole: res.target_role || "Selected Role",
    currentSemester: res.current_semester || 1,
    weekly: (res.weekly || []).map((w: any) => ({
      id: w.id,
      title: w.title,
      detail: w.description,
      category: w.category,
      priority: w.priority,
      estimatedEffort: w.estimated_effort,
      why: w.reason,
      resource: w.related_course ? { label: `Prerequisite Course: ${w.related_course}`, url: "#" } : undefined,
    })),
    monthly: (res.monthly || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      detail: m.description,
      category: m.category,
      priority: m.priority,
      estimatedEffort: m.estimated_effort,
      why: m.reason,
      resource: m.related_skill ? { label: `Target Skill: ${m.related_skill}`, url: "#" } : undefined,
    })),
    semester: (res.semester || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      detail: s.description,
      category: s.category,
      priority: s.priority,
      estimatedEffort: s.estimated_effort,
      why: s.reason,
      resource: undefined,
    })),
  };
}

export async function getSkillGaps(): Promise<any> {
  return apiFetch("/students/me/skill-gaps");
}
