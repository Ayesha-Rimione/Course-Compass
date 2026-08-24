import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Star, Info, BookOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { grades } from "@/data/mock";
import { Course, CourseStatus } from "@/types";
import { getCourses, updateCourseStatus, updateCourseGrade, updateCourseRating } from "@/api/courses";
import { cn } from "@/lib/utils";

const statusLabel: Record<CourseStatus, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  "not-started": "Not started",
};

const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

export function CurriculumSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState<number[]>([6]);
  const [bulk, setBulk] = useState<string>("");

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const grouped = useMemo(
    () => semesters.map((s) => ({ semester: s, items: courses.filter((c) => c.semester === s) })),
    [courses],
  );

  const update = async (code: string, patch: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.code === code ? { ...c, ...patch } : c)));
    if (patch.status) await updateCourseStatus(code, patch.status);
    if (patch.grade) await updateCourseGrade(code, patch.grade);
    if (patch.rating !== undefined) await updateCourseRating(code, patch.rating);
  };

  const applyBulk = (value: string) => {
    setBulk(value);
    const upto = Number(value);
    setCourses((prev) =>
      prev.map((c) => {
        if (c.semester <= upto) {
          const updated = { ...c, status: "completed" as CourseStatus, rating: c.rating ?? 3 };
          updateCourseStatus(c.code, "completed");
          return updated;
        }
        return c;
      }),
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
  const [showDetails, setShowDetails] = useState(false);
  const isDone = course.status === "completed";
  
  return (
    <div className="border-b border-border/70 px-5 py-3 last:border-b-0">
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
        <span className="flex-1 text-sm font-medium">{course.title}</span>
        <span className="text-xs text-ink-soft hidden sm:inline">{course.credits} Credits</span>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-ink-soft hover:text-ink transition-colors p-1"
          title="View Course Outcomes & Details"
        >
          <Info className="size-4" />
        </button>
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

      {showDetails && (
        <div className="mt-2.5 pl-9 pr-4 py-3 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-2">
          {course.prerequisite && (
            <p className="text-ink-soft">
              <strong className="text-foreground">Prerequisite:</strong> {course.prerequisite}
            </p>
          )}
          {course.description && (
            <p className="text-ink-soft">
              <strong className="text-foreground">Description:</strong> {course.description}
            </p>
          )}
          {course.courseOutcomes && course.courseOutcomes.length > 0 && (
            <div>
              <strong className="text-foreground">Course Outcomes (CO):</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-ink-soft">
                {course.courseOutcomes.map((co, i) => (
                  <li key={i}>{co}</li>
                ))}
              </ul>
            </div>
          )}
          {course.skillsCovered && course.skillsCovered.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {course.skillsCovered.map((skill) => (
                <span key={skill} className="px-2 py-0.5 rounded-md bg-background border border-border text-[0.68rem] font-medium text-ink-soft">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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
