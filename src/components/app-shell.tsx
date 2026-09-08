import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  CalendarRange,
  Compass,
  GraduationCap,
  ListChecks,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StudentProfile } from "@/types";
import { getStudentProfile } from "@/api/students";

const nav = [
  { to: "/app/progress", label: "Progress", icon: BarChart3 },
  { to: "/app/build-profile", label: "Build my profile", icon: ListChecks },
  { to: "/app/chat", label: "AI Bhai", icon: Bot },
  { to: "/app/roadmap", label: "Roadmap", icon: Compass },
  { to: "/app/planning", label: "Planning", icon: CalendarRange },
  { to: "/app/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    getStudentProfile().then(setProfile);
  }, []);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("")
    : "NJ";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-ink text-background">
            <Compass className="size-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Course<span className="text-amber">Compass</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-ink-soft hover:bg-secondary hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 h-5 w-1 rounded-r-full bg-amber transition-all",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                {item.to === "/app/chat" ? (
                  <img
                    src="/Gemini_Generated_Image_p23qa7p23qa7p23q.jpg"
                    alt="AI Bhai"
                    className="size-4 rounded-full object-cover object-top border border-amber/60 shrink-0"
                  />
                ) : (
                  <item.icon className={cn("size-4", active && "text-amber")} />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-border bg-background p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-amber-soft font-display text-sm font-bold">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">{profile?.name || "Loading..."}</p>
              <p className="truncate text-xs text-ink-soft">{profile?.studentId || "21103042"}</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
            <GraduationCap className="size-3.5" /> Semester {profile?.semester || 6} · IUBAT CSE
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 px-10 py-5 backdrop-blur-md">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{title}</h1>
        </header>
        <main className="px-10 py-8">
          {description ? (
            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
