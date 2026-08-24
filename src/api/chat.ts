import { ChatContext, ChatMessage } from "@/types";

/**
 * Service abstraction for CourseCompass AI Chat.
 * Will connect to POST /api/v1/chat on FastAPI backend in future phase.
 */
export async function chatWithCourseCompass(
  message: string,
  context?: Partial<ChatContext>
): Promise<ChatMessage> {
  // Clean service signature ready for backend LLM / RAG endpoint
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  // Clean placeholder response until FastAPI backend LLM endpoint is connected
  return {
    id: `msg-${Date.now()}`,
    role: "bot",
    text: `Backend AI service pending connection. Received message: "${message}". Context: ${context?.targetRole || "Backend Developer"}.`,
    timestamp,
  };
}
