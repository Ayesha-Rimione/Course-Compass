import { useState } from "react";
import { Check, Compass } from "lucide-react";
import { careerInterests } from "@/data/mock";
import { cn } from "@/lib/utils";

export function InterestsSection() {
  const [selected, setSelected] = useState<string[]>(["backend"]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      if (id === "exploring") return prev.includes("exploring") ? [] : ["exploring"];
      const next = prev.filter((x) => x !== "exploring");
      return next.includes(id) ? next.filter((x) => x !== id) : [...next, id];
    });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {careerInterests.map((field) => {
        const active = selected.includes(field.id);
        return (
          <button
            key={field.id}
            type="button"
            onClick={() => toggle(field.id)}
            className={cn(
              "lift card-soft flex flex-col items-start p-6 text-left",
              active && "border-amber ring-2 ring-amber/40",
            )}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold">{field.title}</h3>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active ? "border-amber bg-amber" : "border-border",
                )}
              >
                {active && <Check className="size-3.5 text-primary-foreground" />}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{field.description}</p>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => toggle("exploring")}
        className={cn(
          "lift flex flex-col items-start rounded-2xl border-2 border-amber bg-amber-soft/40 p-6 text-left",
          selected.includes("exploring") && "ring-2 ring-amber/50",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-background">
          <Compass className="size-5 text-amber" />
        </span>
        <h3 className="mt-4 font-display text-lg font-bold">Still exploring</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Show me a bit of everything. A broad roadmap that keeps several doors open — a completely
          normal place to start.
        </p>
      </button>
    </div>
  );
}
