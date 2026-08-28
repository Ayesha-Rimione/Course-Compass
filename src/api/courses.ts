import { Course, CourseStatus } from "@/types";
import { masterCurriculumCourses } from "@/data/curriculum-dataset";
import { apiFetch } from "./client";

export async function getCourses(): Promise<Course[]> {
  try {
    // 1. Fetch catalog courses from backend API
    const dbCourses = await apiFetch<any[]>("/courses");
    
    // 2. Fetch student's progress
    let progressMap: Record<string, { status: CourseStatus; grade?: string; rating?: number }> = {};
    try {
      const studentCourses = await apiFetch<any[]>("/students/me/courses");
      if (Array.isArray(studentCourses)) {
        for (const sc of studentCourses) {
          progressMap[sc.course_code] = {
            status: sc.status === "COMPLETED" ? "completed" : sc.status === "IN_PROGRESS" ? "in_progress" : "not_taken",
            grade: sc.grade || undefined,
            rating: sc.self_rating || undefined,
          };
        }
      }
    } catch {
      // Unauthenticated or new user
    }

    const courseCatalog = (Array.isArray(dbCourses) && dbCourses.length > 0)
      ? dbCourses.map((c) => ({
          code: c.course_code,
          title: c.course_name,
          credits: Number(c.credit_hours) || 3.0,
          semester: Number(c.semester) || 1,
          description: c.description || "",
        }))
      : masterCurriculumCourses;

    return courseCatalog.map((c) => {
      const prog = progressMap[c.code];
      return {
        id: c.code,
        code: c.code,
        title: c.title,
        credits: c.credits,
        semester: c.semester,
        description: c.description,
        status: prog?.status || "not_taken",
        grade: prog?.grade,
        rating: prog?.rating,
      };
    });
  } catch (err: any) {
    // Return master dataset
    return masterCurriculumCourses.map((c) => ({
      id: c.code,
      code: c.code,
      title: c.title,
      credits: c.credits,
      semester: c.semester,
      description: c.description,
      status: "not_taken",
    }));
  }
}

export async function saveCourseProgress(
  courseCode: string,
  status: CourseStatus,
  grade?: string,
  rating?: number
): Promise<void> {
  const backendStatus = status === "completed" ? "COMPLETED" : status === "in_progress" ? "IN_PROGRESS" : "NOT_STARTED";
  
  await apiFetch(`/students/me/courses/${encodeURIComponent(courseCode)}`, {
    method: "PUT",
    body: JSON.stringify({
      status: backendStatus,
      grade,
      self_rating: rating,
    }),
  });
}

export async function updateCourseStatus(courseCode: string, status: CourseStatus): Promise<void> {
  return saveCourseProgress(courseCode, status);
}

export async function updateCourseGrade(courseCode: string, grade: string): Promise<void> {
  return saveCourseProgress(courseCode, "completed", grade);
}

export async function updateCourseRating(courseCode: string, rating: number): Promise<void> {
  return saveCourseProgress(courseCode, "completed", undefined, rating);
}

export async function batchSaveCompletedCourses(
  coursesToSave: { code: string; grade?: string; rating?: number; status?: CourseStatus }[]
): Promise<void> {
  const payload = coursesToSave.map((c) => ({
    code: c.code,
    grade: c.grade || "A",
    rating: c.rating || 4,
    status: c.status === "in_progress" ? "IN_PROGRESS" : c.status === "not_taken" ? "NOT_STARTED" : "COMPLETED",
  }));

  await apiFetch("/students/me/courses/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
