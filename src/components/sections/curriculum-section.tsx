import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Star, Info, BookOpen, Check, Search, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { grades } from "@/data/mock";
import { Course, CourseStatus } from "@/types";
import {
  getCourses,
  updateCourseStatus,
  updateCourseGrade,
  updateCourseRating,
  batchSaveCompletedCourses,
} from "@/api/courses";
import { cn } from "@/lib/utils";

const semesters = Array.from({ length: 10 }, (_, i) => i + 1);

export function CurriculumSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openSemesters, setOpenSemesters] = useState<number[]>([1, 2]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkSemester, setBulkSemester] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await getCourses();
      setCourses(list);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const groupedBySemester = useMemo(() => {
    return semesters.map((sem) => ({
      semester: sem,
      items: filteredCourses.filter((c) => c.semester === sem),
    }));
  }, [filteredCourses]);

  const toggleSemester = (sem: number) => {
    setOpenSemesters((prev) =>
      prev.includes(sem) ? prev.filter((s) => s !== sem) : [...prev, sem]
    );
  };

  const handleStatusToggle = async (code: string, currentStatus: CourseStatus) => {
    const nextStatus: CourseStatus = currentStatus === "completed" ? "not-started" : "completed";
    setCourses((prev) =>
      prev.map((c) => (c.code === code ? { ...c, status: nextStatus, rating: c.rating ?? 4 } : c))
    );
    await updateCourseStatus(code, nextStatus);
  };

  const handleGradeChange = async (code: string, grade: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.code === code ? { ...c, grade, status: "completed" as CourseStatus } : c))
    );
    await updateCourseGrade(code, grade);
  };

  const handleRatingChange = async (code: string, rating: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.code === code ? { ...c, rating, status: "completed" as CourseStatus } : c))
    );
    await updateCourseRating(code, rating);
  };

  const applyBulkCompletion = async (value: string) => {
    setBulkSemester(value);
    const upto = Number(value);
    if (!upto) return;

    const toComplete: { code: string; grade: string; rating: number }[] = [];
    const updated = courses.map((c) => {
      if (c.semester <= upto) {
        toComplete.push({ code: c.code, grade: c.grade || "A", rating: c.rating || 4 });
        return {
          ...c,
          status: "completed" as CourseStatus,
          rating: c.rating || 4,
        };
      }
      return c;
    });

    setCourses(updated);
    await batchSaveCompletedCourses(toComplete);
  };

  const totalCompleted = courses.filter((c) => c.status === "completed").length;
  const totalCredits = courses
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (c.credits || 3), 0);

  return (
    <div className="space-y-6">
      {/* Top Summary & Bulk Controls */}
      <div className="card-soft flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="eyebrow">Transcript Checklist</p>
            <h3 className="mt-0.5 font-display text-base font-bold">
              {totalCompleted} of {courses.length} Courses Completed ({totalCredits} Credits)
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">Quick bulk tick:</span>
            <Select value={bulkSemester} onValueChange={applyBulkCompletion}>
              <SelectTrigger className="w-36 h-9 rounded-xl text-xs font-bold font-display">
                <SelectValue placeholder="Through Sem..." />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">
                    Through Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-soft" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code/title..."
              className="h-9 pl-8 text-xs rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Grouped Courses Per Semester Accordion */}
      <div className="space-y-4">
        {groupedBySemester.map(({ semester, items }) => {
          if (items.length === 0 && searchQuery) return null;
          const isOpen = openSemesters.includes(semester);
          const completedInSem = items.filter((c) => c.status === "completed").length;

          return (
            <div key={semester} className="card-soft overflow-hidden border border-border/80">
              <button
                type="button"
                onClick={() => toggleSemester(semester)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-soft font-display text-xs font-bold text-amber-900 border border-amber/30">
                    S{semester}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-ink">
                      Semester {semester}{" "}
                      {semester === 1 ? "(Freshman Core)" : semester >= 9 ? "(Elective / Capstone Track)" : ""}
                    </h4>
                    <p className="text-[0.7rem] text-ink-soft">
                      {completedInSem} of {items.length} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono text-ink-soft">
                    {Math.round((completedInSem / Math.max(1, items.length)) * 100)}%
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-ink-soft transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/60 divide-y divide-border/40 bg-surface/50">
                  {items.map((course) => {
                    const isDone = course.status === "completed";
                    return (
                      <div
                        key={course.code}
                        className={cn(
                          "flex flex-wrap items-center justify-between gap-4 p-4 transition-colors",
                          isDone && "bg-amber-soft/10"
                        )}
                      >
                        <div className="flex items-start gap-3 min-w-0 max-w-lg">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(course.code, course.status)}
                            className={cn(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                              isDone
                                ? "bg-amber border-amber text-ink"
                                : "border-border hover:border-amber"
                            )}
                          >
                            {isDone && <Check className="size-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber">
                                {course.code}
                              </span>
                              <span className="text-[0.7rem] px-2 py-0.5 rounded bg-secondary text-ink-soft">
                                {course.credits} Cr
                              </span>
                            </div>
                            <h5 className="font-display text-sm font-semibold text-ink mt-0.5">
                              {course.title}
                            </h5>
                            {course.description && (
                              <p className="text-xs text-ink-soft line-clamp-1 mt-0.5">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Grade & Rating Controls */}
                        {isDone && (
                          <div className="flex items-center gap-3 ml-auto animate-in fade-in duration-200">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[0.7rem] font-semibold text-ink-soft">Grade:</span>
                              <Select
                                value={course.grade || "A"}
                                onValueChange={(g) => handleGradeChange(course.code, g)}
                              >
                                <SelectTrigger className="h-7 w-16 text-xs font-bold rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {grades.map((g) => (
                                    <SelectItem key={g} value={g} className="text-xs font-mono">
                                      {g}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleRatingChange(course.code, star)}
                                  className="p-0.5 transition-transform hover:scale-110"
                                  title={`Self rating: ${star}/5`}
                                >
                                  <Star
                                    className={cn(
                                      "size-3.5",
                                      star <= (course.rating || 4)
                                        ? "fill-amber text-amber"
                                        : "text-ink-soft/40"
                                    )}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
