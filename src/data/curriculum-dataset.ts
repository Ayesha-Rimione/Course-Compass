/**
 * Complete IUBAT CSE Curriculum Dataset (82 Courses: 59 Core + 23 Electives)
 */
export interface CurriculumCourseData {
  code: string;
  title: string;
  credits: number;
  semester: number;
  description: string;
}

export const masterCurriculumCourses: CurriculumCourseData[] = [
  {
    "code": "ENG 101",
    "title": "Basic English Composition",
    "credits": 4.0,
    "semester": 1,
    "description": "Foundational course in English grammar, paragraph and essay structure, and academic writing conventions."
  },
  {
    "code": "CSC 103",
    "title": "Fundamentals of Computers and Applications",
    "credits": 3.0,
    "semester": 1,
    "description": "Introduces computer hardware/software basics, operating systems, and common productivity applications."
  },
  {
    "code": "CSC 104",
    "title": "Computer Applications Lab",
    "credits": 1.0,
    "semester": 1,
    "description": "Hands-on lab pairing CSC 103, practicing office productivity software and basic computer operations."
  },
  {
    "code": "ENV 103",
    "title": "Environmental Science",
    "credits": 2.0,
    "semester": 1,
    "description": "Survey of ecological principles, environmental issues, and sustainability concepts."
  },
  {
    "code": "ART 102",
    "title": "Educational Planning",
    "credits": 1.0,
    "semester": 1,
    "description": "Orientation course helping students plan their academic path and set goals for university life."
  },
  {
    "code": "ART 103",
    "title": "Professional Etiquette and Grooming",
    "credits": 0.0,
    "semester": 3,
    "description": "Non-credit orientation course covering professional conduct, communication etiquette, and presentation."
  },
  {
    "code": "ART 204",
    "title": "Modern Living",
    "credits": 3.0,
    "semester": 2,
    "description": "General studies course examining contemporary social, cultural, and lifestyle topics relevant to modern life."
  },
  {
    "code": "CSC 183",
    "title": "Programming C",
    "credits": 3.0,
    "semester": 2,
    "description": "Introduction to procedural programming using C, covering syntax, control flow, and basic data structures."
  },
  {
    "code": "CSC 184",
    "title": "Programming C Lab",
    "credits": 1.0,
    "semester": 2,
    "description": "Lab component of CSC 183, focused on hands-on implementation and debugging of C programs."
  },
  {
    "code": "ENG 102",
    "title": "English Comprehensions and Speaking",
    "credits": 3.0,
    "semester": 2,
    "description": "Builds on ENG 101 with focus on reading comprehension, oral communication, and presentation skills."
  },
  {
    "code": "MAT 147",
    "title": "Applied Calculus",
    "credits": 3.0,
    "semester": 2,
    "description": "Covers differential and integral calculus with applications relevant to engineering and computing."
  },
  {
    "code": "CSC 283",
    "title": "Programming (C++)",
    "credits": 3.0,
    "semester": 2,
    "description": "Introduces object-oriented programming concepts using C++, building on procedural C foundations."
  },
  {
    "code": "CSC 284",
    "title": "Programming Lab (C++)",
    "credits": 1.0,
    "semester": 2,
    "description": "Lab component of CSC 283 focused on implementing object-oriented C++ programs."
  },
  {
    "code": "ENG 203",
    "title": "Advanced English Composition",
    "credits": 3.0,
    "semester": 2,
    "description": "Advanced academic and technical writing, including research-based and argumentative essays."
  },
  {
    "code": "MAT 219",
    "title": "Linear Algebra",
    "credits": 2.0,
    "semester": 3,
    "description": "Introduces vectors, matrices, and linear transformations with applications to computing and data science."
  },
  {
    "code": "PHY 111",
    "title": "Physics",
    "credits": 3.0,
    "semester": 3,
    "description": "Introductory physics covering mechanics, energy, and basic electromagnetism relevant to engineering students."
  },
  {
    "code": "PHY 112",
    "title": "Physics Lab",
    "credits": 1.0,
    "semester": 3,
    "description": "Lab component of PHY 111 with hands-on experiments in mechanics and basic electromagnetism."
  },
  {
    "code": "CSC 231",
    "title": "Fundamentals of Electronics and Digital",
    "credits": 3.0,
    "semester": 3,
    "description": "Covers basic electronics and digital logic concepts foundational to computer hardware."
  },
  {
    "code": "CSC 232",
    "title": "Electronics and Digital Lab",
    "credits": 1.0,
    "semester": 3,
    "description": "Lab component of CSC 231, hands-on construction and testing of basic digital circuits."
  },
  {
    "code": "CSC 391",
    "title": "Data Structures and Algorithms",
    "credits": 4.0,
    "semester": 3,
    "description": "Core course covering fundamental data structures and algorithm design/analysis techniques."
  },
  {
    "code": "ELP 002",
    "title": "Intermediate English",
    "credits": 0.0,
    "semester": 3,
    "description": "Non-credit supplementary English language course for students needing additional language support."
  },
  {
    "code": "MAT 247",
    "title": "Numerical Analysis",
    "credits": 3.0,
    "semester": 4,
    "description": "Covers numerical methods for solving mathematical problems computationally."
  },
  {
    "code": "STA 240",
    "title": "Statistics",
    "credits": 3.0,
    "semester": 4,
    "description": "Introduces probability and statistics concepts foundational to data analysis and machine learning."
  },
  {
    "code": "BUS 201",
    "title": "Business Communications",
    "credits": 3.0,
    "semester": 4,
    "description": "Focuses on professional written and verbal communication in business/workplace contexts."
  },
  {
    "code": "CHM 117",
    "title": "General Chemistry",
    "credits": 3.0,
    "semester": 4,
    "description": "Introductory chemistry covering atomic structure, chemical bonding, and reactions."
  },
  {
    "code": "CHM 118",
    "title": "Chemistry Lab",
    "credits": 1.0,
    "semester": 4,
    "description": "Lab component of CHM 117 with hands-on experiments in basic chemical reactions and measurement."
  },
  {
    "code": "PHI 114",
    "title": "Introduction to Philosophy",
    "credits": 3.0,
    "semester": 4,
    "description": "Survey of major philosophical questions, reasoning methods, and ethical frameworks."
  },
  {
    "code": "CSC 197",
    "title": "Assembly Language",
    "credits": 3.0,
    "semester": 4,
    "description": "Introduces low-level programming concepts using assembly language and processor architecture basics."
  },
  {
    "code": "CSC 247",
    "title": "Computer Organization and Architecture",
    "credits": 3.0,
    "semester": 5,
    "description": "Covers CPU architecture, memory hierarchy, and instruction execution at the hardware level."
  },
  {
    "code": "CSC 329",
    "title": "Logic Design and Switching Circuits",
    "credits": 3.0,
    "semester": 5,
    "description": "Advanced digital logic design covering combinational and sequential circuits."
  },
  {
    "code": "CSC 330",
    "title": "Logic Lab",
    "credits": 1.0,
    "semester": 5,
    "description": "Lab component of CSC 329, hands-on design and testing of digital logic circuits."
  },
  {
    "code": "CSC 433",
    "title": "Database Management Systems",
    "credits": 3.0,
    "semester": 5,
    "description": "Covers relational database theory, design, and query languages."
  },
  {
    "code": "CSC 434",
    "title": "Database Management Systems Lab",
    "credits": 1.0,
    "semester": 5,
    "description": "Lab component of CSC 433, hands-on database implementation and querying."
  },
  {
    "code": "MAT 257",
    "title": "Discrete Mathematics",
    "credits": 3.0,
    "semester": 5,
    "description": "Covers discrete structures foundational to computer science: logic, sets, graphs, and combinatorics."
  },
  {
    "code": "CSC 215",
    "title": "Engineering Ethics",
    "credits": 1.0,
    "semester": 5,
    "description": "Introduces ethical principles and professional responsibility in engineering and technology practice."
  },
  {
    "code": "CSC 307",
    "title": "Operating System",
    "credits": 3.0,
    "semester": 5,
    "description": "Covers operating system concepts including process management, memory management, and file systems."
  },
  {
    "code": "CSC 347",
    "title": "Computer Hardware and Maintenance",
    "credits": 2.0,
    "semester": 6,
    "description": "Practical course on computer hardware components, assembly, and troubleshooting."
  },
  {
    "code": "CSC 348",
    "title": "Hardware Lab",
    "credits": 2.0,
    "semester": 6,
    "description": "Lab component of CSC 347, hands-on hardware assembly and diagnostics."
  },
  {
    "code": "EEN 183",
    "title": "Circuit Analysis",
    "credits": 3.0,
    "semester": 6,
    "description": "Covers analysis of electrical circuits including DC/AC circuit theory."
  },
  {
    "code": "EEN 184",
    "title": "Circuit Lab I",
    "credits": 1.0,
    "semester": 6,
    "description": "Lab component of EEN 183, hands-on circuit construction and measurement."
  },
  {
    "code": "ART 202",
    "title": "Career Planning and Development-I",
    "credits": 1.0,
    "semester": 6,
    "description": "Early career-planning course helping students explore career paths and build professional foundations."
  },
  {
    "code": "CSC 387",
    "title": "System Analysis and Design",
    "credits": 3.0,
    "semester": 6,
    "description": "Covers methodologies for analyzing and designing information systems, including requirements and modeling."
  },
  {
    "code": "CSE 3391",
    "title": "Web Engineering",
    "credits": 3.0,
    "semester": 6,
    "description": "Covers principles of designing, building, and engineering web-based applications and systems."
  },
  {
    "code": "ENG 250",
    "title": "Public Speaking",
    "credits": 3.0,
    "semester": 6,
    "description": "Develops formal public speaking and presentation skills for academic and professional contexts."
  },
  {
    "code": "CSC 439",
    "title": "Visual Programming",
    "credits": 3.0,
    "semester": 7,
    "description": "Covers GUI-based application development using visual programming environments."
  },
  {
    "code": "CSC 440",
    "title": "Visual Programming Lab",
    "credits": 1.0,
    "semester": 7,
    "description": "Lab component of CSC 439, hands-on GUI application development."
  },
  {
    "code": "CSE 4357",
    "title": "Principles and Techniques of Data Science",
    "credits": 3.0,
    "semester": 7,
    "description": "Introduces the data science pipeline: data collection, cleaning, analysis, and visualization."
  },
  {
    "code": "CSE 4385",
    "title": "Computer Vision and Image Processing",
    "credits": 3.0,
    "semester": 7,
    "description": "Covers fundamentals of digital image processing and computer vision techniques."
  },
  {
    "code": "CSC 488",
    "title": "Thesis",
    "credits": 3.0,
    "semester": 7,
    "description": "Independent research project applying CSE knowledge to a self-defined problem, under faculty supervision."
  },
  {
    "code": "CSC 397",
    "title": "Theory of Computation",
    "credits": 4.0,
    "semester": 8,
    "description": "Covers formal models of computation, automata theory, and computability/complexity."
  },
  {
    "code": "CSC 437",
    "title": "Compiler Design",
    "credits": 3.0,
    "semester": 8,
    "description": "Covers the phases of compiler construction from lexical analysis to code generation."
  },
  {
    "code": "CSC 465",
    "title": "Data Communication and Computer Network",
    "credits": 3.0,
    "semester": 8,
    "description": "Covers networking fundamentals including protocols, topologies, and the OSI/TCP-IP models."
  },
  {
    "code": "CSC 466",
    "title": "Network Lab",
    "credits": 1.0,
    "semester": 8,
    "description": "Lab component of CSC 465, hands-on network configuration and analysis."
  },
  {
    "code": "CSE 4383",
    "title": "Artificial Intelligence and Expert Systems",
    "credits": 3.0,
    "semester": 8,
    "description": "Introduces AI fundamentals including search algorithms, knowledge representation, and expert systems."
  },
  {
    "code": "CSC 471",
    "title": "Microprocessor Design",
    "credits": 3.0,
    "semester": 10,
    "description": "Covers microprocessor architecture, instruction execution, and interfacing with peripheral systems."
  },
  {
    "code": "CSC 469",
    "title": "Software Engineering",
    "credits": 3.0,
    "semester": 10,
    "description": "Covers software development lifecycle, requirements engineering, design, and project management practices."
  },
  {
    "code": "CSC 470",
    "title": "Software Engineering Lab",
    "credits": 1.0,
    "semester": 10,
    "description": "Lab component of CSC 469, hands-on application of software engineering practices to a team project."
  },
  {
    "code": "ART 203",
    "title": "Career Planning",
    "credits": 1.0,
    "semester": 10,
    "description": "Final-semester career-readiness course focused on job search strategy and transition to the workforce."
  },
  {
    "code": "CSE 4317",
    "title": "Machine Learning and Practices",
    "credits": 3.0,
    "semester": 10,
    "description": "This course introduces the fundamental theory and design of machine learning algorithms. It covers formal models of learning, generalization theory, optimization methods, and core learning algorithms, progressing from linear models to ensemble methods and modern deep learning architectures."
  },
  {
    "code": "CSE 151",
    "title": "Visual Basic",
    "credits": 3.0,
    "semester": 9,
    "description": "Introduces event-driven GUI application development using Visual Basic."
  },
  {
    "code": "CSE 152",
    "title": "Visual Basic Lab",
    "credits": 1.0,
    "semester": 9,
    "description": "Lab component of CSE 151 for hands-on Visual Basic application development."
  },
  {
    "code": "CSE 461",
    "title": "Programming Languages and Structures",
    "credits": 3.0,
    "semester": 9,
    "description": "Survey of programming language paradigms and their structural/design principles."
  },
  {
    "code": "CSE 383",
    "title": "Programming (Java/J++)",
    "credits": 3.0,
    "semester": 9,
    "description": "Introduces object-oriented programming in Java, covering syntax and core OOP application development."
  },
  {
    "code": "CSE 384",
    "title": "Programming (Java/J++) Lab",
    "credits": 1.0,
    "semester": 9,
    "description": "Lab component of CSE 383 for hands-on Java application development."
  },
  {
    "code": "CSE 393",
    "title": "Web Page Designing",
    "credits": 3.0,
    "semester": 9,
    "description": "Introduces front-end web page design using HTML, CSS, and basic client-side scripting."
  },
  {
    "code": "CSE 394",
    "title": "Web Page Designing Lab",
    "credits": 1.0,
    "semester": 9,
    "description": "Lab component of CSE 393 for hands-on web page development."
  },
  {
    "code": "CSE 395",
    "title": "e-Commerce Management",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers principles of online business models, digital marketing, and e-commerce platform management."
  },
  {
    "code": "CSE 406",
    "title": "Wireless and Mobile Communication Networks",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers principles of wireless communication and mobile network architectures."
  },
  {
    "code": "CSE 455",
    "title": "Computer Graphics",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers fundamentals of 2D/3D computer graphics rendering and transformations."
  },
  {
    "code": "CSE 490",
    "title": "Practicum",
    "credits": 9.0,
    "semester": 9,
    "description": "Extended industry practicum providing hands-on professional experience in a real workplace setting."
  },
  {
    "code": "CSE 401",
    "title": "Microprocessor Interfacing for Measurement and Control",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers interfacing microprocessors with sensors and control systems for measurement applications."
  },
  {
    "code": "CSE 407",
    "title": "Microcomputer Architecture Design",
    "credits": 3.0,
    "semester": 9,
    "description": "Advanced study of microcomputer system architecture and design considerations."
  },
  {
    "code": "CSE 441",
    "title": "Introduction to Functional and Logic Programming",
    "credits": 3.0,
    "semester": 9,
    "description": "Introduces functional and logic programming paradigms as alternatives to imperative programming."
  },
  {
    "code": "CSE 451",
    "title": "Management Information System",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers the role of information systems in organizational management and decision-making."
  },
  {
    "code": "CSE 443",
    "title": "System Programming",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers programming at the systems level, including OS interfaces and low-level resource management."
  },
  {
    "code": "CSE 447",
    "title": "Operations Research",
    "credits": 3.0,
    "semester": 9,
    "description": "Introduces optimization techniques and mathematical modeling for decision-making problems."
  },
  {
    "code": "CSE 473",
    "title": "System Modeling and Simulation",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers techniques for modeling and simulating dynamic systems for analysis and decision support."
  },
  {
    "code": "CSE 481",
    "title": "VLSI Design",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers principles of very-large-scale integration (VLSI) chip design."
  },
  {
    "code": "CSE 483",
    "title": "Artificial Intelligence and Expert System",
    "credits": 3.0,
    "semester": 9,
    "description": "Earlier-numbered version of the AI/expert-systems course, covering search, knowledge representation, and rule-based reasoning. NOTE: same subject family as CSE 4383 in the active curriculum \u2014 kept as a separate historical record, not merged, per an older vs. newer course-code convention."
  },
  {
    "code": "CSE 485",
    "title": "Introduction to Computer Vision",
    "credits": 3.0,
    "semester": 9,
    "description": "Earlier-numbered introductory course to computer vision techniques and image analysis. NOTE: related to CSE 4385 (Computer Vision and Image Processing) in the active curriculum \u2014 kept separate, not merged."
  },
  {
    "code": "CSE 487",
    "title": "Real Time Programming",
    "credits": 3.0,
    "semester": 9,
    "description": "Covers programming techniques for real-time and time-constrained systems."
  },
  {
    "code": "CSE 489",
    "title": "Selected Advanced Topics",
    "credits": 3.0,
    "semester": 9,
    "description": "Elective course covering a rotating selection of advanced/emerging computer science topics."
  }
];
