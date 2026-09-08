import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass, ShieldCheck, Lock, Mail, User as UserIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { institution } from "@/data/mock";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — CourseCompass" },
      {
        name: "description",
        content: `Create your CourseCompass account with your name, short password, and @${institution.emailDomain} student email.`,
      },
      { property: "og:title", content: "Sign up — CourseCompass" },
      {
        property: "og:description",
        content: "Sign up with your IUBAT student email to start your personalized academic & career journey.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
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

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(emailTrimmed, password, name.trim());
      navigate({ to: "/app/build-profile" });
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please check your details.");
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
            <h1 className="font-display text-2xl font-bold">Sign up</h1>
            <p className="mt-1 text-xs text-ink-soft">
              Create an account with your IUBAT student email to start your profile.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
              <UserIcon className="size-3.5" /> Full name
            </Label>
            <Input
              id="name"
              required
              placeholder="e.g. Nusrat Jahan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

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
            <p className="text-xs text-ink-soft">
              Must be your official @{institution.emailDomain} address.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
              <Lock className="size-3.5" /> Password *
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={4}
              placeholder="Enter password (min 4 characters)"
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
                <Loader2 className="size-4 animate-spin" /> Creating account...
              </>
            ) : (
              "Sign up & Build Profile"
            )}
          </Button>

          <div className="pt-2 text-center">
            <p className="text-xs text-ink-soft">
              Already have an account?{" "}
              <Link to="/signin" className="font-semibold text-ink hover:underline">
                Sign in here
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
