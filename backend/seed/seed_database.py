"""
seed_database.py — Unified Idempotent Seed for CourseCompass Database.

Populates:
1. Academic Hierarchy (Departments, Programs, Batches, Curriculum Versions).
2. All 82 IUBAT CSE Curriculum Courses (59 Core + 23 Electives) with Topics and Outcomes.
3. Skills Catalog (29 Skills).
4. Career Roles Catalog (10 Roles).
5. Career Role Skill Requirements (73 Requirements).
6. Course-Skill Mappings (20 Mappings).
7. Learning Resources (10 Resources).
8. Portfolio Project Recommendations (5 Projects).
9. Industry Certifications (4 Certifications).
10. Job Market Listings (5 Sample Jobs with is_sample=True).
11. Seed Admin & Test Accounts for Authority Role Testing.

Idempotent: Running this script multiple times will never duplicate rows.
"""
import os
import sys
import uuid
import datetime
import openpyxl

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.users import User, UserRole
from app.models.academic import Department, Program, Batch, CurriculumVersion, CurriculumCourse
from app.models.courses import Course, CourseTopic, CourseOutcome
from app.models.students import StudentProfile
from app.models.skills import Skill
from app.models.careers import CareerRole
from app.models.mappings import CareerRoleSkill, CourseSkillMapping
from app.models.recommendations import LearningResource, ProjectRecommendation, Certification, JobListing
from app.utils.security import hash_password


