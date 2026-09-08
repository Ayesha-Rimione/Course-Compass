import { useEffect, useState } from "react";
import { Check, Compass, Sparkles, Plus, X, Lightbulb, BookOpen } from "lucide-react";
import { CareerPath } from "@/types";
import { getCareerPaths, toggleCareerInterest } from "@/api/careers";
import { getStudentProfile } from "@/api/students";
import { getCourses } from "@/api/courses";
import { getSkills } from "@/api/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const DEFAULT_INTEREST_TAGS = [
  "Generative AI",
  "Full-Stack Web",
  "Cloud Architecture",
  "Competitive Programming",
  "Cybersecurity",
  "Machine Learning",
  "Mobile Apps (Flutter/React Native)",
  "DevOps & CI/CD",
];

export function InterestsSection() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [exploring, setExploring] = useState(false);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState("");
  const [completedCount, setCompletedCount] = useState(0);
  const [skillsRatedCount, setSkillsRatedCount] = useState(0);
  const [hasSufficientInfo, setHasSufficientInfo] = useState(false);

  useEffect(() => {
    getCareerPaths().then(setPaths);

    // Load saved custom interests from localStorage
    const saved = localStorage.getItem("coursecompass_custom_interests");
    if (saved) {
      try {
        setCustomInterests(JSON.parse(saved));
      } catch {
        setCustomInterests(DEFAULT_INTEREST_TAGS.slice(0, 4));
      }
    } else {
      setCustomInterests(DEFAULT_INTEREST_TAGS.slice(0, 4));
    }

    // Check if user has provided info
    Promise.all([getCourses(), getSkills()]).then(([coursesList, sk]) => {
      const compCourses = coursesList.filter((c) => c.status === "completed" || c.status === "in_progress").length;
      const ratedSk = sk.filter((s) => (s.rating || 0) > 0).length;
      setCompletedCount(compCourses);
      setSkillsRatedCount(ratedSk);
      setHasSufficientInfo(compCourses > 0 || ratedSk > 0);
    });
  }, []);

  const handleToggle = async (id: string) => {
    setExploring(false);
    setPaths((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p)),
    );
    await toggleCareerInterest(id);
  };

  const handleToggleExploring = () => {
    setExploring((prev) => !prev);
    if (!exploring) {
      setPaths((prev) => prev.map((p) => ({ ...p, isSelected: false })));
    }
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newInterestInput.trim();
    if (!tag) return;
    if (!customInterests.includes(tag)) {
      const updated = [...customInterests, tag];
      setCustomInterests(updated);
      localStorage.setItem("coursecompass_custom_interests", JSON.stringify(updated));
    }
    setNewInterestInput("");
  };

  const handleRemoveInterest = (tag: string) => {
    const updated = customInterests.filter((t) => t !== tag);
    setCustomInterests(updated);
    localStorage.setItem("coursecompass_custom_interests", JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      {/* AI Role Suggestion Banner (Waits for info before recommending) */}
      <div className="rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-soft text-amber shrink-0 mt-0.5">
            <Sparkles className="size-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display text-sm font-bold flex items-center gap-2">
              AI Role Suggestions
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-ink-soft font-normal">
                {hasSufficientInfo ? "Data Ready" : "Awaiting Information"}
              </span>
            </h4>
            <p className="text-xs text-ink-soft leading-relaxed">
              {hasSufficientInfo
                ? `Based on your ${completedCount} completed/enrolled courses and ${skillsRatedCount} rated skills, you can select roles below or ask AI Bhai to analyze your best fit.`
                : "No role is assigned automatically. Fill in your completed courses and skills in the previous sections, and AI Bhai will recommend career tracks based on your strengths."}
            </p>
            {hasSufficientInfo && (
              <div className="pt-2">
                <Button asChild size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 h-8">
                  <Link to="/app/chat">
                    <Lightbulb className="size-3.5 text-amber" /> Ask AI Bhai for role recommendations
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Career Roles Selection */}
      <div>
        <div className="mb-3">
          <h4 className="font-display text-base font-bold">Select Target Career Roles</h4>
          <p className="text-xs text-ink-soft">Choose one or more tracks you are aiming for, or select 'Still exploring'.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((field) => {
            const active = !!field.isSelected && !exploring;
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => handleToggle(field.id)}
                className={cn(
                  "lift card-soft flex flex-col items-start p-6 text-left transition-all",
                  active && "border-amber ring-2 ring-amber/40 bg-surface/90",
                )}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-foreground">{field.title}</h3>
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      active ? "border-amber bg-amber" : "border-border",
                    )}
                  >
                    {active && <Check className="size-3.5 text-primary-foreground font-bold" />}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{field.description}</p>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleToggleExploring}
            className={cn(
              "lift flex flex-col items-start rounded-2xl border-2 border-amber bg-amber-soft/40 p-6 text-left transition-all",
              exploring && "ring-2 ring-amber/50 bg-amber-soft/70",
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-background shadow-sm">
              <Compass className="size-5 text-amber" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">Still exploring</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Show me a bit of everything. A broad roadmap for IUBAT CSE students that keeps several doors open.
            </p>
          </button>
        </div>
      </div>

      {/* Custom Learning Interests & Topics */}
      <div className="card-soft p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-amber" />
          <h4 className="font-display text-base font-bold">Custom Learning Interests & Topics</h4>
        </div>
        <p className="text-xs text-ink-soft">
          Add specific topics, technologies, or subjects you are passionate about learning alongside your university courses.
        </p>

        {/* Tag Input */}
        <form onSubmit={handleAddInterest} className="flex gap-2 max-w-md">
          <Input
            value={newInterestInput}
            onChange={(e) => setNewInterestInput(e.target.value)}
            placeholder="e.g. Distributed Systems, Rust, Next.js"
            className="h-10 rounded-xl text-xs"
          />
          <Button type="submit" size="sm" className="rounded-xl gap-1 shrink-0">
            <Plus className="size-3.5" /> Add
          </Button>
        </form>

        {/* Tag List */}
        <div className="flex flex-wrap gap-2 pt-1">
          {customInterests.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border/80 text-xs font-medium text-foreground shadow-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveInterest(tag)}
                className="text-ink-soft hover:text-destructive transition-colors"
                title="Remove tag"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {customInterests.length === 0 && (
            <p className="text-xs text-ink-soft italic">No custom interests added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
