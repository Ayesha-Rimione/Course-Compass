import { ChatContext, ChatMessage } from "@/types";
import { getStudentProfile } from "./students";
import { getCourses } from "./courses";

/**
 * Service abstraction for CourseCompass AI Bhai Chat.
 */
export async function sendChatMessage(
  message: string,
  context?: Partial<ChatContext>
): Promise<{ reply: string }> {
  const profile = await getStudentProfile();
  const courses = await getCourses();
  const completed = courses.filter((c) => c.status === "completed");

  const studentName = profile?.name ? profile.name.split(" ")[0] : "bhai";
  const lower = message.toLowerCase();

  if (lower.includes("cgpa") || lower.includes("result") || lower.includes("gpa")) {
    return {
      reply: `Your recorded CGPA is ${profile?.cgpa ? profile.cgpa.toFixed(2) : "3.50"}, ${studentName}. In IUBAT CSE, maintaining 3.50+ opens up good waiver opportunities and gives you an edge for graduate applications. Focus on securing solid grades in 4-credit core courses like Algorithms and Database Systems!`,
    };
  }

  if (lower.includes("course") || lower.includes("semester") || lower.includes("take")) {
    return {
      reply: `You're currently in Semester ${profile?.semester || 1} with ${completed.length} completed courses, ${studentName}. For your upcoming semesters, make sure you don't delay prerequisites like Data Structures (CSC 283) and Database Management (CSC 345) since advanced electives depend on them!`,
    };
  }

  if (lower.includes("project") || lower.includes("github") || lower.includes("build")) {
    return {
      reply: `Great thinking, ${studentName}! Having 2-3 polished full-stack projects on GitHub with clean READMEs and live demo links is worth more than 10 unfinished repos. You can also use the new "Import from GitHub" button on your profile to sync your repos directly!`,
    };
  }

  if (lower.includes("role") || lower.includes("job") || lower.includes("career")) {
    return {
      reply: `Targeting ${profile?.targetRole || "Full-Stack Software Engineering"} is a solid choice! The key areas employers look for right now are strong DSA fundamentals, SQL/database indexing, and building production REST APIs. Check out your Roadmap tab to see your estimated readiness breakdown!`,
    };
  }

  return {
    reply: `Got it, ${studentName}! As your AI Bhai, I recommend keeping your coursework checklist updated in the Curriculum tab and pushing your semester lab assignments to GitHub. What specific area would you like to explore next?`,
  };
}

export async function chatWithCourseCompass(
  message: string,
  context?: Partial<ChatContext>
): Promise<ChatMessage> {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const res = await sendChatMessage(message, context);
  return {
    id: `msg-${Date.now()}`,
    role: "bot",
    text: res.reply,
    timestamp,
  };
}
