import { apiFetch } from "./client";
import { Course, CourseStatus } from "@/types";

function mapStatusToFrontend(status?: string): CourseStatus {
  if (status === "COMPLETED") return "completed";
  if (status === "IN_PROGRESS") return "ongoing";
  return "not-started";
}

function mapStatusToBackend(status: CourseStatus): string {
  if (status === "completed") return "COMPLETED";
  if (status === "ongoing") return "IN_PROGRESS";
  return "NOT_STARTED";
}

export async function getCourses(): Promise<Course[]> {
  try {
    const cur = await apiFetch<any>("/curriculum/me");
    if (cur && Array.isArray(cur.courses)) {
      return cur.courses.map((c: any) => ({
        code: c.course_code,
        title: c.course_name,
        credits: c.credit_hours,
        semester: c.semester,
        status: mapStatusToFrontend(c.status),
        grade: c.grade || undefined,
        rating: c.self_rating || undefined,
        description: c.description || undefined,
        courseOutcomes: c.course_outcomes?.map((co: any) => co.outcome_text) || [],
      }));
    }
  } catch {
    // If not authenticated or error, fetch public courses catalog
    const catalog = await apiFetch<any[]>("/courses");
    return catalog.map((c: any) => ({
      code: c.course_code,
      title: c.course_name,
      credits: c.credit_hours,
      semester: c.semester,
      status: "not-started" as CourseStatus,
      description: c.description || undefined,
    }));
  }
  return [];
}

export async function getCoursesBySemester(semester: number): Promise<Course[]> {
  const all = await getCourses();
  return all.filter((c) => c.semester === semester);
}

export async function updateCourseStatus(
  code: string,
  status: CourseStatus
): Promise<Course> {
  const backendStatus = mapStatusToBackend(status);
  const updated = await apiFetch(`/students/me/courses/${encodeURIComponent(code)}`, {
    method: "PUT",
    body: JSON.stringify({ status: backendStatus }),
  });
  return {
    code: updated.course_code || code,
    title: updated.course_name || code,
    credits: updated.credit_hours || 3,
    semester: updated.semester || 1,
    status: mapStatusToFrontend(updated.status),
    grade: updated.grade,
    rating: updated.self_rating,
  };
}

export async function updateCourseGrade(
  code: string,
  grade: string
): Promise<Course> {
  const updated = await apiFetch(`/students/me/courses/${encodeURIComponent(code)}`, {
    method: "PUT",
    body: JSON.stringify({ grade }),
  });
  return {
    code: updated.course_code || code,
    title: updated.course_name || code,
    credits: updated.credit_hours || 3,
    semester: updated.semester || 1,
    status: mapStatusToFrontend(updated.status),
    grade: updated.grade,
    rating: updated.self_rating,
  };
}

export async function updateCourseRating(
  code: string,
  rating: number
): Promise<Course> {
  const updated = await apiFetch(`/students/me/courses/${encodeURIComponent(code)}`, {
    method: "PUT",
    body: JSON.stringify({ self_rating: rating }),
  });
  return {
    code: updated.course_code || code,
    title: updated.course_name || code,
    credits: updated.credit_hours || 3,
    semester: updated.semester || 1,
    status: mapStatusToFrontend(updated.status),
    grade: updated.grade,
    rating: updated.self_rating,
  };
}
