import { useState } from "react";
import { Plus, Search, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { skills as seedSkills, skillSuggestions, type Skill } from "@/data/mock";
import { cn } from "@/lib/utils";

export function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>(seedSkills);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [quiz, setQuiz] = useState<"pending" | "accepted" | "declined">("pending");

  const visible = skills.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const addSkill = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setSkills((prev) =>
      prev.some((s) => s.name.toLowerCase() === clean.toLowerCase())
        ? prev
        : [...prev, { id: clean.toLowerCase(), name: clean, level: 1, category: "Added by you" }],
    );
    setDraft("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="card-soft p-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your skills"
            className="h-11 rounded-xl pl-9"
          />
        </div>

        <div className="mt-5 divide-y divide-border">
          {visible.map((skill) => (
            <div key={skill.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold">{skill.name}</p>
                <p className="text-xs text-ink-soft">{skill.category}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${skill.name} level ${n}`}
                    onClick={() =>
                      setSkills((prev) =>
                        prev.map((s) => (s.id === skill.id ? { ...s, level: n } : s)),
                      )
                    }
                    className={cn(
                      "h-7 w-7 rounded-md border font-display text-xs transition-colors",
                      skill.level >= n
                        ? "border-amber bg-amber text-primary-foreground"
                        : "border-border bg-background text-ink-soft hover:border-ink/30",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="py-6 text-sm text-ink-soft">No skill matches “{query}”.</p>
          )}
        </div>

        <form
          className="mt-5 flex gap-2 border-t border-border pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            addSkill(draft);
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a skill, e.g. Kubernetes"
            className="h-11 rounded-xl"
          />
          <Button type="submit" className="rounded-xl px-4">
            <Plus className="size-4" />
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {skillSuggestions
            .filter((s) => !skills.some((sk) => sk.name === s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-amber hover:text-ink"
              >
                + {s}
              </button>
            ))}
        </div>
      </div>

      <div className="rounded-3xl border-2 border-amber bg-amber-soft/40 p-7">
        <p className="eyebrow">Optional check</p>
        <h3 className="mt-3 font-display text-2xl leading-tight font-bold">
          Want to double-check those ratings?
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          A short quiz calibrates your self-ratings against typical role expectations. It is
          entirely optional and your roadmap works either way.
        </p>
        <p className="mt-4 flex items-center gap-2 font-display text-xs tracking-wider text-ink-soft uppercase">
          <Timer className="size-3.5" /> About 5 minutes
        </p>

        {quiz === "pending" ? (
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Button size="lg" className="rounded-xl font-display" onClick={() => setQuiz("accepted")}>
              Take the quiz
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-ink/25 bg-background font-display"
              onClick={() => setQuiz("declined")}
            >
              Keep my ratings
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in mt-7 rounded-2xl bg-background p-4 text-sm duration-300">
            {quiz === "accepted"
              ? "Quiz queued. You can start it any time from this card."
              : "No problem — your self-ratings are being used as-is."}
            <button
              type="button"
              onClick={() => setQuiz("pending")}
              className="ml-2 font-display text-xs text-amber underline-offset-4 hover:underline"
            >
              Change
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
