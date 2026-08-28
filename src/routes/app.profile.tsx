import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Code2, Github, Linkedin, Lock, Pencil, Trophy, Phone } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudentProfile } from "@/types";
import { getStudentProfile, updateStudentProfile } from "@/api/students";
import { ProjectsSection } from "@/components/sections/projects-section";
import { CertificationsSection } from "@/components/sections/certifications-section";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CourseCompass" },
      {
        name: "description",
        content: "Your CourseCompass student profile: edit academic details, bio and linked accounts.",
      },
      { property: "og:title", content: "Profile — CourseCompass" },
      { property: "og:description", content: "Student profile details inside CourseCompass." },
    ],
  }),
  component: ProfilePage,
});

const linkIcons = { github: Github, linkedin: Linkedin, codeforces: Trophy, leetcode: Code2 };

function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    getStudentProfile().then(setProfile);
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    const updated = await updateStudentProfile(profile);
    setProfile(updated);
    setEditing(false);
  };

  if (!profile) return null;

  return (
    <AppShell
      eyebrow="Profile"
      title="Your details"
      description="Everything you entered while building your profile lives here — change any of it any time."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="rounded-xl font-display"
          variant={editing ? "default" : "outline"}
        >
          {editing ? (
            <>
              <Check className="mr-2 size-4" /> Save changes
            </>
          ) : (
            <>
              <Pencil className="mr-2 size-4" /> Edit profile
            </>
          )}
        </Button>
        <Button asChild variant="ghost" className="rounded-xl font-display">
          <Link to="/app/build-profile">Update curriculum, skills & interests</Link>
        </Button>
      </div>

      <div className="space-y-8 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="card-soft p-7">
            <div className="flex size-20 items-center justify-center rounded-full bg-amber-soft font-display text-2xl font-bold">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            {editing ? (
              <div className="mt-5 space-y-4">
                <EditField label="Full name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                <EditField label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                <EditField label="Phone (optional)" value={profile.phone || ""} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <div className="space-y-2">
                  <Label className="eyebrow">Bio</Label>
                  <Textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="resize-none rounded-xl text-sm"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="mt-5 font-display text-2xl font-bold">{profile.name}</h2>
                <p className="mt-1 text-sm text-ink-soft">{profile.email}</p>
                {profile.phone && <p className="mt-1 text-xs text-ink-soft flex items-center gap-1"><Phone className="size-3" /> {profile.phone}</p>}
                <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-soft p-7">
              <p className="eyebrow">Academic Profile (IUBAT CSE)</p>
              {editing ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <EditField
                    label="Student ID"
                    value={profile.studentId}
                    onChange={(v) => setProfile({ ...profile, studentId: v })}
                  />
                  <EditField label="Program" value={profile.program} onChange={(v) => setProfile({ ...profile, program: v })} />
                  <EditField
                    label="Current semester"
                    value={String(profile.semester)}
                    onChange={(v) => setProfile({ ...profile, semester: Number(v) || 6 })}
                  />
                  <EditField label="CGPA · private" value={String(profile.cgpa)} onChange={(v) => setProfile({ ...profile, cgpa: Number(v) || 3.72 })} />
                  <EditField label="Expected Graduation" value={profile.expectedGraduation} onChange={(v) => setProfile({ ...profile, expectedGraduation: v })} />
                </div>
              ) : (
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Student ID" value={profile.studentId} />
                  <Row label="Program" value={profile.program} />
                  <Row label="Current semester" value={`Semester ${profile.semester}`} />
                  <Row label="Expected Graduation" value={profile.expectedGraduation} />
                  <Row
                    label="CGPA"
                    value={
                      <span className="flex items-center gap-1.5 font-bold">
                        {profile.cgpa.toFixed(2)}
                        <Lock className="size-3 text-ink-soft" />
                        <span className="text-xs font-normal text-ink-soft">private</span>
                      </span>
                    }
                  />
                </dl>
              )}
            </div>

            <div className="card-soft p-7">
              <p className="eyebrow">Profiles & Competitive Programming Links</p>
              {editing ? (
                <div className="mt-4 space-y-3">
                  <EditField label="GitHub URL" value={profile.links.github} onChange={(v) => setProfile({ ...profile, links: { ...profile.links, github: v } })} />
                  <EditField label="LinkedIn URL" value={profile.links.linkedin} onChange={(v) => setProfile({ ...profile, links: { ...profile.links, linkedin: v } })} />
                  <EditField label="Codeforces Profile" value={profile.links.codeforces} onChange={(v) => setProfile({ ...profile, links: { ...profile.links, codeforces: v } })} />
                  <EditField label="LeetCode Profile" value={profile.links.leetcode} onChange={(v) => setProfile({ ...profile, links: { ...profile.links, leetcode: v } })} />
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(profile.links).map(([key, value]) => {
                    const Icon = linkIcons[key as keyof typeof linkIcons] || Code2;
                    return (
                      <a
                        key={key}
                        href={value.startsWith("http") ? value : `https://${key}.com/${value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-display text-xs font-semibold hover:border-amber transition-colors"
                      >
                        <Icon className="size-4 text-amber" /> {key}: {value.replace(/^https?:\/\//, "")}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="pt-4">
          <ProjectsSection />
        </div>

        {/* Certifications Section */}
        <div className="pt-4">
          <CertificationsSection />
        </div>
      </div>
    </AppShell>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="eyebrow">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-xl text-sm" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
