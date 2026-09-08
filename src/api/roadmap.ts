import { apiFetch } from "./client";
import { Roadmap as RoadmapType } from "@/types";
import { getStudentProfile } from "./students";

export const defaultEmptyRoadmap: RoadmapType = {
  targetRole: "Career Path Exploring",
  percent: 0,
  summary: "Complete your profile and log completed coursework to generate your personalized career readiness score.",
  currentLevel: "Exploring",
  strongestSkills: [],
  weakestSkills: [],
  criticalGaps: [],
  nextPriority: "Build your academic profile",
  gaps: [],
  radar: [],
  semesterGuidance: [],
};

export async function getRoadmap(): Promise<RoadmapType> {
  try {
    const data = await apiFetch<any>("/students/me/roadmap");
    if (data && data.gaps) {
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
  } catch {
    // Unauthenticated or profile not yet created
  }

  return defaultEmptyRoadmap;
}

export async function getPlanningRecommendations(): Promise<{
  targetRole: string;
  currentSemester: number;
  weekly: any[];
  monthly: any[];
  semester: any[];
}> {
  try {
    const res = await apiFetch<any>("/students/me/planning");
    if (res && res.weekly) {
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
  } catch {
    // fallback
  }

  const profile = await getStudentProfile();
  return {
    targetRole: profile.targetRole || "Full-Stack Software Engineer",
    currentSemester: profile.semester || 1,
    weekly: [
      {
        id: "plan-w1",
        title: "Review upcoming semester course syllabus and prerequisites",
        detail: "Check out the course outcomes (COs) for the next semester so you know what is coming up.",
        category: "Academic",
        priority: "High",
        estimatedEffort: "2-3 hrs",
        why: "Early prep gives you an edge before class begins.",
      },
      {
        id: "plan-w2",
        title: "Build a mini CRUD web app with PostgreSQL database",
        detail: "Solidify relational database queries, schema design, and basic REST endpoints.",
        category: "Skill Building",
        priority: "High",
        estimatedEffort: "4-5 hrs",
        why: "Directly bridges coursework to full-stack engineering requirements.",
      },
    ],
    monthly: [
      {
        id: "plan-m1",
        title: "Deploy 1 full project to Vercel/Render with live demo URL",
        detail: "Include clean README documentation, architecture overview, and GitHub repo link.",
        category: "Portfolio",
        priority: "Medium",
        estimatedEffort: "6-8 hrs",
        why: "Live proof of work is the #1 thing recruiters look for.",
      },
    ],
    semester: [
      {
        id: "plan-s1",
        title: "Complete core required department coursework with target GPA >= 3.50",
        detail: "Focus on fundamental data structures, algorithms, database systems, and OOP labs.",
        category: "Curriculum",
        priority: "High",
        estimatedEffort: "Full Semester",
        why: "Maintains strong academic foundation for internships and higher studies.",
      },
    ],
  };
}

export async function getSkillGaps(): Promise<any> {
  const roadmap = await getRoadmap();
  return {
    target_role: roadmap.targetRole,
    gaps: roadmap.gaps,
  };
}
