import { StudentProfile } from "@/types";
import { apiFetch } from "./client";

export const defaultEmptyProfile: StudentProfile = {
  name: "",
  studentId: "",
  email: "",
  phone: "",
  department: "Department of Computer Science & Engineering",
  program: "B.Sc. in Computer Science & Engineering",
  semester: 1,
  cgpa: 0.0,
  expectedGraduation: "",
  bio: "",
  targetRole: "Full-Stack Software Engineer",
  links: {
    github: "",
    linkedin: "",
    codeforces: "",
    leetcode: "",
  },
};

export function transformBackendProfile(raw: any, email?: string): StudentProfile {
  if (!raw) return defaultEmptyProfile;
  return {
    name: raw.full_name || "",
    studentId: raw.student_id || "",
    email: raw.email || email || "",
    phone: raw.phone || "",
    department: raw.department || "Department of Computer Science & Engineering",
    program: raw.program || "B.Sc. in Computer Science & Engineering",
    semester: raw.current_semester || 1,
    cgpa: raw.cgpa ? Number(raw.cgpa) : 0.0,
    expectedGraduation: raw.admission_session || "",
    bio: raw.bio || "",
    targetRole: raw.target_role || "Full-Stack Software Engineer",
    links: {
      github: raw.github_url || "",
      linkedin: raw.linkedin_url || "",
      codeforces: raw.codeforces_url || "",
      leetcode: raw.leetcode_url || "",
    },
  };
}

export const transformSupabaseProfile = transformBackendProfile;

export async function getStudentProfile(): Promise<StudentProfile> {
  try {
    const raw = await apiFetch("/students/me");
    return transformBackendProfile(raw);
  } catch (err: any) {
    return defaultEmptyProfile;
  }
}

export async function updateStudentProfile(
  updates: Partial<StudentProfile>
): Promise<StudentProfile> {
  const payload = {
    full_name: updates.name,
    student_id: updates.studentId,
    phone: updates.phone,
    current_semester: updates.semester,
    cgpa: updates.cgpa,
    target_role: updates.targetRole,
    bio: updates.bio,
    github_url: updates.links?.github,
    linkedin_url: updates.links?.linkedin,
    codeforces_url: updates.links?.codeforces,
    leetcode_url: updates.links?.leetcode,
  };

  const raw = await apiFetch("/students/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return transformBackendProfile(raw);
}
