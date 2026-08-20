import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Code2, Github, Linkedin, Lock, Pencil, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { profile as seedProfile } from "@/data/mock";

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
  const [data, setData] = useState({
    name: seedProfile.name,
    email: seedProfile.email,
    bio: seedProfile.bio,
    studentId: seedProfile.studentId,
    program: seedProfile.program,
    semester: String(seedProfile.semester),
    cgpa: seedProfile.cgpa.toFixed(2),
  });

  const set = (key: keyof typeof data, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  return (
    <AppShell
      eyebrow="Profile"
      title="Your details"
      description="Everything you entered while building your profile lives here — change any of it any time."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setEditing((v) => !v)}
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

      <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card-soft p-7">
          <div className="flex size-20 items-center justify-center rounded-full bg-amber-soft font-display text-2xl font-bold">
            {data.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          {editing ? (
            <div className="mt-5 space-y-4">
              <EditField label="Full name" value={data.name} onChange={(v) => set("name", v)} />
              <EditField label="Email" value={data.email} onChange={(v) => set("email", v)} />
              <div className="space-y-2">
                <Label className="eyebrow">Bio</Label>
                <Textarea
                  rows={4}
                  value={data.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  className="resize-none rounded-xl"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-5 font-display text-2xl font-bold">{data.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{data.email}</p>
              <p className="mt-4 text-sm leading-relaxed">{data.bio}</p>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-soft p-7">
            <p className="eyebrow">Academic</p>
            {editing ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <EditField
                  label="Student ID"
                  value={data.studentId}
                  onChange={(v) => set("studentId", v)}
                />
                <EditField label="Program" value={data.program} onChange={(v) => set("program", v)} />
                <EditField
                  label="Current semester"
                  value={data.semester}
                  onChange={(v) => set("semester", v)}
                />
                <EditField label="CGPA · private" value={data.cgpa} onChange={(v) => set("cgpa", v)} />
              </div>
            ) : (
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Student ID" value={data.studentId} />
                <Row label="Program" value={data.program} />
                <Row label="Current semester" value={`Semester ${data.semester}`} />
                <Row
                  label="CGPA"
                  value={
                    <span className="flex items-center gap-1.5">
                      {data.cgpa}
                      <Lock className="size-3 text-ink-soft" />
                      <span className="text-xs text-ink-soft">private</span>
                    </span>
                  }
                />
              </dl>
            )}
          </div>

          <div className="card-soft p-7">
            <p className="eyebrow">Linked accounts</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(seedProfile.links).map(([key, value]) => {
                const Icon = linkIcons[key as keyof typeof linkIcons];
                return (
                  <span
                    key={key}
                    className="flex items-center gap-2 rounded-full border border-border px-4 py-2 font-display text-sm"
                  >
                    <Icon className="size-4 text-ink-soft" /> {value}
                  </span>
                );
              })}
            </div>
          </div>
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
    <div className="space-y-2">
      <Label className="eyebrow">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl" />
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
