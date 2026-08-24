import { apiFetch } from "./client";
import { CareerPath } from "@/types";

export async function getCareerPaths(): Promise<CareerPath[]> {
  try {
    const [roles, interest] = await Promise.all([
      apiFetch<any[]>("/career-roles"),
      apiFetch<any>("/career-interests/me").catch(() => null),
    ]);

    const selectedRoleId = interest?.career_role_id;
    const isExploring = interest?.is_still_exploring;

    return roles.map((r: any) => ({
      id: r.id,
      title: r.name,
      description: r.description || `${r.category} career track for IUBAT CSE students.`,
      isSelected: !isExploring && selectedRoleId === r.id,
      category: r.category,
      targetReadinessLevel: r.target_readiness_level,
    }));
  } catch {
    return [];
  }
}

export async function getMyCareerInterest(): Promise<{
  career_role_id: string | null;
  career_role_name: string | null;
  is_still_exploring: boolean;
}> {
  return apiFetch("/career-interests/me");
}

export async function setCareerInterest(
  careerRoleId: string | null,
  isStillExploring: boolean = false
): Promise<void> {
  await apiFetch("/career-interests/me", {
    method: "PUT",
    body: JSON.stringify({
      career_role_id: careerRoleId,
      is_still_exploring: isStillExploring,
    }),
  });
}

export async function toggleCareerInterest(id: string): Promise<CareerPath[]> {
  const current = await getCareerPaths();
  const target = current.find((c) => c.id === id);
  const willSelect = !target?.isSelected;

  await setCareerInterest(willSelect ? id : null, !willSelect);
  return getCareerPaths();
}
