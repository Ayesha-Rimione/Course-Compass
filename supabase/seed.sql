-- ==============================================================================
-- CourseCompass — Complete Supabase PostgreSQL Seed Data
-- ==============================================================================

-- 1. Departments & Programs
INSERT INTO public.departments (id, code, name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'CSE', 'Department of Computer Science & Engineering')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.programs (id, department_id, code, name, degree_type, total_credits)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'BCSE', 'Bachelor of Science in Computer Science & Engineering', 'Bachelor of Science', 140)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.curriculum_versions (id, program_id, name, version_code, effective_from, status)
VALUES ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'IUBAT CSE Curriculum (B231)', 'B231', '2023-01', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 2. Master Curriculum (82 IUBAT CSE Courses)
INSERT INTO public.courses (course_code, course_name, credit_hours, semester, description)
VALUES
('ENG 101', 'Basic English Composition', 4.0, 1, 'Foundational course in English grammar, paragraph and essay structure, and academic writing conventions.'),
('CSC 103', 'Fundamentals of Computers and Applications', 3.0, 1, 'Introduces computer hardware/software basics, operating systems, and common productivity applications.'),
('CSC 104', 'Computer Applications Lab', 1.0, 1, 'Hands-on lab pairing CSC 103, practicing office productivity software and basic computer operations.'),
('ENV 103', 'Environmental Science', 2.0, 1, 'Survey of ecological principles, environmental issues, and sustainability concepts.'),
('ART 102', 'Educational Planning', 1.0, 1, 'Orientation course helping students plan their academic path and set goals for university life.'),
('ART 103', 'Professional Etiquette and Grooming', 0.0, 3, 'Non-credit orientation course covering professional conduct, communication etiquette, and presentation.'),
('ART 204', 'Modern Living', 3.0, 2, 'General studies course examining contemporary social, cultural, and lifestyle topics relevant to modern life.'),
('CSC 183', 'Programming C', 3.0, 2, 'Introduction to procedural programming using C, covering syntax, control flow, and basic data structures.'),
('CSC 184', 'Programming C Lab', 1.0, 2, 'Lab component of CSC 183, focused on hands-on implementation and debugging of C programs.'),
('ENG 102', 'English Comprehensions and Speaking', 3.0, 2, 'Builds on ENG 101 with focus on reading comprehension, oral communication, and presentation skills.'),
('MAT 147', 'Applied Calculus', 3.0, 2, 'Covers differential and integral calculus with applications relevant to engineering and computing.'),
('CSC 283', 'Programming (C++)', 3.0, 2, 'Introduces object-oriented programming concepts using C++, building on procedural C foundations.'),
('CSC 284', 'Programming Lab (C++)', 1.0, 2, 'Lab component of CSC 283 focused on implementing object-oriented C++ programs.'),
('ENG 203', 'Advanced English Composition', 3.0, 2, 'Advanced academic and technical writing, including research-based and argumentative essays.'),
('MAT 219', 'Linear Algebra', 2.0, 3, 'Introduces vectors, matrices, and linear transformations with applications to computing and data science.'),
('PHY 111', 'Physics', 3.0, 3, 'Introductory physics covering mechanics, energy, and basic electromagnetism relevant to engineering students.'),
('PHY 112', 'Physics Lab', 1.0, 3, 'Lab component of PHY 111 with hands-on experiments in mechanics and basic electromagnetism.'),
('CSC 231', 'Fundamentals of Electronics and Digital', 3.0, 3, 'Covers basic electronics and digital logic concepts foundational to computer hardware.'),
('CSC 232', 'Electronics and Digital Lab', 1.0, 3, 'Lab component of CSC 231, hands-on construction and testing of basic digital circuits.'),
('CSC 391', 'Data Structures and Algorithms', 4.0, 3, 'Core course covering fundamental data structures and algorithm design/analysis techniques.'),
('ELP 002', 'Intermediate English', 0.0, 3, 'Non-credit supplementary English language course for students needing additional language support.'),
('MAT 247', 'Numerical Analysis', 3.0, 4, 'Covers numerical methods for solving mathematical problems computationally.'),
('STA 240', 'Statistics', 3.0, 4, 'Introduces probability and statistics concepts foundational to data analysis and machine learning.'),
('BUS 201', 'Business Communications', 3.0, 4, 'Focuses on professional written and verbal communication in business/workplace contexts.'),
('CHM 117', 'General Chemistry', 3.0, 4, 'Introductory chemistry covering atomic structure, chemical bonding, and reactions.'),
('CHM 118', 'Chemistry Lab', 1.0, 4, 'Lab component of CHM 117 with hands-on experiments in basic chemical reactions and measurement.'),
('PHI 114', 'Introduction to Philosophy', 3.0, 4, 'Survey of major philosophical questions, reasoning methods, and ethical frameworks.'),
('CSC 197', 'Assembly Language', 3.0, 4, 'Introduces low-level programming concepts using assembly language and processor architecture basics.'),
('CSC 247', 'Computer Organization and Architecture', 3.0, 5, 'Covers CPU architecture, memory hierarchy, and instruction execution at the hardware level.'),
('CSC 329', 'Logic Design and Switching Circuits', 3.0, 5, 'Advanced digital logic design covering combinational and sequential circuits.'),
('CSC 330', 'Logic Lab', 1.0, 5, 'Lab component of CSC 329, hands-on design and testing of digital logic circuits.'),
('CSC 433', 'Database Management Systems', 3.0, 5, 'Covers relational database theory, design, and query languages.'),
('CSC 434', 'Database Management Systems Lab', 1.0, 5, 'Lab component of CSC 433, hands-on database implementation and querying.'),
('MAT 257', 'Discrete Mathematics', 3.0, 5, 'Covers discrete structures foundational to computer science: logic, sets, graphs, and combinatorics.'),
('CSC 215', 'Engineering Ethics', 1.0, 5, 'Introduces ethical principles and professional responsibility in engineering and technology practice.'),
('CSC 307', 'Operating System', 3.0, 5, 'Covers operating system concepts including process management, memory management, and file systems.'),
('CSC 347', 'Computer Hardware and Maintenance', 2.0, 6, 'Practical course on computer hardware components, assembly, and troubleshooting.'),
('CSC 348', 'Hardware Lab', 2.0, 6, 'Lab component of CSC 347, hands-on hardware assembly and diagnostics.'),
('EEN 183', 'Circuit Analysis', 3.0, 6, 'Covers analysis of electrical circuits including DC/AC circuit theory.'),
('EEN 184', 'Circuit Lab I', 1.0, 6, 'Lab component of EEN 183, hands-on circuit construction and measurement.'),
('ART 202', 'Career Planning and Development-I', 1.0, 6, 'Early career-planning course helping students explore career paths and build professional foundations.'),
('CSC 387', 'System Analysis and Design', 3.0, 6, 'Covers methodologies for analyzing and designing information systems, including requirements and modeling.'),
('CSE 3391', 'Web Engineering', 3.0, 6, 'Covers principles of designing, building, and engineering web-based applications and systems.'),
('ENG 250', 'Public Speaking', 3.0, 6, 'Develops formal public speaking and presentation skills for academic and professional contexts.'),
('CSC 439', 'Visual Programming', 3.0, 7, 'Covers GUI-based application development using visual programming environments.'),
('CSC 440', 'Visual Programming Lab', 1.0, 7, 'Lab component of CSC 439, hands-on GUI application development.'),
('CSE 4357', 'Principles and Techniques of Data Science', 3.0, 7, 'Introduces the data science pipeline: data collection, cleaning, analysis, and visualization.'),
('CSE 4385', 'Computer Vision and Image Processing', 3.0, 7, 'Covers fundamentals of digital image processing and computer vision techniques.'),
('CSC 488', 'Thesis', 3.0, 7, 'Independent research project applying CSE knowledge to a self-defined problem, under faculty supervision.'),
('CSC 397', 'Theory of Computation', 4.0, 8, 'Covers formal models of computation, automata theory, and computability/complexity.'),
('CSC 437', 'Compiler Design', 3.0, 8, 'Covers the phases of compiler construction from lexical analysis to code generation.'),
('CSC 465', 'Data Communication and Computer Network', 3.0, 8, 'Covers networking fundamentals including protocols, topologies, and the OSI/TCP-IP models.'),
('CSC 466', 'Network Lab', 1.0, 8, 'Lab component of CSC 465, hands-on network configuration and analysis.'),
('CSE 4383', 'Artificial Intelligence and Expert Systems', 3.0, 8, 'Introduces AI fundamentals including search algorithms, knowledge representation, and expert systems.'),
('CSC 471', 'Microprocessor Design', 3.0, 10, 'Covers microprocessor architecture, instruction execution, and interfacing with peripheral systems.'),
('CSC 469', 'Software Engineering', 3.0, 10, 'Covers software development lifecycle, requirements engineering, design, and project management practices.'),
('CSC 470', 'Software Engineering Lab', 1.0, 10, 'Lab component of CSC 469, hands-on application of software engineering practices to a team project.'),
('ART 203', 'Career Planning', 1.0, 10, 'Final-semester career-readiness course focused on job search strategy and transition to the workforce.'),
('CSE 4317', 'Machine Learning and Practices', 3.0, 10, 'This course introduces the fundamental theory and design of machine learning algorithms. It covers formal models of learning, generalization theory, optimization methods, and core learning algorithms, progressing from linear models to ensemble methods and modern deep learning architectures.'),
('CSE 151', 'Visual Basic', 3.0, 9, 'Introduces event-driven GUI application development using Visual Basic.'),
('CSE 152', 'Visual Basic Lab', 1.0, 9, 'Lab component of CSE 151 for hands-on Visual Basic application development.'),
('CSE 461', 'Programming Languages and Structures', 3.0, 9, 'Survey of programming language paradigms and their structural/design principles.'),
('CSE 383', 'Programming (Java/J++)', 3.0, 9, 'Introduces object-oriented programming in Java, covering syntax and core OOP application development.'),
('CSE 384', 'Programming (Java/J++) Lab', 1.0, 9, 'Lab component of CSE 383 for hands-on Java application development.'),
('CSE 393', 'Web Page Designing', 3.0, 9, 'Introduces front-end web page design using HTML, CSS, and basic client-side scripting.'),
('CSE 394', 'Web Page Designing Lab', 1.0, 9, 'Lab component of CSE 393 for hands-on web page development.'),
('CSE 395', 'e-Commerce Management', 3.0, 9, 'Covers principles of online business models, digital marketing, and e-commerce platform management.'),
('CSE 406', 'Wireless and Mobile Communication Networks', 3.0, 9, 'Covers principles of wireless communication and mobile network architectures.'),
('CSE 455', 'Computer Graphics', 3.0, 9, 'Covers fundamentals of 2D/3D computer graphics rendering and transformations.'),
('CSE 490', 'Practicum', 9.0, 9, 'Extended industry practicum providing hands-on professional experience in a real workplace setting.'),
('CSE 401', 'Microprocessor Interfacing for Measurement and Control', 3.0, 9, 'Covers interfacing microprocessors with sensors and control systems for measurement applications.'),
('CSE 407', 'Microcomputer Architecture Design', 3.0, 9, 'Advanced study of microcomputer system architecture and design considerations.'),
('CSE 441', 'Introduction to Functional and Logic Programming', 3.0, 9, 'Introduces functional and logic programming paradigms as alternatives to imperative programming.'),
('CSE 451', 'Management Information System', 3.0, 9, 'Covers the role of information systems in organizational management and decision-making.'),
('CSE 443', 'System Programming', 3.0, 9, 'Covers programming at the systems level, including OS interfaces and low-level resource management.'),
('CSE 447', 'Operations Research', 3.0, 9, 'Introduces optimization techniques and mathematical modeling for decision-making problems.'),
('CSE 473', 'System Modeling and Simulation', 3.0, 9, 'Covers techniques for modeling and simulating dynamic systems for analysis and decision support.'),
('CSE 481', 'VLSI Design', 3.0, 9, 'Covers principles of very-large-scale integration (VLSI) chip design.'),
('CSE 483', 'Artificial Intelligence and Expert System', 3.0, 9, 'Earlier-numbered version of the AI/expert-systems course, covering search, knowledge representation, and rule-based reasoning. NOTE: same subject family as CSE 4383 in the active curriculum — kept as a separate historical record, not merged, per an older vs. newer course-code convention.'),
('CSE 485', 'Introduction to Computer Vision', 3.0, 9, 'Earlier-numbered introductory course to computer vision techniques and image analysis. NOTE: related to CSE 4385 (Computer Vision and Image Processing) in the active curriculum — kept separate, not merged.'),
('CSE 487', 'Real Time Programming', 3.0, 9, 'Covers programming techniques for real-time and time-constrained systems.'),
('CSE 489', 'Selected Advanced Topics', 3.0, 9, 'Elective course covering a rotating selection of advanced/emerging computer science topics.')
ON CONFLICT (course_code) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  credit_hours = EXCLUDED.credit_hours,
  semester = EXCLUDED.semester,
  description = EXCLUDED.description;

