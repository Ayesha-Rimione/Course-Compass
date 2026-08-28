-- ==============================================================================
-- CourseCompass — Complete Unified Supabase PostgreSQL Schema
-- Single Production Source of Truth for IUBAT CSE Academic & Career Intelligence
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. USER AUTH & PROFILES ───────────────────────────────────────────────────

CREATE TYPE user_role_enum AS ENUM (
    'STUDENT',
    'FACULTY',
    'DEPARTMENT_ADMIN',
    'IUBAT_AUTHORITY',
    'SUPER_ADMIN'
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role_enum DEFAULT 'STUDENT' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_id VARCHAR(100),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    university VARCHAR(255) DEFAULT 'IUBAT' NOT NULL,
    department VARCHAR(255) DEFAULT 'Department of Computer Science & Engineering' NOT NULL,
    program VARCHAR(255) DEFAULT 'B.Sc. in Computer Science & Engineering' NOT NULL,
    batch VARCHAR(100),
    current_semester INTEGER,
    cgpa NUMERIC(3, 2),
    target_role VARCHAR(255) DEFAULT 'Full-Stack Software Engineer',
    admission_session VARCHAR(100),
    profile_image_url VARCHAR(500),
    bio TEXT,
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    codeforces_url VARCHAR(500),
    leetcode_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── 2. ACADEMIC HIERARCHY & CURRICULUM VERSIONING ────────────────────────────

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    degree_type VARCHAR(100) DEFAULT 'Bachelor of Science' NOT NULL,
    total_credits INTEGER DEFAULT 140 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    admission_year INTEGER,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.curriculum_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    version_code VARCHAR(50) NOT NULL,
    effective_from VARCHAR(50),
    effective_to VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    credit_hours NUMERIC(3, 1) DEFAULT 3.0 NOT NULL,
    semester INTEGER DEFAULT 1 NOT NULL,
    description TEXT DEFAULT '',
    department VARCHAR(255) DEFAULT 'Department of Computer Science & Engineering' NOT NULL,
    program VARCHAR(255) DEFAULT 'B.Sc. in Computer Science & Engineering' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.curriculum_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT uq_curriculum_course UNIQUE (curriculum_version_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.course_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    outcome_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

CREATE TYPE progress_status_enum AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE IF NOT EXISTS public.student_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status progress_status_enum DEFAULT 'NOT_STARTED' NOT NULL,
    grade VARCHAR(10),
    self_rating INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_student_course_progress UNIQUE (student_profile_id, course_id)
);

-- ── 3. SKILLS & COMPETENCY CATALOG ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    self_rating INTEGER DEFAULT 1 NOT NULL,
    source VARCHAR(50) DEFAULT 'self_reported' NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_student_skill UNIQUE (student_profile_id, skill_id)
);

CREATE TYPE verification_status_enum AS ENUM ('PENDING', 'VERIFIED', 'FAILED');
CREATE TYPE quiz_status_enum AS ENUM ('PENDING', 'PASSED', 'FAILED');

CREATE TABLE IF NOT EXISTS public.skill_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_skill_id UUID NOT NULL REFERENCES public.student_skills(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) DEFAULT 'QUIZ' NOT NULL,
    status verification_status_enum DEFAULT 'PENDING' NOT NULL,
    score NUMERIC(5, 2),
    max_score NUMERIC(5, 2) DEFAULT 100.0,
    evidence_url VARCHAR(500),
    quiz_status quiz_status_enum DEFAULT 'PENDING' NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── 4. CAREER PATHS & ROLES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.career_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Software Engineering',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.career_role_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    career_role_id UUID NOT NULL REFERENCES public.career_roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    importance INTEGER DEFAULT 3 NOT NULL,
    importance_level VARCHAR(30) DEFAULT 'IMPORTANT' NOT NULL,
    minimum_rating INTEGER DEFAULT 3 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_career_role_skill UNIQUE (career_role_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.student_career_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    career_role_id UUID NOT NULL REFERENCES public.career_roles(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_student_career_interest UNIQUE (student_profile_id, career_role_id)
);

CREATE TABLE IF NOT EXISTS public.course_skill_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    relevance_weight NUMERIC(3, 2) DEFAULT 0.5 NOT NULL,
    contribution_level VARCHAR(30) DEFAULT 'INTERMEDIATE' NOT NULL,
    source VARCHAR(50) DEFAULT 'academic_mapping' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_course_skill UNIQUE (course_id, skill_id)
);

-- ── 5. INTELLIGENCE & RECOMMENDATIONS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'DOCUMENTATION' NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Beginner' NOT NULL,
    estimated_hours INTEGER,
    is_free BOOLEAN DEFAULT TRUE NOT NULL,
    price VARCHAR(50),
    category VARCHAR(100),
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    career_role_id UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Intermediate' NOT NULL,
    estimated_hours INTEGER,
    project_type VARCHAR(50) DEFAULT 'Web App',
    skills_demonstrated TEXT,
    technologies TEXT,
    recommended_for_gap_level VARCHAR(50) DEFAULT 'DEVELOPING',
    is_team BOOLEAN DEFAULT FALSE NOT NULL,
    career_role_id UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    github_starter_url TEXT,
    live_demo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    estimated_hours INTEGER,
    difficulty VARCHAR(50) DEFAULT 'Intermediate' NOT NULL,
    skills_learned TEXT,
    career_role_id UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Full-time' NOT NULL,
    experience_level VARCHAR(50) DEFAULT 'Junior' NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(10) DEFAULT 'BDT' NOT NULL,
    salary_formatted VARCHAR(100),
    required_skills TEXT,
    source_url TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    is_sample BOOLEAN DEFAULT TRUE NOT NULL,
    career_role_id UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── 6. STUDENT PORTFOLIO (PROJECTS & CERTIFICATIONS) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tech_stack VARCHAR(500),
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date VARCHAR(50),
    expiry_date VARCHAR(50),
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── 7. CHAT & AI BHAI MENTORSHIP ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Chat with AI Bhai' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    context_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── 8. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_career_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public Catalogs Read-Only
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_role_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_skill_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public catalog readable by all authenticated and anon users" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public skills readable by all" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public career roles readable by all" ON public.career_roles FOR SELECT USING (true);
CREATE POLICY "Public resources readable by all" ON public.learning_resources FOR SELECT USING (true);
CREATE POLICY "Public project recommendations readable by all" ON public.project_recommendations FOR SELECT USING (true);
CREATE POLICY "Public certifications readable by all" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Public job listings readable by all" ON public.job_listings FOR SELECT USING (true);
CREATE POLICY "Public academic hierarchy readable by all" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public programs readable by all" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Public batches readable by all" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Public curriculum versions readable by all" ON public.curriculum_versions FOR SELECT USING (true);
CREATE POLICY "Public curriculum courses readable by all" ON public.curriculum_courses FOR SELECT USING (true);
CREATE POLICY "Public course topics readable by all" ON public.course_topics FOR SELECT USING (true);
CREATE POLICY "Public course outcomes readable by all" ON public.course_outcomes FOR SELECT USING (true);
CREATE POLICY "Public career role skills readable by all" ON public.career_role_skills FOR SELECT USING (true);
CREATE POLICY "Public course skill mappings readable by all" ON public.course_skill_mappings FOR SELECT USING (true);
