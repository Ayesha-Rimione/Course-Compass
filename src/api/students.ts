import { apiFetch } from "./client";
import { StudentProfile } from "@/types";
import { transformBackendProfile } from "@/lib/auth";

export async function getStudentProfile(): Promise<StudentProfile> {
  const raw = await apiFetch("/students/me");
  return transformBackendProfile(raw);
}

export async function updateStudentProfile(
  updates: Partial<StudentProfile>
): Promise<StudentProfile> {
  const payload: Record<string, any> = {};

  if (updates.name !== undefined) payload.full_name = updates.name;
  if (updates.studentId !== undefined) payload.student_id = updates.studentId;
  if (updates.university !== undefined) payload.university = updates.university;
  if (updates.department !== undefined) payload.department = updates.department;
  if (updates.program !== undefined) payload.program = updates.program;
  if (updates.batch !== undefined) payload.batch = updates.batch;
  if (updates.semester !== undefined) payload.current_semester = Number(updates.semester);
  if (updates.cgpa !== undefined) payload.cgpa = Number(updates.cgpa);
  if (updates.expectedGraduation !== undefined) payload.admission_session = updates.expectedGraduation;
  if (updates.bio !== undefined) payload.bio = updates.bio;

  if (updates.links) {
    if (updates.links.github !== undefined) payload.github_url = updates.links.github;
    if (updates.links.linkedin !== undefined) payload.linkedin_url = updates.links.linkedin;
    if (updates.links.codeforces !== undefined) payload.codeforces_url = updates.links.codeforces;
    if (updates.links.leetcode !== undefined) payload.leetcode_url = updates.links.leetcode;
  }

  const raw = await apiFetch("/students/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return transformBackendProfile(raw);
}
