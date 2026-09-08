import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass, ShieldCheck, Lock, Mail, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { institution } from "@/data/mock";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/signin")({
  head: () => ({
    meta: [
      { title: "Admin Portal Sign In — CourseCompass" },
      {
        name: "description",
        content: `Sign in to the IUBAT CSE Department Admin Workspace.`,
      },
    ],
  }),
  component: AdminSignIn,
});

function AdminSignIn() {
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
      setError(`Only @${institution.emailDomain} institutional email addresses are permitted.`);
      return;
    }

    setLoading(true);
    try {
      const res = await login(emailTrimmed, password);
      // If user is admin, navigate directly to Admin Workspace
      if (res.role === "ADMIN" || res.role === "DEPARTMENT_ADMIN" || res.role === "SUPER_ADMIN" || res.role === "IUBAT_AUTHORITY" || emailTrimmed.startsWith("admin@")) {
        navigate({ to: "/app/admin" });
      } else {
        setError("Access denied. This account does not possess CSE Department Admin privileges.");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid administrator credentials. Please check your email and password.");
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
        <ArrowLeft className="size-3.5" /> Back to Home
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-surface p-8 shadow-xl relative overflow-hidden">
        {/* Top green accent border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500" />

        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <span className="font-display text-sm font-bold tracking-tight text-ink">CourseCompass Admin</span>
            <p className="text-xs font-medium text-emerald-700">IUBAT CSE Department Administration</p>
          </div>
        </div>

        <form className="mt-6 space-y-4 animate-in fade-in duration-300" onSubmit={handleSubmit}>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Department Sign In</h1>
            <p className="mt-1 text-xs text-ink-soft">
              Access cohort tracking, course syllabus governance, and accreditation outcomes.
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
              <Mail className="size-3.5" /> Administrator email (@iubat.edu) *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@iubat.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-border bg-background/50 focus:bg-background text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
              <Lock className="size-3.5" /> Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-border bg-background/50 focus:bg-background text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display text-sm shadow-md transition-all gap-2 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Sign In as Admin
              </>
            )}
          </Button>

          <div className="pt-2 text-center border-t border-border mt-4">
            <p className="text-xs text-ink-soft">
              Are you an IUBAT student?{" "}
              <Link to="/signin" className="font-semibold text-emerald-700 hover:underline">
                Student Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
