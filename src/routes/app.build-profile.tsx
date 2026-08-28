import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Star,
  Check,
  X,
  Compass,
  Code2,
  Award,
  Layers,
  ChevronRight,
  RefreshCw,
  Sliders,
  User,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { VantaBirdsBackground } from "@/components/vanta-birds-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurriculumSection } from "@/components/sections/curriculum-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { InterestsSection } from "@/components/sections/interests-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { CertificationsSection } from "@/components/sections/certifications-section";
import { StudentProfile, Course } from "@/types";
import { getStudentProfile, updateStudentProfile } from "@/api/students";
import { getCourses, batchSaveCompletedCourses } from "@/api/courses";
import { grades } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/build-profile")({
  head: () => ({
    meta: [
      { title: "Build My Profile — CourseCompass" },
      {
        name: "description",
        content: "Academic setup with AI Bhai: wizard setup, coding profiles, projects, certifications, curriculum, skills and interests.",
      },
    ],
  }),
  component: BuildProfilePage,
});

const totalCoreSteps = 4;

export function BuildProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Wizard Flow State: 1: Name, 2: Semester, 3: CGPA, 4: Course Cards, 5: Completed
  const [step, setStep] = useState<number>(1);
  const [isExistingOnboarded, setIsExistingOnboarded] = useState(false);
  const [showWizard, setShowWizard] = useState(true);

  // Editable Form State
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [cgpa, setCgpa] = useState<string>("3.50");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");
  const [links, setLinks] = useState({
    github: "",
    linkedin: "",
    codeforces: "",
    leetcode: "",
  });

  // Course confirmation stepper state
  const [courseIndex, setCourseIndex] = useState<number>(0);
  const [courseDecisions, setCourseDecisions] = useState<
    Record<string, { taken: boolean; grade: string; rating: number }>
  >({});

  // Current active card inputs
  const [cardGrade, setCardGrade] = useState<string>("A");
  const [cardRating, setCardRating] = useState<number>(4);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [p, c] = await Promise.all([getStudentProfile(), getCourses()]);
      setProfile(p);
      setAllCourses(c);

      if (p) {
        setFullName(p.name || "");
        setStudentId(p.studentId || "");
        setCurrentSemester(p.semester || 1);
        setCgpa(p.cgpa ? String(p.cgpa) : "3.50");
        setBio(p.bio || "");
        setPhone(p.phone || "");
        if (p.targetRole) setTargetRole(p.targetRole);
        if (p.links) {
          setLinks({
            github: p.links.github || "",
            linkedin: p.links.linkedin || "",
            codeforces: p.links.codeforces || "",
            leetcode: p.links.leetcode || "",
          });
        }

        // Check if user already has completed onboarding
        if (p.name && p.semester && p.semester > 0) {
          setIsExistingOnboarded(true);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Suggested courses strictly from prior semesters (< currentSemester)
  const suggestedCourses = useMemo(() => {
    return allCourses.filter((c) => c.semester < currentSemester);
  }, [allCourses, currentSemester]);

  const activeSuggestedCourse = suggestedCourses[courseIndex] || null;

  const handleNextFromName = () => {
    if (!fullName.trim()) return;
    setStep(2);
  };

  const handleNextFromSemester = () => {
    setCourseIndex(0);
    setStep(3);
  };

  const handleNextFromCgpa = () => {
    const num = parseFloat(cgpa);
    if (isNaN(num) || num < 0 || num > 4) return;

    if (suggestedCourses.length > 0) {
      setCourseIndex(0);
      setStep(4);
    } else {
      finishOnboarding();
    }
  };

  // Course decision handler (Yes, completed OR No, not yet)
  const handleRecordCourse = (taken: boolean) => {
    if (!activeSuggestedCourse) return;

    setCourseDecisions((prev) => ({
      ...prev,
      [activeSuggestedCourse.code]: {
        taken,
        grade: taken ? cardGrade : "F",
        rating: taken ? cardRating : 1,
      },
    }));

    // Reset card selectors for next course
    setCardGrade("A");
    setCardRating(4);

    // Advance to next course if available
    if (courseIndex + 1 < suggestedCourses.length) {
      setCourseIndex(courseIndex + 1);
    } else {
      // Finished all suggested courses
      finishOnboarding();
    }
  };

  const handlePrevCourse = () => {
    if (courseIndex > 0) {
      setCourseIndex(courseIndex - 1);
      const prevCourse = suggestedCourses[courseIndex - 1];
      if (prevCourse && courseDecisions[prevCourse.code]) {
        setCardGrade(courseDecisions[prevCourse.code].grade || "A");
        setCardRating(courseDecisions[prevCourse.code].rating || 4);
      }
    }
  };

  const handleSkipCourse = () => {
    if (courseIndex + 1 < suggestedCourses.length) {
      setCourseIndex(courseIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setSaving(true);
    const parsedCgpa = parseFloat(cgpa) || 3.50;

    // 1. Save Profile updates
    const updatedProf: Partial<StudentProfile> = {
      name: fullName.trim(),
      studentId: studentId.trim(),
      semester: currentSemester,
      cgpa: parsedCgpa,
      bio,
      phone,
      targetRole,
      links,
    };
    await updateStudentProfile(updatedProf);

    // 2. Save only the courses that the student marked as completed
    const completedList = Object.entries(courseDecisions)
      .filter(([_, dec]) => dec.taken)
      .map(([code, dec]) => ({
        code,
        grade: dec.grade,
        rating: dec.rating,
      }));

    if (completedList.length > 0) {
      await batchSaveCompletedCourses(completedList);
    }

    setSaving(false);
    setIsExistingOnboarded(true);
    setStep(5);
  };

  const handleSaveFullProfile = async () => {
    setSaving(true);
    const parsedCgpa = parseFloat(cgpa) || 3.50;
    const updated = await updateStudentProfile({
      name: fullName.trim(),
      studentId: studentId.trim(),
      semester: currentSemester,
      cgpa: parsedCgpa,
      bio,
      phone,
      targetRole,
      links,
    });
    setProfile(updated);
    setSaving(false);
  };

  if (loading) {
    return (
      <AppShell eyebrow="Profile" title="Loading profile...">
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-amber border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Build My Profile"
      title="Complete Academic Profile & Portfolio"
      description="Quick setup at top with AI Bhai, and full scrollable sections below for your bio, links, projects, certifications, curriculum, and skills."
    >
      <div className="space-y-12">
        {/* TOP: Interactive 3D Vanta Birds Onboarding Wizard */}
        <VantaBirdsBackground
          backgroundColor={0xe5f2e5}
          color1={0x1e6121}
          color2={0xb3ff00}
          birdSize={1.3}
          wingSpan={24.0}
          speedLimit={4.0}
          quantity={4.0}
          className="rounded-3xl border border-border/80 p-4 sm:p-8 shadow-[var(--shadow-lift)]"
        >
          <div className="mx-auto max-w-2xl py-4">
            {/* Status Header for Returning Students */}
            {isExistingOnboarded && step === 1 && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface/90 backdrop-blur-md p-4 border border-border/70 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-soft font-display font-bold text-amber-900">
                    S{currentSemester}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink">
                      Active Profile: {fullName || "Student"}
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Semester {currentSemester} · CGPA {cgpa} · IUBAT CSE
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="rounded-xl text-xs font-display bg-background"
                  >
                    <BookOpen className="mr-1.5 size-3.5" /> Re-check Courses
                  </Button>
                </div>
              </div>
            )}

            {/* Step Progress Bar */}
            {step <= 4 && (
              <div className="mb-8 space-y-2 rounded-2xl bg-surface/85 backdrop-blur-md p-4 border border-border/60 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                  <span className="flex items-center gap-1.5 text-amber-900 font-display">
                    <Sparkles className="size-3.5" /> AI Bhai Setup Wizard
                  </span>
                  <span>Step {Math.min(step, totalCoreSteps)} of {totalCoreSteps}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-amber transition-all duration-300"
                    style={{ width: `${(Math.min(step, totalCoreSteps) / totalCoreSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Name & ID */}
            {step === 1 && (
              <div className="card-soft animate-in fade-in zoom-in-95 duration-200 p-8 space-y-6 bg-surface/95 backdrop-blur-md">
                <div className="space-y-1.5">
                  <p className="eyebrow">Step 1 of 4</p>
                  <h2 className="font-display text-2xl font-bold">
                    {isExistingOnboarded ? "Review your name and details" : "What should I call you, bhai?"}
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Let's verify your full name and student ID for the CSE department record.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-xs font-semibold text-ink-soft">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Nusrat Jahan / Tanvir Ahmed"
                      className="mt-1 rounded-xl text-base h-12 bg-background/80"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentId" className="text-xs font-semibold text-ink-soft">
                      IUBAT Student ID (optional)
                    </Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 21103042"
                      className="mt-1 rounded-xl h-11 bg-background/80"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleNextFromName}
                    disabled={!fullName.trim()}
                    className="rounded-xl px-6 font-display gap-2 bg-amber hover:bg-amber-hover text-ink"
                    size="lg"
                  >
                    Next <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Current Semester */}
            {step === 2 && (
              <div className="card-soft animate-in fade-in zoom-in-95 duration-200 p-8 space-y-6 bg-surface/95 backdrop-blur-md">
                <div className="space-y-1.5">
                  <p className="eyebrow">Step 2 of 4</p>
                  <h2 className="font-display text-2xl font-bold">Which semester are you currently in?</h2>
                  <p className="text-sm text-ink-soft">
                    This automatically finds prior courses (Semesters 1 to {Math.max(1, currentSemester - 1)}) for quick confirmation.
                  </p>
                </div>

                <div className="py-4">
                  <Label className="text-xs font-semibold text-ink-soft">Current Semester *</Label>
                  <Select
                    value={String(currentSemester)}
                    onValueChange={(v) => setCurrentSemester(Number(v))}
                  >
                    <SelectTrigger className="mt-2 h-14 rounded-xl text-lg font-display bg-background/80">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((sem) => (
                        <SelectItem key={sem} value={String(sem)} className="text-base py-3">
                          Semester {sem} {sem === 1 ? "(Freshman)" : sem >= 8 ? "(Senior / Practicum)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl gap-2 font-display bg-background"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNextFromSemester}
                    className="rounded-xl px-6 font-display gap-2 bg-amber hover:bg-amber-hover text-ink"
                    size="lg"
                  >
                    Next <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: CGPA */}
            {step === 3 && (
              <div className="card-soft animate-in fade-in zoom-in-95 duration-200 p-8 space-y-6 bg-surface/95 backdrop-blur-md">
                <div className="space-y-1.5">
                  <p className="eyebrow">Step 3 of 4</p>
                  <h2 className="font-display text-2xl font-bold">What's your current CGPA?</h2>
                  <p className="text-sm text-ink-soft">
                    Don't stress, bhai — whatever it is, we'll build a roadmap from where you are right now.
                  </p>
                </div>

                <div className="py-4">
                  <Label htmlFor="cgpaInput" className="text-xs font-semibold text-ink-soft">
                    Cumulative GPA (0.00 – 4.00) *
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="cgpaInput"
                      type="number"
                      step="0.01"
                      min="0.00"
                      max="4.00"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="3.50"
                      className="rounded-xl text-2xl font-bold h-16 pl-5 tracking-tight font-display bg-background/80"
                      autoFocus
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-display text-sm font-semibold text-ink-soft">
                      / 4.00
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="rounded-xl gap-2 font-display bg-background"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNextFromCgpa}
                    disabled={!cgpa || parseFloat(cgpa) < 0 || parseFloat(cgpa) > 4.0}
                    className="rounded-xl px-6 font-display gap-2 bg-amber hover:bg-amber-hover text-ink"
                    size="lg"
                  >
                    Next: Review Courses ({suggestedCourses.length}) <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Course-by-Course Confirmation Stepper */}
            {step === 4 && (
              <div className="card-soft animate-in fade-in zoom-in-95 duration-200 p-8 space-y-6 bg-surface/95 backdrop-blur-md">
                {activeSuggestedCourse ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="eyebrow">Step 4 of 4 — Course Confirmation</p>
                        <span className="text-xs font-bold text-ink">
                          Course {courseIndex + 1} of {suggestedCourses.length} (Semesters 1 to {currentSemester - 1})
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-bold text-amber-900 border border-amber/30">
                        Semester {activeSuggestedCourse.semester}
                      </span>
                    </div>

                    {/* Focused Course Card */}
                    <div className="rounded-2xl border-2 border-border/80 bg-surface p-6 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="font-mono text-xs font-bold text-amber tracking-wider">
                            {activeSuggestedCourse.code}
                          </span>
                          <h3 className="mt-1 font-display text-xl font-bold text-ink leading-snug">
                            {activeSuggestedCourse.title}
                          </h3>
                        </div>
                        <span className="text-xs font-medium text-ink-soft shrink-0 bg-secondary px-2.5 py-1 rounded-lg">
                          {activeSuggestedCourse.credits} Credits
                        </span>
                      </div>
                      {activeSuggestedCourse.description && (
                        <p className="text-xs text-ink-soft leading-relaxed">
                          {activeSuggestedCourse.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Decision Controls */}
                    <div className="space-y-4 pt-2">
                      <p className="text-center font-display text-sm font-bold text-ink">
                        Did you complete this course?
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => handleRecordCourse(false)}
                          className="rounded-xl h-14 font-display gap-2 border-border bg-background hover:bg-secondary/70"
                        >
                          <X className="size-4 text-ink-soft" /> No / Not yet
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          onClick={() => handleRecordCourse(true)}
                          className="rounded-xl h-14 font-display gap-2 bg-amber hover:bg-amber-hover text-ink"
                        >
                          <Check className="size-4" /> Yes, completed
                        </Button>
                      </div>

                      {/* Optional Grade & Rating adjustments */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary/40 p-4 border border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink-soft">Grade:</span>
                          <Select value={cardGrade} onValueChange={setCardGrade}>
                            <SelectTrigger className="w-24 h-9 rounded-lg text-xs font-bold bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {grades.map((g) => (
                                <SelectItem key={g} value={g} className="text-xs">
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink-soft">Understanding:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setCardRating(star)}
                                className="p-0.5 transition-transform hover:scale-110"
                              >
                                <Star
                                  className={cn(
                                    "size-4",
                                    star <= cardRating
                                      ? "fill-amber text-amber"
                                      : "text-ink-soft/40"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stepper Navigation */}
                    <div className="pt-2 flex justify-between items-center text-xs text-ink-soft">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={courseIndex === 0}
                        onClick={handlePrevCourse}
                        className="rounded-lg text-xs gap-1"
                      >
                        <ArrowLeft className="size-3.5" /> Previous Course
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipCourse}
                        className="rounded-lg text-xs text-amber font-semibold"
                      >
                        Skip to next <ArrowRight className="size-3.5" />
                      </Button>
                      <button
                        type="button"
                        onClick={finishOnboarding}
                        className="hover:underline text-ink-soft font-semibold text-xs"
                      >
                        Finish Review
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="font-display text-lg font-bold">No prior courses to confirm for Semester 1.</p>
                    <Button onClick={finishOnboarding} className="rounded-xl px-6 bg-amber text-ink">
                      Finish Setup
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Congratulations / Ready */}
            {step === 5 && (
              <div className="card-soft animate-in fade-in zoom-in-95 duration-200 p-8 text-center space-y-6 bg-surface/95 backdrop-blur-md">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-9" />
                </div>

                <div className="space-y-2">
                  <p className="eyebrow text-emerald-600">You're all set, bhai!</p>
                  <h2 className="font-display text-3xl font-bold">Profile & Coursework Synchronized</h2>
                  <p className="mx-auto max-w-md text-sm text-ink-soft leading-relaxed">
                    Semester {currentSemester} CSE profile configured with{" "}
                    {Object.values(courseDecisions).filter((d) => d.taken).length} confirmed courses.
                    Scroll down to explore or edit all sections below anytime.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="rounded-xl px-8 font-display bg-amber hover:bg-amber-hover text-ink">
                    <Link to="/app/progress">Go to Progress Overview</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl font-display bg-background"
                  >
                    <RefreshCw className="mr-2 size-4" /> Re-run Setup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </VantaBirdsBackground>

        {/* BELOW VANTA UI: Full Comprehensive Profile Sections (Scrollable) */}
        <div className="space-y-12 max-w-5xl mx-auto pt-6">
          <div className="border-b border-border/80 pb-4">
            <h2 className="font-display text-2xl font-bold text-ink">Full Profile & Portfolio Details</h2>
            <p className="text-xs text-ink-soft mt-1">
              Scroll down to manage your academic details, coding links, projects, certifications, full curriculum checklist, skills, and career interests.
            </p>
          </div>

          {/* Section 1: Academic & Bio Details */}
          <div className="card-soft p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Academic Standing</p>
                <h3 className="font-display text-lg font-bold mt-1">Personal & Academic Details</h3>
              </div>
              <Button
                onClick={handleSaveFullProfile}
                disabled={saving}
                className="rounded-xl text-xs font-display bg-amber hover:bg-amber-hover text-ink"
              >
                {saving ? "Saving..." : "Save Details"}
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-ink-soft">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">Student ID</Label>
                <Input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">Current Semester</Label>
                <Select
                  value={String(currentSemester)}
                  onValueChange={(v) => setCurrentSemester(Number(v))}
                >
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                      <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">CGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">Phone (optional)</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 17..."
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">Target Career Role</Label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-ink-soft">Bio</Label>
              <Textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short intro about your software engineering interests..."
                className="mt-1 rounded-xl"
              />
            </div>
          </div>

          {/* Section 2: Coding & Social Links */}
          <div className="card-soft p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Profiles</p>
                <h3 className="font-display text-lg font-bold mt-1">Coding Profiles & Social Links</h3>
              </div>
              <Button
                onClick={handleSaveFullProfile}
                disabled={saving}
                className="rounded-xl text-xs font-display bg-amber hover:bg-amber-hover text-ink"
              >
                {saving ? "Saving..." : "Save Links"}
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold text-ink-soft">GitHub Profile URL</Label>
                <Input
                  value={links.github}
                  onChange={(e) => setLinks({ ...links, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">LinkedIn Profile URL</Label>
                <Input
                  value={links.linkedin}
                  onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">Codeforces Profile URL</Label>
                <Input
                  value={links.codeforces}
                  onChange={(e) => setLinks({ ...links, codeforces: e.target.value })}
                  placeholder="https://codeforces.com/profile/..."
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-ink-soft">LeetCode Profile URL</Label>
                <Input
                  value={links.leetcode}
                  onChange={(e) => setLinks({ ...links, leetcode: e.target.value })}
                  placeholder="https://leetcode.com/u/..."
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Projects Portfolio */}
          <div className="card-soft p-8 space-y-6">
            <ProjectsSection />
          </div>

          {/* Section 4: Certifications & Credentials */}
          <div className="card-soft p-8 space-y-6">
            <CertificationsSection />
          </div>

          {/* Section 5: Full Curriculum Checklist */}
          <div className="card-soft p-8 space-y-6">
            <div>
              <p className="eyebrow">Master Curriculum</p>
              <h3 className="font-display text-lg font-bold mt-1">Full Curriculum Checklist (Semesters 1 to 10)</h3>
            </div>
            <CurriculumSection />
          </div>

          {/* Section 6: Skills & Self-Rating */}
          <div className="card-soft p-8 space-y-6">
            <div>
              <p className="eyebrow">Competency Inventory</p>
              <h3 className="font-display text-lg font-bold mt-1">Skills & Self Ratings</h3>
            </div>
            <SkillsSection />
          </div>

          {/* Section 7: Career Interests */}
          <div className="card-soft p-8 space-y-6">
            <div>
              <p className="eyebrow">Career Path</p>
              <h3 className="font-display text-lg font-bold mt-1">Target Roles & Career Interests</h3>
            </div>
            <InterestsSection />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