-- 3. Skills Catalog (29 Skills)
INSERT INTO public.skills (name, category, description)
VALUES
('Python', 'Programming', 'Versatile high-level programming language for web, scripting, and AI/ML.'),
('JavaScript', 'Programming', 'Core programming language of the modern web.'),
('TypeScript', 'Programming', 'Typed superset of JavaScript for scalable applications.'),
('C++', 'Programming', 'High-performance systems programming language.'),
('C', 'Programming', 'Foundational procedural systems language.'),
('Java', 'Programming', 'Object-oriented language for enterprise systems and Android.'),
('SQL', 'Database', 'Relational database querying and management.'),
('PostgreSQL', 'Database', 'Advanced open-source relational database system.'),
('MongoDB', 'Database', 'Document-oriented NoSQL database.'),
('React', 'Frontend', 'Declarative UI component library.'),
('Node.js', 'Backend', 'Asynchronous event-driven JavaScript runtime.'),
('FastAPI', 'Backend', 'High-performance Python asynchronous REST API framework.'),
('Django', 'Backend', 'Batteries-included Python web framework.'),
('Docker', 'DevOps', 'Container platform for packaging and deploying applications.'),
('Kubernetes', 'DevOps', 'Container orchestration system for automating deployment.'),
('CI/CD', 'DevOps', 'Continuous Integration and Continuous Deployment pipelines.'),
('Linux', 'Tools & DevOps', 'Unix-like open source operating system.'),
('Git', 'Tools & DevOps', 'Distributed version control system.'),
('Machine Learning', 'AI & Data Science', 'Algorithms and statistical models that learn from data.'),
('Deep Learning', 'AI & Data Science', 'Neural networks and deep representations.'),
('Data Structures', 'Computer Science', 'Fundamental data organization (arrays, trees, graphs).'),
('Algorithms', 'Computer Science', 'Step-by-step problem solving and computational efficiency.'),
('System Design', 'Architecture', 'Designing scalable distributed software architectures.'),
('Cybersecurity', 'Security', 'Protecting systems, networks, and data from attacks.'),
('Cloud Architecture', 'Cloud', 'Designing resilient cloud infrastructure on AWS/GCP/Azure.'),
('HTML/CSS', 'Web Development', 'Fundamental building blocks of web pages.'),
('Next.js', 'Web Development', 'React production framework for full-stack applications.'),
('Data Analysis', 'AI & Data Science', 'Inspecting, cleansing, and transforming data for decisions.'),
('Problem Solving', 'Soft Skills', 'Analytical mindset for diagnosing and resolving complex challenges.')
ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category, description = EXCLUDED.description;

