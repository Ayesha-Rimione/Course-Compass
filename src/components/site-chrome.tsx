import { Link } from "@tanstack/react-router";
import { Compass, User, LogOut } from "lucide-react";
import { institution, landingFooterLinks } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { isAuthenticated, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 px-6 pt-5">
      <div className="mx-auto flex max-w-6xl items-center gap-8 rounded-full border border-border bg-surface/85 px-6 py-3 shadow-[var(--shadow-soft)] backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-ink text-background">
            <Compass className="size-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Course<span className="text-amber">Compass</span>
          </span>
        </Link>
        <span className="hidden font-display text-xs tracking-[0.15em] text-ink-soft uppercase md:inline">
          {institution.name} · Department of CSE
        </span>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className="rounded-full font-display text-sm gap-2">
                <Link to="/app/progress">Dashboard</Link>
              </Button>
              <Button asChild className="rounded-full font-display text-sm gap-2">
                <Link to="/app/profile">
                  <User className="size-3.5" /> {profile?.name ? profile.name.split(" ")[0] : "Profile"}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="rounded-full text-xs font-medium text-ink-soft hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full font-display text-sm">
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full font-display text-sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-ink text-background">
                <Compass className="size-4" />
              </span>
              <span className="font-display text-base font-bold">CourseCompass</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              {institution.tagline}. Built for and restricted to students of {institution.fullName}.
            </p>
          </div>
          {landingFooterLinks.map((group) => (
            <div key={group.heading}>
              <p className="eyebrow">{group.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-default text-sm text-ink-soft transition-colors hover:text-ink">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-ink-soft md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} CourseCompass · {institution.name}</span>
          <span className="font-display tracking-[0.18em] uppercase">
            Student access only
          </span>
        </div>
      </div>
    </footer>
  );
}
