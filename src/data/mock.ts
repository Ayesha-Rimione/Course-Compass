/**
 * Single source of mock data for CourseCompass.
 * Replace these exports with real API calls later — components never
 * hardcode content of their own.
 */

export const institution = {
  name: "IUBAT",
  fullName: "International University of Business Agriculture and Technology",
  emailDomain: "iubat.edu",
  product: "CourseCompass",
  tagline: "Workforce & skills alignment for IUBAT students",
};

export const landingStats = [
  { label: "Courses mapped", value: 412, suffix: "" },
  { label: "Skills tracked", value: 168, suffix: "" },
  { label: "Career paths", value: 24, suffix: "" },
  { label: "Curriculum coverage", value: 96, suffix: "%" },
];

export const landingFeatures = [
  {
    id: "curriculum",
    eyebrow: "Curriculum intelligence",
    title: "Every course you take, mapped to real skills",
    body: "Tick off what you have completed and CourseCompass translates your transcript into a live skill inventory — not a list of course codes.",
    icon: "ListChecks",
  },
  {
    id: "gaps",
    eyebrow: "Gap analysis",
    title: "See the distance between you and the role",
    body: "Compare your current level against what employers ask for, sorted so the biggest gap is always the first thing you read.",
    icon: "BarChart3",
  },
  {
    id: "roadmap",
    eyebrow: "Roadmap",
    title: "One target role, one honest percentage",
    body: "A single number that moves as you learn, backed by competency radars instead of vague encouragement.",
    icon: "Compass",
  },
  {
    id: "planning",
    eyebrow: "Planning",
    title: "Weekly steps, not vague advice",
    body: "Small, checkable recommendations for this week, this month and this semester — each one traced back to a specific gap.",
    icon: "CalendarRange",
  },
];

export const landingFooterLinks = [
  {
    heading: "Platform",
    links: ["Progress", "Curriculum", "Skills", "Roadmap", "Planning"],
  },
  {
    heading: "Academic",
    links: ["Department of CSE", "Advising office", "Course catalogue", "Academic calendar"],
  },
  {
    heading: "Support",
    links: ["Student help desk", "Data & privacy", "Accessibility", "Report an issue"],
  },
];

export type CourseStatus = "not-started" | "ongoing" | "completed";

export type Course = {
  code: string;
  title: string;
  credits: number;
  semester: number;
  status: CourseStatus;
  rating?: number | undefined;
  grade?: string | undefined;
};

export const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];

const rawCourses: Array<[string, string, number, number]> = [
  ["CSC 101", "Introduction to Computer Studies", 3, 1],
  ["MAT 101", "Mathematics I: Differential Calculus", 3, 1],
  ["ENG 101", "English Reading & Writing", 3, 1],
  ["PHY 101", "Physics I", 3, 1],
  ["CSC 103", "Structured Programming", 3, 2],
  ["MAT 102", "Mathematics II: Integral Calculus", 3, 2],
  ["CHE 101", "Chemistry", 3, 2],
  ["ENG 102", "English Listening & Speaking", 3, 2],
  ["CSC 203", "Object Oriented Programming", 3, 3],
  ["CSC 205", "Discrete Mathematics", 3, 3],
  ["MAT 203", "Linear Algebra", 3, 3],
  ["EEE 201", "Electrical Circuits", 3, 3],
  ["CSC 207", "Data Structures", 3, 4],
  ["CSC 209", "Digital Logic Design", 3, 4],
  ["STA 201", "Statistics & Probability", 3, 4],
  ["ACT 201", "Principles of Accounting", 3, 4],
  ["CSC 301", "Algorithms", 3, 5],
  ["CSC 303", "Database Management Systems", 3, 5],
  ["CSC 305", "Computer Architecture", 3, 5],
  ["ECO 201", "Microeconomics", 3, 5],
  ["CSC 307", "Operating Systems", 3, 6],
  ["CSC 309", "Software Engineering", 3, 6],
  ["CSC 311", "Computer Networks", 3, 6],
  ["MGT 301", "Organizational Behaviour", 3, 6],
  ["CSC 401", "Web Application Development", 3, 7],
  ["CSC 403", "Artificial Intelligence", 3, 7],
  ["CSC 405", "Compiler Design", 3, 7],
  ["CSC 407", "Information Security", 3, 7],
  ["CSC 409", "Machine Learning", 3, 8],
  ["CSC 411", "Distributed Systems", 3, 8],
  ["CSC 413", "Mobile Application Development", 3, 8],
  ["CSC 415", "Human Computer Interaction", 3, 8],
  ["CSC 421", "Cloud Computing", 3, 9],
  ["CSC 423", "Data Mining", 3, 9],
  ["CSC 490", "Capstone Project I", 3, 9],
  ["CSC 491", "Capstone Project II", 3, 10],
  ["CSC 425", "DevOps & Site Reliability", 3, 10],
  ["CSC 427", "Advanced Topics in Software Systems", 3, 10],
  ["BUS 401", "Entrepreneurship", 3, 10],
  ["CSC 499", "Industrial Attachment", 3, 10],
];

