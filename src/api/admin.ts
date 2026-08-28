import { apiFetch } from "./client";

export interface DepartmentAnalytics {
  total_students: number;
  average_cgpa: number;
  total_courses: number;
  total_topics: number;
  total_course_outcomes: number;
  semester_distribution: Record<string, number>;
  top_completed_courses: { code: string; name: string; completions: number }[];
}

export interface AdminStudentSummary {
  user_id: string;
  profile_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  semester: number;
  cgpa: number;
  target_role: string;
  completed_courses_count: number;
  in_progress_courses_count: number;
  projects_count: number;
}

export interface AdminStudentDetail {
  profile: {
    user_id: string;
    student_id: string;
    full_name: string;
    email: string;
    phone: string;
    semester: number;
    cgpa: number;
    target_role: string;
    bio: string;
    github_url?: string;
    linkedin_url?: string;
  };
  courses: {
    code: string;
    name: string;
    credits: number;
    semester: number;
    status: string;
    grade?: string;
    rating?: number;
  }[];
  projects: {
    id: string;
    title: string;
    description?: string;
    tech_stack?: string;
    github_url?: string;
    live_url?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issue_date?: string;
    credential_url?: string;
  }[];
}

export interface AdminCourse {
  id: string;
  course_code: string;
  course_name: string;
  credit_hours: number;
  semester: number;
  description: string;
  topics_count: number;
  outcomes_count: number;
}

export interface CourseTopicItem {
  id?: string;
  topic_name: string;
}

export interface CourseOutcomeItem {
  id?: string;
  outcome_code: string;
  description: string;
}

// API functions
export async function getDepartmentAnalytics(): Promise<DepartmentAnalytics> {
  return apiFetch<DepartmentAnalytics>("/admin/analytics");
}

export async function getAdminStudents(semester?: number, search?: string): Promise<AdminStudentSummary[]> {
  const params = new URLSearchParams();
  if (semester) params.append("semester", semester.toString());
  if (search) params.append("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<AdminStudentSummary[]>(`/admin/students${query}`);
}

export async function getAdminStudentDetail(userId: string): Promise<AdminStudentDetail> {
  return apiFetch<AdminStudentDetail>(`/admin/students/${userId}`);
}

export async function getAdminCourses(semester?: number): Promise<AdminCourse[]> {
  const query = semester ? `?semester=${semester}` : "";
  return apiFetch<AdminCourse[]>(`/admin/courses${query}`);
}

export async function createAdminCourse(payload: {
  course_code: string;
  course_name: string;
  credit_hours: number;
  semester: number;
  description?: string;
}): Promise<AdminCourse> {
  return apiFetch<AdminCourse>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCourse(
  courseCode: string,
  payload: {
    course_name?: string;
    credit_hours?: number;
    semester?: number;
    description?: string;
  }
): Promise<AdminCourse> {
  return apiFetch<AdminCourse>(`/admin/courses/${encodeURIComponent(courseCode)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getCourseTopics(courseCode: string): Promise<CourseTopicItem[]> {
  return apiFetch<CourseTopicItem[]>(`/admin/courses/${encodeURIComponent(courseCode)}/topics`);
}

export async function updateCourseTopics(courseCode: string, topics: CourseTopicItem[]): Promise<CourseTopicItem[]> {
  return apiFetch<CourseTopicItem[]>(`/admin/courses/${encodeURIComponent(courseCode)}/topics`, {
    method: "POST",
    body: JSON.stringify(topics),
  });
}

export async function getCourseOutcomes(courseCode: string): Promise<CourseOutcomeItem[]> {
  return apiFetch<CourseOutcomeItem[]>(`/admin/courses/${encodeURIComponent(courseCode)}/outcomes`);
}

export async function updateCourseOutcomes(courseCode: string, outcomes: CourseOutcomeItem[]): Promise<CourseOutcomeItem[]> {
  return apiFetch<CourseOutcomeItem[]>(`/admin/courses/${encodeURIComponent(courseCode)}/outcomes`, {
    method: "POST",
    body: JSON.stringify(outcomes),
  });
}
