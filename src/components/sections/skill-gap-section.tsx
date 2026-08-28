import { useEffect, useState } from "react";
import { SkillGap } from "@/types";
import { getRoadmap } from "@/api/roadmap";
import { cn } from "@/lib/utils";

export function SkillGapSection() {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [targetRole, setTargetRole] = useState<string>("Full-Stack Software Engineer");

  useEffect(() => {
    getRoadmap().then((res) => {
      setGaps(res.gaps);
      setTargetRole(res.targetRole);
    });
  }, []);

  return (
    <div className="card-soft p-6 space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-xl font-bold">Skill Gap Analysis</h3>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-soft text-amber-900 border border-amber/40">
              Sample Data / Preview
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary text-ink font-display text-xs font-semibold border border-border">
            Target: {targetRole}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Calculated distance between your completed coursework profile and sample benchmark requirements.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-ink-soft font-display text-xs uppercase tracking-wider">
              <th className="pb-3 font-semibold">Skill</th>
              <th className="pb-3 font-semibold text-center">Estimated Level</th>
              <th className="pb-3 font-semibold text-center">Benchmark Level</th>
              <th className="pb-3 font-semibold text-center">Gap Distance</th>
              <th className="pb-3 font-semibold text-right">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {gaps.map((item) => (
              <tr key={item.id || item.skill} className="hover:bg-secondary/40 transition-colors">
                <td className="py-3.5 font-display font-semibold text-foreground">{item.skill}</td>
                <td className="py-3.5 text-center font-medium text-ink-soft">{item.currentLevel}%</td>
                <td className="py-3.5 text-center font-medium text-foreground">{item.requiredLevel}%</td>
                <td className="py-3.5 text-center font-bold text-amber">+{item.gap}%</td>
                <td className="py-3.5 text-right">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full font-display text-[0.68rem] uppercase font-bold tracking-wider",
                      item.priority === "High" && "bg-destructive/15 text-destructive border border-destructive/30",
                      item.priority === "Medium" && "bg-amber-soft text-amber-950 border border-amber/30",
                      item.priority === "Low" && "bg-secondary text-ink-soft border border-border",
                    )}
                  >
                    {item.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
