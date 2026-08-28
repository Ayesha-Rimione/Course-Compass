import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Sparkles, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CountUp, Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Roadmap as RoadmapType, Course, Skill } from "@/types";
import { getCourses } from "@/api/courses";
import { getSkills } from "@/api/skills";
import { getRoadmap, getPlanningRecommendations } from "@/api/roadmap";
import { Recommendation } from "@/data/mock";

export const Route = createFileRoute("/app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — CourseCompass" },
      {
        name: "description",
        content: "Credits earned, courses completed and roadmap completion at a glance.",
      },
      { property: "og:title", content: "Progress — CourseCompass" },
      { property: "og:description", content: "Your academic progress overview in CourseCompass." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [weeklyRecs, setWeeklyRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    getCourses().then(setCourses);
    getSkills().then(setSkills);
    getRoadmap().then(setRoadmap);
    getPlanningRecommendations().then((res) => setWeeklyRecs(res.weekly));
  }, []);

  const completedCourses = courses.filter((c) => c.status === "completed");
  const creditsEarned = completedCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
  const creditsTotal = courses.reduce((sum, c) => sum + (c.credits || 3), 0) || 140;

  const cards = [
    {
      label: "Credits earned (Real)",
      value: creditsEarned,
      total: creditsTotal,
      isReal: true,
    },
    {
      label: "Courses completed (Real)",
      value: completedCourses.length,
      total: courses.length || 82,
      isReal: true,
    },
    {
      label: "Curriculum Coverage",
      value: Math.round((completedCourses.length / Math.max(1, courses.length || 82)) * 100),
      total: 100,
      suffix: "%",
      isSample: false,
    },
  ];

  return (
    <AppShell
      eyebrow="Overview"
      title="Where you stand"
      description="A quick read on your degree and your target role. Real transcript data is linked directly to your courses."
    >
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-5 rounded-3xl border-2 border-amber bg-amber-soft/40 p-6">
          <div className="size-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber shadow-sm hidden sm:block">
            <img
              src="/Gemini_Generated_Image_p23qa7p23qa7p23q.jpg"
              alt="AI Bhai Mentor"
              className="size-full object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow flex items-center gap-1.5 text-amber-900">
              <Sparkles className="size-3.5" /> Start here with AI Bhai
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">Quick Academic Onboarding</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Got 2 minutes, bhai? Step through your semester and CGPA, and confirm your completed courses one-by-one with quick taps.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl font-display bg-amber hover:bg-amber-hover text-ink">
              <Link to="/app/build-profile">Start Step-by-Step Setup</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl bg-background font-display">
              <Link to="/app/chat">Chat with AI Bhai</Link>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Stats Cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.label} delay={i * 80}>
            <div className="card-soft lift p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="eyebrow">{card.label}</p>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  Real Data
                </span>
              </div>
              <p className="mt-3 font-display text-5xl font-bold">
                <CountUp value={card.value} />
                {card.suffix ? (
                  <span>{card.suffix}</span>
                ) : (
                  <span className="text-2xl text-ink-soft"> / {card.total}</span>
                )}
              </p>
              <Progress
                value={card.suffix ? card.value : (card.value / (card.total || 1)) * 100}
                className="mt-5 h-1.5"
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Reveal delay={100}>
          <div className="card-soft p-8 relative">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Target Role Readiness</p>
              <span className="text-[0.68rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-soft text-amber-900 border border-amber/40">
                Sample Data / Preview
              </span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold">
              {roadmap?.targetRole || "Full-Stack Software Engineer"}
            </h2>
            <p className="mt-5 font-display text-6xl font-bold text-amber">
              <CountUp value={roadmap?.percent || 0} suffix="%" />
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              {roadmap?.summary || "Readiness calculated from your real completed courses against benchmark skill requirements."}
            </p>
            <Link
              to="/app/roadmap"
              className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink hover:text-amber"
            >
              Open roadmap & skill radar <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="card-soft p-8">
            <p className="eyebrow">This week's focus</p>
            <ul className="mt-5 space-y-4">
              {weeklyRecs.slice(0, 4).map((rec) => (
                <li key={rec.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber" />
                  <span className="leading-relaxed">{rec.title}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/app/planning"
              className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink hover:text-amber"
            >
              Open planning steps <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