-- 4. Career Roles (10 Roles)
INSERT INTO public.career_roles (name, description, category)
VALUES
('Full-Stack Software Engineer', 'Build end-to-end web applications across frontend, backend, and databases.', 'Software Engineering'),
('Backend Engineer', 'Design, build, and optimize backend microservices, APIs, and data layers.', 'Software Engineering'),
('Frontend Engineer', 'Create polished, performant, and accessible user interfaces for web applications.', 'Frontend Engineering'),
('AI/ML Engineer', 'Develop, train, and deploy machine learning models and intelligent services into production.', 'Artificial Intelligence'),
('DevOps & Cloud Engineer', 'Automate infrastructure, build CI/CD pipelines, and maintain highly available cloud systems.', 'DevOps & Cloud'),
('Cybersecurity Analyst', 'Protect networks, systems, and sensitive applications from digital vulnerabilities.', 'Security'),
('Data Scientist', 'Extract actionable insights, statistical models, and predictions from massive data.', 'Data Science'),
('Data Analyst', 'Transform raw data into dashboards, business metrics, and strategic reporting.', 'Data Analytics'),
('Mobile App Developer', 'Build native and cross-platform mobile apps for iOS and Android platforms.', 'Mobile Engineering'),
('Systems Engineer', 'Build low-level operating system modules, compilers, and performance-critical systems.', 'Systems Engineering')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, category = EXCLUDED.category;

