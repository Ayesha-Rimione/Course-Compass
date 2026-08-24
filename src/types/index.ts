export type CourseStatus = "not-started" | "ongoing" | "completed";

export interface Course {
  code: string;
  title: string;
  credits: number;
  semester: number;
  status: CourseStatus;
  rating?: number;
  grade?: string;
  prerequisite?: string;
  description?: string;
  courseOutcomes?: string[];
  skillsCovered?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1 to 5
  category: string;
  isCustom?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  skillsDemonstrated: string[];
  githubUrl?: string;
  liveUrl?: string;
  projectType: "Web App" | "Mobile App" | "AI/ML" | "System Tool" | "Other";
  isTeam: boolean;
  duration: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  completionDate: string;
  certificateUrl?: string;
  skillsLearned: string[];
}

export interface StudentProfile {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  program: string;
  semester: number;
  cgpa: number;
  expectedGraduation: string;
  bio: string;
  links: {
    github: string;
    linkedin: string;
    codeforces: string;
    leetcode: string;
  };
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  isSelected?: boolean;
}

export interface CareerAnalysis {
  careerId: string;
  careerTitle: string;
  matchScore: number; // 0 to 100
  priority: "High" | "Medium" | "Low";
  matchingSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  reasoning: string;
}

export interface SkillGap {
  id: string;
  skill: string;
  currentLevel: number; // 1 to 5
  requiredLevel: number; // 1 to 5
  gap: number;
  priority: "High" | "Medium" | "Low";
}

export interface SemesterGuidance {
  semester: number;
  title: string;
  recommendations: string[];
}

export interface RadarAxis {
  axis: string;
  current: number;
  required: number;
}

export interface Roadmap {
  targetRole: string;
  percent: number;
  summary: string;
  gaps: SkillGap[];
  radar: RadarAxis[];
  semesterGuidance: SemesterGuidance[];
}

export interface LearningResource {
  id: string;
  name: string;
  provider: string;
  url: string;
  isFree: boolean;
  price?: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  experience: string;
  salary?: string;
  jobUrl: string;
  postedDate: string;
  jobType: "Full-time" | "Internship" | "Remote" | "Part-time";
}

export interface ChatMessage {
  id: number | string;
  role: "user" | "bot";
  text: string;
  timestamp?: string;
}

export interface ChatContext {
  student: StudentProfile;
  coursesCompleted: number;
  skillsCount: number;
  targetRole: string;
  topGap: string;
}
