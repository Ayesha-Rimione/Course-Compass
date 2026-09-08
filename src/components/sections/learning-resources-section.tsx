import { useEffect, useState } from "react";
import { ExternalLink, BookOpen, Clock } from "lucide-react";
import { LearningResource } from "@/types";
import { getLearningResources } from "@/api/resources";

export function LearningResourcesSection() {
  const [resources, setResources] = useState<LearningResource[]>([]);

  useEffect(() => {
    getLearningResources().then(setResources);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold">Curated Learning Resources</h3>
        <p className="text-sm text-ink-soft mt-1">Recommended courses, documentations, and problem sets matched to your skill gaps.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((res) => (
          <div key={res.id} className="card-soft p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="eyebrow">{res.category}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-display font-semibold uppercase ${res.isFree ? "bg-amber-soft text-ink" : "bg-secondary text-ink-soft border border-border"}`}>
                  {res.isFree ? "Free" : res.price || "Paid"}
                </span>
              </div>
              <h4 className="mt-2 font-display text-base font-bold text-foreground">{res.name}</h4>
              <p className="mt-1 text-xs text-ink-soft">Provider: {res.provider} · Level: {res.difficulty}</p>
            </div>
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-ink-soft">
              <span className="flex items-center gap-1"><Clock className="size-3.5" /> {res.duration}</span>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-amber hover:underline flex items-center gap-1 font-semibold"
              >
                Access Resource <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
