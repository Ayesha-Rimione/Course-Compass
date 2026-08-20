import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profile, progressOverview, roadmap, planning } from "@/data/mock";
import { cn } from "@/lib/utils";
import { VantaTopologyBackground } from "@/components/vanta-topology-background";

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

type Msg = { id: number; role: "user" | "bot"; text: string };

const prompts = [
  "How is my progress?",
  "What is my biggest skill gap?",
  "What should I do this week?",
  "Am I on track for my target role?",
];

function reply(input: string): string {
  const q = input.toLowerCase();
  const topGap = [...roadmap.gaps].sort((a, b) => b.required - b.current - (a.required - a.current))[0] ?? {
    skill: "System design",
    current: 1,
    required: 4,
  };

  if (q.includes("gap") || q.includes("weak")) {
    return `Your biggest gap right now is **${topGap.skill}** — you rated yourself ${topGap.current}/5 and ${roadmap.targetRole} roles typically expect ${topGap.required}/5. Close that one first, bhai; everything else on your roadmap is within one level.`;
  }
  if (q.includes("week") || q.includes("plan") || q.includes("next")) {
    return `For this week I would keep it to three things:\n1. ${planning.weekly[0]?.title}\n2. ${planning.weekly[1]?.title}\n3. ${planning.weekly[2]?.title}\nSmall and finishable beats ambitious and abandoned.`;
  }
  if (q.includes("track") || q.includes("role") || q.includes("job")) {
    return `You are ${roadmap.percent}% of the way to ${roadmap.targetRole}. ${roadmap.summary} With semester ${profile.semester} coursework counted in, that is a normal place to be — keep the gap list moving and you will be interview-ready before graduation.`;
  }
  if (q.includes("progress") || q.includes("credit") || q.includes("course")) {
    return `Here is your snapshot: ${progressOverview.creditsEarned}/${progressOverview.creditsTotal} credits earned, ${progressOverview.coursesCompleted}/${progressOverview.coursesTotal} courses completed and ${progressOverview.skillsRated} skills rated. That puts you at ${roadmap.percent}% toward ${roadmap.targetRole}.`;
  }
  if (q.includes("cgpa") || q.includes("grade")) {
    return `Your CGPA of ${profile.cgpa.toFixed(2)} stays private — nobody else sees it. It only nudges how aggressive your roadmap pacing is, never what you are allowed to aim for.`;
  }
  return `Good question. From what you have filled in — semester ${profile.semester}, ${progressOverview.coursesCompleted} courses done and ${progressOverview.skillsRated} skills rated — the highest-leverage move is still ${topGap.skill}. Ask me about your progress, skill gaps, or this week's plan and I will go deeper.`;
}

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "bot",
      text: `Assalamu alaikum ${profile.name.split(" ")[0]}! I am AI Bhai. I have read your profile, curriculum checklist, skills and interests. Ask me anything about where you stand.`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: clean }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply(clean) }]);
      setTyping(false);
    }, 750);
  };

  return (
    <AppShell
      eyebrow="AI Bhai"
      title="Talk through your progress"
      description="A study companion that already knows your curriculum, skills and interests. This demo answers from your CourseCompass data."
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
