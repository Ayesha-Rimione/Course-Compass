import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VantaTopologyBackground } from "@/components/vanta-topology-background";
import { ChatMessage, StudentProfile } from "@/types";
import { getStudentProfile } from "@/api/students";
import { chatWithCourseCompass } from "@/api/chat";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "AI Bhai — CourseCompass" },
      {
        name: "description",
        content:
          "Chat with AI Bhai about your curriculum progress, skill gaps and what to learn next.",
      },
      { property: "og:title", content: "AI Bhai — CourseCompass" },
      {
        property: "og:description",
        content: "Your CourseCompass study companion, reading your profile and progress.",
      },
    ],
  }),
  component: ChatPage,
});

const prompts = [
  "How is my progress?",
  "What is my biggest skill gap?",
  "What should I do this week?",
  "Am I on track for my target role?",
];

function ChatPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [targetRole, setTargetRole] = useState<string>("Career Path Exploring");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStudentProfile().then((p) => {
      setProfile(p);
      const studentName = p.name ? p.name.split(" ")[0] : "Student";
      setMessages([
        {
          id: 0,
          role: "bot",
          text: `Assalamu alaikum ${studentName}! I am AI Bhai. I have loaded your IUBAT CSE academic profile, curriculum checklist, and skills. Ask me anything about what courses to take, skill gaps, or career role recommendations!`,
        },
      ]);
    });

    import("@/api/roadmap").then(({ getRoadmap }) => {
      getRoadmap().then((r) => {
        if (r?.targetRole) {
          setTargetRole(r.targetRole);
        }
      });
    });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    
    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: clean };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setTyping(true);

    try {
      const response = await chatWithCourseCompass(clean, {
        student: profile || undefined,
        targetRole: targetRole || "Career Path Exploring",
      });
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: "Unable to reach CourseCompass AI service. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }

  };

  return (
    <AppShell
      eyebrow="AI Bhai"
      title="Talk through your progress"
      description="A study companion that already knows your curriculum, skills and interests. Connected to CourseCompass API service."
    >
      <VantaTopologyBackground className="rounded-3xl border border-border/80 p-2 shadow-[var(--shadow-lift)]">
        <div className="card-soft mx-auto flex h-[calc(100vh-18rem)] max-w-3xl flex-col overflow-hidden bg-surface/85 backdrop-blur-xl border border-border/60">
          <div className="flex items-center gap-3 border-b border-border/80 bg-surface/90 px-6 py-4 backdrop-blur-md">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-soft shadow-inner">
              <Bot className="size-4 text-ink" />
            </span>
            <div>
              <p className="font-display text-sm font-bold">AI Bhai</p>
              <p className="text-xs text-ink-soft">Reading your profile · always online</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] text-sm leading-relaxed whitespace-pre-line shadow-sm",
                    m.role === "user"
                      ? "rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground font-medium"
                      : "rounded-2xl bg-surface/90 border border-border/60 px-4 py-2.5 text-foreground backdrop-blur-md",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <p className="animate-pulse font-display text-sm text-ink-soft">AI Bhai is typing…</p>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/80 bg-surface/90 px-6 py-4 backdrop-blur-md">
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-border/80 bg-background/60 px-3 py-1.5 text-xs text-ink-soft transition-all hover:border-amber hover:bg-background hover:text-ink"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask AI Bhai about your progress…"
                className="h-11 rounded-xl bg-background/80 backdrop-blur-sm"
              />
              <Button type="submit" disabled={typing} className="rounded-xl px-4 shadow-md">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </VantaTopologyBackground>
    </AppShell>
  );
}
