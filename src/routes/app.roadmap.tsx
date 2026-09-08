import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { CountUp, Reveal, useInView } from "@/components/motion";
import { Roadmap as RoadmapType } from "@/types";
import { getRoadmap } from "@/api/roadmap";
import { SkillGapSection } from "@/components/sections/skill-gap-section";
import { LearningResourcesSection } from "@/components/sections/learning-resources-section";
import { JobsSection } from "@/components/sections/jobs-section";

export const Route = createFileRoute("/app/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — CourseCompass" },
      {
        name: "description",
        content:
          "Your completion percentage toward a target role, the biggest skill gaps, and competency radar.",
      },
      { property: "og:title", content: "Roadmap — CourseCompass" },
      {
        property: "og:description",
        content: "Skill gap analysis against your chosen career path.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const [data, setData] = useState<RoadmapType | null>(null);

  useEffect(() => {
    getRoadmap().then(setData);
  }, []);

  if (!data) return null;

  const sortedGaps = [...data.gaps].sort((a, b) => b.gap - a.gap);

  return (
    <AppShell
      eyebrow="Roadmap"
      title={`Toward ${data.targetRole}`}
      description={data.summary}
    >
      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-stretch">
          <Reveal>
            <div className="card-soft flex h-full items-center gap-8 p-8 relative overflow-hidden">
              <ProgressRing percent={data.percent} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="eyebrow">Overall readiness</p>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Deterministic Readiness
                  </span>
                </div>
                <p className="mt-2 font-display text-4xl leading-tight font-bold">
                  {data.percent}% of the way
                  <br />
                  to {data.targetRole}
                </p>
                <p className="mt-4 text-sm text-ink-soft">
                  Readiness calculated from your real completed coursework and verified competencies.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-soft h-full p-6 relative">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Competency radar</p>
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Role Benchmark
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Current estimated level vs required benchmark</p>
              <div className="mt-2 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.radar} outerRadius="72%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                    />
                    <Radar
                      dataKey="required"
                      stroke="var(--ink-soft)"
                      fill="var(--ink-soft)"
                      fillOpacity={0.12}
                    />
                    <Radar
                      dataKey="current"
                      stroke="var(--amber)"
                      fill="var(--amber)"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 text-xs text-ink-soft">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-amber" /> Current
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-ink-soft/40" /> Required
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Skill Gap Table Section */}
        <Reveal delay={80}>
          <SkillGapSection />
        </Reveal>

        {/* Bar Chart Section */}
        <Reveal delay={100}>
          <div className="card-soft p-8">
            <p className="eyebrow">Skill gaps · visual comparison</p>
            <h2 className="mt-1 font-display text-xl font-bold">
              Current level against {data.targetRole} requirements
            </h2>
            <div className="mt-6 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedGaps} layout="vertical" margin={{ left: 40, right: 24 }} barGap={2}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    domain={[0, 5]}
                    tickCount={6}
                    tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={150}
                    tick={{ fontSize: 12, fill: "var(--ink)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="requiredLevel" name="Required" fill="var(--border)" radius={[0, 6, 6, 0]} barSize={10} />
                  <Bar dataKey="currentLevel" name="Current" radius={[0, 6, 6, 0]} barSize={10}>
                    {sortedGaps.map((g) => (
                      <Cell
                        key={g.skill}
                        fill={g.gap >= 2 ? "var(--amber)" : "var(--chart-2)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        {/* Semester-Wise Guidance Section */}
        {data.semesterGuidance && data.semesterGuidance.length > 0 && (
          <Reveal delay={120}>
            <div className="card-soft p-8 space-y-6">
              <div>
                <p className="eyebrow">Semester-Wise Roadmap</p>
                <h2 className="mt-1 font-display text-xl font-bold">
                  Recommended milestones by semester for IUBAT CSE
                </h2>
                <p className="text-xs text-ink-soft mt-1">Structured guidance generated dynamically based on your progress.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {data.semesterGuidance.map((sg) => (
                  <div key={sg.semester} className="rounded-2xl border border-border/80 bg-background/60 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-foreground">Semester {sg.semester}</span>
                      <span className="text-xs font-semibold text-amber bg-amber-soft px-2.5 py-0.5 rounded-full">{sg.title}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-ink-soft list-disc pl-4">
                      {sg.recommendations.map((rec, i) => (
                        <li key={i} className="leading-relaxed">{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Learning Resources Section */}
        <Reveal delay={140}>
          <LearningResourcesSection />
        </Reveal>

        {/* Jobs Section */}
        <Reveal delay={160}>
          <JobsSection />
        </Reveal>
      </div>
    </AppShell>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const r = 82;
  const c = 2 * Math.PI * r;

  return (
    <div ref={ref} className="relative shrink-0">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--border)" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c - (c * percent) / 100 : c}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold">
        <CountUp value={percent} suffix="%" />
      </span>
    </div>
  );
}
