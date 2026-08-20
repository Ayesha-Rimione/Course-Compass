import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, HelpCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { planning, type Recommendation } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/planning")({
  head: () => ({
    meta: [
      { title: "Planning — CourseCompass" },
      {
        name: "description",
        content: "Weekly, monthly and semester recommendations tied to your specific skill gaps.",
      },
      { property: "og:title", content: "Planning — CourseCompass" },
      { property: "og:description", content: "Small, checkable steps that close your skill gaps." },
    ],
  }),
  component: Planning,
});

const tabs = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "semester", label: "Semester" },
] as const;

function Planning() {
  return (
    <AppShell
      eyebrow="Planning"
      title="What to do next"
      description="Each recommendation traces back to a specific gap on your roadmap. Check them off as you go."
    >
      <Tabs defaultValue="weekly" className="max-w-3xl">
        <TabsList className="rounded-xl">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="rounded-lg font-display">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-5 space-y-3">
            {planning[t.id].map((rec) => (
              <RecCard key={rec.id} rec={rec} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}

function RecCard({ rec }: { rec: Recommendation }) {
  const [done, setDone] = useState(false);
  const [why, setWhy] = useState(false);

  return (
    <div className="card-soft p-5">
      <div className="flex gap-3">
        <Checkbox
          checked={done}
          onCheckedChange={(v) => setDone(Boolean(v))}
          className="mt-0.5 transition-transform duration-150 data-[state=checked]:scale-110"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-display text-sm font-semibold transition-colors",
              done && "text-ink-soft line-through",
            )}
          >
            {rec.title}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{rec.detail}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setWhy((v) => !v)}
              className="flex items-center gap-1.5 font-display text-xs text-ink-soft transition-colors hover:text-ink"
            >
              <HelpCircle className="size-3.5" /> Why this?
            </button>
            {rec.resource ? (
              <a
                href={rec.resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-display text-xs text-amber hover:underline"
              >
                {rec.resource.label} <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
          <div
            className={cn(
              "grid transition-all duration-300 ease-out",
              why ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <p className="rounded-xl bg-secondary px-4 py-3 text-xs leading-relaxed text-ink-soft">
                {rec.why}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
