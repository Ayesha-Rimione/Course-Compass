import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
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
  const creditsEarned = completedCourses.reduce((sum, c) => sum + c.credits, 0);
  const creditsTotal = courses.reduce((sum, c) => sum + c.credits, 120);

  const cards = [
    { label: "Credits earned", value: creditsEarned, total: creditsTotal },
    { label: "Courses completed", value: completedCourses.length, total: courses.length || 40 },
    { label: "Skills rated", value: skills.length, total: 20 },
  ];

  return (
    <AppShell
      eyebrow="Overview"
      title="Where you stand"
      description="A quick read on your degree and your target role. Everything here is drawn from your curriculum checklist and skill ratings."
    >
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-5 rounded-3xl border-2 border-amber bg-amber-soft/40 p-6">
          <div className="min-w-0">
            <p className="eyebrow">Start here</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Build my profile</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              One page with every question laid out top to bottom — basics, bio, academic standing,
              coding links, curriculum, skills and interests. Then chat it through with AI Bhai.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl font-display">
              <Link to="/app/build-profile">Build my profile</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl bg-background font-display">
              <Link to="/app/chat">Chat with AI Bhai</Link>
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.label} delay={i * 80}>
            <div className="card-soft lift p-6">
              <p className="eyebrow">{card.label}</p>
              <p className="mt-3 font-display text-5xl font-bold">
                <CountUp value={card.value} />
                <span className="text-2xl text-ink-soft"> / {card.total}</span>
              </p>
              <Progress value={(card.value / (card.total || 1)) * 100} className="mt-5 h-1.5" />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Reveal delay={100}>
          <div className="card-soft p-8">
            <p className="eyebrow">Target role</p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              {roadmap?.targetRole || (roadmap?.status === "EXPLORING" ? "Still Exploring" : "Role Not Selected")}
            </h2>
            <p className="mt-5 font-display text-6xl font-bold text-amber">
              <CountUp value={roadmap?.percent || 0} suffix="%" />
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              {roadmap?.summary || "Select a target career role in Profile or Build Profile to calculate your readiness."}
            </p>
            <Link
              to="/app/roadmap"
              className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink hover:text-amber"
            >
              Open roadmap <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="card-soft p-8">
            <p className="eyebrow">This week</p>
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
              Open planning <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
