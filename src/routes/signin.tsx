import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass, ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { institution } from "@/data/mock";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — CourseCompass" },
      {
        name: "description",
        content: `Sign in to your CourseCompass account with your @${institution.emailDomain} student email and password.`,
      },
      { property: "og:title", content: "Sign in — CourseCompass" },
      {
        property: "og:description",
        content: "Sign in with your IUBAT student email and password to access your personalized roadmap.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed.endsWith(`@${institution.emailDomain}`)) {
      setError(`Only @${institution.emailDomain} student email addresses are allowed.`);
      return;
    }

    setLoading(true);
    try {
      const res = await login(emailTrimmed, password);
      if (res.role === "ADMIN" || res.role === "DEPARTMENT_ADMIN" || res.role === "SUPER_ADMIN" || res.role === "IUBAT_AUTHORITY" || emailTrimmed.startsWith("admin@")) {
        navigate({ to: "/app/admin" });
      } else if (!res.isComplete) {
        navigate({ to: "/app/build-profile" });
      } else {
        navigate({ to: "/app/progress" });
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-paper flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 font-display text-xs tracking-[0.15em] text-ink-soft uppercase transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Home
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-ink text-background">
            <Compass className="size-5" />
          </span>
          <div>
            <span className="font-display text-sm font-bold tracking-tight">CourseCompass</span>
            <p className="text-xs text-ink-soft">IUBAT CSE Department</p>
          </div>
        </div>

        <form className="mt-6 space-y-4 animate-in fade-in duration-300" onSubmit={handleSubmit}>
          <div>
            <h1 className="font-display text-2xl font-bold">Sign in</h1>
            <p className="mt-1 text-xs text-ink-soft">
              Sign in with your IUBAT student email and password.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
              <Mail className="size-3.5" /> Student email *
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder={`21103xxx@${institution.emailDomain}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
              <Lock className="size-3.5" /> Password *
            </Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="mt-4 w-full rounded-xl font-display text-sm gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="pt-2 text-center">
            <p className="text-xs text-ink-soft">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-ink hover:underline">
                Sign up with IUBAT email
              </Link>
            </p>
          </div>
        </form>

        <p className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs text-ink-soft">
          <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" /> Verified access for {institution.name} students.
        </p>
      </div>
    </div>
  );
}
