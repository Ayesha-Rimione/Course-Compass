/**
 * Demo / Placeholder Skills & Employer Demand Data
 *
 * NOTE: Skills-to-course mappings and employer-skill-demand data are intentionally
 * sample data until live industry labor market feeds are integrated.
 * This module is completely isolated from real student courses and transcripts.
 */

import { Skill, SkillGap, Roadmap, CareerPath } from "@/types";

export interface DemoCareerRequirement {
  role: string;
  category: string;
  description: string;
  requiredSkills: { name: string; level: number; weight: number }[];
}

export const demoCareerRoles: DemoCareerRequirement[] = [
  {
    role: "Full-Stack Software Engineer",
    category: "Software Development",
    description: "Builds modern scalable web services, microservices architectures, and interactive frontend interfaces.",
    requiredSkills: [
      { name: "JavaScript / TypeScript", level: 85, weight: 1.0 },
      { name: "React / Frontend Frameworks", level: 80, weight: 0.9 },
      { name: "Node.js / Backend Services", level: 80, weight: 0.9 },
      { name: "SQL & Relational Databases", level: 75, weight: 0.8 },
      { name: "REST APIs & System Design", level: 75, weight: 0.8 },
      { name: "Git & Collaboration", level: 70, weight: 0.7 },
      { name: "Docker & Containerization", level: 60, weight: 0.6 },
    ],
  },
  {
    role: "Backend & Cloud Engineer",
    category: "Software Engineering",
    description: "Designs high-throughput backend APIs, databases, caching layers, and cloud infrastructure.",
    requiredSkills: [
      { name: "Python / Go / Java", level: 85, weight: 1.0 },
      { name: "SQL & Database Optimization", level: 85, weight: 0.95 },
      { name: "FastAPI / Node.js / Spring", level: 80, weight: 0.9 },
      { name: "Docker & Cloud Deployment", level: 75, weight: 0.85 },
      { name: "Distributed Systems & Caching", level: 70, weight: 0.8 },
      { name: "Data Structures & Algorithms", level: 80, weight: 0.85 },
    ],
  },
  {
    role: "Data & ML Engineer",
    category: "Artificial Intelligence",
    description: "Develops data ingestion pipelines, statistical models, and machine learning inference services.",
    requiredSkills: [
      { name: "Python & Scientific Stack", level: 90, weight: 1.0 },
      { name: "SQL & Data Warehousing", level: 85, weight: 0.9 },
      { name: "Applied Machine Learning", level: 80, weight: 0.9 },
      { name: "Data Cleaning & Preprocessing", level: 80, weight: 0.8 },
      { name: "Math & Linear Algebra", level: 75, weight: 0.75 },
      { name: "Model Deployment & APIs", level: 70, weight: 0.7 },
    ],
  },
  {
    role: "DevOps & Cloud Engineer",
    category: "Infrastructure",
    description: "Automates CI/CD pipelines, container orchestration, and cloud reliability.",
    requiredSkills: [
      { name: "Linux & Shell Scripting", level: 85, weight: 1.0 },
      { name: "Docker & Kubernetes", level: 85, weight: 0.95 },
      { name: "CI/CD & Automation", level: 80, weight: 0.9 },
      { name: "Cloud Platforms (AWS/GCP)", level: 75, weight: 0.85 },
      { name: "Infrastructure as Code", level: 70, weight: 0.75 },
    ],
  },
  {
    role: "Mobile App Developer",
    category: "Mobile",
    description: "Builds cross-platform or native Android and iOS mobile applications.",
    requiredSkills: [
      { name: "React Native / Flutter / Kotlin", level: 85, weight: 1.0 },
      { name: "Mobile UI/UX Patterns", level: 80, weight: 0.9 },
      { name: "REST APIs Integration", level: 75, weight: 0.85 },
      { name: "State Management & Offline Storage", level: 75, weight: 0.8 },
    ],
  },
];

export const demoBaseSkills: Skill[] = [
  { id: "s-1", name: "Data Structures & Algorithms", category: "Core CSE", score: 65, status: "intermediate", coursesContributing: ["CSC 283", "CSC 284"] },
  { id: "s-2", name: "Object Oriented Programming (Java/C++)", category: "Programming", score: 70, status: "advanced", coursesContributing: ["CSC 203", "CSC 204"] },
  { id: "s-3", name: "Database Management & SQL", category: "Databases", score: 75, status: "advanced", coursesContributing: ["CSC 345", "CSC 346"] },
  { id: "s-4", name: "Web Programming & APIs", category: "Web Development", score: 60, status: "intermediate", coursesContributing: ["CSE 393", "CSE 394"] },
  { id: "s-5", name: "Software Engineering & Architecture", category: "Software Design", score: 65, status: "intermediate", coursesContributing: ["CSC 469"] },
  { id: "s-6", name: "Operating Systems & Concurrency", category: "Systems", score: 60, status: "intermediate", coursesContributing: ["CSC 317", "CSC 318"] },
  { id: "s-7", name: "Computer Networks & Security", category: "Networks", score: 55, status: "beginner", coursesContributing: ["CSC 339", "CSC 340"] },
  { id: "s-8", name: "Machine Learning & AI", category: "AI/ML", score: 45, status: "beginner", coursesContributing: ["CSE 4317"] },
];

export function calculateDemoRoadmap(
  targetRole: string | undefined,
  completedCoursesCount: number,
  totalCoursesCount: number,
  cgpa: number
): Roadmap {
  const roleName = targetRole || "Full-Stack Software Engineer";
  const roleConfig = demoCareerRoles.find((r) => r.role === roleName) || demoCareerRoles[0];

  // Calculate readiness percentage factoring completed coursework + CGPA baseline + demo skills
  const courseFactor = Math.min(1.0, completedCoursesCount / Math.max(1, totalCoursesCount));
  const cgpaFactor = Math.min(1.0, Math.max(0, cgpa) / 4.0);
  const readinessPercent = Math.round((courseFactor * 60) + (cgpaFactor * 25) + 10);
  const clampedPercent = Math.max(15, Math.min(95, readinessPercent));

  const gaps: SkillGap[] = roleConfig.requiredSkills.map((req, idx) => {
    const studentEst = Math.min(100, Math.round(req.level * (courseFactor * 0.7 + (cgpa >= 3.0 ? 0.3 : 0.15))));
    const gapVal = Math.max(0, req.level - studentEst);
    return {
      id: `gap-${idx + 1}`,
      skill: req.name,
      category: roleConfig.category,
      currentLevel: studentEst,
      requiredLevel: req.level,
      gap: gapVal,
      recommendation: `Recommended sample step: build a focused mini-project demonstrating ${req.name}.`,
    };
  });

  const radar = roleConfig.requiredSkills.map((req) => {
    const currentVal = Math.min(100, Math.round(req.level * (courseFactor * 0.7 + 0.2)));
    return {
      axis: req.name.split("/")[0].trim(),
      current: currentVal,
      required: req.level,
    };
  });

  return {
    targetRole: roleConfig.role,
    percent: clampedPercent,
    summary: `Sample readiness estimation: based on ${completedCoursesCount} completed courses against benchmark profile for ${roleConfig.role}.`,
    status: completedCoursesCount > 0 ? "IN_PROGRESS" : "EXPLORING",
    gaps,
    radar,
  };
}
