import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VantaTopologyBackground } from "@/components/vanta-topology-background";
import { StudentProfile } from "@/types";
import { getStudentProfile } from "@/api/students";
import { sendChatMessage } from "@/api/chat";
import { cn } from "@/lib/utils";

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
        content: "Your AI academic and career mentor for IUBAT CSE.",
      },
    ],
  }),
  component: ChatPage,
});

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

const AI_BHAI_AVATAR = "/Gemini_Generated_Image_p23qa7p23qa7p23q.jpg";

function ChatPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStudentProfile().then((p) => {
      setProfile(p);
      const studentName = p?.name ? p.name.split(" ")[0] : "Bhai";
      setMessages([
        {
          id: 1,
          role: "bot",
          text: `Assalamu alaikum ${studentName}! I am your AI Bhai. I have loaded your IUBAT CSE academic standing (Semester ${p?.semester || 1}, CGPA ${p?.cgpa ? p.cgpa.toFixed(2) : "3.50"}) and B231 curriculum dataset. Ask me anything about course prerequisites, skill gaps, or preparing for target tech roles!`,
        },
      ]);
    });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const response = await sendChatMessage(text);
      const botMsg: Message = {
        id: Date.now() + 1,
        role: "bot",
        text: response.reply,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
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
      description="A study companion that already knows your B231 curriculum, skills and interests."
    >
      <VantaTopologyBackground className="rounded-3xl border border-border/80 p-2 shadow-[var(--shadow-lift)]">
        <div className="card-soft mx-auto flex h-[calc(100vh-18rem)] max-w-3xl flex-col overflow-hidden bg-surface/85 backdrop-blur-xl border border-border/60">
          <div className="flex items-center gap-3 border-b border-border/80 bg-surface/90 px-6 py-4 backdrop-blur-md">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-amber shadow-sm">
              <img
                src={AI_BHAI_AVATAR}
                alt="AI Bhai Profile"
                className="size-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-sm font-bold text-ink">AI Bhai</p>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-soft text-amber-950 font-semibold border border-amber/30">
                  Senior Mentor
                </span>
              </div>
              <p className="text-xs text-ink-soft">IUBAT CSE Senior Bhai · always active</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex items-end gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "bot" && (
                  <div className="size-7 shrink-0 overflow-hidden rounded-full border border-amber/50 mb-1">
                    <img
                      src={AI_BHAI_AVATAR}
                      alt="AI Bhai"
                      className="size-full object-cover object-top"
                    />
                  </div>
                )}
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
              <div className="flex items-center gap-2 text-ink-soft">
                <div className="size-6 shrink-0 overflow-hidden rounded-full border border-amber/40">
                  <img src={AI_BHAI_AVATAR} alt="AI Bhai" className="size-full object-cover object-top" />
                </div>
                <p className="animate-pulse font-display text-xs">AI Bhai is thinking…</p>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 border-t border-border/80 bg-surface/95 px-6 py-4 backdrop-blur-md"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Bhai about your progress, B231 courses, or skill gaps…"
              className="rounded-xl bg-background/80"
            />
            <Button
              type="submit"
              disabled={!input.trim() || typing}
              className="rounded-xl px-5 font-display shrink-0 bg-amber hover:bg-amber-hover text-ink"
            >
              <Send className="mr-2 size-4" /> Send
            </Button>
          </form>
        </div>
      </VantaTopologyBackground>
    </AppShell>
  );
}
