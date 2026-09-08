import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  Compass,
  ListChecks,
  type LucideIcon,
  LogIn,
  UserPlus,
  GraduationCap,
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
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
              <span className="inline-block rounded-full border border-border/60 bg-surface/85 px-5 py-2 font-display text-xs tracking-[0.16em] uppercase backdrop-blur-md shadow-sm">
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
              <div className="mx-auto mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Student Access Portal */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-[var(--shadow-lift)] backdrop-blur-lg text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-ink text-background">
                        <Compass className="size-3.5" />
                      </span>
                      <p className="eyebrow py-0.5">Student Portal</p>
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">
                      Log in with your IUBAT student email to map coursework, track skill readiness, and chat with AI Bhai.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button asChild size="lg" className="w-full rounded-xl font-display text-sm shadow-md gap-2">
                      <Link to="/signin">
                        <LogIn className="size-4" /> Student Sign In
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full rounded-xl font-display text-sm bg-background/80 hover:bg-background gap-2">
                      <Link to="/signup">
                        <UserPlus className="size-4" /> Create Account
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* CSE Department Admin Portal */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-600/30 bg-emerald-950/20 p-5 shadow-[var(--shadow-lift)] backdrop-blur-lg text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-emerald-700 text-white">
                        <GraduationCap className="size-3.5" />
                      </span>
                      <p className="eyebrow text-emerald-800 dark:text-emerald-300 py-0.5">CSE Admin</p>
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">
                      Department faculty and coordinators: track student cohorts, manage curriculum, and govern CO/PO.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button asChild size="lg" className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display text-sm shadow-md gap-2">
                      <Link to="/admin/signin">
                        <GraduationCap className="size-4" /> Admin Sign In
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <p className="mt-7 font-display text-xs tracking-[0.2em] text-foreground/80 uppercase font-semibold">
                @{institution.emailDomain} institutional accounts only
              </p>
            </Reveal>
          </div>
        </VantaHaloBackground>

        {/* Stats Counter Bar */}
        <section className="px-6 -mt-10 relative z-20 pb-16">
          <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-3xl border border-border/80 bg-surface/95 shadow-[var(--shadow-lift)] backdrop-blur-md md:grid-cols-4">
            {landingStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 90}>
                <div className="border-r border-b border-border/80 px-6 py-9 text-center last:border-r-0 md:border-b-0">
                  <p className="font-display text-5xl font-bold text-foreground">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 font-display text-xs tracking-[0.14em] text-ink-soft uppercase font-medium">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Lower Section with Static Fixed Low-Transparency IUBAT CSE Logo Background */}
        <div className="relative isolate overflow-hidden">
          {/* Static Watermark Background Image */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center opacity-[0.07] select-none"
            style={{
              backgroundImage: "url('/iubat_cse-logo.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center 55%",
              backgroundSize: "min(550px, 75vw)",
              backgroundAttachment: "fixed",
            }}
          />

          {/* Features Section */}
          <section className="px-6 pt-6 pb-12 relative z-10">
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

          {/* Bottom CTA Section */}
          <section className="px-6 py-28 relative z-10">
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
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Button asChild size="lg" className="rounded-xl font-display shadow-md gap-2">
                    <Link to="/signup">
                      Sign up with IUBAT Email <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl font-display shadow-sm gap-2">
                    <Link to="/signin">
                      Sign in <LogIn className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
