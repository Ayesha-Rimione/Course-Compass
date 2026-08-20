import { createFileRoute } from "@tanstack/react-router";
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
import { roadmap } from "@/data/mock";

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
  component: Roadmap,
});

function Roadmap() {
  const gaps = [...roadmap.gaps].sort((a, b) => b.required - b.current - (a.required - a.current));

  return (
    <AppShell
      eyebrow="Roadmap"
      title={`Toward ${roadmap.targetRole}`}
      description={roadmap.summary}
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-stretch">
        <Reveal>
          <div className="card-soft flex h-full items-center gap-8 p-8">
            <ProgressRing percent={roadmap.percent} />
            <div>
              <p className="eyebrow">Overall readiness</p>
              <p className="mt-2 font-display text-4xl leading-tight font-bold">
                {roadmap.percent}% of the way
                <br />
                to {roadmap.targetRole}
              </p>
              <p className="mt-4 text-sm text-ink-soft">
                Recalculated whenever you update the curriculum checklist or your skill ratings.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="card-soft h-full p-6">
            <p className="eyebrow">Competency radar</p>
            <p className="mt-1 text-xs text-ink-soft">Current vs required</p>
            <div className="mt-2 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={roadmap.radar} outerRadius="72%">
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

      <Reveal delay={80}>
        <div className="card-soft mt-6 p-8">
          <p className="eyebrow">Skill gaps · biggest first</p>
          <h2 className="mt-1 font-display text-xl font-bold">
            Current level against {roadmap.targetRole} requirements
          </h2>
          <div className="mt-6 h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gaps} layout="vertical" margin={{ left: 40, right: 24 }} barGap={2}>
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
                <Bar dataKey="required" fill="var(--border)" radius={[0, 6, 6, 0]} barSize={10} />
                <Bar dataKey="current" radius={[0, 6, 6, 0]} barSize={10}>
                  {gaps.map((g) => (
                    <Cell
                      key={g.skill}
                      fill={g.required - g.current >= 2 ? "var(--amber)" : "var(--chart-2)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>
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
