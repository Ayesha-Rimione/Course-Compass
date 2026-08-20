import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { institution } from "@/data/mock";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — CourseCompass" },
      {
        name: "description",
        content: `Create your CourseCompass account with your name and @${institution.emailDomain} student email.`,
      },
      { property: "og:title", content: "Sign up — CourseCompass" },
      {
        property: "og:description",
        content: "Two fields: your name and your IUBAT student email. That is the whole sign-up.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="grid-paper flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link
        to="/"
        className="mb-10 flex items-center gap-2 font-display text-[0.7rem] tracking-[0.2em] text-ink-soft uppercase transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Home
      </Link>

      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-background">
          <Compass className="size-5" />
        </span>

        <form
          className="animate-in fade-in duration-300"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/app/progress" });
          }}
        >
          <h1 className="mt-6 font-display text-3xl font-bold">Sign up</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Just your name and student email. You build the rest of your profile once you are in.
          </p>

          <div className="mt-8 space-y-2">
            <Label htmlFor="name" className="eyebrow">
              Full name
            </Label>
            <Input
              id="name"
              required
              placeholder="Nusrat Jahan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="email" className="eyebrow">
              Student email
            </Label>
            <Input
              id="email"
              type="email"
              required
              pattern={`.+@${institution.emailDomain.replace(".", "\\.")}`}
              placeholder={`yourname@${institution.emailDomain}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-ink-soft">
              Only @{institution.emailDomain} addresses can create an account.
            </p>
          </div>

          <Button type="submit" size="lg" className="mt-7 w-full rounded-xl font-display">
            Create my account
          </Button>
        </form>

        <p className="mt-8 flex items-center gap-2 border-t border-border pt-5 text-xs text-ink-soft">
          <ShieldCheck className="size-3.5" /> Private to {institution.name} students.
        </p>
      </div>
    </div>
  );
}
