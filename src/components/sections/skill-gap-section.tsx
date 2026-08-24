import { useEffect, useState } from "react";
import { SkillGap } from "@/types";
import { getRoadmap } from "@/api/roadmap";
import { cn } from "@/lib/utils";

export function SkillGapSection() {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [targetRole, setTargetRole] = useState<string>("Backend Developer");

  useEffect(() => {
    getRoadmap().then((res) => {
      setGaps(res.gaps);
      setTargetRole(res.targetRole);
    });
  }, []);

  return (
    <div className="card-soft p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">Skill Gap Analysis</h3>
          <span className="px-3 py-1 rounded-full bg-amber-soft text-ink font-display text-xs font-semibold">
            Target: {targetRole}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Calculated distance between your self-ratings/completed coursework and industry expectations.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-ink-soft font-display text-xs uppercase tracking-wider">
              <th className="pb-3 font-semibold">Skill</th>
              <th className="pb-3 font-semibold text-center">Current Level</th>
              <th className="pb-3 font-semibold text-center">Required Level</th>
              <th className="pb-3 font-semibold text-center">Gap</th>
              <th className="pb-3 font-semibold text-right">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {gaps.map((item) => (
              <tr key={item.id || item.skill} className="hover:bg-secondary/40 transition-colors">
                <td className="py-3.5 font-display font-semibold text-foreground">{item.skill}</td>
                <td className="py-3.5 text-center font-medium text-ink-soft">{item.currentLevel} / 5</td>
                <td className="py-3.5 text-center font-medium text-foreground">{item.requiredLevel} / 5</td>
                <td className="py-3.5 text-center font-bold text-amber">+{item.gap}</td>
                <td className="py-3.5 text-right">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full font-display text-[0.68rem] uppercase font-bold tracking-wider",
                      item.priority === "High" && "bg-destructive/15 text-destructive border border-destructive/30",
                      item.priority === "Medium" && "bg-amber-soft text-ink border border-amber/30",
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