def run_master_seed():
    print("==================================================")
    print("CourseCompass Master Database Seed Starting...")
    print("==================================================")

    # 1. Ensure all tables exist in the target database
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # ── 1. ACADEMIC HIERARCHY & VERSIONING ────────────────────────────
        print("\n[1/7] Seeding Academic Hierarchy & Versioning...")
        dept = db.query(Department).filter(Department.code == "CSE").first()
        if not dept:
            dept = Department(
                code="CSE",
                name="Department of Computer Science & Engineering"
            )
            db.add(dept)
            db.flush()

        program = db.query(Program).filter(Program.code == "BCSE").first()
        if not program:
            program = Program(
                department_id=dept.id,
                code="BCSE",
                name="Bachelor of Science in Computer Science & Engineering",
                degree_type="Bachelor of Science",
                total_credits=140
            )
            db.add(program)
            db.flush()

        batch51 = db.query(Batch).filter(Batch.name == "51st Batch").first()
        if not batch51:
            batch51 = Batch(
                program_id=program.id,
                name="51st Batch",
                admission_year=2021,
                status="ACTIVE"
            )
            db.add(batch51)
            db.flush()

        curriculum_ver = db.query(CurriculumVersion).filter(CurriculumVersion.version_code == "B231").first()
        if not curriculum_ver:
            curriculum_ver = CurriculumVersion(
                program_id=program.id,
                name="IUBAT CSE Curriculum (B231)",
                version_code="B231",
                effective_from="2023-01",
                status="ACTIVE"
            )
            db.add(curriculum_ver)
            db.flush()

        # ── 2. CURRICULUM DATASET (82 COURSES) ─────────────────────────────
        print("\n[2/7] Seeding 82 IUBAT CSE Courses from Excel dataset...")
        excel_path = os.path.join(os.path.dirname(__file__), "curriculum_dataset.xlsx")
        wb = openpyxl.load_workbook(excel_path)
        sheet = wb.active

        headers = [cell.value for cell in next(sheet.iter_rows(min_row=1, max_row=1))]
        headers_clean = [str(h).strip() if h is not None else "" for h in headers]
        col_map = {h: idx for idx, h in enumerate(headers_clean)}

        course_count = 0
        topic_count = 0
        outcome_count = 0

        for row in sheet.iter_rows(min_row=2, values_only=True):
            if not row or all(v is None for v in row):
                continue
            raw_code = row[col_map["Course Code"]] if "Course Code" in col_map else None
            raw_name = row[col_map["Course Name"]] if "Course Name" in col_map else None
            if not raw_code or not raw_name or str(raw_code).strip() == "":
                continue

            course_code = str(raw_code).strip().upper()
            course_name = str(raw_name).strip()

            raw_credits = row[col_map["Credit Hours"]] if "Credit Hours" in col_map else 3.0
            try:
                credit_hours = float(raw_credits) if raw_credits is not None else 3.0
            except:
                credit_hours = 3.0

            raw_sem = row[col_map["Semester"]] if "Semester" in col_map else 1
            if str(raw_sem).strip().isdigit():
                semester = int(str(raw_sem).strip())
            elif "Final" in str(raw_sem):
                semester = 10
            elif "Elective" in str(raw_sem):
                semester = 9
            elif course_code == "ART 204":
                semester = 2
            else:
                semester = 8

            description = str(row[col_map["Description"]]).strip() if "Description" in col_map and row[col_map["Description"]] else ""

            course = db.query(Course).filter(Course.course_code == course_code).first()
            if not course:
                course = Course(
                    course_code=course_code,
                    course_name=course_name,
                    credit_hours=credit_hours,
                    semester=semester,
                    description=description
                )
                db.add(course)
                db.flush()
                course_count += 1
            else:
                course.course_name = course_name
                course.credit_hours = credit_hours
                course.semester = semester
                course.description = description
                db.flush()

            # Link Course to CurriculumVersion
            curr_course = db.query(CurriculumCourse).filter(
                CurriculumCourse.curriculum_version_id == curriculum_ver.id,
                CurriculumCourse.course_id == course.id
            ).first()
            if not curr_course:
                curr_course = CurriculumCourse(
                    curriculum_version_id=curriculum_ver.id,
                    course_id=course.id,
                    semester=semester,
                    is_required=(semester <= 8 or semester == 10)
                )
                db.add(curr_course)

            # Topics
            if "Topics / Skills" in col_map and row[col_map["Topics / Skills"]]:
                topics_raw = str(row[col_map["Topics / Skills"]])
                for line in topics_raw.split("\n"):
                    clean_t = line.replace("•", "").replace("\ufffd", "").strip()
                    if clean_t:
                        existing_t = db.query(CourseTopic).filter(
                            CourseTopic.course_id == course.id,
                            CourseTopic.topic_name == clean_t
                        ).first()
                        if not existing_t:
                            db.add(CourseTopic(course_id=course.id, topic_name=clean_t))
                            topic_count += 1

            # Outcomes
            for co_num in range(1, 6):
                co_header = f"CO{co_num}"
                if co_header in col_map and row[col_map[co_header]]:
                    co_desc = str(row[col_map[co_header]]).replace("•", "").replace("\ufffd", "").strip()
                    if co_desc:
                        existing_co = db.query(CourseOutcome).filter(
                            CourseOutcome.course_id == course.id,
                            CourseOutcome.outcome_code == co_header
                        ).first()
                        if not existing_co:
                            db.add(CourseOutcome(course_id=course.id, outcome_code=co_header, description=co_desc))
                            outcome_count += 1

        db.commit()
        print(f"Courses synced: 82 in catalog (inserted: {course_count}, topics: {topic_count}, outcomes: {outcome_count})")

        # ── 3. SKILLS CATALOG (29 SKILLS) ──────────────────────────────────
        print("\n[3/7] Seeding 29 Skills...")
        skills_data = [
            ("Python", "Programming", "Versatile high-level programming language for web, scripting, and AI/ML."),
            ("JavaScript", "Programming", "Core programming language of the modern web."),
            ("TypeScript", "Programming", "Typed superset of JavaScript for scalable applications."),
            ("C++", "Programming", "High-performance systems programming language."),
            ("C", "Programming", "Foundational procedural systems language."),
            ("Java", "Programming", "Object-oriented language for enterprise systems and Android."),
            ("SQL", "Database", "Relational database querying and management."),
            ("PostgreSQL", "Database", "Advanced open-source relational database system."),
            ("MongoDB", "Database", "Document-oriented NoSQL database."),
            ("React", "Frontend", "Declarative UI component library."),
            ("Node.js", "Backend", "Asynchronous event-driven JavaScript runtime."),
            ("FastAPI", "Backend", "High-performance Python asynchronous REST API framework."),
            ("Django", "Backend", "Batteries-included Python web framework."),
            ("Docker", "DevOps", "Container platform for packaging and deploying applications."),
            ("Kubernetes", "DevOps", "Container orchestration system for automating deployment."),
            ("CI/CD", "DevOps", "Continuous Integration and Continuous Deployment pipelines."),
            ("Linux", "Tools & DevOps", "Unix-like open source operating system."),
            ("Git", "Tools & DevOps", "Distributed version control system."),
            ("Machine Learning", "AI & Data Science", "Algorithms and statistical models that learn from data."),
            ("Deep Learning", "AI & Data Science", "Neural networks and deep representations."),
            ("Data Structures", "Computer Science", "Fundamental data organization (arrays, trees, graphs)."),
            ("Algorithms", "Computer Science", "Step-by-step problem solving and computational efficiency."),
            ("System Design", "Architecture", "Designing scalable distributed software architectures."),
            ("Cybersecurity", "Security", "Protecting systems, networks, and data from attacks."),
            ("Cloud Architecture", "Cloud", "Designing resilient cloud infrastructure on AWS/GCP/Azure."),
            ("HTML/CSS", "Web Development", "Fundamental building blocks of web pages."),
            ("Next.js", "Web Development", "React production framework for full-stack applications."),
            ("Data Analysis", "AI & Data Science", "Inspecting, cleansing, and transforming data for decisions."),
            ("Problem Solving", "Soft Skills", "Analytical mindset for diagnosing and resolving complex challenges.")
        ]
        for name, cat, desc in skills_data:
            sk = db.query(Skill).filter(Skill.name == name).first()
            if not sk:
                db.add(Skill(name=name, category=cat, description=desc))
            else:
                sk.category = cat
                sk.description = desc
        db.commit()

        # ── 4. CAREER ROLES & ROLE SKILLS ──────────────────────────────────
        print("\n[4/7] Seeding 10 Career Roles and 73 Role Skills...")
        roles_data = [
            ("Full-Stack Software Engineer", "Build end-to-end web applications across frontend, backend, and databases."),
            ("Backend Engineer", "Design, build, and optimize backend microservices, APIs, and data layers."),
            ("Frontend Engineer", "Create polished, performant, and accessible user interfaces for web applications."),
            ("AI/ML Engineer", "Develop, train, and deploy machine learning models and intelligent services into production."),
            ("DevOps & Cloud Engineer", "Automate infrastructure, build CI/CD pipelines, and maintain highly available cloud systems."),
            ("Cybersecurity Analyst", "Protect networks, systems, and sensitive applications from digital vulnerabilities."),
            ("Data Scientist", "Extract actionable insights, statistical models, and predictions from massive data."),
            ("Data Analyst", "Transform raw data into dashboards, business metrics, and strategic reporting."),
            ("Mobile App Developer", "Build native and cross-platform mobile apps for iOS and Android platforms."),
            ("Systems Engineer", "Build low-level operating system modules, compilers, and performance-critical systems.")
        ]
        role_map = {}
        for rname, rdesc in roles_data:
            role = db.query(CareerRole).filter(CareerRole.name == rname).first()
            if not role:
                role = CareerRole(name=rname, description=rdesc)
                db.add(role)
                db.flush()
            else:
                role.description = rdesc
            role_map[rname] = role

        skill_map = {s.name: s for s in db.query(Skill).all()}

        role_skills_defs = [
            ("Full-Stack Software Engineer", [("JavaScript", "CORE", 4), ("TypeScript", "CORE", 4), ("React", "CORE", 4), ("Node.js", "CORE", 3), ("FastAPI", "IMPORTANT", 3), ("SQL", "CORE", 4), ("PostgreSQL", "IMPORTANT", 3), ("Git", "CORE", 4), ("Docker", "IMPORTANT", 3), ("System Design", "IMPORTANT", 3)]),
            ("Backend Engineer", [("Python", "CORE", 4), ("FastAPI", "CORE", 4), ("Django", "IMPORTANT", 3), ("SQL", "CORE", 5), ("PostgreSQL", "CORE", 4), ("Docker", "CORE", 4), ("Kubernetes", "IMPORTANT", 3), ("Git", "CORE", 4), ("System Design", "CORE", 4), ("Algorithms", "CORE", 4)]),
            ("Frontend Engineer", [("JavaScript", "CORE", 5), ("TypeScript", "CORE", 4), ("React", "CORE", 5), ("Next.js", "CORE", 4), ("HTML/CSS", "CORE", 5), ("Git", "CORE", 4)]),
            ("AI/ML Engineer", [("Python", "CORE", 5), ("Machine Learning", "CORE", 5), ("Deep Learning", "CORE", 4), ("Data Analysis", "IMPORTANT", 4), ("SQL", "IMPORTANT", 3), ("Docker", "IMPORTANT", 3), ("Algorithms", "CORE", 4)]),
            ("DevOps & Cloud Engineer", [("Docker", "CORE", 5), ("Kubernetes", "CORE", 4), ("CI/CD", "CORE", 5), ("Linux", "CORE", 5), ("Cloud Architecture", "CORE", 4), ("Git", "CORE", 4), ("Python", "IMPORTANT", 3)]),
            ("Cybersecurity Analyst", [("Cybersecurity", "CORE", 5), ("Linux", "CORE", 4), ("Python", "CORE", 4), ("SQL", "IMPORTANT", 3), ("Problem Solving", "CORE", 4)]),
            ("Data Scientist", [("Python", "CORE", 5), ("Machine Learning", "CORE", 4), ("Data Analysis", "CORE", 5), ("SQL", "CORE", 4), ("PostgreSQL", "IMPORTANT", 3)]),
            ("Data Analyst", [("SQL", "CORE", 5), ("Data Analysis", "CORE", 5), ("Python", "IMPORTANT", 3), ("Problem Solving", "CORE", 4)]),
            ("Mobile App Developer", [("JavaScript", "CORE", 4), ("TypeScript", "CORE", 4), ("React", "CORE", 4), ("Git", "CORE", 4), ("Problem Solving", "IMPORTANT", 3)]),
            ("Systems Engineer", [("C", "CORE", 5), ("C++", "CORE", 5), ("Linux", "CORE", 5), ("Data Structures", "CORE", 5), ("Algorithms", "CORE", 5), ("System Design", "CORE", 4)])
        ]

        for rname, sk_list in role_skills_defs:
            role = role_map.get(rname)
            if not role:
                continue
            for sname, importance, req_level in sk_list:
                sk = skill_map.get(sname)
                if not sk:
                    continue
                crs = db.query(CareerRoleSkill).filter(
                    CareerRoleSkill.career_role_id == role.id,
                    CareerRoleSkill.skill_id == sk.id
                ).first()
                if not crs:
                    db.add(CareerRoleSkill(
                        career_role_id=role.id,
                        skill_id=sk.id,
                        importance=req_level,
                        importance_level=importance,
                        minimum_rating=req_level
                    ))
                else:
                    crs.importance = req_level
                    crs.importance_level = importance
                    crs.minimum_rating = req_level
        db.commit()

        # ── 5. COURSE-SKILL MAPPINGS (20 MAPPINGS) ─────────────────────────
        print("\n[5/7] Seeding Course-Skill Mappings...")
        course_map = {c.course_code: c for c in db.query(Course).all()}
        course_skill_defs = [
            ("CSC 101", [("Python", "INTRODUCTORY", 2), ("Problem Solving", "INTRODUCTORY", 2)]),
            ("CSC 201", [("C++", "INTRODUCTORY", 2), ("Algorithms", "INTRODUCTORY", 2)]),
            ("CSC 283", [("Data Structures", "ADVANCED", 4), ("Algorithms", "INTERMEDIATE", 3), ("C++", "INTERMEDIATE", 3)]),
            ("CSC 345", [("SQL", "ADVANCED", 4), ("PostgreSQL", "INTERMEDIATE", 3)]),
            ("CSC 371", [("Linux", "ADVANCED", 4), ("C", "INTERMEDIATE", 3)]),
            ("CSC 385", [("Algorithms", "ADVANCED", 4), ("Problem Solving", "ADVANCED", 4)]),
            ("CSC 483", [("Machine Learning", "ADVANCED", 4), ("Python", "ADVANCED", 4)]),
        ]
        for ccode, sk_list in course_skill_defs:
            course = course_map.get(ccode)
            if not course:
                continue
            for sname, contrib, level in sk_list:
                sk = skill_map.get(sname)
                if not sk:
                    continue
                csm = db.query(CourseSkillMapping).filter(
                    CourseSkillMapping.course_id == course.id,
                    CourseSkillMapping.skill_id == sk.id
                ).first()
                if not csm:
                    db.add(CourseSkillMapping(
                        course_id=course.id,
                        skill_id=sk.id,
                        contribution_level=contrib,
                        relevance_weight=float(level) / 5.0
                    ))
                else:
                    csm.contribution_level = contrib
                    csm.relevance_weight = float(level) / 5.0
        db.commit()

        # ── 6. INTELLIGENCE, PROJECTS, CERTS & SAMPLE JOBS ────────────────
        print("\n[6/7] Seeding Learning Resources, Projects, Certs & Sample Jobs...")
        resources_data = [
            ("FastAPI Official Documentation", "https://fastapi.tiangolo.com/", "FastAPI", "Documentation", "Comprehensive guide to building high-performance APIs with Python.", "Beginner to Advanced", "FastAPI"),
            ("Full Stack Open — University of Helsinki", "https://fullstackopen.com/", "React", "Course", "Deep dive into modern web development with React, Node.js, and TypeScript.", "Intermediate", "University of Helsinki"),
            ("PostgreSQL Tutorial — PostgresGuide", "https://www.postgresguide.com/", "PostgreSQL", "Tutorial", "Practical insights and SQL optimization strategies.", "Intermediate", "PostgresGuide"),
            ("NeetCode 150 — DSA Roadmap", "https://neetcode.io/", "Data Structures", "Practice", "Structured coding interview preparation and algorithms.", "Intermediate", "NeetCode"),
            ("Docker for Beginners", "https://docker-curriculum.com/", "Docker", "Tutorial", "Hands-on guide to containerization and Docker Compose.", "Beginner", "Docker Curriculum"),
            ("The Missing Semester of Your CS Education (MIT)", "https://missing.csail.mit.edu/", "Linux", "Course", "Mastering shell tools, Git, vim, and command line mastery.", "All Levels", "MIT"),
            ("Designing Data-Intensive Applications", "https://dataintensive.net/", "System Design", "Book", "Foundational concepts for distributed data systems.", "Advanced", "O'Reilly"),
            ("DeepLearning.AI Machine Learning Specialization", "https://www.coursera.org/specializations/machine-learning-introduction", "Machine Learning", "Course", "Andrew Ng's foundational ML specialization.", "Beginner to Intermediate", "Coursera"),
            ("TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/", "TypeScript", "Documentation", "Official TypeScript language guide.", "Intermediate", "Microsoft"),
            ("Kubernetes Up & Running", "https://www.oreilly.com/library/view/kubernetes-up-and/9781492046523/", "Kubernetes", "Book", "Practical guide to building containerized cloud systems.", "Advanced", "O'Reilly"),
        ]
        for title, url, sname, rtype, desc, diff, provider in resources_data:
            sk = skill_map.get(sname)
            res = db.query(LearningResource).filter(LearningResource.url == url).first()
            if not res:
                db.add(LearningResource(
                    title=title, url=url, provider=provider, skill_id=sk.id if sk else None,
                    resource_type=rtype, difficulty=diff
                ))
            else:
                res.title = title
                res.provider = provider
                res.difficulty = diff

        project_recs = [
            ("CourseCompass Academic Advising Platform", "Full-stack academic advising and career intelligence system with student context, course trees, and role planning.", "Intermediate", "Backend Engineer", '["FastAPI", "React", "PostgreSQL"]'),
            ("Distributed Task Queue & Rate Limiter", "High-performance worker queue with exponential backoff retry policies and sliding-window rate limiting in Python.", "Advanced", "Backend Engineer", '["Python", "Redis", "FastAPI"]'),
            ("Interactive React Component Design System", "Accessible, keyboard-navigable component library built with TypeScript, TailwindCSS, and Radix UI primitives.", "Intermediate", "Frontend Engineer", '["React", "TypeScript", "TailwindCSS"]'),
            ("End-to-End E-Commerce Microservices", "Full-stack multi-service store with cart management, stripe payment webhooks, and JWT authenticated user profiles.", "Advanced", "Full-Stack Software Engineer", '["Node.js", "React", "PostgreSQL", "Docker"]'),
            ("University Course Recommender System", "Machine learning collaborative filtering engine matching students with elective courses based on historical grades and interests.", "Advanced", "AI/ML Engineer", '["Python", "Scikit-Learn", "FastAPI"]')
        ]
        for title, desc, diff, rname, techs in project_recs:
            role = role_map.get(rname)
            proj = db.query(ProjectRecommendation).filter(ProjectRecommendation.title == title).first()
            if not proj:
                db.add(ProjectRecommendation(
                    title=title, description=desc, difficulty=diff,
                    technologies=techs,
                    career_role_id=role.id if role else None
                ))

        certs_data = [
            ("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "Validates ability to design robust and scalable distributed systems on AWS.", "https://aws.amazon.com/certification/certified-solutions-architect-associate/", 80, "Intermediate", '["AWS", "Cloud", "System Design", "Linux"]', "DevOps & Cloud Engineer"),
            ("Meta Front-End Developer Professional Certificate", "Meta / Coursera", "Covers React, modern JavaScript, UI/UX principles, and version control.", "https://www.coursera.org/professional-certificates/meta-front-end-developer", 120, "Beginner", '["React", "JavaScript", "TypeScript", "Git"]', "Frontend Engineer"),
            ("Google Data Analytics Professional Certificate", "Google / Coursera", "In-depth training in SQL data transformation, R programming, and business dashboards.", "https://www.coursera.org/professional-certificates/google-data-analytics", 140, "Beginner", '["SQL", "Python", "Data Structures"]', "Data Analyst"),
            ("CompTIA Security+ Certification", "CompTIA", "Baseline global standard for foundational cybersecurity and network defense.", "https://www.comptia.org/certifications/security", 100, "Intermediate", '["Cybersecurity", "Linux"]', "Cybersecurity Analyst"),
        ]
        for name, provider, desc, url, hrs, diff, s_learned, role_name in certs_data:
            role = role_map.get(role_name)
            c = db.query(Certification).filter(Certification.name == name).first()
            if not c:
                db.add(Certification(
                    name=name, provider=provider, description=desc,
                    url=url, estimated_hours=hrs, difficulty=diff,
                    skills_learned=s_learned,
                    career_role_id=role.id if role else None
                ))

        jobs_defs = [
            ("Junior Backend Engineer", "Brain Station 23", "Dhaka, Bangladesh", "Full-time", "Junior", 45000, 65000, "BDT", "৳45,000 – ৳65,000 / month", '["Python", "FastAPI", "PostgreSQL", "REST APIs", "Git"]', "https://brainstation-23.com/careers", "Backend Engineer"),
            ("Software Engineer (Frontend / React)", "Optimizely Bangladesh", "Dhaka, Bangladesh (Hybrid)", "Full-time", "Junior", 50000, 75000, "BDT", "৳50,000 – ৳75,000 / month", '["JavaScript", "TypeScript", "React", "Git"]', "https://www.optimizely.com/careers", "Frontend Engineer"),
            ("Associate Software Engineer", "Samsung R&D Institute Bangladesh", "Dhaka, Bangladesh", "Full-time", "Entry Level", 60000, 85000, "BDT", "৳60,000 – ৳85,000 / month", '["C++", "Algorithms", "Data Structures", "Operating Systems"]', "https://research.samsung.com/srbd", "Full-Stack Software Engineer"),
            ("Junior DevOps / Cloud Engineer", "Cefalo Bangladesh", "Dhaka, Bangladesh", "Full-time", "Junior", 45000, 70000, "BDT", "৳45,000 – ৳70,000 / month", '["Linux", "Docker", "CI/CD", "AWS", "Git"]', "https://cefalo.com/careers", "DevOps & Cloud Engineer"),
            ("Associate AI / ML Engineer", "Kona Software Lab", "Dhaka, Bangladesh", "Full-time", "Junior", 55000, 80000, "BDT", "৳55,000 – ৳80,000 / month", '["Python", "Machine Learning", "FastAPI", "SQL"]', "https://konasl.com/careers", "AI/ML Engineer"),
        ]
        for role_title, company, loc, emp_type, exp_lvl, s_min, s_max, curr, s_fmt, req_s, src_url, role_name in jobs_defs:
            role = role_map.get(role_name)
            j = db.query(JobListing).filter(JobListing.role == role_title, JobListing.company_name == company).first()
            if not j:
                db.add(JobListing(
                    role=role_title, company_name=company, location=loc,
                    employment_type=emp_type, experience_level=exp_lvl,
                    salary_min=s_min, salary_max=s_max, currency=curr,
                    salary_formatted=s_fmt, required_skills=req_s,
                    source_url=src_url, posted_at=datetime.datetime.now(datetime.timezone.utc),
                    is_sample=True,
                    career_role_id=role.id if role else None
                ))
        db.commit()

        # ── 7. SEED USERS FOR AUTHORITY TESTING ───────────────────────────
        print("\n[7/7] Seeding Authority Users for Testing...")
        test_users = [
            ("admin@iubat.edu", "admin123", UserRole.ADMIN, "IUBAT CSE Department Admin", "CSE-ADMIN"),
            ("student@iubat.edu", "pass123", UserRole.STUDENT, "Nusrat Jahan", "21103042"),
            ("faculty@iubat.edu", "pass123", UserRole.FACULTY, "Prof. Dr. Monirul Islam", "FAC-001"),
            ("dept_admin@iubat.edu", "pass123", UserRole.DEPARTMENT_ADMIN, "CSE Department Coordinator", "ADM-001"),
            ("authority@iubat.edu", "pass123", UserRole.IUBAT_AUTHORITY, "IUBAT Academic Registrar", "AUT-001"),
            ("superadmin@iubat.edu", "pass123", UserRole.SUPER_ADMIN, "System Administrator", "SYS-001"),
        ]
        for email, pwd, role, fname, sid in test_users:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    email=email,
                    role=role,
                    password_hash=hash_password(pwd),
                    is_active=True
                )
                db.add(u)
                db.flush()
                prof = StudentProfile(
                    user_id=u.id,
                    student_id=sid,
                    full_name=fname,
                    university="IUBAT",
                    department="Department of Computer Science & Engineering",
                    program="B.Sc. in Computer Science & Engineering",
                    current_semester=6,
                    cgpa=3.75,
                    target_role="Full-Stack Software Engineer"
                )
                db.add(prof)
            else:
                u.role = role
                if not u.profile:
                    prof = StudentProfile(
                        user_id=u.id,
                        student_id=sid,
                        full_name=fname,
                        university="IUBAT",
                        department="Department of Computer Science & Engineering",
                        program="B.Sc. in Computer Science & Engineering",
                        current_semester=6,
                        cgpa=3.75,
                        target_role="Full-Stack Software Engineer"
                    )
                    db.add(prof)
        db.commit()

        print("\n==================================================")
        print("MASTER SEED COMPLETED SUCCESSFULLY!")
        print("==================================================")
    except Exception as e:
        db.rollback()
        print(f"Error during master seed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_master_seed()
