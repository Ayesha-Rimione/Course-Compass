import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Search, 
  Plus, 
  Edit3, 
  ExternalLink, 
  Target, 
  ShieldCheck, 
  BarChart2, 
  FolderGit2, 
  ChevronRight, 
  Save, 
  X,
  LogOut,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { 
  getDepartmentAnalytics, 
  getAdminStudents, 
  getAdminStudentDetail, 
  getAdminCourses, 
  createAdminCourse, 
  updateAdminCourse, 
  getCourseTopics, 
  updateCourseTopics, 
  getCourseOutcomes, 
  updateCourseOutcomes,
  DepartmentAnalytics,
  AdminStudentSummary,
  AdminStudentDetail,
  AdminCourse,
  CourseTopicItem,
  CourseOutcomeItem
} from "@/api/admin";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "CSE Department Admin Workspace — CourseCompass" },
      { name: "description", content: "IUBAT CSE Department Admin Workspace for tracking student cohorts, courses, topics, and CO/PO governance." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { role, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"students" | "courses" | "copo">("students");
  const [analytics, setAnalytics] = useState<DepartmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Students state
  const [students, setStudents] = useState<AdminStudentSummary[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentDetail | null>(null);
  const [studentModalLoading, setStudentModalLoading] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [courseSemester, setCourseSemester] = useState<number | undefined>(undefined);
  const [courseSearch, setCourseSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    course_code: "",
    course_name: "",
    credit_hours: 3.0,
    semester: 1,
    description: "",
  });

  // CO/PO & Topics state
  const [selectedCourseForGov, setSelectedCourseForGov] = useState<string>("CSC 101");
  const [topics, setTopics] = useState<CourseTopicItem[]>([]);
  const [outcomes, setOutcomes] = useState<CourseOutcomeItem[]>([]);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [govSaveSuccess, setGovSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [anData, stData, cData] = await Promise.all([
        getDepartmentAnalytics(),
        getAdminStudents(),
        getAdminCourses()
      ]);
      setAnalytics(anData);
      setStudents(stData);
      setCourses(cData);
    } catch (err: any) {
      console.error(err);
      setError("Unauthorized. Please sign in with an authorized CSE Department Admin account (@iubat.edu).");
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterStudents(sem?: number, search?: string) {
    try {
      const res = await getAdminStudents(sem, search);
      setStudents(res);
    } catch (err) {
      console.error(err);
    }
  }

  async function openStudentDetail(userId: string) {
    setStudentModalLoading(true);
    try {
      const detail = await getAdminStudentDetail(userId);
      setSelectedStudent(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentModalLoading(false);
    }
  }

  async function handleLoadGovCourse(code: string) {
    setSelectedCourseForGov(code);
    try {
      const [tList, oList] = await Promise.all([
        getCourseTopics(code),
        getCourseOutcomes(code)
      ]);
      setTopics(tList);
      setOutcomes(oList.length > 0 ? oList : [
        { outcome_code: "CO1", description: "" },
        { outcome_code: "CO2", description: "" },
        { outcome_code: "CO3", description: "" },
        { outcome_code: "CO4", description: "" },
        { outcome_code: "CO5", description: "" },
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (activeTab === "copo" && selectedCourseForGov) {
      handleLoadGovCourse(selectedCourseForGov);
    }
  }, [activeTab]);

  async function handleSaveTopics() {
    try {
      await updateCourseTopics(selectedCourseForGov, topics);
      setGovSaveSuccess(true);
      setTimeout(() => setGovSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save syllabus topics.");
    }
  }

  async function handleSaveOutcomes() {
    try {
      await updateCourseOutcomes(selectedCourseForGov, outcomes);
      setGovSaveSuccess(true);
      setTimeout(() => setGovSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save Course Outcomes.");
    }
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAdminCourse(newCourseForm);
      setShowAddCourseModal(false);
      const updated = await getAdminCourses(courseSemester);
      setCourses(updated);
      setNewCourseForm({ course_code: "", course_name: "", credit_hours: 3.0, semester: 1, description: "" });
    } catch (err: any) {
      alert(err.message || "Failed to create course");
    }
  }

  async function handleSaveEditedCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await updateAdminCourse(editingCourse.course_code, {
        course_name: editingCourse.course_name,
        credit_hours: editingCourse.credit_hours,
        semester: editingCourse.semester,
        description: editingCourse.description,
      });
      setEditingCourse(null);
      const updated = await getAdminCourses(courseSemester);
      setCourses(updated);
    } catch (err: any) {
      alert("Failed to update course.");
    }
  }

  const handleAdminLogout = async () => {
    await logout();
    navigate({ to: "/admin/signin" });
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSem = courseSemester ? c.semester === courseSemester : true;
    const matchesSearch = courseSearch
      ? c.course_code.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.course_name.toLowerCase().includes(courseSearch.toLowerCase())
      : true;
    return matchesSem && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dedicated Standalone Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md px-6 py-3.5 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tracking-tight text-ink">CourseCompass Admin</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  CSE Department
                </span>
              </div>
              <p className="text-xs text-ink-soft">International University of Business Agriculture and Technology</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-ink-soft hover:text-ink transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50 hidden sm:inline-block"
            >
              Public Site
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminLogout}
              className="rounded-xl border-border text-xs gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="size-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Authorization Error Banner */}
          {error && (
            <div className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 shrink-0" />
                <span>{error}</span>
              </div>
              <Button asChild size="sm" variant="outline" className="bg-background text-xs">
                <Link to="/admin/signin">Go to Admin Sign In</Link>
              </Button>
            </div>
          )}

          {/* Department Analytics Stats */}
          {analytics && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total CSE Students</span>
                  <Users className="size-5 text-emerald-600" />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{analytics.total_students}</div>
                <p className="mt-1 text-xs text-muted-foreground">Enrolled in BCSE Program</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Average Department CGPA</span>
                  <BarChart2 className="size-5 text-amber" />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{analytics.average_cgpa.toFixed(2)}</div>
                <p className="mt-1 text-xs text-muted-foreground">Across all active batches</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Curriculum Courses</span>
                  <BookOpen className="size-5 text-sky-600" />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{analytics.total_courses}</div>
                <p className="mt-1 text-xs text-muted-foreground">59 Core + 23 Electives</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Syllabus Topics & COs</span>
                  <Target className="size-5 text-indigo-600" />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-ink">
                  {analytics.total_topics} / {analytics.total_course_outcomes}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Topics & Course Outcomes mapped</p>
              </div>
            </div>
          )}

          {/* Module Tab Switcher */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
                activeTab === "students"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <Users className="size-4" />
              Student Cohort Tracker
            </button>

            <button
              onClick={() => setActiveTab("courses")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
                activeTab === "courses"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <BookOpen className="size-4" />
              Curriculum & Course Manager
            </button>

            <button
              onClick={() => setActiveTab("copo")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
                activeTab === "copo"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <Target className="size-4" />
              CO / PO & Topics Governance
            </button>
          </div>

          {/* ── TAB 1: STUDENT COHORT TRACKER ───────────────────────────────── */}
          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name or ID..."
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        handleFilterStudents(selectedSemester, e.target.value);
                      }}
                      className="pl-9 rounded-xl"
                    />
                  </div>

                  <select
                    value={selectedSemester || ""}
                    onChange={(e) => {
                      const sem = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedSemester(sem);
                      handleFilterStudents(sem, studentSearch);
                    }}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs text-muted-foreground">
                  Showing {students.length} enrolled students
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4">Semester</th>
                      <th className="px-6 py-4">CGPA</th>
                      <th className="px-6 py-4">Target Role</th>
                      <th className="px-6 py-4">Completed</th>
                      <th className="px-6 py-4">Projects</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((st) => (
                      <tr key={st.user_id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-ink">{st.full_name}</div>
                          <div className="text-xs text-muted-foreground">{st.email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">{st.student_id}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            Sem {st.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-ink">
                          {st.cgpa > 0 ? st.cgpa.toFixed(2) : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">{st.target_role}</td>
                        <td className="px-6 py-4 font-medium text-ink">{st.completed_courses_count} courses</td>
                        <td className="px-6 py-4 font-medium text-ink">{st.projects_count}</td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStudentDetail(st.user_id)}
                            className="h-8 gap-1 text-xs rounded-xl"
                          >
                            Transcript <ChevronRight className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground italic">
                          No students matching the search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 2: CURRICULUM & COURSE MANAGER ──────────────────────────── */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by course code or title..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>

                  <select
                    value={courseSemester || ""}
                    onChange={(e) => setCourseSemester(e.target.value ? Number(e.target.value) : undefined)}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={() => setShowAddCourseModal(true)}
                  className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm"
                >
                  <Plus className="size-4" /> Add Curriculum Course
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800">
                          {c.course_code}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          Sem {c.semester} • {c.credit_hours} Cr
                        </span>
                      </div>

                      <h3 className="mt-3 font-semibold text-ink line-clamp-1">{c.course_name}</h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {c.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        {c.topics_count} Topics • {c.outcomes_count} COs
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCourse(c)}
                        className="h-8 gap-1.5 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl"
                      >
                        <Edit3 className="size-3.5" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: CO/PO & TOPICS GOVERNANCE ───────────────────────────── */}
          {activeTab === "copo" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">Select Course:</span>
                  <select
                    value={selectedCourseForGov}
                    onChange={(e) => handleLoadGovCourse(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-background px-3 font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {courses.map((c) => (
                      <option key={c.course_code} value={c.course_code}>
                        {c.course_code} — {c.course_name} (Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {govSaveSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="size-4" /> Changes saved successfully!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Course Outcomes Section */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">Course Outcomes (CO1 – CO5)</h3>
                      <p className="text-xs text-muted-foreground">Accreditation outcomes for {selectedCourseForGov}</p>
                    </div>
                    <Button size="sm" onClick={handleSaveOutcomes} className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">
                      <Save className="size-3.5" /> Save COs
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {outcomes.map((co, idx) => (
                      <div key={co.outcome_code || idx} className="space-y-1">
                        <span className="text-xs font-mono font-bold text-slate-700">{co.outcome_code}</span>
                        <textarea
                          rows={2}
                          value={co.description}
                          onChange={(e) => {
                            const updated = [...outcomes];
                            updated[idx].description = e.target.value;
                            setOutcomes(updated);
                          }}
                          placeholder={`Description for ${co.outcome_code}...`}
                          className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Topics / Syllabus Section */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">Syllabus Topics</h3>
                      <p className="text-xs text-muted-foreground">Key technical concepts and modules</p>
                    </div>
                    <Button size="sm" onClick={handleSaveTopics} className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">
                      <Save className="size-3.5" /> Save Topics
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new syllabus topic..."
                      value={newTopicInput}
                      onChange={(e) => setNewTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTopicInput.trim()) {
                          e.preventDefault();
                          setTopics([...topics, { topic_name: newTopicInput.trim() }]);
                          setNewTopicInput("");
                        }
                      }}
                      className="text-xs rounded-xl"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        if (newTopicInput.trim()) {
                          setTopics([...topics, { topic_name: newTopicInput.trim() }]);
                          setNewTopicInput("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {topics.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-ink"
                      >
                        <span>{t.topic_name}</span>
                        <button
                          onClick={() => setTopics(topics.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {topics.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No topics added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL: STUDENT TRANSCRIPT DEEP DIVE ─────────────────────────── */}
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6">
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{selectedStudent.profile.full_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedStudent.profile.student_id} • Semester {selectedStudent.profile.semester} • CGPA: {selectedStudent.profile.cgpa.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Course Transcript */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-ink flex items-center gap-2">
                    <BookOpen className="size-4 text-emerald-600" /> Academic Course Transcript ({selectedStudent.courses.length} courses)
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-3">Code</th>
                          <th className="p-3">Course Title</th>
                          <th className="p-3">Credits</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Grade</th>
                          <th className="p-3">Self Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedStudent.courses.map((c) => (
                          <tr key={c.code}>
                            <td className="p-3 font-mono font-bold">{c.code}</td>
                            <td className="p-3 font-medium">{c.name}</td>
                            <td className="p-3">{c.credits}</td>
                            <td className="p-3">
                              <span className={`inline-flex rounded px-2 py-0.5 font-semibold ${
                                c.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-ink">{c.grade || "—"}</td>
                            <td className="p-3">{c.rating ? `${c.rating}/5 ⭐` : "—"}</td>
                          </tr>
                        ))}
                        {selectedStudent.courses.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">No courses logged yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Student Projects */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-ink flex items-center gap-2">
                    <FolderGit2 className="size-4 text-sky-600" /> Student Projects ({selectedStudent.projects.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedStudent.projects.map((p) => (
                      <div key={p.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-ink">{p.title}</span>
                          {p.github_url && (
                            <a href={p.github_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-ink">
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                        {p.tech_stack && (
                          <span className="inline-block font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {p.tech_stack}
                          </span>
                        )}
                      </div>
                    ))}
                    {selectedStudent.projects.length === 0 && (
                      <p className="text-xs text-muted-foreground italic col-span-2">No projects submitted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL: EDIT COURSE ─────────────────────────────────────────── */}
          {editingCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-ink">Edit Course {editingCourse.course_code}</h3>
                  <button onClick={() => setEditingCourse(null)}><X className="size-4" /></button>
                </div>

                <form onSubmit={handleSaveEditedCourse} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-ink">Course Title</label>
                    <Input
                      value={editingCourse.course_name}
                      onChange={(e) => setEditingCourse({ ...editingCourse, course_name: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-ink">Credit Hours</label>
                      <Input
                        type="number"
                        step="0.5"
                        value={editingCourse.credit_hours}
                        onChange={(e) => setEditingCourse({ ...editingCourse, credit_hours: Number(e.target.value) })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink">Semester (1-10)</label>
                      <Input
                        type="number"
                        value={editingCourse.semester}
                        onChange={(e) => setEditingCourse({ ...editingCourse, semester: Number(e.target.value) })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink">Description</label>
                    <textarea
                      rows={3}
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditingCourse(null)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">Save Changes</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── MODAL: ADD NEW COURSE ──────────────────────────────────────── */}
          {showAddCourseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-ink">Add New Curriculum Course</h3>
                  <button onClick={() => setShowAddCourseModal(false)}><X className="size-4" /></button>
                </div>

                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-ink">Course Code</label>
                      <Input
                        placeholder="e.g. CSE 489"
                        value={newCourseForm.course_code}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, course_code: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink">Semester (1-10)</label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={newCourseForm.semester}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, semester: Number(e.target.value) })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink">Course Title</label>
                    <Input
                      placeholder="e.g. Cloud Native Computing"
                      value={newCourseForm.course_name}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, course_name: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink">Credit Hours</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newCourseForm.credit_hours}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, credit_hours: Number(e.target.value) })}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-ink">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Course objectives, prerequisites and scope..."
                      value={newCourseForm.description}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowAddCourseModal(false)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">Create Course</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
