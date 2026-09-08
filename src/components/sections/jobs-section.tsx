import { useEffect, useState } from "react";
import { Briefcase, MapPin, ExternalLink, Calendar, DollarSign } from "lucide-react";
import { JobRecommendation } from "@/types";
import { getJobRecommendations } from "@/api/jobs";

export function JobsSection() {
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);

  useEffect(() => {
    getJobRecommendations().then(setJobs);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold">Industry Job Alignment</h3>
        <p className="text-sm text-ink-soft mt-1">Real-world tech opportunities aligned with your target career path and IUBAT CSE skills.</p>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="card-soft p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-display text-base font-bold text-foreground">{job.title}</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-ink-soft font-display text-xs uppercase font-semibold border border-border">
                  {job.jobType}
                </span>
              </div>
              <p className="text-xs font-medium text-ink-soft">
                <strong className="text-foreground">{job.company}</strong> · <MapPin className="inline size-3 text-ink-soft" /> {job.location} · {job.experience}
              </p>
              {job.salary && (
                <p className="text-xs text-amber font-semibold flex items-center gap-1">
                  <DollarSign className="size-3.5" /> {job.salary}
                </p>
              )}
              {job.requiredSkills && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 rounded-md bg-amber-soft text-ink text-xs font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
              <span className="text-xs text-ink-soft flex items-center gap-1">
                <Calendar className="size-3" /> {job.postedDate}
              </span>
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display text-xs font-semibold hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                Apply / Details <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