export const courses: Course[] = rawCourses.map(([code, title, credits, semester]) => ({
  code,
  title,
  credits,
  semester,
  status: semester <= 5 ? "completed" : semester === 6 ? "ongoing" : "not-started",
  rating: semester <= 5 ? 4 : undefined,
  grade: semester <= 5 ? "A-" : undefined,
}));

export const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

export type Skill = { id: string; name: string; level: number; category: string };

export const skills: Skill[] = [
  { id: "js", name: "JavaScript", level: 4, category: "Languages" },
  { id: "ts", name: "TypeScript", level: 3, category: "Languages" },
  { id: "py", name: "Python", level: 4, category: "Languages" },
  { id: "sql", name: "SQL", level: 3, category: "Data" },
  { id: "react", name: "React", level: 3, category: "Frameworks" },
  { id: "node", name: "Node.js", level: 2, category: "Frameworks" },
  { id: "docker", name: "Docker", level: 1, category: "Infrastructure" },
  { id: "git", name: "Git & version control", level: 4, category: "Tooling" },
  { id: "dsa", name: "Data structures & algorithms", level: 3, category: "Fundamentals" },
  { id: "sysdesign", name: "System design", level: 1, category: "Fundamentals" },
];

export const skillSuggestions = [
  "GraphQL",
  "PostgreSQL",
  "Redis",
  "Kubernetes",
  "Figma",
  "Pandas",
  "TensorFlow",
  "Linux administration",
];

export const careerInterests = [
  {
    id: "backend",
    title: "Backend Developer",
    description: "APIs, databases and the systems that keep products running.",
  },
  {
    id: "data",
    title: "Data Analyst",
    description: "Turning messy institutional data into decisions people trust.",
  },
  {
    id: "ml",
    title: "Machine Learning Engineer",
    description: "Training, shipping and monitoring models in production.",
  },
  {
    id: "frontend",
    title: "Frontend Engineer",
    description: "Interfaces that stay fast, accessible and pleasant to use.",
  },
  {
    id: "devops",
    title: "DevOps / SRE",
    description: "Pipelines, reliability and infrastructure that heals itself.",
  },
  {
    id: "security",
    title: "Security Analyst",
    description: "Finding weaknesses before someone else does.",
  },
];

export const roadmap = {
  targetRole: "Backend Developer",
  percent: 68,
  summary:
    "You are strongest in language fundamentals and data structures. Infrastructure and system design are the two things holding the number down.",
  gaps: [
    { skill: "System design", current: 1, required: 4 },
    { skill: "Docker & containers", current: 1, required: 4 },
    { skill: "Node.js", current: 2, required: 4 },
    { skill: "PostgreSQL", current: 2, required: 4 },
    { skill: "Testing & CI", current: 2, required: 3 },
    { skill: "TypeScript", current: 3, required: 4 },
    { skill: "Algorithms", current: 3, required: 4 },
    { skill: "Git workflow", current: 4, required: 4 },
  ],
  radar: [
    { axis: "Programming", current: 4, required: 5 },
    { axis: "Data", current: 3, required: 4 },
    { axis: "Systems", current: 2, required: 4 },
    { axis: "Infrastructure", current: 1, required: 4 },
    { axis: "Collaboration", current: 4, required: 4 },
    { axis: "Communication", current: 3, required: 4 },
  ],
};

export type Recommendation = {
  id: string;
  title: string;
  detail: string;
  resource?: { label: string; url: string };
  why: string;
};

