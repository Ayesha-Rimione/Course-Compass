import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Check, Code2, Github, Linkedin, Trophy, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurriculumSection } from "@/components/sections/curriculum-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { InterestsSection } from "@/components/sections/interests-section";
import { semesters } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/build-profile")({
  head: () => ({
    meta: [
      { title: "Build my profile — CourseCompass" },
      {
        name: "description",
        content:
          "One page, six sections: basics, bio, academic standing, coding links, curriculum, skills and interests.",
      },
      { property: "og:title", content: "Build my profile — CourseCompass" },
      {
        property: "og:description",
        content: "Fill everything in one scroll, then talk it through with AI Bhai.",
      },
    ],
  }),
  component: BuildProfile,
});

const sections = [
  { id: "basics", label: "Basics" },
  { id: "bio", label: "Short bio" },
  { id: "academic", label: "Academic standing" },
  { id: "links", label: "Coding profiles" },
  { id: "curriculum", label: "Curriculum checklist" },
  { id: "skills", label: "Skills & quiz" },
  { id: "interests", label: "Career interests" },
];

const linkChips = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "codeforces", label: "Codeforces", icon: Trophy },
  { id: "leetcode", label: "LeetCode", icon: Code2 },
];

function BuildProfile() {
  const [semester, setSemester] = useState<number | null>(6);
  const [active, setActive] = useState<string[]>([]);

  const toggleChip = (id: string) =>
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <AppShell
      eyebrow="Build my profile"
      title="Everything CourseCompass needs, on one page"
      description="Scroll top to bottom — seven sections in total. Nothing is hidden behind steps, so you can see exactly what is being asked. You can change any of it later from Profile."
    >
      <div className="grid gap-10 xl:grid-cols-[1fr_15rem] xl:items-start">
        <div className="min-w-0 space-y-8">
          <Block index={1} id="basics" title="The basics" hint="How you appear across CourseCompass.">
            <div className="flex items-center gap-5">
              <div className="flex size-20 items-center justify-center rounded-full bg-amber-soft font-display text-xl font-bold">
                YOU
              </div>
              <Button variant="outline" className="rounded-xl">
                <Upload className="mr-2 size-4" /> Upload photo
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" placeholder="Nusrat Jahan" />
              <Field label="Student ID" placeholder="21103042" />
              <Field label="Program" placeholder="BSc in CSE" />
              <Field label="Phone · optional" placeholder="+880 1XXXXXXXXX" />
            </div>
          </Block>

          <Block index={2} id="bio" title="A short bio" hint="Optional. One or two lines is plenty.">
            <div className="space-y-2">
              <Label className="eyebrow">Bio</Label>
              <Textarea rows={4} placeholder="What are you into?" className="resize-none rounded-xl" />
            </div>
          </Block>

          <Block
            index={3}
            id="academic"
            title="Academic standing"
            hint="Used only to calibrate your roadmap. CGPA stays private."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="CGPA · private" placeholder="3.72" hint="Never shown to anyone else." />
              <Field label="Expected graduation" placeholder="Spring 2027" />
            </div>
            <div className="space-y-3">
              <Label className="eyebrow">Current semester</Label>
              <div className="flex flex-wrap gap-2">
                {semesters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSemester(s)}
                    className={cn(
                      "size-11 rounded-xl border font-display text-sm font-semibold transition-all",
                      semester === s
                        ? "border-amber bg-amber text-primary-foreground"
                        : "border-border bg-background text-ink-soft hover:border-ink/30",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Block>

          <Block
            index={4}
            id="links"
            title="Coding profiles"
            hint="Optional. They sharpen your skill suggestions."
          >
            <div className="flex flex-wrap gap-2">
              {linkChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleChip(chip.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2.5 font-display text-sm transition-all",
                    active.includes(chip.id)
                      ? "border-amber bg-amber-soft"
                      : "border-border bg-background text-ink-soft hover:border-ink/30",
                  )}
                >
                  <chip.icon className="size-4" /> {chip.label}
                  {active.includes(chip.id) && <Check className="size-3.5 text-amber" />}
                </button>
              ))}
            </div>
            {active.length > 0 && (
              <div className="animate-in fade-in grid gap-5 duration-300 sm:grid-cols-2">
                {active.map((id) => (
                  <Field
                    key={id}
                    label={linkChips.find((c) => c.id === id)?.label ?? id}
                    placeholder="username"
                  />
                ))}
              </div>
            )}
          </Block>

          <Block
            index={5}
            id="curriculum"
            title="Curriculum checklist"
            hint="Tick what you have finished. Completed courses ask for a quick self-assessment."
          >
            <CurriculumSection />
          </Block>

          <Block
            index={6}
            id="skills"
            title="Skills & quiz"
            hint="Rate honestly — the roadmap is only as useful as these numbers are accurate."
          >
            <SkillsSection />
          </Block>

          <Block
            index={7}
            id="interests"
            title="Career interests"
            hint="Pick as many as you like — or none, if you are still figuring it out."
          >
            <InterestsSection />
          </Block>

          <div className="rounded-3xl border-2 border-amber bg-amber-soft/40 p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-background">
              <Bot className="size-6 text-amber" />
            </span>
            <h2 className="mt-5 font-display text-3xl leading-tight font-bold">
              Last step: talk it through with AI Bhai.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Your profile is saved. AI Bhai reads your curriculum, skills and interests and walks
              you through your progress — ask anything about what to learn next.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl font-display">
                <Link to="/app/chat">Chat with AI Bhai</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-background font-display">
                <Link to="/app/progress">Go to dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        <nav className="card-soft sticky top-28 hidden p-5 xl:block">
          <p className="eyebrow">On this page</p>
          <ol className="mt-4 space-y-2.5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-start gap-2.5 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <span className="font-display text-xs font-bold text-amber">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-ink-soft">
            {sections.length} sections in total. Everything can be edited later from Profile.
          </p>
        </nav>
      </div>
    </AppShell>
  );
}

function Block({
  index,
  id,
  title,
  hint,
  children,
}: {
  index: number;
  id: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm font-bold text-amber">
          {String(index).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{hint}</p>
        </div>
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  hint,
}: {
  label: string;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="eyebrow">{label}</Label>
      <Input placeholder={placeholder} className="h-12 rounded-xl" />
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
