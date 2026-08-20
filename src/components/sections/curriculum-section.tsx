import { useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courses as seedCourses,
  grades,
  semesters,
  type Course,
  type CourseStatus,
} from "@/data/mock";
import { cn } from "@/lib/utils";

const statusLabel: Record<CourseStatus, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  "not-started": "Not started",
};

export function CurriculumSection() {
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [open, setOpen] = useState<number[]>([6]);
  const [bulk, setBulk] = useState<string>("");

  const grouped = useMemo(
    () => semesters.map((s) => ({ semester: s, items: courses.filter((c) => c.semester === s) })),
    [courses],
  );

  const update = (code: string, patch: Partial<Course>) =>
    setCourses((prev) => prev.map((c) => (c.code === code ? { ...c, ...patch } : c)));

  const applyBulk = (value: string) => {
    setBulk(value);
    const upto = Number(value);
    setCourses((prev) =>
      prev.map((c) => (c.semester <= upto ? { ...c, status: "completed", rating: c.rating ?? 3 } : c)),
    );
  };

  const completed = courses.filter((c) => c.status === "completed").length;

  return (
    <div>
      <div className="card-soft mb-6 flex flex-wrap items-center gap-4 p-5">
        <div>
          <p className="eyebrow">Bulk update</p>
          <p className="mt-1 font-display text-sm font-semibold">
            I have completed through Semester
          </p>
        </div>
        <Select value={bulk} onValueChange={applyBulk}>
          <SelectTrigger className="w-36 rounded-xl">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((s) => (
              <SelectItem key={s} value={String(s)}>
                Semester {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto font-display text-sm text-ink-soft">
          {completed} / {courses.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {grouped.map(({ semester, items }) => {
          const isOpen = open.includes(semester);
          const done = items.filter((c) => c.status === "completed").length;
          return (
            <div key={semester} className="card-soft overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setOpen((prev) =>
                    prev.includes(semester)
                      ? prev.filter((s) => s !== semester)
                      : [...prev, semester],
                  )
                }
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-secondary/60"
              >
                <ChevronDown
                  className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
                />
                <span className="font-display text-sm font-bold">Semester {semester}</span>
                <span className="text-xs text-ink-soft">
                  {done}/{items.length} completed
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border">
                    {items.map((course) => (
                      <CourseRow key={course.code} course={course} onUpdate={update} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CourseRow({
  course,
  onUpdate,
}: {
  course: Course;
  onUpdate: (code: string, patch: Partial<Course>) => void;
}) {
  const isDone = course.status === "completed";
  return (
    <div className="border-b border-border/70 px-5 py-2 last:border-b-0">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={(v) =>
            onUpdate(course.code, {
              status: v ? "completed" : "not-started",
              ...(v ? {} : { rating: undefined, grade: undefined }),
            })
          }
          className="transition-transform duration-150 data-[state=checked]:scale-110"
        />
        <span className="w-20 font-display text-xs font-semibold text-ink-soft">{course.code}</span>
        <span className="flex-1 truncate text-sm">{course.title}</span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 font-display text-[0.65rem] tracking-wider uppercase",
            isDone && "bg-amber-soft text-ink",
            course.status === "ongoing" && "bg-secondary text-ink-soft",
            course.status === "not-started" && "border border-border text-ink-soft",
          )}
        >
          {statusLabel[course.status]}
        </span>
      </div>

      {isDone && (
        <div className="animate-in fade-in mt-2 mb-1 flex flex-wrap items-center gap-6 pl-9 duration-200">
          <div className="flex items-center gap-2">
            <span className="font-display text-[0.65rem] tracking-wider text-ink-soft uppercase">
              How well did you learn this? <span className="text-destructive">*</span>
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n}`}
                  onClick={() => onUpdate(course.code, { rating: n })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-4",
                      (course.rating ?? 0) >= n ? "fill-amber text-amber" : "text-border",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[0.65rem] tracking-wider text-ink-soft uppercase">
              Grade · optional
            </span>
            <Select
              value={course.grade ?? ""}
              onValueChange={(v) => onUpdate(course.code, { grade: v })}
            >
              <SelectTrigger className="h-8 w-24 rounded-lg">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!course.rating && <span className="text-[0.7rem] text-destructive">Rating required</span>}
        </div>
      )}
    </div>
  );
}
