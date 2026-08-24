import { apiFetch } from "./client";
import { Skill } from "@/types";

export async function getSkills(): Promise<Skill[]> {
  try {
    const studentSkills = await apiFetch<any[]>("/students/me/skills");
    return studentSkills.map((ss: any) => ({
      id: ss.skill_id || ss.id,
      name: ss.skill_name || ss.skill?.name || "Skill",
      category: ss.skill_category || ss.skill?.category || "Other",
      level: ss.self_rating || 1,
      verifiedRating: ss.verified_rating || undefined,
      verificationStatus: ss.verification_status,
      isCustom: false,
    }));
  } catch {
    return [];
  }
}

export async function getSkillsCatalog(): Promise<Skill[]> {
  const catalog = await apiFetch<any[]>("/skills");
  return catalog.map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category || "Other",
    level: 1,
    isCustom: false,
  }));
}

export async function addSkill(skillId: string, level: number = 1): Promise<Skill> {
  const res = await apiFetch("/students/me/skills", {
    method: "POST",
    body: JSON.stringify({
      skill_id: skillId,
      self_rating: level,
    }),
  });
  return {
    id: res.skill_id,
    name: res.skill_name,
    category: res.skill_category || "Other",
    level: res.self_rating,
    verificationStatus: res.verification_status,
  };
}

export async function updateSkillLevel(skillId: string, level: number): Promise<Skill> {
  const res = await apiFetch(`/students/me/skills/${encodeURIComponent(skillId)}`, {
    method: "PUT",
    body: JSON.stringify({ self_rating: level }),
  });
  return {
    id: res.skill_id,
    name: res.skill_name,
    category: res.skill_category || "Other",
    level: res.self_rating,
    verificationStatus: res.verification_status,
  };
}

export async function removeSkill(skillId: string): Promise<void> {
  await apiFetch(`/students/me/skills/${encodeURIComponent(skillId)}`, {
    method: "DELETE",
  });
}
