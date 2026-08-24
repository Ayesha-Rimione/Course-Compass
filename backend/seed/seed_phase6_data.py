"""
seed_phase6_data.py — Complete, Idempotent Seed for Phase 6 Intelligence & Catalog Data.

Seeds:
1. 10 Comprehensive Career Roles with categories and target readiness levels.
2. Career Role Skills with CORE, IMPORTANT, NICE_TO_HAVE importance levels.
3. Course-Skill Mappings with contribution levels (INTRODUCTORY, INTERMEDIATE, ADVANCED).
4. Verified Learning Resources with genuine, real-world URLs.
5. Realistic Portfolio Project Recommendations.
6. Industry Certifications.
7. Sample Job Market Listings (explicitly marked is_sample=True).

Idempotent: Running this script multiple times safely updates records without duplicates.
"""
import os
import sys
import uuid
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.careers import CareerRole
from app.models.skills import Skill
from app.models.courses import Course
from app.models.mappings import CareerRoleSkill, CourseSkillMapping
from app.models.recommendations import LearningResource, ProjectRecommendation, Certification, JobListing


def seed_phase6():
    db: Session = SessionLocal()
    stats = {
        "roles_inserted": 0, "roles_updated": 0,
        "skills_inserted": 0,
        "role_skills_inserted": 0, "role_skills_updated": 0,
        "course_skills_inserted": 0, "course_skills_updated": 0,
        "resources_inserted": 0, "resources_updated": 0,
        "projects_inserted": 0, "projects_updated": 0,
        "certs_inserted": 0, "certs_updated": 0,
        "jobs_inserted": 0, "jobs_updated": 0,
    }

    try:
        # ── 1. SKILLS CATALOG ───────────────────────────────────────────────
        skill_defs = [
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
            ("Kubernetes", "DevOps", "Production-grade container orchestration system."),
            ("Git", "Tools", "Distributed version control system."),
            ("Linux", "Systems", "Unix-like open-source operating system kernel & CLI."),
            ("REST APIs", "Backend", "RESTful web services design and implementation."),
            ("GraphQL", "Backend", "Query language and runtime for web APIs."),
            ("Data Structures", "Computer Science", "Arrays, Linked Lists, Trees, Graphs, Hash Tables."),
            ("Algorithms", "Computer Science", "Sorting, Searching, Dynamic Programming, Graph Traversal."),
            ("Machine Learning", "Data & AI", "Supervised, unsupervised, and reinforcement learning models."),
            ("Deep Learning", "Data & AI", "Neural networks, CNNs, Transformers, PyTorch/TensorFlow."),
            ("Computer Networks", "Computer Science", "TCP/IP, HTTP/HTTPS, DNS, routing, socket programming."),
            ("Operating Systems", "Computer Science", "Processes, threads, memory management, file systems."),
            ("System Design", "Architecture", "Distributed systems, caching, load balancing, scalability."),
            ("Cybersecurity Fundamentals", "Security", "Network security, cryptography, OWASP Top 10 vulnerabilities."),
            ("AWS", "Cloud", "Amazon Web Services cloud computing platform (EC2, S3, RDS, Lambda)."),
            ("CI/CD", "DevOps", "Continuous Integration and Continuous Deployment pipelines (GitHub Actions)."),
        ]

        skills_map = {}
        for name, category, desc in skill_defs:
            s = db.query(Skill).filter(Skill.name == name).first()
            if not s:
                s = Skill(id=str(uuid.uuid4()), name=name, category=category, description=desc)
                db.add(s)
                db.flush()
                stats["skills_inserted"] += 1
            skills_map[name] = s

        # ── 2. 10 CAREER ROLES ───────────────────────────────────────────────
        career_defs = [
            ("Software Engineer", "Software Engineering", 80, "Build and maintain software systems across diverse engineering domains."),
            ("Backend Engineer", "Software Engineering", 85, "Architect, build, and optimize scalable server-side systems, databases, and APIs."),
            ("Frontend Engineer", "Software Engineering", 80, "Craft responsive, accessible, and high-performance interactive user interfaces."),
            ("Full Stack Engineer", "Software Engineering", 85, "Develop end-to-end web applications combining modern frontend and backend architectures."),
            ("AI/ML Engineer", "Data & AI", 85, "Design, train, and deploy production machine learning models and intelligent systems."),
            ("Data Scientist", "Data & AI", 80, "Extract actionable insights, statistical models, and predictive analytics from complex data."),
            ("Data Analyst", "Data & AI", 75, "Transform raw data into meaningful business intelligence, dashboards, and reports."),
            ("Cybersecurity Engineer", "Infrastructure & Security", 85, "Protect computer systems, networks, and data from cyber threats and vulnerabilities."),
            ("DevOps Engineer", "Infrastructure & Security", 80, "Automate software delivery pipelines, container orchestration, and infrastructure."),
            ("Cloud Engineer", "Infrastructure & Security", 80, "Design, deploy, and manage scalable cloud infrastructure and microservices architectures."),
        ]

        roles_map = {}
        for name, category, target_lvl, desc in career_defs:
            r = db.query(CareerRole).filter(CareerRole.name == name).first()
            if not r:
                r = CareerRole(
                    id=str(uuid.uuid4()),
                    name=name,
                    category=category,
                    target_readiness_level=target_lvl,
                    description=desc
                )
                db.add(r)
                db.flush()
                stats["roles_inserted"] += 1
            else:
                r.category = category
                r.target_readiness_level = target_lvl
                r.description = desc
                stats["roles_updated"] += 1
            roles_map[name] = r

        # ── 3. CAREER ROLE SKILL REQUIREMENTS ────────────────────────────────
        role_skill_mappings = {
            "Backend Engineer": [
                ("Python", "CORE", 4),
                ("FastAPI", "CORE", 4),
                ("SQL", "CORE", 4),
                ("PostgreSQL", "IMPORTANT", 3),
                ("REST APIs", "CORE", 4),
                ("Data Structures", "CORE", 4),
                ("Algorithms", "IMPORTANT", 3),
                ("System Design", "IMPORTANT", 3),
                ("Git", "IMPORTANT", 3),
                ("Docker", "NICE_TO_HAVE", 2),
                ("Linux", "IMPORTANT", 3),
            ],
            "Frontend Engineer": [
                ("JavaScript", "CORE", 4),
                ("TypeScript", "CORE", 4),
                ("React", "CORE", 4),
                ("REST APIs", "IMPORTANT", 3),
                ("Git", "IMPORTANT", 3),
                ("Data Structures", "IMPORTANT", 3),
                ("GraphQL", "NICE_TO_HAVE", 2),
            ],
            "Software Engineer": [
                ("C++", "CORE", 4),
                ("Data Structures", "CORE", 4),
                ("Algorithms", "CORE", 4),
                ("Git", "IMPORTANT", 3),
                ("Operating Systems", "IMPORTANT", 3),
                ("Computer Networks", "IMPORTANT", 3),
                ("SQL", "IMPORTANT", 3),
                ("Python", "IMPORTANT", 3),
            ],
            "Full Stack Engineer": [
                ("JavaScript", "CORE", 4),
                ("TypeScript", "IMPORTANT", 3),
                ("React", "CORE", 4),
                ("Node.js", "CORE", 4),
                ("SQL", "IMPORTANT", 3),
                ("PostgreSQL", "IMPORTANT", 3),
                ("REST APIs", "CORE", 4),
                ("Git", "IMPORTANT", 3),
                ("Docker", "NICE_TO_HAVE", 2),
            ],
            "AI/ML Engineer": [
                ("Python", "CORE", 5),
                ("Machine Learning", "CORE", 4),
                ("Deep Learning", "CORE", 4),
                ("Algorithms", "CORE", 4),
                ("Data Structures", "IMPORTANT", 3),
                ("SQL", "IMPORTANT", 3),
                ("FastAPI", "IMPORTANT", 3),
                ("Git", "IMPORTANT", 3),
            ],
            "Data Scientist": [
                ("Python", "CORE", 4),
                ("SQL", "CORE", 4),
                ("Machine Learning", "CORE", 4),
                ("Algorithms", "IMPORTANT", 3),
                ("PostgreSQL", "IMPORTANT", 3),
                ("Git", "IMPORTANT", 3),
            ],
            "Data Analyst": [
                ("SQL", "CORE", 4),
                ("Python", "IMPORTANT", 3),
                ("PostgreSQL", "IMPORTANT", 3),
                ("Git", "NICE_TO_HAVE", 2),
            ],
            "Cybersecurity Engineer": [
                ("Cybersecurity Fundamentals", "CORE", 4),
                ("Computer Networks", "CORE", 4),
                ("Linux", "CORE", 4),
                ("Python", "IMPORTANT", 3),
                ("Operating Systems", "IMPORTANT", 3),
                ("Git", "IMPORTANT", 3),
            ],
            "DevOps Engineer": [
                ("Linux", "CORE", 4),
                ("Docker", "CORE", 4),
                ("Kubernetes", "CORE", 3),
                ("CI/CD", "CORE", 4),
                ("Git", "CORE", 4),
                ("Python", "IMPORTANT", 3),
                ("AWS", "IMPORTANT", 3),
            ],
            "Cloud Engineer": [
                ("AWS", "CORE", 4),
                ("Linux", "CORE", 4),
                ("Docker", "IMPORTANT", 3),
                ("Computer Networks", "IMPORTANT", 3),
                ("Python", "IMPORTANT", 3),
                ("CI/CD", "IMPORTANT", 3),
                ("Git", "IMPORTANT", 3),
            ],
        }

        importance_to_int = {"CORE": 5, "IMPORTANT": 3, "NICE_TO_HAVE": 1}

        for role_name, reqs in role_skill_mappings.items():
            role = roles_map.get(role_name)
            if not role:
                continue
            for skill_name, imp_level, min_rating in reqs:
                skill = skills_map.get(skill_name)
                if not skill:
                    continue
                crs = (
                    db.query(CareerRoleSkill)
                    .filter(CareerRoleSkill.career_role_id == role.id, CareerRoleSkill.skill_id == skill.id)
                    .first()
                )
                if not crs:
                    crs = CareerRoleSkill(
                        id=str(uuid.uuid4()),
                        career_role_id=role.id,
                        skill_id=skill.id,
                        importance=importance_to_int.get(imp_level, 3),
                        importance_level=imp_level,
                        minimum_rating=min_rating
                    )
                    db.add(crs)
                    stats["role_skills_inserted"] += 1
                else:
                    crs.importance = importance_to_int.get(imp_level, 3)
                    crs.importance_level = imp_level
                    crs.minimum_rating = min_rating
                    stats["role_skills_updated"] += 1

        # ── 4. COURSE-SKILL MAPPINGS ─────────────────────────────────────────
        course_skill_defs = [
            ("CSC 101", "C", "INTRODUCTORY", 0.5),
            ("CSC 101", "Algorithms", "INTRODUCTORY", 0.4),
            ("CSC 102", "C", "INTERMEDIATE", 0.8),
            ("CSC 102", "Data Structures", "INTRODUCTORY", 0.5),
            ("CSC 201", "Data Structures", "ADVANCED", 0.9),
            ("CSC 201", "C++", "INTERMEDIATE", 0.8),
            ("CSC 201", "Algorithms", "INTERMEDIATE", 0.7),
            ("CSC 202", "Algorithms", "ADVANCED", 0.9),
            ("CSC 202", "Data Structures", "ADVANCED", 0.8),
            ("CSC 203", "Java", "INTERMEDIATE", 0.8),
            ("CSC 301", "SQL", "ADVANCED", 0.9),
            ("CSC 301", "PostgreSQL", "INTERMEDIATE", 0.7),
            ("CSC 302", "Operating Systems", "ADVANCED", 0.9),
            ("CSC 302", "Linux", "INTERMEDIATE", 0.6),
            ("CSC 303", "Computer Networks", "ADVANCED", 0.9),
            ("CSC 304", "Software Engineering", "INTERMEDIATE", 0.7),
            ("CSC 304", "Git", "INTERMEDIATE", 0.6),
            ("CSC 401", "Machine Learning", "ADVANCED", 0.9),
            ("CSC 401", "Python", "ADVANCED", 0.8),
            ("CSC 402", "Cybersecurity Fundamentals", "ADVANCED", 0.9),
        ]

        for code, skill_name, cont_lvl, weight in course_skill_defs:
            course = db.query(Course).filter(Course.course_code == code).first()
            skill = skills_map.get(skill_name)
            if course and skill:
                csm = (
                    db.query(CourseSkillMapping)
                    .filter(CourseSkillMapping.course_id == course.id, CourseSkillMapping.skill_id == skill.id)
                    .first()
                )
                if not csm:
                    csm = CourseSkillMapping(
                        id=str(uuid.uuid4()),
                        course_id=course.id,
                        skill_id=skill.id,
                        contribution_level=cont_lvl,
                        relevance_weight=weight,
                        source="academic_mapping"
                    )
                    db.add(csm)
                    stats["course_skills_inserted"] += 1
                else:
                    csm.contribution_level = cont_lvl
                    csm.relevance_weight = weight
                    stats["course_skills_updated"] += 1

        # ── 5. LEARNING RESOURCES (Genuine URLs) ──────────────────────────────
        resources_defs = [
            ("FastAPI Official Documentation & Tutorial", "FastAPI", "https://fastapi.tiangolo.com/tutorial/", "DOCUMENTATION", "Beginner", 15, True, None, "Backend", "FastAPI"),
            ("MDN Web Docs — JavaScript Guide", "Mozilla MDN", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "DOCUMENTATION", "Beginner", 20, True, None, "Programming", "JavaScript"),
            ("Official Python 3 Documentation & Tutorial", "Python.org", "https://docs.python.org/3/tutorial/", "DOCUMENTATION", "Beginner", 25, True, None, "Programming", "Python"),
            ("PostgreSQL Official Tutorial", "PostgreSQL Global Development Group", "https://www.postgresql.org/docs/current/tutorial.html", "DOCUMENTATION", "Intermediate", 15, True, None, "Database", "PostgreSQL"),
            ("React Official Documentation & Learn", "React.dev", "https://react.dev/learn", "DOCUMENTATION", "Beginner", 20, True, None, "Frontend", "React"),
            ("Docker Getting Started Tutorial", "Docker Inc.", "https://docs.docker.com/get-started/", "TUTORIAL", "Beginner", 10, True, None, "DevOps", "Docker"),
            ("freeCodeCamp Full Stack JavaScript Curriculum", "freeCodeCamp", "https://www.freecodecamp.org/learn", "COURSE", "Intermediate", 300, True, None, "Web Development", "JavaScript"),
            ("OWASP Top Ten Security Project", "OWASP Foundation", "https://owasp.org/www-project-top-ten/", "DOCUMENTATION", "Intermediate", 12, True, None, "Security", "Cybersecurity Fundamentals"),
            ("Git Official Documentation & Book (Pro Git)", "Git SCM", "https://git-scm.com/book/en/v2", "DOCUMENTATION", "Beginner", 15, True, None, "Tools", "Git"),
            ("AWS Getting Started Resource Center", "Amazon Web Services", "https://aws.amazon.com/getting-started/", "TUTORIAL", "Beginner", 18, True, None, "Cloud", "AWS"),
        ]

        for title, provider, url, r_type, diff, hrs, is_free, price, cat, s_name in resources_defs:
            skill = skills_map.get(s_name)
            res = db.query(LearningResource).filter(LearningResource.url == url).first()
            if not res:
                res = LearningResource(
                    id=str(uuid.uuid4()),
                    title=title,
                    provider=provider,
                    url=url,
                    resource_type=r_type,
                    difficulty=diff,
                    estimated_hours=hrs,
                    is_free=is_free,
                    price=price,
                    category=cat,
                    skill_id=skill.id if skill else None
                )
                db.add(res)
                stats["resources_inserted"] += 1
            else:
                res.title = title
                res.provider = provider
                res.resource_type = r_type
                res.difficulty = diff
                res.estimated_hours = hrs
                stats["resources_updated"] += 1

        # ── 6. PROJECT RECOMMENDATIONS ───────────────────────────────────────
        projects_defs = [
            (
                "CourseCompass Academic Advising Platform",
                "Full-stack academic advising and career intelligence system with student context, course trees, and role planning.",
                "Intermediate",
                30,
                "Web App",
                '["Python", "FastAPI", "React", "PostgreSQL", "SQL"]',
                '["FastAPI", "SQLAlchemy", "React", "TailwindCSS", "PostgreSQL"]',
                "DEVELOPING",
                False,
                "Backend Engineer",
                "https://github.com/Ayesha-Rimione/Course-Compass"
            ),
            (
                "Distributed Task Queue & Rate Limiter",
                "High-performance worker queue with exponential backoff retry policies and sliding-window rate limiting in Python.",
                "Advanced",
                25,
                "System Tool",
                '["Python", "FastAPI", "Data Structures", "System Design"]',
                '["Python", "Redis", "FastAPI", "Docker"]',
                "DEVELOPING",
                False,
                "Backend Engineer",
                "https://github.com/example/task-queue-starter"
            ),
            (
                "Interactive React Component Design System",
                "Accessible, keyboard-navigable component library built with TypeScript, TailwindCSS, and Radix UI primitives.",
                "Intermediate",
                20,
                "Web App",
                '["JavaScript", "TypeScript", "React"]',
                '["React", "TypeScript", "Vite", "TailwindCSS"]',
                "BEGINNER",
                False,
                "Frontend Engineer",
                "https://github.com/example/ui-design-system"
            ),
            (
                "End-to-End E-Commerce Microservices",
                "Full-stack multi-service store with cart management, stripe payment webhooks, and JWT authenticated user profiles.",
                "Advanced",
                45,
                "Web App",
                '["JavaScript", "React", "Node.js", "SQL", "REST APIs", "Docker"]',
                '["React", "Node.js", "PostgreSQL", "Docker", "Express"]',
                "DEVELOPING",
                True,
                "Full Stack Engineer",
                "https://github.com/example/ecommerce-microservices"
            ),
            (
                "University Course Recommender System",
                "Machine learning collaborative filtering engine matching students with elective courses based on historical grades and interests.",
                "Advanced",
                35,
                "AI/ML",
                '["Python", "Machine Learning", "Algorithms", "SQL"]',
                '["Python", "Scikit-Learn", "Pandas", "FastAPI"]',
                "DEVELOPING",
                False,
                "AI/ML Engineer",
                "https://github.com/example/ml-course-recommender"
            ),
        ]

        for title, desc, diff, hrs, p_type, s_demo, techs, gap_lvl, is_team, role_name, repo_url in projects_defs:
            role = roles_map.get(role_name)
            p = db.query(ProjectRecommendation).filter(ProjectRecommendation.title == title).first()
            if not p:
                p = ProjectRecommendation(
                    id=str(uuid.uuid4()),
                    title=title,
                    description=desc,
                    difficulty=diff,
                    estimated_hours=hrs,
                    project_type=p_type,
                    skills_demonstrated=s_demo,
                    technologies=techs,
                    recommended_for_gap_level=gap_lvl,
                    is_team=is_team,
                    career_role_id=role.id if role else None,
                    github_starter_url=repo_url
                )
                db.add(p)
                stats["projects_inserted"] += 1
            else:
                p.description = desc
                p.difficulty = diff
                p.estimated_hours = hrs
                p.career_role_id = role.id if role else None
                stats["projects_updated"] += 1

        # ── 7. CERTIFICATIONS ───────────────────────────────────────────────
        certs_defs = [
            ("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "Validates ability to design robust and scalable distributed systems on AWS.", "https://aws.amazon.com/certification/certified-solutions-architect-associate/", 80, "Intermediate", '["AWS", "Cloud", "System Design", "Linux"]', "Cloud Engineer"),
            ("Meta Front-End Developer Professional Certificate", "Meta / Coursera", "Covers React, modern JavaScript, UI/UX principles, and version control.", "https://www.coursera.org/professional-certificates/meta-front-end-developer", 120, "Beginner", '["React", "JavaScript", "TypeScript", "Git"]', "Frontend Engineer"),
            ("Google Data Analytics Professional Certificate", "Google / Coursera", "In-depth training in SQL data transformation, R programming, and business dashboards.", "https://www.coursera.org/professional-certificates/google-data-analytics", 140, "Beginner", '["SQL", "Python", "Data Structures"]', "Data Analyst"),
            ("CompTIA Security+ Certification", "CompTIA", "Baseline global standard for foundational cybersecurity and network defense.", "https://www.comptia.org/certifications/security", 100, "Intermediate", '["Cybersecurity Fundamentals", "Computer Networks", "Linux"]', "Cybersecurity Engineer"),
        ]

        for name, provider, desc, url, hrs, diff, s_learned, role_name in certs_defs:
            role = roles_map.get(role_name)
            c = db.query(Certification).filter(Certification.name == name).first()
            if not c:
                c = Certification(
                    id=str(uuid.uuid4()),
                    name=name,
                    provider=provider,
                    description=desc,
                    url=url,
                    estimated_hours=hrs,
                    difficulty=diff,
                    skills_learned=s_learned,
                    career_role_id=role.id if role else None
                )
                db.add(c)
                stats["certs_inserted"] += 1
            else:
                c.provider = provider
                c.description = desc
                c.url = url
                c.career_role_id = role.id if role else None
                stats["certs_updated"] += 1

        # ── 8. SAMPLE JOB MARKET LISTINGS (Explicitly Labeled Sample Data) ──
        jobs_defs = [
            ("Junior Backend Engineer", "Brain Station 23", "Dhaka, Bangladesh", "Full-time", "Junior", 45000, 65000, "BDT", "৳45,000 – ৳65,000 / month", '["Python", "FastAPI", "PostgreSQL", "REST APIs", "Git"]', "https://brainstation-23.com/careers", "Backend Engineer"),
            ("Software Engineer (Frontend / React)", "Optimizely Bangladesh", "Dhaka, Bangladesh (Hybrid)", "Full-time", "Junior", 50000, 75000, "BDT", "৳50,000 – ৳75,000 / month", '["JavaScript", "TypeScript", "React", "Git"]', "https://www.optimizely.com/careers", "Frontend Engineer"),
            ("Associate Software Engineer", "Samsung R&D Institute Bangladesh", "Dhaka, Bangladesh", "Full-time", "Entry Level", 60000, 85000, "BDT", "৳60,000 – ৳85,000 / month", '["C++", "Algorithms", "Data Structures", "Operating Systems"]', "https://research.samsung.com/srbd", "Software Engineer"),
            ("Junior DevOps / Cloud Engineer", "Cefalo Bangladesh", "Dhaka, Bangladesh", "Full-time", "Junior", 45000, 70000, "BDT", "৳45,000 – ৳70,000 / month", '["Linux", "Docker", "CI/CD", "AWS", "Git"]', "https://cefalo.com/careers", "DevOps Engineer"),
            ("Associate AI / ML Engineer", "Kona Software Lab", "Dhaka, Bangladesh", "Full-time", "Junior", 55000, 80000, "BDT", "৳55,000 – ৳80,000 / month", '["Python", "Machine Learning", "FastAPI", "SQL"]', "https://konasl.com/careers", "AI/ML Engineer"),
        ]

        for role_title, company, loc, emp_type, exp_lvl, s_min, s_max, curr, s_fmt, req_s, src_url, role_name in jobs_defs:
            role = roles_map.get(role_name)
            j = db.query(JobListing).filter(JobListing.role == role_title, JobListing.company_name == company).first()
            if not j:
                j = JobListing(
                    id=str(uuid.uuid4()),
                    role=role_title,
                    company_name=company,
                    location=loc,
                    employment_type=emp_type,
                    experience_level=exp_lvl,
                    salary_min=s_min,
                    salary_max=s_max,
                    currency=curr,
                    salary_formatted=s_fmt,
                    required_skills=req_s,
                    source_url=src_url,
                    posted_at=datetime.datetime.now(datetime.timezone.utc),
                    is_sample=True,
                    career_role_id=role.id if role else None
                )
                db.add(j)
                stats["jobs_inserted"] += 1
            else:
                j.salary_formatted = s_fmt
                j.required_skills = req_s
                j.career_role_id = role.id if role else None
                stats["jobs_updated"] += 1

        db.commit()
        print("CourseCompass Phase 6 Seed Complete:")
        for k, v in stats.items():
            print(f"  {k}: {v}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_phase6()
