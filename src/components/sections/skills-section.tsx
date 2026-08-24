import { useEffect, useState } from "react";
import { Plus, Search, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { skillSuggestions } from "@/data/mock";
import { Skill } from "@/types";
import { getSkills, addSkill as apiAddSkill, updateSkillLevel as apiUpdateSkillLevel, removeSkill as apiRemoveSkill } from "@/api/skills";
import { cn } from "@/lib/utils";

export function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [quiz, setQuiz] = useState<"pending" | "accepted" | "declined">("pending");

  useEffect(() => {
    getSkills().then(setSkills);
  }, []);

  const visible = skills.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const handleAddSkill = async (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (skills.some((s) => s.name.toLowerCase() === clean.toLowerCase())) return;
    const newSkill = await apiAddSkill(clean, "Custom", 1);
    setSkills((prev) => [...prev, newSkill]);
    setDraft("");
  };

  const handleUpdateLevel = async (id: string, level: number) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, level } : s)));
    await apiUpdateSkillLevel(id, level);
  };

  const handleRemoveSkill = async (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    await apiRemoveSkill(id);
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
                    onClick={() => handleUpdateLevel(skill.id, n)}
                    className={cn(
                      "h-7 w-7 rounded-md border font-display text-xs transition-colors",
                      skill.level >= n
                        ? "border-amber bg-amber text-primary-foreground font-semibold"
                        : "border-border bg-background text-ink-soft hover:border-ink/30",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill.id)}
                className="text-ink-soft hover:text-destructive transition-colors p-1"
                title="Remove skill"
              >
                <Trash2 className="size-4" />
              </button>
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
            handleAddSkill(draft);
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a custom skill, e.g. FastAPI"
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
                onClick={() => handleAddSkill(s)}
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
