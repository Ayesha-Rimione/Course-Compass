import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurriculumSection } from "@/components/sections/curriculum-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { InterestsSection } from "@/components/sections/interests-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { CertificationsSection } from "@/components/sections/certifications-section";
import { StudentProfile } from "@/types";
import { getStudentProfile, updateStudentProfile } from "@/api/students";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/build-profile")({
  head: () => ({
    meta: [
      { title: "Build my profile — CourseCompass" },
      {
        name: "description",
        content:
          "One page: basics, bio, academic standing, coding links, curriculum, skills, projects, certifications, and career interests.",
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
  { id: "projects", label: "Projects portfolio" },
  { id: "certifications", label: "Certifications" },
  { id: "curriculum", label: "Curriculum checklist" },
  { id: "skills", label: "Skills & quiz" },
  { id: "interests", label: "Career interests" },
];

const semestersList = Array.from({ length: 10 }, (_, i) => i + 1);

function BuildProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    getStudentProfile().then(setProfile);
  }, []);

  const handleChange = (key: keyof StudentProfile, value: any) => {
    if (!profile) return;
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    updateStudentProfile(updated);
  };

  const handleLinkChange = (linkKey: keyof StudentProfile["links"], value: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      links: { ...profile.links, [linkKey]: value },
    };
    setProfile(updated);
    updateStudentProfile(updated);
  };

  if (!profile) return null;

  return (
    <AppShell
      eyebrow="Build my profile"
      title="Everything CourseCompass needs, on one page"
      description="Scroll top to bottom — nine sections in total. Nothing is hidden behind steps, so you can see exactly what is being asked. You can change any of it later from Profile."
    >
      <div className="grid gap-10 xl:grid-cols-[1fr_15rem] xl:items-start">
        <div className="min-w-0 space-y-8">
          <Block index={1} id="basics" title="The basics" hint="How you appear across CourseCompass (IUBAT CSE).">
            <div className="flex items-center gap-5">
              <div className="flex size-20 items-center justify-center rounded-full bg-amber-soft font-display text-xl font-bold">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <Button variant="outline" className="rounded-xl">
                <Upload className="mr-2 size-4" /> Upload photo
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" value={profile.name} onChange={(v) => handleChange("name", v)} />
              <Field label="Student ID" value={profile.studentId} onChange={(v) => handleChange("studentId", v)} />
              <Field label="Program" value={profile.program} onChange={(v) => handleChange("program", v)} />
              <Field label="Phone" value={profile.phone} onChange={(v) => handleChange("phone", v)} placeholder="+880 17..." />
            </div>
          </Block>

          <Block index={2} id="bio" title="A short bio" hint="One or two lines about your technical focus.">
            <div className="space-y-2">
              <Label className="eyebrow">Bio</Label>
              <Textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="What are you into?"
                className="resize-none rounded-xl text-sm"
              />
            </div>
          </Block>

          <Block
            index={3}
            id="academic"
            title="Academic standing"
            hint="Used to calibrate your roadmap pacing. CGPA stays strictly private."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="CGPA · private" value={String(profile.cgpa)} onChange={(v) => handleChange("cgpa", Number(v) || 3.72)} hint="Never shown to anyone else." />
              <Field label="Expected graduation" value={profile.expectedGraduation} onChange={(v) => handleChange("expectedGraduation", v)} placeholder="Fall 2027" />
            </div>
            <div className="space-y-3">
              <Label className="eyebrow">Current semester</Label>
              <div className="flex flex-wrap gap-2">
                {semestersList.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleChange("semester", s)}
                    className={cn(
                      "size-11 rounded-xl border font-display text-sm font-semibold transition-all",
                      profile.semester === s
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
            title="Coding & Competitive Profiles"
            hint="Used to sharpen backend skill suggestions and GitHub/LeetCode readiness."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GitHub URL" value={profile.links.github} onChange={(v) => handleLinkChange("github", v)} placeholder="https://github.com/..." />
              <Field label="LinkedIn URL" value={profile.links.linkedin} onChange={(v) => handleLinkChange("linkedin", v)} placeholder="https://linkedin.com/in/..." />
              <Field label="Codeforces Profile" value={profile.links.codeforces} onChange={(v) => handleLinkChange("codeforces", v)} placeholder="username" />
              <Field label="LeetCode Profile" value={profile.links.leetcode} onChange={(v) => handleLinkChange("leetcode", v)} placeholder="username" />
            </div>
          </Block>

          <Block
            index={5}
            id="projects"
            title="Projects portfolio"
            hint="Add personal, capstone, or course engineering projects."
          >
            <ProjectsSection />
          </Block>

          <Block
            index={6}
            id="certifications"
            title="Certifications & courses"
            hint="Add online certifications, verified skills, or training workshops."
          >
            <CertificationsSection />
          </Block>

          <Block
            index={7}
            id="curriculum"
            title="Curriculum checklist"
            hint="Tick what you have finished. Completed courses ask for a quick self-assessment rating."
          >
            <CurriculumSection />
          </Block>

          <Block
            index={8}
            id="skills"
            title="Skills & quiz"
            hint="Rate honestly — the roadmap is only as useful as these numbers are accurate."
          >
            <SkillsSection />
          </Block>

          <Block
            index={9}
            id="interests"
            title="Career interests"
            hint="Pick the initial career paths you are targeting for IUBAT CSE."
          >
            <InterestsSection />
          </Block>

          <div className="rounded-3xl border-2 border-amber bg-amber-soft/40 p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm">
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
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="eyebrow">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl text-sm"
      />
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
