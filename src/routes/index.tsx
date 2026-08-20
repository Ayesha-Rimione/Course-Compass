import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  Compass,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { CountUp, Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { institution, landingFeatures, landingStats } from "@/data/mock";

import { VantaHaloBackground } from "@/components/vanta-halo-background";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourseCompass — Skills alignment for IUBAT students" },
      {
        name: "description",
        content:
          "Map your IUBAT coursework to real workforce skills, see the gap to your target role, and get weekly steps that close it.",
      },
      { property: "og:title", content: "CourseCompass — Skills alignment for IUBAT students" },
      {
        property: "og:description",
        content: "Curriculum, skills, roadmap and weekly planning in one private academic tool.",
      },
    ],
  }),
  component: Landing,
});

const icons: Record<string, LucideIcon> = {
  ListChecks,
  BarChart3,
  Compass,
  CalendarRange,
};

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section with Live Vanta Halo Background */}
      <VantaHaloBackground
        baseColor={0x0f2d19}
        backgroundColor={0x051a0d}
        size={1.1}
        overlayOpacity={0.35}
        className="px-6 pt-20 pb-24"
      >
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <span className="inline-block rounded-full border border-border/60 bg-surface/85 px-5 py-2 font-display text-[0.68rem] tracking-[0.2em] uppercase backdrop-blur-md shadow-sm">
              {institution.fullName}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-8 font-display text-[clamp(3.5rem,10vw,7.5rem)] leading-[0.86] font-bold tracking-tight">
              <span className="block text-ink/20 drop-shadow-sm [-webkit-text-stroke:2px_var(--ink)]">
                COURSE
              </span>
              <span className="block text-foreground drop-shadow-md">COMPASS</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-foreground/90 backdrop-blur-sm rounded-2xl bg-surface/40 p-4 border border-border/30 shadow-sm">
              Your degree, translated into the skills employers actually hire for — and the shortest
              honest path from where you are to the role you want.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mx-auto mt-10 flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border/80 bg-surface/90 p-4 shadow-[var(--shadow-lift)] backdrop-blur-lg">
              <p className="eyebrow py-1">Student access</p>
              <Button asChild size="lg" className="rounded-xl font-display text-base shadow-md">
                <Link to="/signup">Sign up</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl font-display text-base bg-background/80 hover:bg-background">
                <Link to="/app/build-profile">Build your profile</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <p className="mt-7 font-display text-xs tracking-[0.2em] text-foreground/80 uppercase font-semibold">
              @{institution.emailDomain} accounts only
            </p>
          </Reveal>
        </div>
      </VantaHaloBackground>

      <section className="px-6 -mt-10 relative z-20 pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-3xl border border-border/80 bg-surface/95 shadow-[var(--shadow-lift)] backdrop-blur-md md:grid-cols-4">
          {landingStats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="border-r border-b border-border/80 px-6 py-9 text-center last:border-r-0 md:border-b-0">
                <p className="font-display text-5xl font-bold text-foreground">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 font-display text-[0.68rem] tracking-[0.18em] text-ink-soft uppercase font-medium">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="mx-auto max-w-5xl space-y-28">
          {landingFeatures.map((feature, i) => {
            const Icon = icons[feature.icon] ?? Compass;
            const flipped = i % 2 === 1;
            return (
              <Reveal key={feature.id}>
                <div
                  className={`grid items-center gap-14 md:grid-cols-2 ${flipped ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className="lift flex aspect-[4/3] items-center justify-center rounded-3xl border border-border bg-surface/90 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                    <div className="grid-paper flex size-full items-center justify-center rounded-3xl">
                      <span className="flex size-24 items-center justify-center rounded-3xl bg-amber-soft shadow-inner">
                        <Icon className="size-10 text-ink" />
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow">{feature.eyebrow}</p>
                    <h2 className="mt-4 font-display text-4xl leading-[1.05] font-bold">
                      {feature.title}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-ink-soft">{feature.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-28">
        <Reveal>
          <div className="grid-paper mx-auto max-w-5xl rounded-[2.5rem] border border-border bg-surface/95 px-10 py-20 text-center shadow-[var(--shadow-lift)] backdrop-blur-sm">
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-bold">
              Start with the courses
              <br />
              you have already passed.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-ink-soft">
              Ten minutes of setup gives you a roadmap that updates every semester.
            </p>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg" className="rounded-xl font-display shadow-md">
                <Link to="/app/build-profile">
                  Build your profile <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