export const planning: Record<"weekly" | "monthly" | "semester", Recommendation[]> = {
  weekly: [
    {
      id: "w1",
      title: "Finish two LeetCode mediums on graphs",
      detail: "Aim for BFS and shortest-path variants rather than easy array problems.",
      resource: { label: "Graph problem set", url: "https://leetcode.com" },
      why: "Algorithms sits at 3 of 5 against a required 4 for Backend Developer.",
    },
    {
      id: "w2",
      title: "Containerise one existing project",
      detail: "Write a Dockerfile and a compose file for a project you already have.",
      resource: { label: "Docker getting started", url: "https://docs.docker.com/get-started/" },
      why: "Docker & containers is your second largest gap: 1 of 5 against a required 4.",
    },
    {
      id: "w3",
      title: "Add tests to a route handler",
      detail: "Pick one API endpoint and cover the happy path plus two failures.",
      why: "Testing & CI is at 2 of 5 against a required 3.",
    },
    {
      id: "w4",
      title: "Read one system design case study",
      detail: "Take notes on the trade-offs, not just the diagram.",
      why: "System design is the single biggest gap on your roadmap.",
    },
    {
      id: "w5",
      title: "Convert one JS file to TypeScript",
      detail: "Start with the module you understand best so types stay honest.",
      why: "TypeScript is at 3 of 5 against a required 4.",
    },
  ],
  monthly: [
    {
      id: "m1",
      title: "Ship a small REST API with PostgreSQL",
      detail: "Auth, three resources, migrations and a deployed URL.",
      why: "Covers Node.js and PostgreSQL, both 2 of 5 against a required 4.",
    },
    {
      id: "m2",
      title: "Set up CI on a personal repository",
      detail: "Lint, test and build on every push.",
      resource: { label: "GitHub Actions docs", url: "https://docs.github.com/actions" },
      why: "Testing & CI gap, and it makes DevOps work later much cheaper.",
    },
    {
      id: "m3",
      title: "Design a URL shortener end to end",
      detail: "Write it up: data model, caching, rate limits, failure modes.",
      why: "System design: 1 of 5 against a required 4.",
    },
    {
      id: "m4",
      title: "Complete 40 algorithm problems",
      detail: "Two per weekday, mixed topics, reviewed weekly.",
      why: "Algorithms gap and general interview readiness.",
    },
    {
      id: "m5",
      title: "Pair with a senior on a code review",
      detail: "Ask specifically about structure and naming, not syntax.",
      why: "Collaboration is already strong — this keeps it at level 4.",
    },
  ],
  semester: [
    {
      id: "s1",
      title: "Take CSC 425 DevOps & Site Reliability",
      detail: "It maps directly to your weakest competency axis.",
      why: "Infrastructure sits at 1 of 5 against a required 4.",
    },
    {
      id: "s2",
      title: "Make your capstone a distributed system",
      detail: "Queue, worker and API as separate deployable services.",
      why: "Systems competency: 2 of 5 against a required 4.",
    },
    {
      id: "s3",
      title: "Apply for one backend internship per month",
      detail: "Track responses and note which skill each rejection cites.",
      why: "Converts roadmap progress into real hiring signal.",
    },
    {
      id: "s4",
      title: "Publish three technical write-ups",
      detail: "One per project, explaining a decision you got wrong first.",
      why: "Communication is at 3 of 5 against a required 4.",
    },
    {
      id: "s5",
      title: "Contribute to one open source repository",
      detail: "Start with documentation, then a small bug fix.",
      why: "Git workflow and collaboration at professional standard.",
    },
  ],
};

export const profile = {
  name: "Nusrat Jahan",
  studentId: "21103042",
  email: "nusrat.jahan@iubat.edu",
  program: "B.Sc. in Computer Science & Engineering",
  semester: 6,
  cgpa: 3.72,
  bio: "Building small backend things and slowly getting comfortable with infrastructure.",
  links: {
    github: "nusrat-j",
    linkedin: "nusratjahan",
    codeforces: "nusrat_j",
    leetcode: "nusratj",
  },
};

export const progressOverview = {
  creditsEarned: 60,
  creditsTotal: 120,
  coursesCompleted: 20,
  coursesTotal: 40,
  skillsRated: 10,
  roadmapPercent: 68,
};
